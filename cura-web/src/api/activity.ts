import { http } from "./http";

export type ActivityItem = {
  id: string;
  type: "RESIDENT" | "FACILITY" | "UNIT" | "INCIDENT" | "HOURS" | "ADMIN";
  title: string;
  status: "COMPLETED" | "PENDING" | "IN_REVIEW";
  createdAt: string;
  actor?: string;
};

export async function listRecentActivity(limit = 10): Promise<ActivityItem[]> {
  const res = await http.get("/activity", {
    params: { limit }
  });
  return res.data;
}