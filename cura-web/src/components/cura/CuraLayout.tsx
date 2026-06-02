import React from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import CuraSidebar from './CuraSidebar';
import CuraTopBar from './CuraTopBar';

interface CuraLayoutProps {
  children: React.ReactNode;
  activePage?: string;
  role: string | null;
  username: string | null;
  notifications?: string[];
  onLogout: () => void;
}

export default function CuraLayout({
  children,
  activePage,
  role,
  username,
  notifications,
  onLogout,
}: CuraLayoutProps) {
  const location = useLocation();
  const reduced = useReducedMotion();

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        background: 'var(--cura-bg, #f0f2f5)',
      }}
    >
      <CuraSidebar activePage={activePage} role={role} onLogout={onLogout} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <CuraTopBar username={username} role={role} notifications={notifications} onLogout={onLogout} />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '28px 28px 48px',
            background: 'var(--cura-bg, #f0f2f5)',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
