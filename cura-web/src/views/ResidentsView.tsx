// TODO: replace mockData with useEffect + fetch(...) to GET /api/v1/residents/directory
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import CuraStatCard from '../components/cura/CuraStatCard';
import CuraStatusPill from '../components/cura/CuraStatusPill';
import { residents } from '../lib/mockData';
import './ResidentsView.scss';

const WINGS = ['All', 'Wing A', 'Wing B', 'Wing C'];
const STATUSES = ['All', 'Stable', 'Monitor', 'Urgent'];
const PAGE_SIZE = 8;

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

function avatarColor(name: string): string {
  const colors = ['#4A90D9', '#3AB06A', '#E8A032', '#9B59B6', '#E05050', '#1E3A5F'];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % colors.length;
  return colors[Math.abs(h)];
}

export default function ResidentsView() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [wing, setWing] = useState('All');
  const [status, setStatus] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    return residents.filter(r => {
      const matchQ = !query || `${r.firstName} ${r.lastName} ${r.residentId} ${r.room}`.toLowerCase().includes(query.toLowerCase());
      const matchW = wing === 'All' || r.wing === wing;
      const matchS = status === 'All' || r.status === status.toLowerCase();
      return matchQ && matchW && matchS;
    });
  }, [query, wing, status]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const stats = {
    total: residents.length,
    stable: residents.filter(r => r.status === 'stable').length,
    monitor: residents.filter(r => r.status === 'monitor').length,
    urgent: residents.filter(r => r.status === 'urgent').length,
  };

  return (
    <div className="res-view">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="res-view__header">
        <div>
          <h1 className="res-view__title">Residents</h1>
          <p className="res-view__subtitle">{stats.total} residents</p>
        </div>
        <button
          type="button"
          className="res-view__newBtn"
          onClick={() => navigate('/residents/new')}
        >
          <PersonAddAltOutlinedIcon sx={{ fontSize: 15 }} />
          New Resident
        </button>
      </div>

      {/* ── Stat strip ───────────────────────────────────────────────────── */}
      <div className="res-view__stats">
        <CuraStatCard icon={PeopleAltOutlinedIcon} iconBg="var(--cura-blue-light)" iconColor="var(--cura-blue)" value={stats.total} label="Total Residents" />
        <CuraStatCard icon={FavoriteOutlinedIcon} iconBg="var(--cura-green-bg)" iconColor="var(--cura-green)" value={stats.stable} label="Stable" />
        <CuraStatCard icon={MonitorHeartOutlinedIcon} iconBg="var(--cura-amber-bg)" iconColor="var(--cura-amber)" value={stats.monitor} label="Monitoring" />
        <CuraStatCard icon={WarningAmberOutlinedIcon} iconBg="var(--cura-red-bg)" iconColor="var(--cura-red)" value={stats.urgent} label="Urgent" />
      </div>

      {/* ── Filter bar ────────────────────────────────────────────────────── */}
      <div className="res-view__filters">
        <div className="res-view__search">
          <SearchIcon sx={{ fontSize: 16 }} />
          <input
            type="search"
            placeholder="Search name, ID, room…"
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(0); }}
          />
        </div>

        <div className="res-view__pill-group">
          {WINGS.map(w => (
            <button key={w} type="button" className={`res-view__pill${wing === w ? ' res-view__pill--active' : ''}`} onClick={() => { setWing(w); setPage(0); }}>
              {w}
            </button>
          ))}
        </div>

        <div className="res-view__pill-group">
          {STATUSES.map(s => (
            <button key={s} type="button" className={`res-view__pill${status === s ? ' res-view__pill--active' : ''}`} onClick={() => { setStatus(s); setPage(0); }}>
              {s}
            </button>
          ))}
        </div>

        <div className="res-view__view-toggle">
          <button type="button" title="Table view" className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')}>
            <TableRowsOutlinedIcon sx={{ fontSize: 18 }} />
          </button>
          <button type="button" title="Grid view" className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>
            <GridViewOutlinedIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="res-view__table-wrap">
        <table className="res-view__table">
          <thead>
            <tr>
              <th>Resident</th>
              <th>ID</th>
              <th>Room</th>
              <th>Wing</th>
              <th>Age</th>
              <th>Condition</th>
              <th>Care Level</th>
              <th>Status</th>
              <th>Last Checked</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: 32, color: 'var(--cura-text-muted)' }}>
                  No residents match your filters.
                </td>
              </tr>
            )}
            {paged.map(r => (
              <tr
                key={r.id}
                className="res-view__row"
                onClick={() => navigate(`/residents/${r.id}`)}
              >
                <td>
                  <div className="res-view__resident-cell">
                    <div className="res-view__avatar" style={{ background: avatarColor(`${r.firstName} ${r.lastName}`) }}>
                      {getInitials(r.firstName, r.lastName)}
                    </div>
                    <div>
                      <div className="res-view__name">{r.firstName} {r.lastName}</div>
                      <div className="res-view__sub">{r.conditions[0]}</div>
                    </div>
                  </div>
                </td>
                <td className="res-view__muted">{r.residentId}</td>
                <td>{r.room}</td>
                <td className="res-view__muted">{r.wing}</td>
                <td>{r.age}</td>
                <td>{r.conditions.slice(0, 2).join(', ')}</td>
                <td>
                  <span className="res-view__care-badge">{r.careLevel}</span>
                </td>
                <td><CuraStatusPill status={r.status} /></td>
                <td className="res-view__muted">{r.lastChecked}</td>
                <td>
                  <button
                    type="button"
                    className="res-view__menu-btn"
                    onClick={e => e.stopPropagation()}
                    title="Actions"
                    aria-label="Actions"
                  >
                    <MoreVertIcon sx={{ fontSize: 18 }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      <div className="res-view__pagination">
        <span className="res-view__pagination-count">
          Showing {Math.min(page * PAGE_SIZE + 1, filtered.length)}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} residents
        </span>
        <div className="res-view__pagination-btns">
          <button type="button" className="res-view__page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`res-view__page-btn${page === i ? ' res-view__page-btn--active' : ''}`}
              onClick={() => setPage(i)}
            >
              {i + 1}
            </button>
          ))}
          <button type="button" className="res-view__page-btn" disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}>
            Next
          </button>
        </div>
      </div>

    </div>
  );
}
