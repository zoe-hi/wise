export type Netting = {
  existingBalance: number;
  expectedInflows: number;
};

export type Strategy =
  | { mode: "SPREAD_OVER_TIME"; chunks: number }
  | { mode: "ONE_SHOT_RATE"; minRate: number };

export type Rule = {
  need: {
    currency: string;
    amount: number;
    convertBy: string; // ISO datetime
  };
  sourceCurrency: string;
  strategy: Strategy;
  netting: Netting;
};
