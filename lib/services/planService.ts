import {
  Plan,
  Rule,
  User,
} from "../domain/models";

import { validateRule } from "../domain/validators";
import { generatePlanSteps } from "../domain/plannerEngine";
import { generateId } from "../utils/id";
import { nowISO } from "../utils/time";
import { plans, planSteps } from "../storage/memory";
import { logActivity } from "./activityService";
import { canActivate, canCancel } from "../domain/rbac";
import { settings } from "./settingsService";

export function previewPlan(rule: Rule, user: User) {
  validateRule(rule);

  const plan: Plan = {
    id: "preview",
    name: rule.name ?? "Preview Plan",
    sourceCurrency: rule.sourceCurrency,
    targetCurrency: rule.need.currency,
    grossAmount: rule.need.amount,
    netAmount: Math.max(
      0,
      rule.need.amount - rule.netting.existingBalance - rule.netting.expectedInflows
    ),
    convertBy: rule.need.convertBy,
    executionMode: rule.strategy.mode,
    chunks: rule.strategy.chunks,
    minRate: rule.strategy.minRate,
    existingBalance: rule.netting.existingBalance,
    expectedInflows: rule.netting.expectedInflows,
    status: "DRAFT",
    createdAt: nowISO(),
    createdBy: user.id,
    rawRuleJson: rule,
  };

  const steps = generatePlanSteps(plan, new Date());
  return { plan, steps };
}

export function createPlan(rule: Rule, user: User) {
  validateRule(rule);

  const id = generateId();
  const createdAt = nowISO();

  const plan: Plan = {
    id,
    name: rule.name ?? `Plan ${id}`,
    sourceCurrency: rule.sourceCurrency,
    targetCurrency: rule.need.currency,
    grossAmount: rule.need.amount,
    netAmount: Math.max(
      0,
      rule.need.amount - rule.netting.existingBalance - rule.netting.expectedInflows
    ),
    convertBy: rule.need.convertBy,
    executionMode: rule.strategy.mode,
    chunks: rule.strategy.chunks,
    minRate: rule.strategy.minRate,
    existingBalance: rule.netting.existingBalance,
    expectedInflows: rule.netting.expectedInflows,
    status: "DRAFT",
    createdAt,
    createdBy: user.id,
    rawRuleJson: rule,
  };

  plans.set(id, plan);

  const steps = generatePlanSteps(plan, new Date());
  planSteps.set(id, steps);

  logActivity(id, "PLAN_CREATED", `Plan created by ${user.name}`, user);

  return { plan, steps };
}

export function listPlans() {
  return Array.from(plans.values()).map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    sourceCurrency: p.sourceCurrency,
    targetCurrency: p.targetCurrency,
    netAmount: p.netAmount,
    convertBy: p.convertBy,
  }));
}

export function getPlan(id: string) {
  const plan = plans.get(id);
  if (!plan) throw new Error("Plan not found");

  const steps = planSteps.get(id) ?? [];
  return { plan, steps };
}

export function activatePlan(id: string, user: User) {
  const plan = plans.get(id);
  if (!plan) throw new Error("Plan not found");

  if (!canActivate(user, plan.netAmount, settings)) {
    throw new Error("You do not have permission to activate this plan.");
  }

  plan.status = "ACTIVE";
  plan.approvedAt = nowISO();
  plan.approvedBy = user.id;

  logActivity(id, "PLAN_ACTIVATED", "Plan activated", user);

  return plan;
}

export function cancelPlan(id: string, user: User) {
  const plan = plans.get(id);
  if (!plan) throw new Error("Plan not found");

  if (plan.status !== "ACTIVE") {
    throw new Error("Only ACTIVE plans can be cancelled.");
  }

  if (!canCancel(user)) {
    throw new Error("You do not have permission to cancel this plan.");
  }

  plan.status = "CANCELLED";
  plan.cancelledAt = nowISO();

  logActivity(id, "PLAN_CANCELLED", "Plan cancelled", user);

  return plan;
}

export function completePlan(id: string, user: User) {
  const plan = plans.get(id);
  if (!plan) throw new Error("Plan not found");

  plan.status = "COMPLETED";
  logActivity(id, "PLAN_COMPLETED", "Plan completed", user);

  return plan;
}
