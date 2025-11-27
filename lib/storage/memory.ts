import { Plan, PlanStep, ActivityLog } from "../domain/models";

export const plans = new Map<string, Plan>();
export const planSteps = new Map<string, PlanStep[]>();
export const activityLogs = new Map<string, ActivityLog[]>();
