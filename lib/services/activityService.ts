import { ActivityLog, ActivityType, User } from "../domain/models";
import { generateId } from "../utils/id";
import { nowISO } from "../utils/time";
import { activityLogs } from "../storage/memory";

export function logActivity(
  planId: string,
  type: ActivityType,
  message: string,
  user: User
) {
  const entry: ActivityLog = {
    id: generateId(),
    planId,
    type,
    message,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    createdAt: nowISO(),
  };

  if (!activityLogs.has(planId)) activityLogs.set(planId, []);
  activityLogs.get(planId)!.push(entry);

  return entry;
}

export function getActivity(planId: string): ActivityLog[] {
  return activityLogs.get(planId) ?? [];
}
