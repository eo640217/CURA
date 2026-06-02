// TODO: replace mockData with useEffect + fetch(...) to GET /api/v1/care-plans
import React, { useState, useMemo } from 'react';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AssignmentLateOutlinedIcon from '@mui/icons-material/AssignmentLateOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CuraStatCard from '../components/cura/CuraStatCard';
import CuraStatusPill from '../components/cura/CuraStatusPill';
import { carePlans, MockCarePlan } from '../lib/mockData';
import './CarePlansView.scss';

type FilterKey = 'All' | 'Overdue' | 'Due soon' | 'Current';

const DETAIL_TABS = ['Goals & tasks', 'Review history', 'Assigned staff'];

function statusToFilter(s: MockCarePlan['status']): FilterKey | null {
  if (s === 'overdue') return 'Overdue';
  if (s === 'due-soon') return 'Due soon';
  if (s === 'active' || s === 'up-to-date') return 'Current';
  return null;
}

export default function CarePlansView() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('All');
  const [selectedId, setSelectedId] = useState<number>(carePlans[0]?.id ?? 1);
  const [detailTab, setDetailTab] = useState('Goals & tasks');

  const stats = {
    active: carePlans.filter(p => p.status === 'active' || p.status === 'up-to-date' || p.status === 'due-soon').length,
    overdue: carePlans.filter(p => p.status === 'overdue').length,
    dueSoon: carePlans.filter(p => p.status === 'due-soon').length,
    upToDate: carePlans.filter(p => p.status === 'up-to-date').length,
  };

  const filtered = useMemo(() => {
    return carePlans.filter(p => {
      const matchQ = !query || p.residentName.toLowerCase().includes(query.toLowerCase());
      const matchF = filter === 'All' || statusToFilter(p.status) === filter || (filter === 'Current' && p.status === 'active');
      return matchQ && matchF;
    });
  }, [query, filter]);

  const selected = carePlans.find(p => p.id === selectedId) ?? carePlans[0];

  return (
    <div className="cp-view">

      {/* ── Stat strip ─────────────────────────────────────────────────── */}
      <div className="cp-view__stats">
        <CuraStatCard icon={AssignmentOutlinedIcon} iconBg="var(--cura-blue-light)" iconColor="var(--cura-blue)" value={stats.active} label="Active Plans" />
        <CuraStatCard icon={AssignmentLateOutlinedIcon} iconBg="var(--cura-red-bg)" iconColor="var(--cura-red)" value={stats.overdue} label="Overdue" />
        <CuraStatCard icon={EventAvailableOutlinedIcon} iconBg="var(--cura-amber-bg)" iconColor="var(--cura-amber)" value={stats.dueSoon} label="Due This Week" />
        <CuraStatCard icon={CheckCircleOutlineIcon} iconBg="var(--cura-green-bg)" iconColor="var(--cura-green)" value={stats.upToDate} label="Up to Date" />
      </div>

      {/* ── Master / detail ─────────────────────────────────────────────── */}
      <div className="cp-view__body">

        {/* List panel */}
        <div className="cp-view__list-panel">
          {/* Search */}
          <div className="cp-view__search">
            <SearchIcon sx={{ fontSize: 16 }} />
            <input
              type="search"
              placeholder="Search resident…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          {/* Filter pills */}
          <div className="cp-view__filter-pills">
            {(['All', 'Overdue', 'Due soon', 'Current'] as FilterKey[]).map(f => (
              <button
                key={f}
                type="button"
                className={`cp-view__pill${filter === f ? ' cp-view__pill--active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Plan cards */}
          <div className="cp-view__plan-list">
            {filtered.length === 0 && (
              <p className="cp-view__empty">No plans match your filter.</p>
            )}
            {filtered.map(plan => (
              <button
                key={plan.id}
                type="button"
                className={`cp-view__plan-card${selectedId === plan.id ? ' cp-view__plan-card--active' : ''}`}
                onClick={() => setSelectedId(plan.id)}
              >
                <div className="cp-view__plan-card-head">
                  <span className="cp-view__plan-name">{plan.residentName}</span>
                  <CuraStatusPill status={plan.status as any} />
                </div>
                <div className="cp-view__plan-meta">Room {plan.room} · Next review: {plan.nextReview}</div>
                <div className="cp-view__progress-bar-wrap">
                  <div className="cp-view__progress-bar" style={{ width: `${plan.progress}%`, background: plan.status === 'overdue' ? 'var(--cura-red)' : plan.status === 'due-soon' ? 'var(--cura-amber)' : 'var(--cura-green)' }} />
                </div>
                <div className="cp-view__progress-label">{plan.progress}% complete</div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="cp-view__detail-panel">
            {/* Resident header */}
            <div className="cp-view__detail-header">
              <div>
                <div className="cp-view__detail-name">{selected.residentName}</div>
                <div className="cp-view__detail-meta">
                  Room {selected.room} &nbsp;·&nbsp;
                  Last review: {selected.lastReview} &nbsp;·&nbsp;
                  Next review: <strong>{selected.nextReview}</strong>
                </div>
              </div>
              <div className="cp-view__detail-header-right">
                <CuraStatusPill status={selected.status as any} />
                <button type="button" className="cp-view__detail-btn cp-view__detail-btn--primary">
                  Start Review
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="cp-view__detail-tabs">
              {DETAIL_TABS.map(tab => (
                <button
                  key={tab}
                  type="button"
                  className={`cp-view__detail-tab${detailTab === tab ? ' cp-view__detail-tab--active' : ''}`}
                  onClick={() => setDetailTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Goals & tasks tab */}
            {detailTab === 'Goals & tasks' && (
              <div className="cp-view__goals">
                {selected.goals.map(goal => (
                  <div key={goal.id} className="cp-view__goal-card">
                    <h4 className="cp-view__goal-title">{goal.title}</h4>
                    <ul className="cp-view__task-list">
                      {goal.tasks.map(task => (
                        <li key={task.id} className="cp-view__task">
                          {task.done
                            ? <CheckBoxIcon sx={{ fontSize: 16, color: 'var(--cura-green)' }} />
                            : <CheckBoxOutlineBlankIcon sx={{ fontSize: 16, color: 'var(--cura-text-hint)' }} />
                          }
                          <span className={task.done ? 'cp-view__task--done' : ''}>{task.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Review history tab */}
            {detailTab === 'Review history' && (
              <div className="cp-view__timeline">
                {[
                  { date: selected.lastReview, actor: selected.assignedStaff[0], note: 'Quarterly review completed. Goals updated. Progress satisfactory.' },
                  { date: '01 Mar 2026', actor: 'Dr. Adeyemi', note: 'GP review — medication adjusted. Plan updated accordingly.' },
                  { date: '15 Feb 2026', actor: selected.assignedStaff[0], note: 'Interim review. New goal added: mobility support.' },
                ].map((entry, i) => (
                  <div key={i} className="cp-view__timeline-entry">
                    <div className="cp-view__timeline-dot" />
                    <div className="cp-view__timeline-body">
                      <div className="cp-view__timeline-head">
                        <span className="cp-view__timeline-actor">{entry.actor}</span>
                        <span className="cp-view__timeline-date">{entry.date}</span>
                      </div>
                      <p className="cp-view__timeline-note">{entry.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Assigned staff tab */}
            {detailTab === 'Assigned staff' && (
              <div className="cp-view__staff-list">
                {selected.assignedStaff.map(name => (
                  <div key={name} className="cp-view__staff-row">
                    <div className="cp-view__staff-avatar">
                      <PersonOutlineIcon sx={{ fontSize: 18 }} />
                    </div>
                    <span className="cp-view__staff-name">{name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
