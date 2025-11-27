import { Rule } from "./models";

export function validateRule(rule: Rule) {
  if (rule.need.amount < 0) throw new Error("need.amount must be >= 0");
  if (rule.netting.existingBalance < 0) throw new Error("existingBalance < 0");
  if (rule.netting.expectedInflows < 0) throw new Error("expectedInflows < 0");

  if (rule.strategy.mode === "SPREAD_OVER_TIME") {
    if (!rule.strategy.chunks || rule.strategy.chunks < 1) {
      throw new Error("chunks must be >= 1 for SPREAD_OVER_TIME");
    }
  }

  if (rule.strategy.mode === "ONE_SHOT_RATE") {
    if (rule.strategy.minRate == null) {
      throw new Error("minRate is required for ONE_SHOT_RATE");
    }
  }
}
