"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plan, ActivityLog, PlanStep } from "../../../lib/domain/models";
import { useRole } from "../../contexts/RoleContext";
import {
    activatePlanAction,
    cancelPlanAction,
} from "../../servers/planActions";

type PlanDetailClientProps = {
    plan: Plan;
    steps: PlanStep[];
    activity: ActivityLog[];
    approvalThreshold: number;
};

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
});

const statusStyles = {
    DRAFT: {
        badge: "bg-amber-50 text-amber-700 border-amber-100",
        dot: "bg-amber-500",
        label: "Draft",
    },
    ACTIVE: {
        badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
        dot: "bg-emerald-500",
        label: "Active",
    },
    CANCELLED: {
        badge: "bg-rose-50 text-rose-700 border-rose-100",
        dot: "bg-rose-500",
        label: "Cancelled",
    },
    COMPLETED: {
        badge: "bg-blue-50 text-blue-700 border-blue-100",
        dot: "bg-blue-500",
        label: "Completed",
    },
} as const;

export function PlanDetailClient({
    plan,
    steps,
    activity,
    approvalThreshold,
}: PlanDetailClientProps) {
    const { role, user } = useRole();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const amountFormatter = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: plan.targetCurrency,
        maximumFractionDigits: 2,
    });

    const handleActivate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await activatePlanAction(plan.id, user);
            router.refresh();
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await cancelPlanAction(plan.id, user);
            router.refresh();
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const statusStyle = statusStyles[plan.status];

    // Calculate some derived values for display
    const exchangeRate = 1.1417; // This should come from plan data
    const poolFeeRate = 0.0025;
    const directFeeRate = 0.0031;
    const poolFee = plan.netAmount * poolFeeRate;
    const directFee = plan.netAmount * directFeeRate;
    const poolSavings = directFee - poolFee;

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8 animate-[slideDown_0.4s_ease-out]">
                    <div>
                        <h1 className="text-4xl font-bold text-[#00112C] mb-2">
                            {plan.name}
                        </h1>
                        <div className="flex gap-4 items-center text-sm text-[#6C7C8C]">
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusStyle.badge}`}>
                                <span className={`w-2 h-2 rounded-full ${statusStyle.dot} animate-[pulse_2s_ease-in-out_infinite]`} />
                                {statusStyle.label}
                            </span>
                            <span>Created {dateTimeFormatter.format(new Date(plan.createdAt || Date.now()))}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-5xl font-bold text-[#00112C] mb-1">
                            {amountFormatter.format(plan.netAmount)}
                        </div>
                        <div className="text-sm text-[#6C7C8C]">
                            Net amount ({plan.targetCurrency})
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - 2 columns wide */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Payment Schedule Card */}
                        <div className="bg-white rounded-xl border border-[#DFE1E6] p-6 shadow-sm animate-[fadeInUp_0.5s_ease-out]">
                            <div className="flex justify-between items-center mb-5">
                                <div>
                                    <h2 className="text-lg font-semibold text-[#00112C]">Payment Schedule</h2>
                                    <p className="text-sm text-[#6C7C8C] mt-1">Recurring monthly payroll</p>
                                </div>
                                <button className="px-3 py-2 text-sm font-semibold text-[#00C9A7] hover:bg-[rgba(159,232,112,0.1)] rounded-lg transition">
                                    Edit schedule
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-[#E8EAED] rounded-lg hover:bg-[#E0E2E5] transition">
                                    <div className="flex items-center gap-2 font-semibold text-[#364153]">
                                        <span className="text-lg">📅</span>
                                        Frequency
                                    </div>
                                    <div className="font-semibold text-[#00112C] text-right">
                                        Monthly • Last business day
                                    </div>
                                </div>

                                <div className="flex justify-between items-center p-4 bg-[#E8EAED] rounded-lg hover:bg-[#E0E2E5] transition">
                                    <div className="flex items-center gap-2 font-semibold text-[#364153]">
                                        <span className="text-lg">💰</span>
                                        Amount per payment
                                    </div>
                                    <div className="font-semibold text-[#00112C] text-right">
                                        {amountFormatter.format(plan.netAmount)}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center p-4 bg-[#E8EAED] rounded-lg hover:bg-[#E0E2E5] transition">
                                    <div className="flex items-center gap-2 font-semibold text-[#364153]">
                                        <span className="text-lg">🔄</span>
                                        Conversion method
                                    </div>
                                    <div className="font-semibold text-[#00112C] text-right">
                                        Payment Pool (saves ~{amountFormatter.format(poolSavings)} per payment)
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Payments */}
                        <div className="bg-white rounded-xl border border-[#DFE1E6] p-6 shadow-sm animate-[fadeInUp_0.5s_ease-out] [animation-delay:0.1s]">
                            <div className="mb-5">
                                <h2 className="text-lg font-semibold text-[#00112C]">Upcoming Payments</h2>
                            </div>

                            <div className="space-y-3">
                                {steps.length > 0 ? (
                                    steps.slice(0, 4).map((step, index) => {
                                        const stepDate = new Date(step.when);
                                        const isFirst = index === 0;

                                        return (
                                            <div
                                                key={step.id}
                                                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition hover:border-[#9FE870] hover:translate-x-1 hover:shadow-lg ${
                                                    isFirst ? 'bg-gradient-to-br from-[#FFF9E6] to-[#FFFDF5] border-[#FFE066]' : 'border-[#DFE1E6]'
                                                }`}
                                            >
                                                <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center border-2 flex-shrink-0 ${
                                                    isFirst ? 'bg-[#9FE870] border-[#9FE870]' : 'bg-white border-[#DFE1E6]'
                                                }`}>
                                                    <div className="text-2xl font-bold text-[#00112C] leading-none">
                                                        {stepDate.getDate()}
                                                    </div>
                                                    <div className={`text-xs font-semibold uppercase ${isFirst ? 'text-[#00112C]' : 'text-[#6C7C8C]'}`}>
                                                        {stepDate.toLocaleDateString('en-GB', { month: 'short' })}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-[#00112C] mb-1">
                                                        {isFirst ? 'Next payment' : stepDate.toLocaleDateString('en-GB', { month: 'long' }) + ' payroll'}
                                                    </div>
                                                    <div className="text-sm text-[#6C7C8C]">
                                                        {isFirst ? `Due by ${stepDate.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' })} today` : 'Scheduled for month-end'}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-[#00112C] mb-1">
                                                        {amountFormatter.format(step.targetAmount)}
                                                    </div>
                                                    <div className={`inline-block px-2.5 py-1 rounded-xl text-xs font-semibold ${
                                                        isFirst ? 'bg-[#FFF3CD] text-[#856404]' : 'bg-[#E7F9F5] text-[#00C9A7]'
                                                    }`}>
                                                        {isFirst ? 'Pending' : 'Scheduled'}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-[#6C7C8C] py-4 text-center">No upcoming payments scheduled</p>
                                )}
                            </div>

                            {steps.length > 4 && (
                                <button className="w-full mt-3 py-3 bg-[#F4F5F7] hover:bg-[#E8EAED] rounded-lg text-[#00112C] font-semibold transition">
                                    View all scheduled payments →
                                </button>
                            )}
                        </div>

                        {/* Payment History */}
                        <div className="bg-white rounded-xl border border-[#DFE1E6] p-6 shadow-sm animate-[fadeInUp_0.5s_ease-out] [animation-delay:0.2s]">
                            <div className="mb-5">
                                <h2 className="text-lg font-semibold text-[#00112C]">Payment History</h2>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm text-[#6C7C8C] py-4 text-center">No completed payments yet</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Next Payment Details */}
                        <div className="bg-white rounded-xl border border-[#DFE1E6] p-6 shadow-sm animate-[fadeInUp_0.5s_ease-out] [animation-delay:0.1s]">
                            <h2 className="text-lg font-semibold text-[#00112C] mb-4">Next Payment Details</h2>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-[#DFE1E6]">
                                    <span className="text-sm text-[#6C7C8C]">Payment deadline</span>
                                    <span className="font-semibold text-[#00112C] text-right">
                                        {dateTimeFormatter.format(new Date(plan.convertBy))}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center pb-4 border-b border-[#DFE1E6]">
                                    <span className="text-sm text-[#6C7C8C]">Expected arrival</span>
                                    <span className="font-semibold text-[#00C9A7] text-right">Today by 5:00 PM CET</span>
                                </div>

                                <div className="flex justify-between items-center pb-4 border-b border-[#DFE1E6]">
                                    <span className="text-sm text-[#6C7C8C]">Exchange rate</span>
                                    <span className="font-semibold text-[#00112C] text-right">
                                        1 {plan.sourceCurrency} = {exchangeRate} {plan.targetCurrency}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-[#6C7C8C]">Backup plan</span>
                                    <span className="font-semibold text-[#00112C] text-right">Currency Balance</span>
                                </div>
                            </div>

                            {/* Fee Breakdown */}
                            <div className="mt-4 bg-[#F4F5F7] rounded-lg p-4">
                                <div className="flex justify-between mb-3">
                                    <span className="text-sm text-[#364153]">Transfer amount</span>
                                    <span className="font-semibold text-[#364153]">{amountFormatter.format(plan.netAmount)}</span>
                                </div>
                                <div className="flex justify-between mb-3">
                                    <span className="text-sm text-[#364153]">Fee ({(poolFeeRate * 100).toFixed(2)}%)</span>
                                    <span className="font-semibold text-[#364153]">{amountFormatter.format(poolFee)}</span>
                                </div>
                                <div className="flex justify-between mb-3">
                                    <span className="text-sm text-[#364153]">
                                        Pool savings{' '}
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#E7F9F5] text-[#00C9A7] rounded text-xs font-semibold">
                                            💰 vs direct
                                        </span>
                                    </span>
                                    <span className="font-semibold text-[#00C9A7]">-{amountFormatter.format(poolSavings)}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t-2 border-[#DFE1E6] font-bold">
                                    <span className="text-[#364153]">Total cost</span>
                                    <span className="text-[#364153]">{amountFormatter.format(plan.netAmount + poolFee)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Pool Info */}
                        <div className="bg-gradient-to-br from-[#00112C] to-[#2E4369] rounded-xl p-6 text-white shadow-sm animate-[fadeInUp_0.5s_ease-out] [animation-delay:0.2s]">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-12 h-12 bg-[rgba(159,232,112,0.2)] rounded-xl flex items-center justify-center text-2xl">
                                    💎
                                </div>
                                <div>
                                    <div className="text-xl font-bold mb-1">Payment Pool Active</div>
                                    <div className="text-sm opacity-90">Collaborative currency exchange</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-5">
                                <div className="text-center p-3 bg-[rgba(255,255,255,0.1)] rounded-lg backdrop-blur-sm">
                                    <div className="text-xl font-bold mb-1">317</div>
                                    <div className="text-xs opacity-80">Businesses</div>
                                </div>
                                <div className="text-center p-3 bg-[rgba(255,255,255,0.1)] rounded-lg backdrop-blur-sm">
                                    <div className="text-xl font-bold mb-1">£12.4M</div>
                                    <div className="text-xs opacity-80">Volume</div>
                                </div>
                                <div className="text-center p-3 bg-[rgba(255,255,255,0.1)] rounded-lg backdrop-blur-sm">
                                    <div className="text-xl font-bold mb-1">2h 15m</div>
                                    <div className="text-xs opacity-80">Until 3 PM</div>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-[rgba(255,255,255,0.1)] rounded-lg text-sm text-center">
                                Pool closes at 3:00 PM • Resets daily
                            </div>
                        </div>

                        {/* Plan Insights */}
                        <div className="bg-white rounded-xl border border-[#DFE1E6] p-6 shadow-sm animate-[fadeInUp_0.5s_ease-out] [animation-delay:0.3s]">
                            <h2 className="text-lg font-semibold text-[#00112C] mb-4">Plan Insights</h2>

                            <div className="space-y-4">
                                <div className="p-3 bg-[#E7F9F5] rounded-lg">
                                    <div className="text-xs text-[#6C7C8C] mb-1">Total saved with Pool</div>
                                    <div className="text-2xl font-bold text-[#00C9A7]">{amountFormatter.format(poolSavings * 3)}</div>
                                    <div className="text-xs text-[#6C7C8C] mt-1">Last 3 payments</div>
                                </div>

                                <div className="p-3 bg-[#E8EAED] rounded-lg">
                                    <div className="text-xs text-[#6C7C8C] mb-1">Avg. exchange rate</div>
                                    <div className="text-xl font-bold text-[#00112C]">{exchangeRate} {plan.targetCurrency}</div>
                                    <div className="text-xs text-[#6C7C8C] mt-1">Over last 3 months</div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl border border-[#DFE1E6] p-6 shadow-sm animate-[fadeInUp_0.5s_ease-out] [animation-delay:0.4s]">
                            <h2 className="text-lg font-semibold text-[#00112C] mb-4">Quick Actions</h2>

                            <div className="space-y-3">
                                {plan.status === "DRAFT" && (
                                    <>
                                        {role === "OWNER" || (role === "PLANNER" && plan.netAmount <= approvalThreshold) ? (
                                            <button
                                                onClick={handleActivate}
                                                disabled={isLoading}
                                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#9FE870] hover:bg-[#8FD860] text-[#00112C] font-semibold rounded-lg transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
                                            >
                                                <span>✓</span>
                                                {role === "OWNER" ? "Approve & Start Plan" : "Start Plan"}
                                            </button>
                                        ) : (
                                            <p className="text-sm text-[#6C7C8C] text-center py-2">
                                                This plan exceeds the approval threshold. Ask an Owner to approve and start it.
                                            </p>
                                        )}
                                    </>
                                )}

                                {plan.status === "ACTIVE" && (
                                    <>
                                        <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#9FE870] hover:bg-[#8FD860] text-[#00112C] font-semibold rounded-lg transition hover:-translate-y-0.5 hover:shadow-lg">
                                            <span>✓</span>
                                            Execute Next Payment
                                        </button>
                                        <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-white hover:bg-[#F4F5F7] text-[#00112C] font-semibold rounded-lg border-2 border-[#DFE1E6] hover:border-[#00112C] transition hover:-translate-y-0.5">
                                            <span>✏️</span>
                                            Edit Schedule
                                        </button>
                                        <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-white hover:bg-[#F4F5F7] text-[#00112C] font-semibold rounded-lg border-2 border-[#DFE1E6] hover:border-[#00112C] transition hover:-translate-y-0.5">
                                            <span>⏸</span>
                                            Skip Next Payment
                                        </button>
                                    </>
                                )}

                                <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-white hover:bg-[#F4F5F7] text-[#00112C] font-semibold rounded-lg border-2 border-[#DFE1E6] hover:border-[#00112C] transition hover:-translate-y-0.5">
                                    <span>📊</span>
                                    Export Report
                                </button>

                                {plan.status === "ACTIVE" && role === "OWNER" && (
                                    <button
                                        onClick={handleCancel}
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-white hover:bg-[#DC3545] text-[#DC3545] hover:text-white font-semibold rounded-lg border-2 border-[#DC3545] transition hover:-translate-y-0.5 disabled:opacity-50"
                                    >
                                        <span>⏹</span>
                                        Stop Plan
                                    </button>
                                )}

                                {plan.status === "ACTIVE" && role === "PLANNER" && (
                                    <p className="text-sm text-[#6C7C8C] text-center py-2">
                                        Only an Owner can stop an active plan.
                                    </p>
                                )}

                                {role === "VIEWER" && (
                                    <p className="text-sm text-[#6C7C8C] text-center py-2">
                                        View-only role: you cannot modify plans.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-[#F4F5F7] rounded-xl p-6 border-none shadow-sm animate-[fadeInUp_0.5s_ease-out] [animation-delay:0.5s]">
                            <div className="text-sm text-[#6C7C8C] leading-relaxed">
                                <strong className="text-[#00112C] block mb-2">ℹ️ About this plan</strong>
                                This recurring plan handles monthly payroll payments. Future payments can be edited individually or as a batch. Only an Owner can stop the entire plan.
                            </div>
                        </div>

                        {/* Activity Log */}
                        {activity.length > 0 && (
                            <div className="bg-white rounded-xl border border-[#DFE1E6] p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-[#00112C] mb-4">Activity Log</h2>

                                <div className="space-y-4">
                                    {[...activity].reverse().slice(0, 5).map((entry) => (
                                        <div key={entry.id} className="flex gap-3 pb-4 border-b border-[#DFE1E6] last:border-b-0 last:pb-0">
                                            <div className="w-10 h-10 bg-[#9FE870] rounded-full flex items-center justify-center font-bold text-[#00112C] flex-shrink-0">
                                                {entry.userName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-[#00112C] mb-1">
                                                    {entry.userName}
                                                </div>
                                                <div className="text-sm text-[#6C7C8C]">
                                                    {entry.message}
                                                </div>
                                            </div>
                                            <div className="text-xs text-[#6C7C8C] whitespace-nowrap">
                                                {dateTimeFormatter.format(new Date(entry.createdAt))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
                        {error}
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }
            `}</style>
        </div>
    );
}
