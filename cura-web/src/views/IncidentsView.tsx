// TODO: replace mockData with useEffect + fetch(...) to GET /api/v1/incidents (endpoint to be built)
import React, { useState, useMemo } from 'react';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import CuraStatCard from '../components/cura/CuraStatCard';
import CuraStatusPill from '../components/cura/CuraStatusPill';
import { incidents, MockIncident, IncidentSeverity, IncidentStatus } from '../lib/mockData';
import './IncidentsView.scss';

type SeverityFilter = 'All' | 'Critical' | 'Major' | 'Minor' | 'Low';
const SEVERITY_FILTERS: SeverityFilter[] = ['All', 'Critical', 'Major', 'Minor', 'Low'];
const DETAIL_TABS = ['Details', 'Actions', 'Timeline', 'Related'];

const TYPE_ICON: Record<string, React.ReactNode> = {
  'Fall':           <DirectionsWalkIcon sx={{ fontSize: 18 }} />,
  'Medication':     <MedicationOutlinedIcon sx={{ fontSize: 18 }} />,
  'Behaviour':      <PsychologyOutlinedIcon sx={{ fontSize: 18 }} />,
  'Near-miss':      <WarningAmberOutlinedIcon sx={{ fontSize: 18 }} />,
  'Skin integrity': <HealthAndSafetyOutlinedIcon sx={{ fontSize: 18 }} />,
};

const TYPE_BG: Record<string, string> = {
  'Fall':           'var(--cura-amber-bg)',
  'Medication':     'var(--cura-red-bg)',
  'Behaviour':      'var(--cura-purple-bg)',
  'Near-miss':      'var(--cura-amber-bg)',
  'Skin integrity': 'var(--cura-blue-light)',
};

const TYPE_COLOR: Record<string, string> = {
  'Fall':           'var(--cura-amber-text)',
  'Medication':     'var(--cura-red-text)',
  'Behaviour':      'var(--cura-purple-text)',
  'Near-miss':      'var(--cura-amber-text)',
  'Skin integrity': 'var(--cura-navy)',
};

export default function IncidentsView() {
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState<SeverityFilter>('All');
  const [selectedId, setSelectedId] = useState<number>(incidents[0]?.id ?? 1);
  const [detailTab, setDetailTab] = useState('Details');

  const stats = {
    critical: incidents.filter(i => i.severity === 'critical' && i.status === 'open').length,
    openWeek: incidents.filter(i => i.status === 'open').length,
    pending: incidents.filter(i => i.status === 'pending').length,
    resolved: incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length,
  };

  const filtered = useMemo(() => {
    return incidents.filter(inc => {
      const matchQ = !query || inc.title.toLowerCase().includes(query.toLowerCase()) || inc.type.toLowerCase().includes(query.toLowerCase());
      const matchS = severity === 'All' || inc.severity === severity.toLowerCase();
      return matchQ && matchS;
    });
  }, [query, severity]);

  const selected = incidents.find(i => i.id === selectedId) ?? incidents[0];

  return (
    <div className="inc-view">

      {/* ── Stat strip ─────────────────────────────────────────────────── */}
      <div className="inc-view__stats">
        <CuraStatCard icon={ReportProblemOutlinedIcon} iconBg="var(--cura-red-bg)" iconColor="var(--cura-red)" value={stats.critical} label="Critical Open" />
        <CuraStatCard icon={AssignmentOutlinedIcon} iconBg="var(--cura-amber-bg)" iconColor="var(--cura-amber)" value={stats.openWeek} label="Open This Week" />
        <CuraStatCard icon={HourglassEmptyOutlinedIcon} iconBg="var(--cura-blue-light)" iconColor="var(--cura-blue)" value={stats.pending} label="Pending Review" />
        <CuraStatCard icon={CheckCircleOutlineIcon} iconBg="var(--cura-green-bg)" iconColor="var(--cura-green)" value={stats.resolved} label="Resolved This Month" />
      </div>

      {/* ── Master / detail ─────────────────────────────────────────────── */}
      <div className="inc-view__body">

        {/* List panel */}
        <div className="inc-view__list-panel">
          <div className="inc-view__search">
            <SearchIcon sx={{ fontSize: 16 }} />
            <input
              type="search"
              placeholder="Search incidents…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          <div className="inc-view__filter-pills">
            {SEVERITY_FILTERS.map(f => (
              <button
                key={f}
                type="button"
                className={`inc-view__pill${severity === f ? ' inc-view__pill--active' : ''}`}
                onClick={() => setSeverity(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="inc-view__incident-list">
            {filtered.length === 0 && (
              <p className="inc-view__empty">No incidents match your filter.</p>
            )}
            {filtered.map(inc => (
              <button
                key={inc.id}
                type="button"
                className={`inc-view__inc-card${selectedId === inc.id ? ' inc-view__inc-card--active' : ''}`}
                onClick={() => { setSelectedId(inc.id); setDetailTab('Details'); }}
              >
                <div className="inc-view__inc-card-head">
                  <div
                    className="inc-view__type-icon"
                    style={{ background: TYPE_BG[inc.type] ?? 'var(--cura-bg)', color: TYPE_COLOR[inc.type] ?? 'var(--cura-navy)' }}
                  >
                    {TYPE_ICON[inc.type] ?? <ReportProblemOutlinedIcon sx={{ fontSize: 18 }} />}
                  </div>
                  <div className="inc-view__inc-info">
                    <div className="inc-view__inc-title">{inc.title}</div>
                    <div className="inc-view__inc-meta">{inc.time} · {inc.location}</div>
                  </div>
                </div>
                <div className="inc-view__inc-card-foot">
                  <CuraStatusPill status={inc.severity as any} />
                  <CuraStatusPill status={inc.status as any} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="inc-view__detail-panel">
            {/* Header */}
            <div className="inc-view__detail-header">
              <div className="inc-view__detail-header-left">
                <div
                  className="inc-view__detail-type-icon"
                  style={{ background: TYPE_BG[selected.type] ?? 'var(--cura-bg)', color: TYPE_COLOR[selected.type] ?? 'var(--cura-navy)' }}
                >
                  {TYPE_ICON[selected.type] ?? <ReportProblemOutlinedIcon sx={{ fontSize: 22 }} />}
                </div>
                <div>
                  <div className="inc-view__detail-title">{selected.title}</div>
                  <div className="inc-view__detail-meta">
                    {selected.date} at {selected.time} · {selected.location}
                  </div>
                  <div className="inc-view__detail-pills">
                    <CuraStatusPill status={selected.severity as any} />
                    <CuraStatusPill status={selected.status as any} />
                    <span className="inc-view__type-pill">{selected.type}</span>
                  </div>
                </div>
              </div>
              <div className="inc-view__detail-header-actions">
                <button type="button" className="inc-view__detail-btn">Escalate</button>
                <button type="button" className="inc-view__detail-btn inc-view__detail-btn--primary">
                  {selected.status === 'resolved' || selected.status === 'closed' ? 'View Report' : 'Mark Resolved'}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="inc-view__detail-tabs">
              {DETAIL_TABS.map(tab => (
                <button
                  key={tab}
                  type="button"
                  className={`inc-view__detail-tab${detailTab === tab ? ' inc-view__detail-tab--active' : ''}`}
                  onClick={() => setDetailTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Details tab */}
            {detailTab === 'Details' && (
              <div className="inc-view__tab-content">
                <div className="inc-view__info-grid">
                  {[
                    { label: 'Reported by', value: selected.reportedBy },
                    { label: 'Date', value: selected.date },
                    { label: 'Time', value: selected.time },
                    { label: 'Location', value: selected.location },
                    { label: 'Resident', value: selected.residentName ?? '—' },
                    { label: 'Severity', value: selected.severity.charAt(0).toUpperCase() + selected.severity.slice(1) },
                  ].map(item => (
                    <div key={item.label} className="inc-view__info-cell">
                      <div className="inc-view__info-label">{item.label}</div>
                      <div className="inc-view__info-value">{item.value}</div>
                    </div>
                  ))}
                </div>

                <div className="inc-view__desc-box">
                  <div className="inc-view__desc-label">Description</div>
                  <p className="inc-view__desc-text">{selected.description}</p>
                </div>
              </div>
            )}

            {/* Actions tab */}
            {detailTab === 'Actions' && (
              <div className="inc-view__tab-content">
                <h4 className="inc-view__section-label">Action Checklist</h4>
                <ul className="inc-view__action-list">
                  {selected.actions.map(action => (
                    <li key={action.id} className="inc-view__action-item">
                      {action.done
                        ? <CheckBoxIcon sx={{ fontSize: 18, color: 'var(--cura-green)' }} />
                        : <CheckBoxOutlineBlankIcon sx={{ fontSize: 18, color: 'var(--cura-text-hint)' }} />
                      }
                      <span className={action.done ? 'inc-view__action--done' : ''}>{action.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Timeline tab */}
            {detailTab === 'Timeline' && (
              <div className="inc-view__tab-content">
                <div className="inc-view__timeline">
                  {selected.timeline.map((entry, i) => (
                    <div key={i} className="inc-view__tl-entry">
                      <div className="inc-view__tl-dot" />
                      <div className="inc-view__tl-body">
                        <div className="inc-view__tl-head">
                          <span className="inc-view__tl-actor">{entry.actor}</span>
                          <span className="inc-view__tl-time">{entry.time}</span>
                        </div>
                        <p className="inc-view__tl-note">{entry.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related tab */}
            {detailTab === 'Related' && (
              <div className="inc-view__tab-content">
                <p style={{ color: 'var(--cura-text-muted)', fontSize: 13, margin: 0 }}>
                  No related incidents recorded for this entry.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
