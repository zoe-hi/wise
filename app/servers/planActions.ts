"use server";

import { Plan, PlanStep, User, ActivityLog } from "../../lib/domain/models";
import { Rule } from "../../lib/domain/types";
import { previewPlan, createPlan, listPlans, getPlan, activatePlan, cancelPlan, completePlan } from "../../lib/services/planService";
import { settings } from "../../lib/services/settingsService";
import { activityLogs } from "../../lib/storage/memory";

const ALLOWED_ROLES = ["PLANNER", "OWNER"];

// RBAC helper
function checkRole(user: User) {
  if (!ALLOWED_ROLES.includes(user.role)) {
    throw new Error("Forbidden: insufficient role");
  }
}

// Server Actions
export async function previewPlanAction(rule: Rule, user: User): Promise<{ plan: Plan; steps: PlanStep[] }> {
  checkRole(user);
  return previewPlan(rule, user);
}

export async function createPlanAction(rule: Rule, user: User): Promise<{ plan: Plan; steps: PlanStep[] }> {
  checkRole(user);
  return createPlan(rule, user);
}

export async function listPlansAction(): Promise<ReturnType<typeof listPlans>> {
  return listPlans();
}

export async function getPlanDetailAction(planId: string): Promise<{ plan: Plan; steps: PlanStep[] }> {
  return getPlan(planId);
}

export async function getPlanActivityAction(planId: string): Promise<ActivityLog[]> {
  const logs = activityLogs.get(planId) ?? [];
  return logs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function activatePlanAction(planId: string, user: User): Promise<Plan> {
  const planData = getPlan(planId);
  const plan = planData.plan;
  const threshold = settings.approvalThreshold;

  if (plan.netAmount > threshold && user.role !== "OWNER") {
    throw new Error(`Forbidden: NetAmount > ${threshold}, only OWNER can activate`);
  }
  checkRole(user);

  return activatePlan(planId, user);
}

export async function cancelPlanAction(planId: string, user: User): Promise<Plan> {
  const planData = getPlan(planId);
  const plan = planData.plan;
  if (plan.status !== "ACTIVE") throw new Error("Cannot cancel: plan not ACTIVE");
  checkRole(user, ["OWNER"]);

  return cancelPlan(planId, user);
}

export async function completePlanAction(planId: string, user: User): Promise<Plan> {
  const planData = getPlan(planId);
  const plan = planData.plan;
  plan.status = "COMPLETED";
  completePlan(planId, user);
  return plan;
}
