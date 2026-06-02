import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { clearAuth, getAuth } from '../auth/auth';
import CuraLayout from '../components/cura/CuraLayout';
import './AppShell.scss';

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
    navigate('/login');
  };

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
