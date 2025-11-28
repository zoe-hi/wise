"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plan, PlanStep } from "../../lib/domain/models";
import { Rule } from "../../lib/domain/types";
import {
    createPlanAction,
    previewPlanAction,
    activatePlanAction,
} from "../servers/planActions";
import { getSettingsAction } from "../servers/settingsActions";
import { useRole } from "../contexts/RoleContext";

type RuleBuilderModalProps = {
    onClose: () => void;
    onSave: (plan: Plan) => void;
};

export function RuleBuilderModal({ onClose, onSave }: RuleBuilderModalProps) {
    const { user, role } = useRole();
    const router = useRouter();
    const [approvalThreshold, setApprovalThreshold] = useState<number>(25000);
    const [formData, setFormData] = useState({
        name: "",
        targetCurrency: "USD",
        amount: "100000",
        convertBy: getDefaultConvertBy(),
        existingBalance: "0",
        expectedInflows: "0",
        mode: "SPREAD_OVER_TIME" as "SPREAD_OVER_TIME" | "ONE_SHOT_RATE",
        chunks: "4",
        minRate: "1.10",
    });

    const [preview, setPreview] = useState<{
        plan: Plan;
        steps: PlanStep[];
    } | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch approval threshold
    useEffect(() => {
        getSettingsAction().then((settings) => {
            setApprovalThreshold(settings.approvalThreshold);
        });
    }, []);

    // Calculate net amount
    const netAmount = Math.max(
        0,
        Number(formData.amount) - Number(formData.existingBalance) - Number(formData.expectedInflows)
    );

    // Role-based flags
    const isViewer = role === "VIEWER";
    const isOwner = role === "OWNER";
    const isPlanner = role === "PLANNER";

    const canPlannerSelfStart =
        isPlanner &&
        netAmount > 0 &&
        approvalThreshold != null &&
        netAmount <= approvalThreshold;

    const isOverThreshold =
        approvalThreshold != null && netAmount > approvalThreshold;

    const exceedsThreshold = isPlanner && isOverThreshold;

    // Helper to get tomorrow at 10:00 local time
    function getDefaultConvertBy() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        // Format for datetime-local: YYYY-MM-DDTHH:mm
        const pad = (n: number) => n.toString().padStart(2, "0");
        return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(
            tomorrow.getDate(),
        )}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
    }

    const CURRENCIES = [
        "EUR",
        "GBP",
        "USD",
        "CAD",
        "AUD",
        "PLN",
        "HUF",
        "CZK",
        "SGD",
    ];

    const buildRule = (): Rule => {
        let strategy: any; // Using any temporarily to bypass the strict union check during construction if needed, but better to be explicit
        if (formData.mode === "SPREAD_OVER_TIME") {
            strategy = {
                mode: "SPREAD_OVER_TIME",
                chunks: Number(formData.chunks),
            };
        } else {
            strategy = {
                mode: "ONE_SHOT_RATE",
                minRate: Number(formData.minRate),
            };
        }

        return {
            need: {
                currency: formData.targetCurrency,
                amount: Number(formData.amount),
                convertBy: formData.convertBy,
            },
            netting: {
                existingBalance: Number(formData.existingBalance),
                expectedInflows: Number(formData.expectedInflows),
            },
            strategy: strategy,
            sourceCurrency: "EUR", // Hardcoded for demo
            name:
                formData.name.trim() ||
                `Convert ${formData.amount} ${formData.targetCurrency}`,
        };
    };

    const handlePreview = async () => {
        if (!formData.convertBy) {
            setError("Please select a 'Convert by' date.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const rule = buildRule();
            const result = await previewPlanAction(rule, user);
            setPreview(result);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.convertBy) {
            setError("Please select a 'Convert by' date.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const rule = buildRule();
            const { plan } = await createPlanAction(rule, user);
            onSave(plan);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrimarySubmit = async () => {
        if (isViewer) {
            return; // Button should be disabled anyway
        }

        if (!formData.convertBy) {
            setError("Please select a 'Convert by' date.");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const rule = buildRule();
            const { plan } = await createPlanAction(rule, user);

            // Conditional activation
            if (isOwner || canPlannerSelfStart) {
                await activatePlanAction(plan.id, user);
            }

            // Navigate to plan detail page
            router.push(`/plans/${plan.id}`);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    // Dynamic primary button label
    let primaryLabel = "Save as draft";
    if (isViewer) {
        primaryLabel = "Save as draft"; // disabled
    } else if (isOwner) {
        primaryLabel = "Approve & start plan";
    } else if (canPlannerSelfStart) {
        primaryLabel = "Save & start plan";
    } else if (isPlanner && isOverThreshold) {
        primaryLabel = "Save as draft";
    }

    const currencyFormatter = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: formData.targetCurrency,
        maximumFractionDigits: 0,
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="my-8 w-full max-w-3xl rounded-2xl bg-white shadow-xl">
                <div className="border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-slate-900">New Plan</h2>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        Creating as {role}
                    </span>
                </div>

                <div className="grid gap-8 p-6 lg:grid-cols-2">
                    {/* Left Column: Form */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">
                                Plan Name (optional)
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className="mt-1 block w-full rounded-md border border-slate-300 p-2 text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                                placeholder={`Convert ${formData.amount} ${formData.targetCurrency}`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">
                                I need
                            </label>
                            <div className="mt-1 flex gap-2">
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) =>
                                        setFormData({ ...formData, amount: e.target.value })
                                    }
                                    className="block w-full rounded-md border border-slate-300 p-2 text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                                    placeholder="e.g. 10000"
                                />
                                <select
                                    value={formData.targetCurrency}
                                    onChange={(e) =>
                                        setFormData({ ...formData, targetCurrency: e.target.value })
                                    }
                                    className="block w-24 rounded-md border border-slate-300 p-2 text-slate-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                                >
                                    {CURRENCIES.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">
                                Convert by
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.convertBy}
                                onChange={(e) =>
                                    setFormData({ ...formData, convertBy: e.target.value })
                                }
                                className="mt-1 block w-full rounded-md border border-slate-300 p-2 text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                            />
                        </div>

                        <div className="space-y-4 rounded-lg bg-slate-50 p-4">
                            <div>
                                <h3 className="text-sm font-medium text-slate-900">Netting</h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    In a real Wise account, this would be auto-filled from
                                    balances and invoices. Here you can adjust it manually for the
                                    demo.
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500">
                                    Existing balance
                                </label>
                                <input
                                    type="number"
                                    value={formData.existingBalance}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            existingBalance: e.target.value,
                                        })
                                    }
                                    className="mt-1 block w-full rounded-md border border-slate-300 p-2 text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500">
                                    Expected inflows
                                </label>
                                <input
                                    type="number"
                                    value={formData.expectedInflows}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            expectedInflows: e.target.value,
                                        })
                                    }
                                    className="mt-1 block w-full rounded-md border border-slate-300 p-2 text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-slate-900">Strategy</h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    id="spread"
                                    name="mode"
                                    checked={formData.mode === "SPREAD_OVER_TIME"}
                                    onChange={() =>
                                        setFormData({ ...formData, mode: "SPREAD_OVER_TIME" })
                                    }
                                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                                />
                                <label htmlFor="spread" className="text-sm text-slate-700">
                                    Spread over time
                                </label>
                            </div>
                            {formData.mode === "SPREAD_OVER_TIME" && (
                                <div className="ml-6">
                                    <label className="block text-xs text-slate-500">Chunks</label>
                                    <input
                                        type="number"
                                        min="2"
                                        max="10"
                                        value={formData.chunks}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                chunks: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-20 rounded-md border border-slate-300 p-2 text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    id="oneshot"
                                    name="mode"
                                    checked={formData.mode === "ONE_SHOT_RATE"}
                                    onChange={() =>
                                        setFormData({ ...formData, mode: "ONE_SHOT_RATE" })
                                    }
                                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                                />
                                <label htmlFor="oneshot" className="text-sm text-slate-700">
                                    One-shot on good rate
                                </label>
                            </div>
                            {formData.mode === "ONE_SHOT_RATE" && (
                                <div className="ml-6">
                                    <label className="block text-xs text-slate-500">
                                        Minimum FX rate (source → target)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        min="0"
                                        value={formData.minRate}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                minRate: e.target.value,
                                            })
                                        }
                                        placeholder="1.10"
                                        className="mt-1 block w-24 rounded-md border border-slate-300 p-2 text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Preview */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                        <h3 className="text-sm font-semibold text-slate-900">Preview</h3>

                        {error && (
                            <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                                {error}
                            </div>
                        )}

                        {!preview ? (
                            <div className="mt-8 text-center text-sm text-slate-500">
                                Click "Preview plan" to see the schedule.
                            </div>
                        ) : (
                            <div className="mt-4 space-y-6">
                                <div className="rounded-lg bg-white p-4 shadow-sm">
                                    <div className="mb-2 grid grid-cols-2 gap-1 text-xs text-slate-500">
                                        <span>Gross need:</span>
                                        <span className="text-right font-medium text-slate-700">
                                            {currencyFormatter.format(preview.plan.grossAmount)}
                                        </span>
                                        <span>Existing balance:</span>
                                        <span className="text-right font-medium text-slate-700">
                                            {currencyFormatter.format(preview.plan.existingBalance)}
                                        </span>
                                        <span>Expected inflows:</span>
                                        <span className="text-right font-medium text-slate-700">
                                            {currencyFormatter.format(preview.plan.expectedInflows)}
                                        </span>
                                    </div>
                                    <div className="border-t border-slate-100 pt-2">
                                        <p className="text-xs uppercase tracking-wide text-slate-500">
                                            Net to convert
                                        </p>
                                        <p className="mt-1 text-xl font-bold text-slate-900">
                                            {currencyFormatter.format(preview.plan.netAmount)}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {preview.steps.map((step, i) => (
                                        <div key={i} className="flex gap-3 text-sm">
                                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {new Intl.DateTimeFormat("en-GB", {
                                                        dateStyle: "medium",
                                                        timeStyle: "short",
                                                    }).format(new Date(step.when))}
                                                </p>
                                                <p className="text-slate-600">{step.explanation}</p>
                                                <p className="mt-1 text-xs font-semibold text-slate-700">
                                                    {currencyFormatter.format(step.targetAmount)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                {exceedsThreshold && (
                    <div className="border-t border-slate-100 px-6 py-4">
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                            <p className="text-sm text-amber-800">
                                ⚠️ This plan exceeds the approval threshold of €
                                {approvalThreshold.toLocaleString("en-GB")}. Ask an Owner to
                                approve and start it.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePreview}
                        disabled={isLoading || isViewer}
                        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Preview plan
                    </button>
                    <button
                        onClick={handlePrimarySubmit}
                        disabled={isLoading || isViewer}
                        className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {primaryLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
