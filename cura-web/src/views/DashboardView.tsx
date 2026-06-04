import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import AddAlertOutlinedIcon from '@mui/icons-material/AddAlertOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import NotificationAddOutlinedIcon from '@mui/icons-material/NotificationAddOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import { useNavigate } from 'react-router-dom';
import { listRecentActivity, ActivityItem } from '../api/activity';
import { useAuthState } from '../auth/useAuth';
import CuraStatusPill from '../components/cura/CuraStatusPill';
import WorkletGrid from '../components/dashboard/WorkletGrid';
import WidgetPicker from '../components/dashboard/WidgetPicker';
import EditModeBanner from '../components/dashboard/EditModeBanner';
import { actionItems } from './homeData';
import type { DashboardLayout, WidgetKey } from '../types/dashboard';
import { DEFAULT_LAYOUT } from '../types/dashboard';
import './DashboardView.scss';

type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: ActivityItem[] }
  | { status: 'error'; message: string };

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getShift(): { label: string; variant: 'day' | 'evening' | 'night' } {
  const h = new Date().getHours();
  if (h >= 8 && h < 16) return { label: 'Day Shift', variant: 'day' };
  if (h >= 16 && h < 24) return { label: 'Evening Shift', variant: 'evening' };
  return { label: 'Night Shift', variant: 'night' };
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusVariant(s: ActivityItem['status']) {
  if (s === 'COMPLETED') return 'stable';
  if (s === 'IN_REVIEW') return 'review';
  return 'pending';
}

function statusLabel(s: ActivityItem['status']) {
  if (s === 'IN_REVIEW') return 'In Review';
  if (s === 'COMPLETED') return 'Completed';
  return 'Pending';
}

const TODAY = new Date().toLocaleDateString('en-GB', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

const URGENCY_LABEL: Record<string, string> = {
  urgent: 'Urgent', monitor: 'Monitor', info: 'Info', stable: 'Stable',
};

const QUICK_ACTIONS = [
  { id: 1, icon: PersonAddAltOutlinedIcon,      label: 'Add Resident',  route: '/residents'   },
  { id: 2, icon: AddAlertOutlinedIcon,           label: 'Log Incident',  route: '/incidents'   },
  { id: 3, icon: EventNoteOutlinedIcon,          label: 'Schedule Task', route: '/scheduling'  },
  { id: 4, icon: NoteAddOutlinedIcon,            label: 'New Care Plan', route: '/care-plans'  },
  { id: 5, icon: NotificationAddOutlinedIcon,    label: 'Raise Alert',   route: '/dashboard'   },
  { id: 6, icon: BarChartOutlinedIcon,           label: 'Run Report',    route: '/dashboard'   },
];

function layoutKey(username: string | null) {
  return `cura_dashboard_layout_${username ?? 'default'}`;
}

export default function DashboardView() {
  const { username, isAdmin } = useAuthState();
  const navigate = useNavigate();
  const [actState, setActState] = useState<LoadState>({ status: 'idle' });
  const shift = getShift();

  // ── Layout state ──────────────────────────────────────────────────────────
  const [layout, setLayout] = useState<DashboardLayout>(DEFAULT_LAYOUT);
  const [editMode, setEditMode] = useState(false);
  const [stagedWidgets, setStagedWidgets] = useState<WidgetKey[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const hasChanges = editMode &&
    JSON.stringify(stagedWidgets) !== JSON.stringify(layout.widgets);

  const reduced = useReducedMotion();

  // Load saved layout from localStorage on mount
  useEffect(() => {
    const key = layoutKey(username);
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const saved = JSON.parse(raw) as DashboardLayout;
        if (Array.isArray(saved.widgets) && saved.widgets.length > 0) {
          setLayout(saved);
        }
      } catch { /* ignore corrupt data */ }
    }
  }, [username]);

  function handleEnterEdit() {
    setStagedWidgets([...layout.widgets]);
    setEditMode(true);
    setPickerOpen(false);
  }

  function handleCancel() {
    setEditMode(false);
    setPickerOpen(false);
  }

  function handleSave() {
    const newLayout: DashboardLayout = { widgets: stagedWidgets };
    setLayout(newLayout);
    localStorage.setItem(layoutKey(username), JSON.stringify(newLayout));
    // TODO: PATCH /api/users/{userId}/dashboard-layout with { widgets: stagedWidgets }
    setEditMode(false);
    setPickerOpen(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  function handleRemove(key: WidgetKey) {
    setStagedWidgets(prev => prev.filter(k => k !== key));
  }

  function handleReorder(newOrder: WidgetKey[]) {
    setStagedWidgets(newOrder);
  }

  function handleAdd(key: WidgetKey) {
    if (!stagedWidgets.includes(key)) {
      setStagedWidgets(prev => [...prev, key]);
    }
  }

  // ── Activity feed ─────────────────────────────────────────────────────────
  const loadActivity = async () => {
    try {
      setActState({ status: 'loading' });
      const data = await listRecentActivity(10);
      setActState({ status: 'success', data });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load activity';
      setActState({ status: 'error', message: msg });
    }
  };

  useEffect(() => {
    loadActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeWidgets = editMode ? stagedWidgets : layout.widgets;

  return (
    <div className="dash">

      {/* ── Screen-lock overlay (edit mode only) ──────────────────────────── */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            className="dash__overlay"
            aria-hidden="true"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* ── Edit mode banner (sticky, above overlay) ──────────────────────── */}
      <AnimatePresence>
        {editMode && (
          <div className="dash__edit-banner-wrap">
            <EditModeBanner
              hasChanges={hasChanges}
              onCancel={handleCancel}
              onSave={handleSave}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ── Greeting ──────────────────────────────────────────────────────── */}
      <section className="dash__greeting">
        <div>
          <h1 className="dash__greeting-title">
            {getGreeting()}, {username ?? 'there'}
          </h1>
          <p className="dash__greeting-sub">Sunrise Care Home &nbsp;·&nbsp; {TODAY}</p>
        </div>
        <span className={`dash__shift-badge dash__shift-badge--${shift.variant}`}>
          {shift.label}
        </span>
      </section>

      {/* ── Awaiting action ───────────────────────────────────────────────── */}
      <section className="dash__section">
        <div className="dash__section-head">
          <h2 className="dash__section-title">Awaiting your action</h2>
          <span className="dash__count-badge">{actionItems.length}</span>
        </div>
        <div className="dash__action-strip" role="list">
          {actionItems.map(item => (
            <article
              key={item.id}
              role="listitem"
              className={`dash__action-card dash__action-card--${item.urgency}`}
            >
              <p className="dash__action-label">{item.label}</p>
              <p className="dash__action-detail">{item.detail}</p>
              <div className="dash__action-footer">
                <CuraStatusPill
                  status={item.urgency as any}
                  label={URGENCY_LABEL[item.urgency]}
                />
                <button type="button" className="dash__action-review">Review</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── My apps (customisable widget grid) ────────────────────────────── */}
      <section className={`dash__section${editMode ? ' dash__section--apps-edit' : ''}`}>
        <div className="dash__section-head">
          <h2 className="dash__section-title">My apps</h2>
          {editMode && hasChanges && (
            <span className="dash__unsaved">● Unsaved changes</span>
          )}
          {!editMode && (
            <button
              type="button"
              className="dash__customise-btn"
              onClick={handleEnterEdit}
            >
              Customise
            </button>
          )}
        </div>

        <WorkletGrid
          widgets={activeWidgets}
          editMode={editMode}
          onRemove={handleRemove}
          onReorder={handleReorder}
          onAddClick={() => setPickerOpen(p => !p)}
        />

        <AnimatePresence>
          {editMode && pickerOpen && (
            <WidgetPicker
              currentWidgets={stagedWidgets}
              onAdd={handleAdd}
              onClose={() => setPickerOpen(false)}
            />
          )}
        </AnimatePresence>
      </section>

      {/* ── Quick actions ─────────────────────────────────────────────────── */}
      <section className="dash__section">
        <h2 className="dash__section-title">Quick actions</h2>
        <div className="dash__quick-actions">
          {QUICK_ACTIONS.map(qa => {
            const Icon = qa.icon;
            return (
              <button
                key={qa.id}
                type="button"
                className="dash__qa"
                onClick={() => navigate(qa.route)}
                title={qa.label}
              >
                <div className="dash__qa-icon">
                  <Icon sx={{ fontSize: 20 }} />
                </div>
                <span className="dash__qa-label">{qa.label}</span>
              </button>
            );
          })}
          {isAdmin && (
            <button
              type="button"
              className="dash__qa"
              onClick={() => navigate('/staff')}
              title="View Staff"
            >
              <div className="dash__qa-icon">
                <BadgeOutlinedIcon sx={{ fontSize: 20 }} />
              </div>
              <span className="dash__qa-label">View Staff</span>
            </button>
          )}
        </div>
      </section>

      {/* ── Recent activity ───────────────────────────────────────────────── */}
      <section className="dash__section">
        <div className="dash__section-head">
          <h2 className="dash__section-title">Recent activity</h2>
          <button type="button" className="dash__refresh-btn" onClick={loadActivity}>
            Refresh
          </button>
        </div>
        <div className="dash__activity">
          <table className="dash__table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {actState.status === 'loading' && (
                <tr><td colSpan={3} className="dash__table-msg">Loading…</td></tr>
              )}
              {actState.status === 'error' && (
                <tr><td colSpan={3} className="dash__table-msg dash__table-msg--error">{actState.message}</td></tr>
              )}
              {actState.status === 'success' && actState.data.length === 0 && (
                <tr><td colSpan={3} className="dash__table-msg">No recent activity.</td></tr>
              )}
              {actState.status === 'success' && actState.data.map(row => (
                <tr key={row.id}>
                  <td>{row.title}</td>
                  <td style={{ color: 'var(--cura-text-muted)' }}>{fmtDate(row.createdAt)}</td>
                  <td><CuraStatusPill status={statusVariant(row.status)} label={statusLabel(row.status)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Save toast ────────────────────────────────────────────────────── */}
      {/* Outer wrapper: fixed full-width flex row that Framer Motion can translateY.
          Inner span: the visible pill. This avoids transform conflicts with left:50%. */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className="dash__toast"
            role="status"
            aria-live="polite"
            initial={reduced ? false : { y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduced ? undefined : { y: 80, opacity: 0, transition: { duration: 0.22, ease: 'easeIn' } }}
            transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <span className="dash__toast-pill">
              <span className="dash__toast-check">
                <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
              </span>
              Layout saved successfully
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
