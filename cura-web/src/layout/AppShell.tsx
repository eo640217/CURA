import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearAuth, getAuth } from "../auth/auth";
import cura_logo from "../assets/images/cura_logo_2.png";
import "./AppShell.scss";

export default function AppShell() {
  const { username, role } = getAuth();
  const navigate = useNavigate();

  const [sidebarHidden, setSidebarHidden] = useState(false);

  // Dark mode persisted
  const [dark, setDark] = useState(() => localStorage.getItem("cura.dark") === "1");

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("cura.dark", dark ? "1" : "0");
  }, [dark]);

  // Auto-collapse on small screens
  useEffect(() => {
    const adjust = () => {
      if (window.innerWidth <= 576) setSidebarHidden(true);
      if (window.innerWidth > 576) setSidebarHidden(false);
    };
    adjust();
    window.addEventListener("resize", adjust);
    return () => window.removeEventListener("resize", adjust);
  }, []);

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(t)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(t)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

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

  return (
    <div className={`hub ${sidebarHidden ? "hub--sidebarHidden" : ""}`}>
      {/* SIDEBAR */}
      <aside id="sidebar" className={sidebarHidden ? "hide" : ""}>
        <NavLink to="/" className="brand">
          <img src={cura_logo} alt="Cura Logo" className="logo" />
        </NavLink>

        <ul className="side-menu top">
          <li>
            <NavLink to="/dashboard" end className={({ isActive }) => (isActive ? "activeLink" : "")}>
              <i className="bx bxs-dashboard bx-sm" />
              <span className="text">Dashboard</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/facilities" className={({ isActive }) => (isActive ? "activeLink" : "")}>
              <i className="bx bxs-building-house bx-sm" />
              <span className="text">Facilities</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/residents/directory" className={({ isActive }) => (isActive ? "activeLink" : "")}>
              <i className="bx bxs-group bx-sm" />
              <span className="text">Residents</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/units" className={({ isActive }) => (isActive ? "activeLink" : "")}>
              <i className="bx bxs-home bx-sm" />
              <span className="text">Units</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/hours" className={({ isActive }) => (isActive ? "activeLink" : "")}>
              <i className="bx bxs-time-five bx-sm" />
              <span className="text">Hours</span>
            </NavLink>
          </li>

          {role === "ADMIN" && (
            <li>
              <NavLink to="/admin/users" className={({ isActive }) => (isActive ? "activeLink" : "")}>
                <i className="bx bxs-cog bx-sm" />
                <span className="text">Admin</span>
              </NavLink>
            </li>
          )}
        </ul>

        <ul className="side-menu bottom">
          <li>
            <button
              className="sidebarBtn"
              onClick={() => navigate("/settings")}
              type="button"
            >
              <i className="bx bxs-cog bx-sm bx-spin-hover" />
              <span className="text">Settings</span>
            </button>
          </li>

          <li>
            <button
              className="sidebarBtn logout"
              onClick={() => {
                clearAuth();
                navigate("/login");
              }}
              type="button"
            >
              <i className="bx bx-power-off bx-sm bx-burst-hover" />
              <span className="text">Logout</span>
            </button>
          </li>
        </ul>
      </aside>

      {/* CONTENT */}
      <section id="content">
        {/* NAVBAR */}
        <nav>
          <i
            className="bx bx-menu bx-sm"
            onClick={() => setSidebarHidden((v) => !v)}
            role="button"
            aria-label="Toggle sidebar"
          />

          

          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Later: hook into your search
            }}
          >
            <div className="form-input">
              <input type="search" placeholder="Search..." />
              <button type="submit" className="search-btn">
                <i className="bx bx-search" />
              </button>
            </div>
          </form>

          <input
            type="checkbox"
            className="checkbox"
            id="switch-mode"
            hidden
            checked={dark}
            onChange={(e) => setDark(e.target.checked)}
          />
          <label className="swith-lm" htmlFor="switch-mode" title="Toggle theme">
            <i className="bx bxs-moon" />
            <i className="bx bx-sun" />
            <div className="ball" />
          </label>

          {/* Notification */}
          <div className="menuWrap" ref={notifRef}>
            <button
              type="button"
              className="notification"
              onClick={() => {
                setNotifOpen((v) => !v);
                setProfileOpen(false);
              }}
              aria-label="Notifications"
            >
              <i className="bx bxs-bell bx-tada-hover" />
              <span className="num">{notifications.length}</span>
            </button>

            <div className={`notification-menu ${notifOpen ? "show" : ""}`}>
              <ul>
                {notifications.map((n, idx) => (
                  <li key={idx}>{n}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Profile */}
          <div className="menuWrap" ref={profileRef}>
            <button
              type="button"
              className="profile"
              onClick={() => {
                setProfileOpen((v) => !v);
                setNotifOpen(false);
              }}
              aria-label="Profile menu"
            >
              <img src="https://placehold.co/72x72/png" alt="Profile" />
            </button>

            <div className={`profile-menu ${profileOpen ? "show" : ""}`}>
              <ul>
                <li className="profileLine">
                  <div className="profileName">{username}</div>
                  <div className="profileRole">{role}</div>
                </li>
                <li>
                  <button type="button" onClick={() => navigate("/profile")}>My Profile</button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate("/settings")}>Settings</button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      clearAuth();
                      navigate("/login");
                    }}
                  >
                    Log Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <main>
          <Outlet />
        </main>
      </section>
    </div>
  );
}