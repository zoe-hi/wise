import { ActivityLog, Plan, PlanStep } from "../domain/models";

export const plans = new Map<string, Plan>();
export const planSteps = new Map<string, PlanStep[]>();
export const activityLogs = new Map<string, ActivityLog[]>();

// Seed data for demo
const seedId = "demo-1";
const now = new Date().toISOString();
const convertBy = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

const demoPlan: Plan = {
    id: seedId,
    name: "Q4 Marketing Budget",
    sourceCurrency: "EUR",
    targetCurrency: "USD",
    grossAmount: 100000,
    netAmount: 50000,
    convertBy,
    executionMode: "SPREAD_OVER_TIME",
    chunks: 4,
    existingBalance: 20000,
    expectedInflows: 30000,
    status: "DRAFT",
    createdAt: now,
    createdBy: "user-1",
};

const demoSteps: PlanStep[] = [
    {
        id: "step-1",
        planId: seedId,
        index: 0,
        type: "CHUNK",
        when: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        sourceCurrency: "EUR",
        sourceAmount: 13750,
        targetCurrency: "USD",
        targetAmount: 12500,
        explanation: "Step 1/4: convert 12500 USD",
    },
    {
        id: "step-2",
        planId: seedId,
        index: 1,
        type: "CHUNK",
        when: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        sourceCurrency: "EUR",
        sourceAmount: 13750,
        targetCurrency: "USD",
        targetAmount: 12500,
        explanation: "Step 2/4: convert 12500 USD",
    },
];

plans.set(seedId, demoPlan);
planSteps.set(seedId, demoSteps);
activityLogs.set(seedId, [
    {
        id: "log-1",
        planId: seedId,
        type: "PLAN_CREATED",
        message: "Plan created by Demo User",
        userId: "user-1",
        userName: "Demo User",
        userRole: "PLANNER",
        createdAt: now,
    },
]);
