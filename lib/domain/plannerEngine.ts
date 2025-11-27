import { Plan, PlanStep } from "./models";
import { generateId } from "../utils/id";

const DEMO_FX_RATE = 1.10;

export function generatePlanSteps(plan: Plan, now: Date): PlanStep[] {
  if (plan.netAmount <= 0) return [];

  if (plan.executionMode === "SPREAD_OVER_TIME") {
    return spreadOverTime(plan, now);
  } else {
    return oneShot(plan);
  }
}

function spreadOverTime(plan: Plan, now: Date): PlanStep[] {
  const steps: PlanStep[] = [];
  const N = plan.chunks ?? 1;

  const start = now.getTime();
  const end = new Date(plan.convertBy).getTime();
  const interval = (end - start) / N;

  // split net amount equally
  const baseAmount = Math.floor(plan.netAmount / N);
  let remaining = plan.netAmount;

  for (let i = 0; i < N; i++) {
    const tgtAmount = i === N - 1 ? remaining : baseAmount;
    remaining -= tgtAmount;

    const sourceAmount = Number((tgtAmount * DEMO_FX_RATE).toFixed(2));

    steps.push({
      id: generateId(),
      planId: plan.id,
      index: i,
      type: "CHUNK",
      when: new Date(start + interval * (i + 1)).toISOString(),
      sourceCurrency: plan.sourceCurrency,
      sourceAmount,
      targetCurrency: plan.targetCurrency,
      targetAmount: tgtAmount,
      explanation: `Step ${i + 1}/${N}: convert ${tgtAmount} ${plan.targetCurrency} to spread FX risk before ConvertBy.`,
    });
  }

  return steps;
}

function oneShot(plan: Plan): PlanStep[] {
  const tgtAmount = plan.netAmount;
  const sourceAmount = Number((tgtAmount * DEMO_FX_RATE).toFixed(2));

  return [
    {
      id: generateId(),
      planId: plan.id,
      index: 0,
      type: "TRIGGER",
      when: plan.convertBy,
      sourceCurrency: plan.sourceCurrency,
      sourceAmount,
      targetCurrency: plan.targetCurrency,
      targetAmount: tgtAmount,
      explanation: `Convert full amount once rate >= ${plan.minRate}. If not hit, fallback executes at ConvertBy.`,
    },
  ];
}
