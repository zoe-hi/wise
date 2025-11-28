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
        operationType: "payment" as "payment" | "conversion",
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
    const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);

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
    const amount = Number(formData.sendAmount) || 0;

    // Fee calculations based on payment method
    const poolFeeRate = 0.0025; // 0.25%
    const directFeeRate = 0.0031; // 0.31%

    const poolFee = amount * poolFeeRate;
    const directFee = amount * directFeeRate;
    const poolDiscount = directFee - poolFee;

    const currentFee = formData.paymentMethod === "pool" ? poolFee : directFee;
    const currentFeeRate = formData.paymentMethod === "pool" ? poolFeeRate * 100 : directFeeRate * 100;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="my-8 w-full max-w-4xl rounded-2xl bg-white shadow-xl max-h-[95vh] overflow-hidden flex flex-col">
                <div className="overflow-y-auto flex-1">
                    <div className="p-6">

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
                                        className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:border-[hsl(97,72%,67%)] focus:ring-1 focus:ring-[hsl(97,72%,67%)] outline-none"
                                        placeholder="e.g., Monthly Supplier Payment"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Operation Type</label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData({ ...formData, operationType: "payment" })
                                            }
                                            className={`flex-1 py-2 text-sm font-medium transition border-none ${
                                                formData.operationType === "payment"
                                                    ? "bg-[hsl(97,72%,67%)] text-[hsl(80,11%,5%)]"
                                                    : "bg-[hsl(90,14%,93%)] text-slate-600"
                                            }`}
                                            style={{ borderRadius: '30px' }}
                                        >
                                            💸 Payment
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData({ ...formData, operationType: "conversion" })
                                            }
                                            className={`flex-1 py-2 text-sm font-medium transition border-none ${
                                                formData.operationType === "conversion"
                                                    ? "bg-[hsl(97,72%,67%)] text-[hsl(80,11%,5%)]"
                                                    : "bg-[hsl(90,14%,93%)] text-slate-600"
                                            }`}
                                            style={{ borderRadius: '30px' }}
                                        >
                                            🔄 Conversion
                                        </button>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        {formData.operationType === "payment"
                                            ? "Send money to a recipient"
                                            : "Convert between your multi-currency balances"}
                                    </div>
                                </div>

                                {formData.operationType === "payment" && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Recipient
                                        </label>
                                        <select
                                            value={formData.selectedRecipient}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    selectedRecipient: e.target.value,
                                                })
                                            }
                                            className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:border-[hsl(97,72%,67%)] focus:ring-1 focus:ring-[hsl(97,72%,67%)] outline-none bg-white"
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

                                <div className="text-center text-xs text-slate-600 p-2 bg-[hsl(90,14%,93%)] rounded-lg border border-slate-200">
                                    🔒 1 {formData.sourceCurrency} = {exchangeRate} {formData.targetCurrency}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        You send exactly
                                    </label>
                                    <div className="flex items-center justify-between p-2 border border-slate-300 rounded-lg focus-within:border-[hsl(97,72%,67%)] focus-within:ring-1 focus-within:ring-[hsl(97,72%,67%)]">
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
                                    <div className="flex items-center justify-between p-2 border border-slate-300 rounded-lg bg-[hsl(90,14%,93%)]">
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
                                            className={`flex-1 py-1.5 text-sm font-medium transition border-none ${
                                                formData.transactionType === "single"
                                                    ? "bg-[hsl(97,72%,67%)] text-[hsl(80,11%,5%)]"
                                                    : "bg-[hsl(90,14%,93%)] text-slate-600"
                                            }`}
                                            style={{ borderRadius: '30px' }}
                                        >
                                            Single
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData({ ...formData, transactionType: "recurring" })
                                            }
                                            className={`flex-1 py-1.5 text-sm font-medium transition border-none ${
                                                formData.transactionType === "recurring"
                                                    ? "bg-[hsl(97,72%,67%)] text-[hsl(80,11%,5%)]"
                                                    : "bg-[hsl(90,14%,93%)] text-slate-600"
                                            }`}
                                            style={{ borderRadius: '30px' }}
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
                                            className="w-full p-2 text-sm border border-slate-300 rounded-lg mt-2 focus:border-[hsl(97,72%,67%)] focus:ring-1 focus:ring-[hsl(97,72%,67%)] outline-none bg-white"
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
                                        className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:border-[hsl(97,72%,67%)] focus:ring-1 focus:ring-[hsl(97,72%,67%)] outline-none"
                                    />
                                    <div className="text-xs text-slate-500 mt-1">
                                        Executed before this time
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-slate-700 mb-2">Paying with</div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPaymentMethodModal(true)}
                                      className="w-full flex items-center justify-between p-3 border-2 bg-[hsl(90, 1%, 64%)] border-slate-300 rounded-lg hover:border-slate-400 hover:bg-[hsl(97,72%,67%)] transition"

                                    >
                                        <div className="flex items-center gap-3">
                                            {formData.paymentMethod === "pool" ? (
                                                <>
                                                    <div className="text-xl">💎</div>
                                                    <div className="text-left">
                                                        <div className="text-sm font-semibold text-slate-800">
                                                            Payment Pool
                                                        </div>
                                                        <div className="text-xs text-[hsla(0, 0%, 36%, 1.00)]">
                                                            {currentFee.toFixed(2)} {formData.sourceCurrency} fee • by 5 PM
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="text-xl">🏦</div>
                                                    <div className="text-left">
                                                        <div className="text-sm font-semibold text-slate-800">
                                                            Bank transfer
                                                        </div>
                                                        <div className="text-xs text-slate-600">
                                                            {currentFee.toFixed(2)} {formData.sourceCurrency} fee • in seconds
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="text-sm text-slate-500">Change →</div>
                                    </button>
                                </div>

                                <div className="border-t border-slate-200 pt-3">
                                    <div className="text-sm font-medium text-slate-700 mb-2">Fee Breakdown</div>
                                    <div className="space-y-1.5 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Transfer amount</span>
                                            <span className="font-medium">{amount.toFixed(2)} {formData.sourceCurrency}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">
                                                Fee ({currentFeeRate.toFixed(2)}%)
                                            </span>
                                            <span className="font-medium">{currentFee.toFixed(2)} {formData.sourceCurrency}</span>
                                        </div>

                                        {formData.paymentMethod === "pool" && poolDiscount > 0 && (
                                            <div className="bg-[hsl(97,72%,90%)] border border-[hsl(97,72%,67%)] rounded-lg p-1.5 flex justify-between">
                                                <span className="text-[hsl(122.5,92.08%,19.8%)] font-medium text-xs">
                                                    💎 Pool savings vs direct
                                                </span>
                                                <span className="text-[hsl(122.5,92.08%,19.8%)] font-semibold text-xs">
                                                    {poolDiscount.toFixed(2)} {formData.sourceCurrency}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex justify-between pt-2 border-t border-slate-200 font-semibold">
                                            <span>Total cost</span>
                                            <span>{(amount + currentFee).toFixed(2)} {formData.sourceCurrency}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 bg-[hsl(90,14%,93%)] rounded-lg text-xs text-slate-600">
                                    <div>
                                        Arrives: <strong className="text-slate-800">
                                            {formData.paymentMethod === "pool" ? "Today by 5:00 PM CET" : "In seconds"}
                                        </strong>
                                    </div>
                                    {formData.paymentMethod === "pool" && (
                                        <div className="mt-2 pt-2 border-t border-slate-200">
                                            <div className="font-semibold text-[hsl(122.5,92.08%,19.8%)] mb-1">💎 Payment Pool Active</div>
                                            <div className="grid grid-cols-3 gap-2 text-center mb-2">
                                                <div>
                                                    <div className="font-semibold text-[hsla(0, 0%, 2%, 1.00)]">847</div>
                                                    <div className="text-slate-500">Businesses</div>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-[hsla(0, 0%, 0%, 1.00)]">£12.4M</div>
                                                    <div className="text-slate-500">Volume</div>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-[hsla(0, 0%, 0%, 1.00)]">2h 15m</div>
                                                    <div className="text-slate-500">Until 3 PM</div>
                                                </div>
                                            </div>
                                            <div className="text-slate-500 text-center pt-1 border-t border-slate-200">
                                                Pool closes at 3:00 PM • Resets daily
                                            </div>
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
                                        className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:border-[hsl(97,72%,67%)] focus:ring-1 focus:ring-[hsl(97,72%,67%)] outline-none bg-white"
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

                <div className="border-t border-slate-200 px-6 py-4 bg-[hsl(90,14%,93%)] flex gap-3">
                    <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="flex-1 py-2.5 bg-white border-none text-slate-700 font-semibold hover:bg-[hsl(90,14%,93%)] transition disabled:opacity-50"
                        style={{ borderRadius: '30px' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApprove}
                        disabled={isLoading}
                        className="flex-1 py-2.5 bg-[hsl(97,72%,67%)] border-none text-[hsl(80,11%,5%)] font-semibold hover:bg-[hsl(122.5,92.08%,19.8%)] transition disabled:opacity-50"
                        style={{ borderRadius: '30px' }}
                    >
                        {isLoading ? "Processing..." : "Approve Plan"}
                    </button>
                </div>
            </div>

            {/* Payment Method Selection Modal */}
            {showPaymentMethodModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
                        <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-semibold text-slate-900">How would you like to pay?</h3>
                                <p className="text-sm text-slate-600 mt-1">Here are the ways you can pay for this transfer</p>
                            </div>
                            <button
                                onClick={() => setShowPaymentMethodModal(false)}
                                className="text-slate-400 hover:text-slate-600 transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="text-sm font-medium text-slate-700 mb-4">Payment methods</div>
                            <div className="space-y-3">
                                {/* Bank Transfer */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData({ ...formData, paymentMethod: "direct" });
                                        setShowPaymentMethodModal(false);
                                    }}
                                    className="w-full flex items-center justify-between p-4 border-none bg-[hsl(90,14%,93%)] hover:bg-[hsl(90,14%,88%)] transition text-left"
                                    style={{ borderRadius: '30px' }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-2xl">
                                            🏦
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-900">Bank transfer</div>
                                            <div className="text-sm text-slate-600">
                                                Transfer money to Wise using your bank account.
                                            </div>
                                            <div className="text-sm text-slate-800 mt-1">
                                                <span className="font-semibold">{directFee.toFixed(2)} {formData.sourceCurrency}</span> fee • Should arrive <span className="font-semibold">in seconds</span>
                                            </div>
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>

                                {/* Payment Pool */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData({ ...formData, paymentMethod: "pool" });
                                        setShowPaymentMethodModal(false);
                                    }}
                                    className="w-full relative flex items-center justify-between p-4 border-none bg-[hsl(97,72%,90%)] hover:bg-[hsl(97,72%,85%)] transition text-left"
                                    style={{ borderRadius: '30px' }}
                                >
                                    <div className="absolute -top-2 -right-2 bg-[hsl(97,72%,67%)] text-white px-3 py-1 rounded-full text-xs font-bold">
                                        RECOMMENDED
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[hsl(97,72%,90%)] rounded-full flex items-center justify-center text-2xl">
                                            💎
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-900">Payment Pool</div>
                                            <div className="text-sm text-slate-700">
                                                Join 847 businesses for better rates.
                                            </div>
                                            <div className="text-sm text-[hsl(122.5,92.08%,19.8%)] mt-1">
                                                <span className="font-semibold">{poolFee.toFixed(2)} {formData.sourceCurrency}</span> fee • Should arrive <span className="font-semibold">by 5:00 PM</span>
                                            </div>
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-[hsl(97,72%,67%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>

                                {poolDiscount > 0 && (
                                    <div className="text-center text-sm text-[hsl(97,72%,67%)] font-medium mt-2">
                                        💎 Save {poolDiscount.toFixed(2)} {formData.sourceCurrency} with Payment Pool
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
