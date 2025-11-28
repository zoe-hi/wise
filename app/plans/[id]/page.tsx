import { notFound } from "next/navigation";
import {
  getPlanDetailAction,
  getPlanActivityAction,
} from "../../servers/planActions";
import { getSettingsAction } from "../../servers/settingsActions";
import { PlanDetailClient } from "./PlanDetailClient";

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

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlanDetailPage({ params }: PageProps) {
  const { id } = await params;

  let planData;
  let activity;
  let settings;

  try {
    planData = await getPlanDetailAction(id);
    activity = await getPlanActivityAction(id);
    settings = await getSettingsAction();
  } catch (e) {
    return notFound();
  }

  const { plan, steps } = planData;
  const amountFormatter = currencyFormatter(plan.targetCurrency);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-6xl px-6 pt-12">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              {plan.name}
            </h1>
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

        <div className="mb-6">
          <PlanDetailClient
            plan={plan}
            activity={activity}
            approvalThreshold={settings.approvalThreshold}
          />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
