import Link from "next/link";
import { demoPlans } from "../data/demoPlans";

const statusStyles: Record<
  (typeof demoPlans)[number]["status"],
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

export default function PlansPage() {
  const plans = demoPlans.map((plan) => ({
    ...plan,
    formattedNetAmount: currencyFormatter(plan.targetCurrency).format(
      plan.netAmount,
    ),
  }));

  return (
    <div className="min-h-screen bg-slate-50 pb-16 w-full">
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
          <Link
            href="/plans/new"
            className="inline-flex items-center justify-center rounded-full bg-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
          >
            New plan
          </Link>
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
                        <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
                        {plan.status}
                      </span>
                    </td>

                    {/* Net amount */}
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {plan.formattedNetAmount}
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
    </div>
  );
}
