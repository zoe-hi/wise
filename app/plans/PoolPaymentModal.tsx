"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plan } from "../../lib/domain/models";
import { Rule } from "../../lib/domain/types";
import {
    createPlanAction,
    activatePlanAction,
} from "../servers/planActions";
import { getSettingsAction } from "../servers/settingsActions";
import { useRole } from "../contexts/RoleContext";

type PoolPaymentModalProps = {
    onClose: () => void;
    onSave: (plan: Plan) => void;
};

export function PoolPaymentModal({ onClose, onSave }: PoolPaymentModalProps) {
    const { user, role } = useRole();
    const router = useRouter();
    const [approvalThreshold, setApprovalThreshold] = useState<number>(25000);

    const [formData, setFormData] = useState({
        planName: "Payroll Plan A",
        sendToRecipient: true,
        selectedRecipient: "1",
        sourceCurrency: "GBP",
        targetCurrency: "EUR",
        sendAmount: "2500",
        receiveAmount: "2845.31",
        transactionType: "single" as "single" | "recurring",
        recurringFrequency: "monthly",
        paymentDeadline: getDefaultDeadline(),
        paymentMethod: "pool" as "direct" | "pool",
        backupPlan: "receiver_currency",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch approval threshold
    useEffect(() => {
        getSettingsAction().then((settings) => {
            setApprovalThreshold(settings.approvalThreshold);
        });
    }, []);

    // Helper to get default deadline
    function getDefaultDeadline() {
        const now = new Date();
        now.setHours(15, 0, 0, 0); // 3:00 PM today
        const pad = (n: number) => n.toString().padStart(2, "0");
        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
            now.getDate(),
        )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    }

    const CURRENCIES = [
        { code: "EUR", flagIcon: "/eur-euro.svg", name: "EUR" },
        { code: "GBP", flagIcon: "/gb-united-kingdom.svg", name: "GBP" },
        { code: "USD", flagIcon: null, flagEmoji: "🇺🇸", name: "USD" },
        { code: "CAD", flagIcon: null, flagEmoji: "🇨🇦", name: "CAD" },
        { code: "AUD", flagIcon: null, flagEmoji: "🇦🇺", name: "AUD" },
    ];

    const getCurrencyFlag = (currencyCode: string) => {
        const currency = CURRENCIES.find(c => c.code === currencyCode);
        if (!currency) return null;

        if (currency.flagIcon) {
            return (
                <Image
                    src={currency.flagIcon}
                    alt={currency.code}
                    width={20}
                    height={20}
                    className="rounded-sm"
                />
            );
        }
        return <span className="text-base">{currency.flagEmoji}</span>;
    };

    const RECIPIENTS = [
        { id: "1", name: "Tech Supplies Ltd - EUR Account" },
        { id: "2", name: "Marketing Agency GmbH" },
        { id: "3", name: "Freelancer - Jan Kowalski" },
        { id: "4", name: "Office Rent - Berlin" },
    ];

    const buildRule = (): Rule => {
        return {
            need: {
                currency: formData.targetCurrency,
                amount: Number(formData.sendAmount),
                convertBy: formData.paymentDeadline,
            },
            netting: {
                existingBalance: 0,
                expectedInflows: 0,
            },
            strategy: {
                mode: "SPREAD_OVER_TIME",
                chunks: 1,
            },
            sourceCurrency: formData.sourceCurrency,
            name: formData.planName,
        };
    };

    const handleApprove = async () => {
        if (!formData.paymentDeadline) {
            setError("Please select a payment deadline.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const rule = buildRule();
            const { plan } = await createPlanAction(rule, user);

            // Auto-activate if owner or under threshold
            const netAmount = Number(formData.sendAmount);
            const canAutoActivate =
                role === "OWNER" ||
                (role === "PLANNER" && netAmount <= approvalThreshold);

            if (canAutoActivate) {
                await activatePlanAction(plan.id, user);
            }

            router.push(`/plans/${plan.id}`);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        onClose();
    };

    const exchangeRate = 1.1417;
    const standardFee = 7.75;
    const poolDiscount = 1.50;
    const totalFee = 6.25;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="my-8 w-full max-w-4xl rounded-2xl bg-white shadow-xl max-h-[95vh] overflow-hidden flex flex-col">
                <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-semibold text-slate-900">New Payment Plan</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-y-auto flex-1">
                    <div className="p-6">
                        {/* Pool Highlight Banner */}
                        <div className="bg-emerald-50 border border-emerald-500 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-bold uppercase">
                                    NEW
                                </span>
                                <h3 className="text-base font-semibold text-slate-800">
                                    💎 Payment Pool - Save up to 20%
                                </h3>
                            </div>
                            <p className="text-sm text-slate-700 mb-3">
                                Join 847 businesses in today's pool. Combined volume = better rates for everyone.
                            </p>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div>
                                    <div className="text-lg font-semibold text-emerald-600">847</div>
                                    <div className="text-xs text-slate-600">Businesses</div>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold text-emerald-600">£12.4M</div>
                                    <div className="text-xs text-slate-600">Pool volume</div>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold text-emerald-600">2h 15m</div>
                                    <div className="text-xs text-slate-600">Until closes</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Plan Name</label>
                                    <input
                                        type="text"
                                        value={formData.planName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, planName: e.target.value })
                                        }
                                        className="w-full p-2 text-sm border border-slate-300 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                        placeholder="e.g., Monthly Supplier Payment"
                                    />
                                </div>

                                <div className="p-3 bg-slate-50 rounded">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800">
                                        <input
                                            type="checkbox"
                                            checked={formData.sendToRecipient}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    sendToRecipient: e.target.checked,
                                                })
                                            }
                                            className="w-4 h-4 accent-emerald-500"
                                        />
                                        <span>Send to recipient</span>
                                    </label>
                                </div>

                                {formData.sendToRecipient && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Select Recipient
                                        </label>
                                        <select
                                            value={formData.selectedRecipient}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    selectedRecipient: e.target.value,
                                                })
                                            }
                                            className="w-full p-2 text-sm border border-slate-300 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
                                        >
                                            <option value="">Choose recipient...</option>
                                            {RECIPIENTS.map((recipient) => (
                                                <option key={recipient.id} value={recipient.id}>
                                                    {recipient.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="text-center text-xs text-slate-600 p-2 bg-slate-50 rounded border border-slate-200">
                                    🔒 1 {formData.sourceCurrency} = {exchangeRate} {formData.targetCurrency}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        You send exactly
                                    </label>
                                    <div className="flex items-center justify-between p-2 border border-slate-300 rounded">
                                        <input
                                            type="number"
                                            value={formData.sendAmount}
                                            onChange={(e) =>
                                                setFormData({ ...formData, sendAmount: e.target.value })
                                            }
                                            className="text-lg font-medium outline-none flex-1"
                                        />
                                        <div className="flex items-center gap-1.5 font-semibold text-sm">
                                            {getCurrencyFlag(formData.sourceCurrency)}
                                            {formData.sourceCurrency}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Recipient gets
                                    </label>
                                    <div className="flex items-center justify-between p-2 border border-slate-300 rounded bg-slate-50">
                                        <span className="text-lg font-medium">{formData.receiveAmount}</span>
                                        <div className="flex items-center gap-1.5 font-semibold text-sm">
                                            {getCurrencyFlag(formData.targetCurrency)}
                                            {formData.targetCurrency}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Transaction Type
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData({ ...formData, transactionType: "single" })
                                            }
                                            className={`flex-1 py-1.5 text-sm border-2 rounded font-medium transition ${
                                                formData.transactionType === "single"
                                                    ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                                                    : "border-slate-300 text-slate-600"
                                            }`}
                                        >
                                            Single
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData({ ...formData, transactionType: "recurring" })
                                            }
                                            className={`flex-1 py-1.5 text-sm border-2 rounded font-medium transition ${
                                                formData.transactionType === "recurring"
                                                    ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                                                    : "border-slate-300 text-slate-600"
                                            }`}
                                        >
                                            Recurring
                                        </button>
                                    </div>
                                    {formData.transactionType === "recurring" && (
                                        <select
                                            value={formData.recurringFrequency}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    recurringFrequency: e.target.value,
                                                })
                                            }
                                            className="w-full p-2 text-sm border border-slate-300 rounded mt-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
                                        >
                                            <option value="weekly">Weekly</option>
                                            <option value="biweekly">Every 2 weeks</option>
                                            <option value="monthly">Monthly</option>
                                            <option value="quarterly">Quarterly</option>
                                        </select>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Payment Deadline
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.paymentDeadline}
                                        onChange={(e) =>
                                            setFormData({ ...formData, paymentDeadline: e.target.value })
                                        }
                                        className="w-full p-2 text-sm border border-slate-300 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                    />
                                    <div className="text-xs text-slate-500 mt-1">
                                        Executed before this time
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-slate-700 mb-2">Payment Method</div>

                                    <div
                                        onClick={() =>
                                            setFormData({ ...formData, paymentMethod: "direct" })
                                        }
                                        className="flex items-center gap-2 p-2 border-2 border-slate-300 rounded cursor-pointer hover:border-slate-400 transition"
                                    >
                                        <div
                                            className={`w-4 h-4 border-2 rounded-full flex items-center justify-center ${
                                                formData.paymentMethod === "direct"
                                                    ? "border-emerald-500"
                                                    : "border-slate-300"
                                            }`}
                                        >
                                            {formData.paymentMethod === "direct" && (
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="text-base">🏦</div>
                                        <div className="text-sm font-medium">Bank transfer</div>
                                    </div>

                                    <div
                                        onClick={() => setFormData({ ...formData, paymentMethod: "pool" })}
                                        className="relative flex items-center gap-2 p-2 border-2 border-emerald-500 bg-emerald-50 rounded cursor-pointer"
                                    >
                                        <div className="absolute -top-2 left-3 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                                            SAVE 20%
                                        </div>
                                        <div className="w-4 h-4 border-2 border-emerald-500 rounded-full flex items-center justify-center">
                                            {formData.paymentMethod === "pool" && (
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="text-base">💎</div>
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-slate-800">
                                                Payment Pool
                                            </div>
                                            <div className="text-xs text-emerald-600 font-medium">
                                                Today by 5 PM • Save £{poolDiscount.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 pt-3">
                                    <div className="text-sm font-medium text-slate-700 mb-2">Fee Breakdown</div>
                                    <div className="space-y-1.5 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Bank fee</span>
                                            <span className="font-medium">0 GBP</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Standard fee (0.31%)</span>
                                            <span className="font-medium">{standardFee.toFixed(2)} GBP</span>
                                        </div>

                                        {formData.paymentMethod === "pool" && (
                                            <div className="bg-emerald-100 border border-emerald-500 rounded p-1.5 flex justify-between">
                                                <span className="text-emerald-600 font-medium text-xs">
                                                    💎 Pool discount
                                                </span>
                                                <span className="text-emerald-600 font-semibold text-xs">
                                                    -{poolDiscount.toFixed(2)} GBP
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex justify-between pt-2 border-t border-slate-200 font-semibold">
                                            <span>Total fees</span>
                                            <span>{totalFee.toFixed(2)} GBP</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-50 rounded text-xs text-slate-600">
                                    <div>
                                        Arrives: <strong className="text-slate-800">Today by 5:00 PM CET</strong>
                                    </div>
                                    {formData.paymentMethod === "pool" && (
                                        <div className="mt-1 text-emerald-600">
                                            Pool closes in 2h 15m • 847 businesses joined
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Backup Plan</label>
                                    <select
                                        value={formData.backupPlan}
                                        onChange={(e) =>
                                            setFormData({ ...formData, backupPlan: e.target.value })
                                        }
                                        className="w-full p-2 text-sm border border-slate-300 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
                                    >
                                        <option value="">None</option>
                                        <option value="receiver_currency">
                                            Receiver's Currency Balance
                                        </option>
                                        <option value="gbp_balance">GBP Balance</option>
                                        <option value="usd_balance">USD Balance</option>
                                        <option value="eur_balance">
                                            EUR Balance
                                        </option>
                                    </select>
                                    {formData.backupPlan && (
                                        <div className="text-xs text-slate-500 mt-1">
                                            Fallback if primary payment fails
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded text-sm text-rose-700">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex gap-3">
                    <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="flex-1 py-2.5 bg-white border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApprove}
                        disabled={isLoading}
                        className="flex-1 py-2.5 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition disabled:opacity-50"
                    >
                        {isLoading ? "Processing..." : "Approve Plan"}
                    </button>
                </div>
            </div>
        </div>
    );
}
