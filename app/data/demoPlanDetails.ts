import { demoPlans, type Plan } from "./demoPlans";

type StepType = "CHUNK" | "TRIGGER";

export type PlanStep = {
  id: string;
  planId: string;
  index: number;
  type: StepType;
  when: string;
  targetCurrency: string;
  targetAmount: number;
  explanation: string;
};

type ActivityType =
  | "PLAN_CREATED"
  | "PLAN_ACTIVATED"
  | "PLAN_CANCELLED"
  | "PLAN_UPDATED";

export type ActivityLogEntry = {
  id: string;
  planId: string;
  type: ActivityType;
  message: string;
  userName: string;
  userRole: "OWNER" | "PLANNER" | "VIEWER";
  createdAt: string;
};

const stepsByPlan: Record<string, PlanStep[]> = {
  "plan-uk-payroll-nov": [
    {
      id: "step-uk-1",
      planId: "plan-uk-payroll-nov",
      index: 0,
      type: "CHUNK",
      when: "2025-01-28T09:00:00Z",
      targetCurrency: "GBP",
      targetAmount: 6000,
      explanation:
        "Convert the first third ahead of payroll to reduce deadline risk.",
    },
    {
      id: "step-uk-2",
      planId: "plan-uk-payroll-nov",
      index: 1,
      type: "CHUNK",
      when: "2025-02-05T09:00:00Z",
      targetCurrency: "GBP",
      targetAmount: 6000,
      explanation: "Second chunk to smooth out FX exposure mid-cycle.",
    },
    {
      id: "step-uk-3",
      planId: "plan-uk-payroll-nov",
      index: 2,
      type: "CHUNK",
      when: "2025-02-12T09:00:00Z",
      targetCurrency: "GBP",
      targetAmount: 6000,
      explanation:
        "Final conversion on deadline to cover any remaining payroll need.",
    },
  ],
  "plan-supplier-batch-q4": [
    {
      id: "step-supplier-1",
      planId: "plan-supplier-batch-q4",
      index: 0,
      type: "TRIGGER",
      when: "2025-02-05T16:30:00Z",
      targetCurrency: "EUR",
      targetAmount: 42000,
      explanation:
        "Convert the full amount once EURUSD hits the minimum rate, otherwise execute at deadline.",
    },
  ],
  "plan-marketing-campaign": [
    {
      id: "step-mkt-1",
      planId: "plan-marketing-campaign",
      index: 0,
      type: "CHUNK",
      when: "2025-02-01T14:00:00Z",
      targetCurrency: "GBP",
      targetAmount: 6500,
      explanation: "Initial tranche for agency retainer and deposits.",
    },
    {
      id: "step-mkt-2",
      planId: "plan-marketing-campaign",
      index: 1,
      type: "CHUNK",
      when: "2025-02-10T14:00:00Z",
      targetCurrency: "GBP",
      targetAmount: 6500,
      explanation: "Second tranche aligned to media booking schedule.",
    },
    {
      id: "step-mkt-3",
      planId: "plan-marketing-campaign",
      index: 2,
      type: "CHUNK",
      when: "2025-02-20T14:00:00Z",
      targetCurrency: "GBP",
      targetAmount: 13000,
      explanation:
        "Final amount to cover launch creatives before the go-live date.",
    },
  ],
  "plan-saas-renewals": [
    {
      id: "step-saas-1",
      planId: "plan-saas-renewals",
      index: 0,
      type: "TRIGGER",
      when: "2025-02-15T11:00:00Z",
      targetCurrency: "USD",
      targetAmount: 6000,
      explanation:
        "Convert half ahead of renewals to lock a portion at current rates.",
    },
    {
      id: "step-saas-2",
      planId: "plan-saas-renewals",
      index: 1,
      type: "TRIGGER",
      when: "2025-02-28T11:00:00Z",
      targetCurrency: "USD",
      targetAmount: 6000,
      explanation:
        "Finalize remaining amount on the renewal deadline to cover all contracts.",
    },
  ],
};

const activityByPlan: Record<string, ActivityLogEntry[]> = {
  "plan-uk-payroll-nov": [
    {
      id: "act-uk-1",
      planId: "plan-uk-payroll-nov",
      type: "PLAN_CREATED",
      message: "Plan created for upcoming payroll run.",
      userName: "Alex Morgan",
      userRole: "PLANNER",
      createdAt: "2025-01-22T10:15:00Z",
    },
    {
      id: "act-uk-2",
      planId: "plan-uk-payroll-nov",
      type: "PLAN_UPDATED",
      message: "Netting inputs updated with latest inflows.",
      userName: "Alex Morgan",
      userRole: "PLANNER",
      createdAt: "2025-01-24T08:10:00Z",
    },
  ],
  "plan-supplier-batch-q4": [
    {
      id: "act-supplier-1",
      planId: "plan-supplier-batch-q4",
      type: "PLAN_CREATED",
      message: "Plan drafted for Q4 supplier settlement.",
      userName: "Priya Shah",
      userRole: "PLANNER",
      createdAt: "2025-01-18T08:45:00Z",
    },
    {
      id: "act-supplier-2",
      planId: "plan-supplier-batch-q4",
      type: "PLAN_ACTIVATED",
      message: "Owner approved and started the plan.",
      userName: "Sam Carter",
      userRole: "OWNER",
      createdAt: "2025-01-20T09:20:00Z",
    },
  ],
  "plan-marketing-campaign": [
    {
      id: "act-mkt-1",
      planId: "plan-marketing-campaign",
      type: "PLAN_CREATED",
      message: "Campaign budget plan drafted.",
      userName: "Jordan Lee",
      userRole: "PLANNER",
      createdAt: "2025-01-10T12:00:00Z",
    },
    {
      id: "act-mkt-2",
      planId: "plan-marketing-campaign",
      type: "PLAN_CANCELLED",
      message: "Plan cancelled after scope change.",
      userName: "Jordan Lee",
      userRole: "PLANNER",
      createdAt: "2025-01-25T15:30:00Z",
    },
  ],
  "plan-saas-renewals": [
    {
      id: "act-saas-1",
      planId: "plan-saas-renewals",
      type: "PLAN_CREATED",
      message: "Plan drafted for SaaS renewal payments.",
      userName: "Taylor Chen",
      userRole: "PLANNER",
      createdAt: "2025-01-05T09:20:00Z",
    },
    {
      id: "act-saas-2",
      planId: "plan-saas-renewals",
      type: "PLAN_ACTIVATED",
      message: "Owner approved staged conversions.",
      userName: "Morgan Blake",
      userRole: "OWNER",
      createdAt: "2025-01-07T11:05:00Z",
    },
  ],
};

export const getPlanById = (id: string): Plan | undefined =>
  demoPlans.find((plan) => plan.id === id);

export const getPlanSteps = (id: string): PlanStep[] =>
  [...(stepsByPlan[id] ?? [])].sort((a, b) =>
    new Date(a.when).getTime() - new Date(b.when).getTime(),
  );

export const getPlanActivity = (id: string): ActivityLogEntry[] =>
  [...(activityByPlan[id] ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
