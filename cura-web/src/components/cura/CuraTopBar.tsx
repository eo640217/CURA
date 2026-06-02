import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import './CuraTopBar.scss';

interface CuraTopBarProps {
  username: string | null;
  role: string | null;
  notifications?: string[];
  onLogout: () => void;
}

export default function CuraTopBar({ username, role, notifications = [], onLogout }: CuraTopBarProps) {
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
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = username ? username.slice(0, 2).toUpperCase() : '?';

  return (
    <header className="cura-topbar">
      {/* Search */}
      <div className="cura-topbar__search">
        <SearchIcon />
        <input
          type="search"
          placeholder="Search residents, staff, tasks…"
          aria-label="Search"
        />
      </div>

      <div className="cura-topbar__actions">
        {/* Inbox */}
        <button type="button" className="cura-topbar__icon-btn" title="Inbox" aria-label="Inbox">
          <InboxOutlinedIcon />
        </button>

        {/* Help */}
        <button type="button" className="cura-topbar__icon-btn" title="Help" aria-label="Help">
          <HelpOutlineIcon />
        </button>

        <div className="cura-topbar__divider" />

        {/* Notifications */}
        <div ref={notifRef} className="cura-topbar__menu-wrap">
          <button
            type="button"
            className="cura-topbar__icon-btn"
            aria-label="Notifications"
            title="Notifications"
            onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
          >
            <NotificationsOutlinedIcon />
            {notifications.length > 0 && <span className="cura-topbar__notif-dot" aria-hidden="true" />}
          </button>

          {notifOpen && (
            <div className="cura-topbar__dropdown">
              <div className="cura-topbar__dropdown-head">
                <span>Notifications</span>
                <span className="cura-topbar__count">{notifications.length}</span>
              </div>
              <ul className="cura-topbar__dropdown-list">
                {notifications.map((n, i) => <li key={i}><button type="button">{n}</button></li>)}
              </ul>
            </div>
          )}
        </div>

        {/* Profile avatar */}
        <div ref={profileRef} className="cura-topbar__menu-wrap">
          <button
            type="button"
            className="cura-topbar__avatar-btn"
            aria-label="Profile menu"
            title={username ?? 'Profile'}
            onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
          >
            <span className="cura-topbar__avatar">{initials}</span>
          </button>

          {profileOpen && (
            <div className="cura-topbar__dropdown cura-topbar__dropdown--profile">
              <div className="cura-topbar__dropdown-head cura-topbar__dropdown-head--profile">
                <div className="cura-topbar__profile-name">{username}</div>
                <div className="cura-topbar__profile-role">{role}</div>
              </div>
              <ul className="cura-topbar__dropdown-list">
                <li><button type="button" onClick={() => navigate('/profile')}>My Profile</button></li>
                <li><button type="button" onClick={() => navigate('/settings')}>Settings</button></li>
                <li className="cura-topbar__dropdown-item--danger">
                  <button type="button" onClick={onLogout}>Log Out</button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
