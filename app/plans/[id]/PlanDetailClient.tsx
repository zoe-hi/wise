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
        badge: "border border-amber-100 bg-amber-50 text-amber-700",
        dot: "bg-amber-500",
        label: "Draft",
    },
    ACTIVE: {
        badge: "border border-emerald-100 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
        label: "Active",
    },
    CANCELLED: {
        badge: "border border-rose-100 bg-rose-50 text-rose-700",
        dot: "bg-rose-500",
        label: "Cancelled",
    },
    COMPLETED: {
        badge: "border border-blue-100 bg-blue-50 text-blue-700",
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

    const renderActionButton = () => {
        // VIEWER: no action buttons
        if (role === "VIEWER") {
            return (
                <p className="text-sm text-slate-500">
                    View-only role: you cannot modify plans.
                </p>
            );
        }

        // No buttons for CANCELLED or COMPLETED
        if (plan.status === "CANCELLED" || plan.status === "COMPLETED") {
            return null;
        }

        // DRAFT status
        if (plan.status === "DRAFT") {
            // PLANNER: check threshold
            if (role === "PLANNER") {
                if (plan.netAmount > approvalThreshold) {
                    // Threshold exceeded - PLANNER cannot start
                    return (
                        <p className="text-sm text-slate-500">
                            This plan exceeds the approval threshold. Ask an Owner to
                            approve and start it.
                        </p>
                    );
                }
                return (
                    <button
                        onClick={handleActivate}
                        disabled={isLoading}
                        className="rounded-full bg-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600 disabled:opacity-50"
                    >
                        Start plan
                    </button>
                );
            }

            // OWNER: can always activate
            if (role === "OWNER") {
                return (
                    <button
                        onClick={handleActivate}
                        disabled={isLoading}
                        className="rounded-full bg-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600 disabled:opacity-50"
                    >
                        Approve & start
                    </button>
                );
            }
        }

        // ACTIVE status
        if (plan.status === "ACTIVE") {
            // Only OWNER can cancel
            if (role === "OWNER") {
                return (
                    <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:opacity-50"
                    >
                        Stop plan
                    </button>
                );
            }

            // PLANNER cannot cancel
            if (role === "PLANNER") {
                return (
                    <p className="text-sm text-slate-500">
                        Only an Owner can stop an active plan.
                    </p>
                );
            }
        }

        return null;
    };

    const planTimelineEl= () => {
        if (steps.length > 0) {
          return(
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900">
                      Plan timeline
                  </h3>
                  <ol className="mt-4 space-y-4">
                      {steps.map((step, index) => (
                          <li
                              key={step.id}
                              className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4"
                          >
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-900 shadow-sm">
                                  {index + 1}
                              </div>
                              <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-sm font-semibold text-slate-900">
                                          {amountFormatter.format(step.targetAmount)}{" "}
                                          {step.targetCurrency}
                                      </p>
                                      <span className="text-xs text-slate-500">
                                          {dateTimeFormatter.format(new Date(step.when))}
                                      </span>
                                  </div>
                                  <p className="mt-2 text-sm text-slate-700">
                                      {step.explanation}
                                  </p>
                              </div>
                          </li>
                      ))}
                  </ol>
              </section>
          );
        } else {
            return (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900">
                      Activity log
                  </h3>
                  <p className="text-sm text-slate-500 mt-2">No data</p>
              </section>
            );
        }
    };

    const activityLogEl= () => {
      if (activity.length > 0) {
          return (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900">
                      Activity log
                  </h3>
                  <ul className="mt-4 space-y-3">
                      {[...activity].reverse().map((entry) => (
                          <li
                              key={entry.id}
                              className="rounded-lg border border-slate-100 bg-slate-50/70 p-4"
                          >
                              <div className="flex items-start justify-between">
                                  <div>
                                      <p className="text-sm font-semibold text-slate-900">
                                          {entry.userName}{" "}
                                          <span className="text-xs font-medium text-slate-500">
                                              ({entry.userRole})
                                          </span>
                                      </p>
                                      <p className="text-sm text-slate-700">
                                          {entry.message}
                                      </p>
                                  </div>
                                  <p className="text-xs text-slate-500">
                                      {dateTimeFormatter.format(new Date(entry.createdAt))}
                                  </p>
                              </div>
                          </li>
                      ))}
                  </ul>
              </section>
          );
        } else {
          return (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900">
                      Activity log
                  </h3>
                  <p className="text-sm text-slate-500 mt-2">No data</p>
              </section>
          );
        }
    };

    const statusStyle = statusStyles[plan.status];
    const amountFormatter = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: plan.targetCurrency,
        maximumFractionDigits: 0,
    });

    return (
        <div className="space-y-6">
            {/* Action button area */}
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${statusStyle.badge}`}
                    >
                        <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
                        {statusStyle.label}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {error && (
                        <p className="text-sm text-rose-600">{error}</p>
                    )}
                    {renderActionButton()}
                </div>
            </div>

            {/* Two-column grid: Timeline left, Activity log right */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Plan timeline */}
                {planTimelineEl()}

                {/* Activity log */}
                {activityLogEl()}
            </div>
        </div>
    );
}
