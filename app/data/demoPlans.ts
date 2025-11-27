export type PlanStatus = "DRAFT" | "ACTIVE" | "CANCELLED";

export type ExecutionMode = "SPREAD_OVER_TIME" | "ONE_SHOT_RATE";

export type Plan = {
  id: string;
  name: string;
  sourceCurrency: string;
  targetCurrency: string;
  grossAmount: number;
  netAmount: number;
  convertBy: string;
  executionMode: ExecutionMode;
  chunks?: number | null;
  minRate?: number | null;
  existingBalance: number;
  expectedInflows: number;
  status: PlanStatus;
  createdAt: string;
  createdBy: string;
};

export const demoPlans: Plan[] = [
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
    minRate: null,
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
    chunks: null,
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
    minRate: null,
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
    chunks: null,
    minRate: 0.76,
    existingBalance: 18000,
    expectedInflows: 15000,
    status: "ACTIVE",
    createdAt: "2025-01-05T09:20:00Z",
    createdBy: "Taylor Chen",
  },
];
