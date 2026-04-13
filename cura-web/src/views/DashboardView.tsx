import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listRecentActivity, ActivityItem } from "../api/activity";
import "./DashboardView.scss";

type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: ActivityItem[] }
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
  if (s === "COMPLETED") return "Completed";
  return "Pending";
}

export default function DashboardView() {
  const [state, setState] = useState<LoadState>({ status: "idle" });

  const load = async () => {
    try {
      setState({ status: "loading" });
      const data = await listRecentActivity(10);
      setState({ status: "success", data });
    } catch (e: any) {
      setState({ status: "error", message: e?.message || "Failed to load activity" });
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="head-title">
        <div className="left">
          <h1>Dashboard</h1>
          <ul className="breadcrumb">
            <li>
                <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <i className="bx bx-chevron-right" />
            </li>
            <li>
              <span className="active">Home</span>
            </li>
          </ul>
        </div>

        {/* <a className="btn-download" href="#" onClick={(e) => e.preventDefault()}>
          <i className="bx bxs-cloud-download bx-fade-down-hover" />
          <span className="text">CURA v1</span>
        </a> */}
      </div>

      <ul className="box-info">
        <li>
          <i className="bx bxs-calendar-check" />
          <span className="text">
            <h3>12</h3>
            <p>Open Tasks</p>
          </span>
        </li>
        <li>
          <i className="bx bxs-group" />
          <span className="text">
            <h3>284</h3>
            <p>Residents</p>
          </span>
        </li>
        <li>
          <i className="bx bxs-dollar-circle" />
          <span className="text">
            <h3>38.5</h3>
            <p>Hours This Week</p>
          </span>
        </li>
      </ul>

      <div className="table-data">
        <div className="order">
          <div className="head">
            <h3>Recent Activity</h3>

            {/* refresh button using your icon style */}
            <i
              className="bx bx-refresh"
              title="Refresh"
              role="button"
              onClick={load}
              style={{ cursor: "pointer" }}
            />
            <i className="bx bx-filter" />
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {state.status === "loading" && (
                <tr>
                  <td colSpan={3}>
                    <p style={{ opacity: 0.75 }}>Loading…</p>
                  </td>
                </tr>
              )}

              {state.status === "error" && (
                <tr>
                  <td colSpan={3}>
                    <p style={{ color: "crimson" }}>Error: {state.message}</p>
                  </td>
                </tr>
              )}

              {state.status === "success" && state.data.length === 0 && (
                <tr>
                  <td colSpan={3}>
                    <p style={{ opacity: 0.75 }}>No recent activity.</p>
                  </td>
                </tr>
              )}

              {state.status === "success" &&
                state.data.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <p>{row.title}</p>
                    </td>
                    <td>{fmtDate(row.createdAt)}</td>
                    <td>
                      <span className={`status ${statusClass(row.status)}`}>
                        {statusLabel(row.status)}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="todo">
          <div className="head">
            <h3>Todos</h3>
            <i className="bx bx-plus icon" />
            <i className="bx bx-filter" />
          </div>

          <ul className="todo-list">
            <li className="completed">
              <p>Review unit capacity</p>
              <i className="bx bx-dots-vertical-rounded" />
            </li>
            <li className="completed">
              <p>Check expiring documents</p>
              <i className="bx bx-dots-vertical-rounded" />
            </li>
            <li className="not-completed">
              <p>Follow up: incident #124</p>
              <i className="bx bx-dots-vertical-rounded" />
            </li>
            <li className="not-completed">
              <p>Submit hours for approval</p>
              <i className="bx bx-dots-vertical-rounded" />
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}