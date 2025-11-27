import { ActivityLog, Plan, PlanStep } from "../domain/models";

// Seed data for demo
const seedId = "demo-1";
const now = new Date().toISOString();
const convertBy = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

type MemoryStore = {
  plans: Map<string, Plan>;
  planSteps: Map<string, PlanStep[]>;
  activityLogs: Map<string, ActivityLog[]>;
};

if (!globalThis.__memoryStore) {
  const demoPlans: Plan[] = [
    {
      id: seedId,
      name: "Q4 Marketing Budget",
      sourceCurrency: "EUR",
      targetCurrency: "USD",
      grossAmount: 100000,
      netAmount: 50000,
      convertBy: "2025-02-12T12:00:00Z",
      executionMode: "SPREAD_OVER_TIME",
      chunks: 4,
      existingBalance: 20000,
      expectedInflows: 30000,
      status: "DRAFT",
      createdAt: now,
      createdBy: "user-1",
    },
    {
      id: "plan-uk-payroll-nov",
      name: "UK Payroll November",
      sourceCurrency: "EUR",
      targetCurrency: "GBP",
      grossAmount: 52000,
      netAmount: 18000,
      convertBy: "2025-02-12T09:00:00Z",
      executionMode: "SPREAD_OVER_TIME",
      chunks: 3,
      minRate: 0,
      existingBalance: 24000,
      expectedInflows: 10000,
      status: "DRAFT",
      createdAt: "2025-01-22T10:15:00Z",
      createdBy: "Alex Morgan",
    },
    {
      id: "plan-supplier-batch-q4",
      name: "Supplier Batch Q4",
      sourceCurrency: "USD",
      targetCurrency: "EUR",
      grossAmount: 90000,
      netAmount: 42000,
      convertBy: "2025-02-05T16:30:00Z",
      executionMode: "ONE_SHOT_RATE",
      chunks: 1,
      minRate: 0.93,
      existingBalance: 28000,
      expectedInflows: 20000,
      status: "ACTIVE",
      createdAt: "2025-01-18T08:45:00Z",
      createdBy: "Priya Shah",
    },
    {
      id: "plan-marketing-campaign",
      name: "Marketing Campaign Launch",
      sourceCurrency: "USD",
      targetCurrency: "GBP",
      grossAmount: 30000,
      netAmount: 26000,
      convertBy: "2025-02-20T14:00:00Z",
      executionMode: "SPREAD_OVER_TIME",
      chunks: 4,
      minRate: 0,
      existingBalance: 2000,
      expectedInflows: 2000,
      status: "CANCELLED",
      createdAt: "2025-01-10T12:00:00Z",
      createdBy: "Jordan Lee",
    },
    {
      id: "plan-saas-renewals",
      name: "SaaS Renewals Spring",
      sourceCurrency: "CAD",
      targetCurrency: "USD",
      grossAmount: 45000,
      netAmount: 12000,
      convertBy: "2025-02-28T11:00:00Z",
      executionMode: "ONE_SHOT_RATE",
      chunks: 2,
      minRate: 0.76,
      existingBalance: 18000,
      expectedInflows: 15000,
      status: "ACTIVE",
      createdAt: "2025-01-05T09:20:00Z",
      createdBy: "Taylor Chen",
    },
  ];
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

  globalThis.__memoryStore = {
    plans: new Map<string, Plan>(
      demoPlans.map(plan => [plan.id, plan])
    ),

    planSteps: new Map<string, PlanStep[]>([
      [seedId, demoSteps]
    ]),

    activityLogs: new Map<string, ActivityLog[]>([
      [seedId,
        [{
            id: "log-1",
            planId: seedId,
            type: "PLAN_CREATED",
            message: "Plan created by Demo User",
            userId: "user-1",
            userName: "Demo User",
            userRole: "PLANNER",
            createdAt: now,
       }],
      ]
    ])
  };
}

export const plans = globalThis.__memoryStore.plans;
export const planSteps = globalThis.__memoryStore.planSteps;
export const activityLogs = globalThis.__memoryStore.activityLogs;

declare global {
  var __memoryStore: MemoryStore | undefined;
}
