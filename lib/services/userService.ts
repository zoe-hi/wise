import { User } from "../domain/models";

const demoUsers: Record<string, User> = {
  alice: { id: "alice", name: "Alice", role: "PLANNER" },
  bob: { id: "bob", name: "Bob", role: "OWNER" },
  viewer: { id: "viewer", name: "Viewer", role: "VIEWER" },
};

export function getUserFromHeaders(headers: Headers): User {
  const id = headers.get("X-User-Id") ?? "viewer";

  return demoUsers[id] ?? demoUsers["viewer"];
}

