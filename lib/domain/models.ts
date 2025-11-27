export type UserRole = "OWNER" | "PLANNER" | "VIEWER";

export type User = {
  id: string;
  name: string;
  role: UserRole;
};

export type PlanStatus = "DRAFT" | "ACTIVE" | "CANCELLED" | "COMPLETED";

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

  chunks?: number;  // for SPREAD
  minRate?: number; // for ONE_SHOT

  existingBalance: number;
  expectedInflows: number;

  status: PlanStatus;

  createdAt: string;
  createdBy: string;

  approvedAt?: string;
  approvedBy?: string;

  cancelledAt?: string;

  rawRuleJson?: unknown;
};

export type PlanStepType = "CHUNK" | "TRIGGER";

export type PlanStep = {
  id: string;
  planId: string;
  index: number;
  type: PlanStepType;

  when: string;

  sourceCurrency: string;
  sourceAmount: number;
  targetCurrency: string;
  targetAmount: number;

  explanation: string;
};

export type ActivityType =
  | "PLAN_CREATED"
  | "PLAN_UPDATED"
  | "PLAN_ACTIVATED"
  | "PLAN_CANCELLED"
  | "PLAN_COMPLETED";

export type ActivityLog = {
  id: string;
  planId: string;
  type: ActivityType;
  message: string;

  userId: string;
  userName: string;
  userRole: UserRole;

  createdAt: string;
};

// Rule received from frontend
export type Rule = {
  need: {
    currency: string;
    amount: number;
    convertBy: string;
  };
  strategy: {
    mode: ExecutionMode;
    chunks?: number;
    minRate?: number;
  };
  netting: {
    existingBalance: number;
    expectedInflows: number;
  };
  sourceCurrency: string;
  name?: string;
};
