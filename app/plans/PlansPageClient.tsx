"use client";

import Link from "next/link";
import { useState } from "react";
import { Plan, PlanStatus } from "../../lib/domain/models";
import { RuleBuilderModal } from "./RuleBuilderModal";
import { useRole } from "../contexts/RoleContext";

type PlanSummary = {
    id: string;
    name: string;
    status: PlanStatus;
    sourceCurrency: string;
    targetCurrency: string;
    netAmount: number;
    convertBy: string;
};

type PlansPageClientProps = {
    initialPlans: PlanSummary[];
};

const statusStyles: Record<
    "DRAFT" | "ACTIVE" | "CANCELLED" | "COMPLETED",
    { badge: string; dot: string }
> = {
    DRAFT: {
        badge: "border border-amber-100 bg-amber-50 text-amber-700",
        dot: "bg-amber-500",
    },
    ACTIVE: {
        badge: "border border-emerald-100 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
    },
    CANCELLED: {
        badge: "border border-rose-100 bg-rose-50 text-rose-700",
        dot: "bg-rose-500",
    },
    COMPLETED: {
        badge: "border border-blue-100 bg-blue-50 text-blue-700",
        dot: "bg-blue-500",
    },
};

const currencyFormatter = (currency: string) =>
    new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    });

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
});

export function PlansPageClient({ initialPlans }: PlansPageClientProps) {
    const { role } = useRole();
    const [plans, setPlans] = useState<PlanSummary[]>(
        [...initialPlans].sort(
            (a, b) => new Date(b.convertBy).getTime() - new Date(a.convertBy).getTime()
        )
    );
    const [isNewPlanOpen, setIsNewPlanOpen] = useState(false);

    const handlePlanCreated = (newPlan: Plan) => {
        setPlans((prev) => {
            const updated = [...prev, newPlan];
            return updated.sort(
                (a, b) => new Date(b.convertBy).getTime() - new Date(a.convertBy).getTime()
            );
        });
        setIsNewPlanOpen(false);
    };

    const canCreatePlans = role !== "VIEWER";

    return (
        <div className="min-h-screen bg-slate-100 pb-16">
            <div className="mx-auto max-w-6xl px-6 pt-12">
                <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900">
                            Convert plans
                        </h1>
                        <p className="mt-2 text-sm text-slate-600">
                            Track your planned conversions and their deadlines in one place.
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <button
                            onClick={() => canCreatePlans && setIsNewPlanOpen(true)}
                            disabled={!canCreatePlans}
                            className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${canCreatePlans
                                ? "bg-teal-500 hover:bg-teal-600 focus-visible:outline-teal-500"
                                : "cursor-not-allowed bg-slate-300 opacity-50"
                                }`}
                        >
                            New plan
                        </button>
                        {!canCreatePlans && (
                            <p className="text-xs text-slate-500">
                                View-only role: ask an Owner or Planner to create plans.
                            </p>
                        )}
                    </div>
                </header>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                    Plan name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                    Net amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                    Convert by
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {plans.map((plan) => {
                                const statusStyle = statusStyles[plan.status];
                                const formattedNetAmount = currencyFormatter(
                                    plan.targetCurrency,
                                ).format(plan.netAmount);

                                return (
                                    <tr
                                        key={plan.id}
                                        className="cursor-pointer bg-white transition hover:bg-slate-50"
                                    >
                                        {/* Plan name cell with Link */}
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                                            <Link
                                                href={`/plans/${plan.id}`}
                                                className="inline-flex items-center text-slate-900 hover:underline"
                                                aria-label={`View plan ${plan.name}`}
                                            >
                                                {plan.name}
                                            </Link>
                                        </td>

                                        {/* Status cell */}
                                        <td className="px-6 py-4 text-sm">
                                            <span
                                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${statusStyle.badge}`}
                                            >
                                                <span
                                                    className={`h-2 w-2 rounded-full ${statusStyle.dot}`}
                                                />
                                                {plan.status}
                                            </span>
                                        </td>

                                        {/* Net amount */}
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                                            {formattedNetAmount}
                                        </td>

                                        {/* Convert-by */}
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {dateTimeFormatter.format(new Date(plan.convertBy))}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {isNewPlanOpen && (
                <RuleBuilderModal
                    onClose={() => setIsNewPlanOpen(false)}
                    onSave={handlePlanCreated}
                />
            )}
        </div>
    );
}
