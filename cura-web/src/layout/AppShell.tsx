import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { clearAuth, getAuth } from "../auth/auth";
import Sidebar from "./Sidebar";
import AppTopBar from "./AppTopBar";
import "./AppShell.scss";

export default function AppShell() {
  const { username, role } = getAuth();
  const navigate = useNavigate();

  const [dark, setDark] = useState(() => localStorage.getItem("cura.dark") === "1");

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("cura.dark", dark ? "1" : "0");
  }, [dark]);

  const notifications = useMemo(
    () => [
      "New resident admission submitted",
      "Facility audit reminder",
      "New incident report logged",
      "2 care tasks overdue",
      "Unit capacity updated",
    ],
    []
  );

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="hub">
      <Sidebar role={role} onLogout={handleLogout} />

      <div className="app-content">
        <AppTopBar
          dark={dark}
          onDarkToggle={() => setDark((v) => !v)}
          username={username}
          role={role}
          notifications={notifications}
          onLogout={handleLogout}
        />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
