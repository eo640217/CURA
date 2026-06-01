import React, { useEffect, useState } from "react";
import { listRecentActivity, ActivityItem } from "../api/activity";
import { useAuthState } from "../auth/useAuth";
import { actionItems, worklets, quickActions } from "./homeData";
import ActionStrip from "../components/ActionStrip";
import WorkletCard from "../components/WorkletCard";
import QuickAction from "../components/QuickAction";
import "./DashboardView.scss";

type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: ActivityItem[] }
  | { status: "error"; message: string };

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getShift(): { label: string; variant: "day" | "evening" | "night" } {
  const h = new Date().getHours();
  if (h >= 8 && h < 16)  return { label: "Day Shift",     variant: "day"     };
  if (h >= 16 && h < 24) return { label: "Evening Shift", variant: "evening" };
  return                         { label: "Night Shift",   variant: "night"   };
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function statusVariant(s: ActivityItem["status"]) {
  if (s === "COMPLETED") return "completed";
  if (s === "IN_REVIEW")  return "process";
  return "pending";
}

function statusLabel(s: ActivityItem["status"]) {
  if (s === "IN_REVIEW")  return "In Review";
  if (s === "COMPLETED") return "Completed";
  return "Pending";
}

const TODAY = new Date().toLocaleDateString("en-GB", {
  weekday: "long",
  day:     "numeric",
  month:   "long",
  year:    "numeric",
});

export default function DashboardView() {
  const { username } = useAuthState();
  const [actState, setActState] = useState<LoadState>({ status: "idle" });
  const shift = getShift();

  const loadActivity = async () => {
    try {
      setActState({ status: "loading" });
      const data = await listRecentActivity(10);
      setActState({ status: "success", data });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load activity";
      setActState({ status: "error", message: msg });
    }
  };

  useEffect(() => {
    loadActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="dashboard">

      {/* ── Greeting ──────────────────────────────────────────────────── */}
      <section className="dashboard__greeting">
        <div>
          <h1 className="dashboard__greeting-title">
            {getGreeting()}, {username ?? "there"}
          </h1>
          <p className="dashboard__greeting-sub">
            Sunrise Care Home &nbsp;·&nbsp; {TODAY}
          </p>
        </div>
        <span className={`dashboard__shift-badge dashboard__shift-badge--${shift.variant}`}>
          {shift.label}
        </span>
      </section>

      {/* ── Awaiting action ───────────────────────────────────────────── */}
      <section className="dashboard__section">
        <div className="dashboard__section-head">
          <h2 className="dashboard__section-title">Awaiting your action</h2>
          <span className="dashboard__count-badge" aria-label={`${actionItems.length} items`}>
            {actionItems.length}
          </span>
        </div>
        <ActionStrip items={actionItems} />
      </section>

      {/* ── Overview worklets ──────────────────────────────────────────── */}
      <section className="dashboard__section">
        <h2 className="dashboard__section-title">Overview</h2>
        <div className="dashboard__worklets">
          {worklets.map((w) => (
            <WorkletCard key={w.id} data={w} />
          ))}
        </div>
      </section>

      {/* ── Quick actions ──────────────────────────────────────────────── */}
      <section className="dashboard__section">
        <h2 className="dashboard__section-title">Quick actions</h2>
        <div className="dashboard__quick-actions">
          {quickActions.map((qa) => (
            <QuickAction key={qa.id} data={qa} />
          ))}
        </div>
      </section>

      {/* ── Recent activity ────────────────────────────────────────────── */}
      <section className="dashboard__section">
        <div className="dashboard__section-head">
          <h2 className="dashboard__section-title">Recent activity</h2>
          <button
            type="button"
            className="dashboard__refresh-btn"
            onClick={loadActivity}
            title="Refresh activity"
          >
            ↻ Refresh
          </button>
        </div>

        <div className="dashboard__activity">
          <table className="dashboard__table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {actState.status === "loading" && (
                <tr>
                  <td colSpan={3} className="dashboard__table-msg">Loading…</td>
                </tr>
              )}
              {actState.status === "error" && (
                <tr>
                  <td colSpan={3} className="dashboard__table-msg dashboard__table-msg--error">
                    {actState.message}
                  </td>
                </tr>
              )}
              {actState.status === "success" && actState.data.length === 0 && (
                <tr>
                  <td colSpan={3} className="dashboard__table-msg">No recent activity.</td>
                </tr>
              )}
              {actState.status === "success" &&
                actState.data.map((row) => (
                  <tr key={row.id}>
                    <td>{row.title}</td>
                    <td>{fmtDate(row.createdAt)}</td>
                    <td>
                      <span className={`dashboard__status dashboard__status--${statusVariant(row.status)}`}>
                        {statusLabel(row.status)}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
