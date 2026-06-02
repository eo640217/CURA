import React, { useEffect, useRef, useState } from "react";
import { Bell, HelpCircle, Inbox, Moon, Search, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AppTopBar.scss";

interface AppTopBarProps {
  dark: boolean;
  onDarkToggle: () => void;
  username: string | null;
  role: string | null;
  notifications: string[];
  onLogout: () => void;
}

export default function AppTopBar({
  dark,
  onDarkToggle,
  username,
  role,
  notifications,
  onLogout,
}: AppTopBarProps) {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(t)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(t)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = username ? username.slice(0, 2).toUpperCase() : "?";

  return (
    <header className="app-topbar">
      {/* Search */}
      <div className="app-topbar__search">
        <Search size={14} className="app-topbar__search-icon" />
        <input type="search" placeholder="Search…" aria-label="Search" />
      </div>

      <div className="app-topbar__actions">
        {/* Dark mode toggle */}
        <button
          type="button"
          className="app-topbar__icon-btn"
          onClick={onDarkToggle}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Inbox */}
        <button
          type="button"
          className="app-topbar__icon-btn"
          title="Inbox"
          aria-label="Inbox"
        >
          <Inbox size={17} />
        </button>

        {/* Help */}
        <button
          type="button"
          className="app-topbar__icon-btn"
          title="Help"
          aria-label="Help"
        >
          <HelpCircle size={17} />
        </button>

        <div className="app-topbar__divider" />

        {/* Notifications */}
        <div ref={notifRef} className="app-topbar__menu-wrap">
          <button
            type="button"
            className="app-topbar__icon-btn"
            aria-label="Notifications"
            title="Notifications"
            onClick={() => {
              setNotifOpen((v) => !v);
              setProfileOpen(false);
            }}
          >
            <Bell size={17} />
            {notifications.length > 0 && (
              <span className="app-topbar__notif-dot" aria-hidden="true" />
            )}
          </button>

          {notifOpen && (
            <div className="app-topbar__dropdown">
              <div className="app-topbar__dropdown-head">
                <span>Notifications</span>
                <span className="app-topbar__count">{notifications.length}</span>
              </div>
              <ul className="app-topbar__dropdown-list">
                {notifications.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Profile avatar */}
        <div ref={profileRef} className="app-topbar__menu-wrap">
          <button
            type="button"
            className="app-topbar__avatar-btn"
            aria-label="Profile menu"
            title={username ?? "Profile"}
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotifOpen(false);
            }}
          >
            <span className="app-topbar__avatar">{initials}</span>
          </button>

          {profileOpen && (
            <div className="app-topbar__dropdown app-topbar__dropdown--profile">
              <div className="app-topbar__dropdown-head app-topbar__dropdown-head--profile">
                <div className="app-topbar__profile-name">{username}</div>
                <div className="app-topbar__profile-role">{role}</div>
              </div>
              <ul className="app-topbar__dropdown-list">
                <li>
                  <button type="button" onClick={() => navigate("/profile")}>
                    My Profile
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate("/settings")}>
                    Settings
                  </button>
                </li>
                <li className="app-topbar__dropdown-item--danger">
                  <button type="button" onClick={onLogout}>
                    Log Out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
