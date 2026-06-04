import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { clearAuth, getAuth } from '../auth/auth';
import { useInactivityTimer } from '../lib/useInactivityTimer';
import CuraLayout from '../components/cura/CuraLayout';
import './AppShell.scss';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export default function AppShell() {
  const { username, role } = getAuth();
  const navigate = useNavigate();

  const [dark, setDark] = useState(() => localStorage.getItem('cura.dark') === '1');

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
    localStorage.setItem('cura.dark', dark ? '1' : '0');
  }, [dark]);

  const notifications = useMemo(
    () => [
      'New resident admission submitted',
      'Facility audit reminder',
      'New incident report logged',
      '2 care tasks overdue',
      'Unit capacity updated',
    ],
    []
  );

  const handleLogout = () => {
    clearAuth();
    navigate('/logout');
  };

  const handleInactivityLogout = useCallback(() => {
    clearAuth();
    navigate('/logout?reason=inactive');
  }, [navigate]);

  useInactivityTimer(INACTIVITY_TIMEOUT_MS, handleInactivityLogout);

  return (
    <CuraLayout
      username={username}
      role={role}
      notifications={notifications}
      onLogout={handleLogout}
    >
      <Outlet />
    </CuraLayout>
  );
}