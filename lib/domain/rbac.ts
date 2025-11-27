import { User } from "./models";
import { Settings } from "../services/settingsService";

export function canActivate(user: User, netAmount: number, settings: Settings): boolean {
  if (netAmount <= settings.approvalThreshold) {
    return user.role === "OWNER" || user.role === "PLANNER";
  }
  return user.role === "OWNER";
}

export function canCancel(user: User): boolean {
  return user.role === "OWNER";
}
