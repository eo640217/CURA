// TODO: replace mockData with useEffect + fetch(...) to GET /api/v1/staff/shifts (endpoint to be built)
import React, { useState, useMemo } from 'react';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import SignalCellularAltOutlinedIcon from '@mui/icons-material/SignalCellularAltOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BeachAccessOutlinedIcon from '@mui/icons-material/BeachAccessOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import CuraStatCard from '../components/cura/CuraStatCard';
import { staff, DAYS, ShiftType } from '../lib/mockData';
import './SchedulingView.scss';

const VIEW_MODES = ['Week', 'Day', 'Month'] as const;
type ViewMode = typeof VIEW_MODES[number];

const ROLES = ['All roles', 'Nurse', 'Senior Carer', 'Carer', 'Night Carer', 'GP (visiting)'];
const WINGS_F = ['All wings', 'Wing A', 'Wing B', 'Wing C', 'All'];

const SHIFT_CONFIG: Record<ShiftType, { label: string; className: string; short: string }> = {
  morning:   { label: 'Morning',   className: 'sch__shift--morning',   short: 'AM' },
  afternoon: { label: 'Afternoon', className: 'sch__shift--afternoon', short: 'PM' },
  night:     { label: 'Night',     className: 'sch__shift--night',     short: 'Night' },
  leave:     { label: 'Leave',     className: 'sch__shift--leave',     short: 'Leave' },
  off:       { label: 'Day Off',   className: 'sch__shift--off',       short: '—' },
};

function getCoverageLabel(day: string): { label: string; type: 'full' | 'reduced' | 'gap' } {
  const count = staff.filter(s => s.shifts[day] === 'morning' || s.shifts[day] === 'afternoon' || s.shifts[day] === 'night').length;
  if (count >= 6) return { label: 'Full', type: 'full' };
  if (count >= 4) return { label: 'Reduced', type: 'reduced' };
  return { label: `${8 - count} gap${8 - count !== 1 ? 's' : ''}`, type: 'gap' };
}

function getWeekLabel(offset: number): string {
  const base = new Date(2026, 5, 1); // week of 1 Jun 2026
  const start = new Date(base);
  start.setDate(start.getDate() + offset * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(start)} – ${fmt(end)}, ${start.getFullYear()}`;
}

const TODAY_DAY = 'Mon'; // simulated today

export default function SchedulingView() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('Week');
  const [roleFilter, setRoleFilter] = useState('All roles');
  const [wingFilter, setWingFilter] = useState('All wings');

  const visibleStaff = useMemo(() =>
    staff.filter(s =>
      (roleFilter === 'All roles' || s.role === roleFilter) &&
      (wingFilter === 'All wings' || s.wing === wingFilter || (wingFilter === 'All' && s.wing === 'All'))
    ),
    [roleFilter, wingFilter]
  );

  const onShift = staff.filter(s => s.shifts['Mon'] === 'morning' || s.shifts['Mon'] === 'afternoon').length;
  const onLeave = staff.filter(s => Object.values(s.shifts).some(sh => sh === 'leave')).length;
  const gaps = DAYS.filter(d => getCoverageLabel(d).type === 'gap').length;

  return (
    <div className="sch">

      {/* ── Stat strip ─────────────────────────────────────────────────── */}
      <div className="sch__stats">
        <CuraStatCard icon={BadgeOutlinedIcon} iconBg="var(--cura-blue-light)" iconColor="var(--cura-blue)" value={onShift} label="On Shift Today" />
        <CuraStatCard icon={SignalCellularAltOutlinedIcon} iconBg="var(--cura-green-bg)" iconColor="var(--cura-green)" value="Full" label="Coverage" />
        <CuraStatCard icon={ErrorOutlineIcon} iconBg="var(--cura-amber-bg)" iconColor="var(--cura-amber)" value={gaps} label="Coverage Gaps" />
        <CuraStatCard icon={BeachAccessOutlinedIcon} iconBg="var(--cura-purple-bg)" iconColor="var(--cura-purple-text)" value={onLeave} label="On Leave" />
      </div>

      {/* ── Calendar controls ──────────────────────────────────────────── */}
      <div className="sch__controls">
        <div className="sch__week-nav">
          <button type="button" className="sch__nav-btn" onClick={() => setWeekOffset(o => o - 1)} aria-label="Previous week">
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </button>
          <span className="sch__week-label">{getWeekLabel(weekOffset)}</span>
          <button type="button" className="sch__nav-btn" onClick={() => setWeekOffset(o => o + 1)} aria-label="Next week">
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </button>
          <button type="button" className="sch__today-btn" onClick={() => setWeekOffset(0)}>
            <TodayIcon sx={{ fontSize: 14 }} /> Today
          </button>
        </div>

        <div className="sch__filters">
          <select
            className="sch__filter-select"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            aria-label="Filter by role"
          >
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
          <select
            className="sch__filter-select"
            value={wingFilter}
            onChange={e => setWingFilter(e.target.value)}
            aria-label="Filter by wing"
          >
            {WINGS_F.map(w => <option key={w}>{w}</option>)}
          </select>
        </div>

        <div className="sch__view-toggle">
          {VIEW_MODES.map(m => (
            <button
              key={m}
              type="button"
              className={`sch__view-btn${viewMode === m ? ' sch__view-btn--active' : ''}`}
              onClick={() => setViewMode(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* ── Shift legend ───────────────────────────────────────────────── */}
      <div className="sch__legend">
        {(Object.entries(SHIFT_CONFIG) as [ShiftType, typeof SHIFT_CONFIG[ShiftType]][]).map(([key, cfg]) => (
          <span key={key} className={`sch__legend-pill ${cfg.className}`}>{cfg.label}</span>
        ))}
      </div>

      {/* ── Weekly grid ────────────────────────────────────────────────── */}
      <div className="sch__grid-wrap">
        <table className="sch__grid">
          <thead>
            <tr>
              <th className="sch__staff-col">Staff Member</th>
              {DAYS.map(day => {
                const cov = getCoverageLabel(day);
                const isToday = day === TODAY_DAY && weekOffset === 0;
                return (
                  <th key={day} className={`sch__day-col${isToday ? ' sch__day-col--today' : ''}`}>
                    <div className="sch__day-header">
                      <span className="sch__day-name">{day}</span>
                      <span className={`sch__cov-pill sch__cov-pill--${cov.type}`}>{cov.label}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visibleStaff.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--cura-text-muted)' }}>
                  No staff match your filters.
                </td>
              </tr>
            )}
            {visibleStaff.map(member => (
              <tr key={member.id} className="sch__staff-row">
                <td className="sch__staff-cell">
                  <div className="sch__staff-info">
                    <div className="sch__staff-name">{member.name}</div>
                    <div className="sch__staff-role">{member.role}</div>
                  </div>
                </td>
                {DAYS.map(day => {
                  const shiftType = member.shifts[day] as ShiftType;
                  const cfg = SHIFT_CONFIG[shiftType];
                  const isToday = day === TODAY_DAY && weekOffset === 0;
                  return (
                    <td key={day} className={`sch__shift-cell${isToday ? ' sch__shift-cell--today' : ''}`}>
                      {shiftType !== 'off' && (
                        <span className={`sch__shift ${cfg.className}`}>{cfg.short}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
