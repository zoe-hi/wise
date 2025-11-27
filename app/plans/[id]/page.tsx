import { notFound } from "next/navigation";
import {
  getPlanDetailAction,
  getPlanActivityAction,
} from "../../servers/planActions";

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

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlanDetailPage({ params }: PageProps) {
  const { id } = await params;

  let planData;
  let activity;

  try {
    planData = await getPlanDetailAction(id);
    activity = await getPlanActivityAction(id);
  } catch (e) {
    return notFound();
  }

  const { plan, steps } = planData;
  const amountFormatter = currencyFormatter(plan.targetCurrency);
  const statusStyle = statusStyles[plan.status];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-6xl px-6 pt-12">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-slate-900">
                {plan.name}
              </h1>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${statusStyle.badge}`}
              >
                <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
                {statusStyle.label}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Convert by {dateTimeFormatter.format(new Date(plan.convertBy))}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">Net amount</p>
            <p className="text-2xl font-semibold text-slate-900">
              {amountFormatter.format(plan.netAmount)}
            </p>
            <p className="text-xs text-slate-500">
              Target currency: {plan.targetCurrency}
            </p>
          </div>
        </header>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Netting summary
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryItem
              label="Gross need"
              value={amountFormatter.format(plan.grossAmount)}
            />
            <SummaryItem
              label="Existing balance"
              value={amountFormatter.format(plan.existingBalance)}
            />
            <SummaryItem
              label="Expected inflows"
              value={amountFormatter.format(plan.expectedInflows)}
            />
            <SummaryItem
              label="Net to convert"
              value={amountFormatter.format(plan.netAmount)}
              emphasis
            />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Plan timeline
              </h3>
            </div>
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

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Activity log
            </h3>
            <ul className="mt-4 space-y-3">
              {activity.map((entry) => (
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
        </div>
      </div>
    </div>
  );
}

type SummaryItemProps = {
  label: string;
  value: string;
  emphasis?: boolean;
};

function SummaryItem({ label, value, emphasis }: SummaryItemProps) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 text-lg font-semibold ${emphasis ? "text-slate-900" : "text-slate-800"
          }`}
      >
        {value}
      </p>
    </div>
  );
}
