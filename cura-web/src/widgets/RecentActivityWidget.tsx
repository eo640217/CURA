import React, { useEffect, useMemo, useState } from "react";
import { ActivityItem, listRecentActivity } from "../api/activity";

type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}

function statusClass(s: ActivityItem["status"]) {
  if (s === "COMPLETED") return "completed";
  if (s === "IN_REVIEW") return "process";
  return "pending";
}

function statusLabel(s: ActivityItem["status"]) {
  if (s === "IN_REVIEW") return "In Review";
  return s.charAt(0) + s.slice(1).toLowerCase();
}

export default function RecentActivityWidget({ limit = 8 }: { limit?: number }) {
  const [state, setState] = useState<LoadState<ActivityItem[]>>({ status: "idle" });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setState({ status: "loading" });
        const data = await listRecentActivity(limit);
        if (cancelled) return;
        setState({ status: "success", data });
      } catch (e: any) {
        if (cancelled) return;
        setState({ status: "error", message: e?.message || "Failed to load activity" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [limit]);

  const rows = useMemo(() => {
    if (state.status !== "success") return [];
    return state.data;
  }, [state]);

  return (
    <div className="dashWidget">
      <div className="dashWidget__head">
        <h3>Recent Activity</h3>
        <div className="dashWidget__headRight">
          <button
            className="dashIconBtn"
            onClick={() => window.location.reload()}
            type="button"
            title="Refresh"
          >
            <i className="bx bx-refresh" />
          </button>
        </div>
      </div>

      {state.status === "loading" && <div className="dashWidget__empty">Loading…</div>}
      {state.status === "error" && <div className="dashWidget__empty">Error: {state.message}</div>}
      {state.status === "success" && rows.length === 0 && (
        <div className="dashWidget__empty">No recent activity.</div>
      )}

      {state.status === "success" && rows.length > 0 && (
        <table className="dashTable">
          <thead>
            <tr>
              <th>Item</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="dashTable__item">
                  <img src="https://placehold.co/72x72/png" alt="" />
                  <span>{r.title}</span>
                </td>
                <td>{fmtDate(r.createdAt)}</td>
                <td>
                  <span className={`status ${statusClass(r.status)}`}>
                    {statusLabel(r.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}