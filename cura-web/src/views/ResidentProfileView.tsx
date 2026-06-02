// TODO: replace mockData with useEffect + fetch(...) to GET /api/v1/residents/:id
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CuraStatusPill from '../components/cura/CuraStatusPill';
import { residents } from '../lib/mockData';
import './ResidentProfileView.scss';

const TABS = ['Overview', 'Care Plan', 'Medications', 'Vitals', 'Notes', 'History'];

function avatarColor(name: string): string {
  const colors = ['#4A90D9', '#3AB06A', '#E8A032', '#9B59B6', '#E05050', '#1E3A5F'];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % colors.length;
  return colors[Math.abs(h)];
}

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

function calcAge(dob: string): string {
  return dob;
}

export default function ResidentProfileView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');

  const resident = residents.find(r => r.id === Number(id));

  if (!resident) {
    return (
      <div className="rp-view">
        <div className="rp-view__not-found">
          <p>Resident not found.</p>
          <button type="button" onClick={() => navigate('/residents')}>Back to Residents</button>
        </div>
      </div>
    );
  }

  const fullName = `${resident.firstName} ${resident.lastName}`;
  const bgColor = avatarColor(fullName);
  const isAlert = resident.status === 'urgent' || resident.status === 'monitor';

  return (
    <div className="rp-view">
      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <nav className="rp-view__breadcrumb">
        <Link to="/residents" className="rp-view__bc-link">
          <ArrowBackIcon sx={{ fontSize: 14 }} /> Residents
        </Link>
        <span className="rp-view__bc-sep">/</span>
        <span className="rp-view__bc-current">{fullName}</span>
      </nav>

      {/* ── Alert banner ───────────────────────────────────────────────── */}
      {isAlert && (
        <div className={`rp-view__alert-banner rp-view__alert-banner--${resident.status}`}>
          <WarningAmberOutlinedIcon sx={{ fontSize: 18 }} />
          <span>
            {resident.status === 'urgent'
              ? 'This resident requires urgent attention. Please review their care plan and recent vitals immediately.'
              : 'This resident is currently under closer monitoring. Check recent notes and vitals.'}
          </span>
        </div>
      )}

      {/* ── Profile header ─────────────────────────────────────────────── */}
      <div className="rp-view__header">
        <div className="rp-view__header-left">
          <div className="rp-view__avatar-lg" style={{ background: bgColor }}>
            {getInitials(resident.firstName, resident.lastName)}
          </div>
          <div>
            <div className="rp-view__header-name-row">
              <h1 className="rp-view__name">{fullName}</h1>
              <CuraStatusPill status={resident.status} />
            </div>
            <div className="rp-view__meta-row">
              <span>Room {resident.room}</span>
              <span className="rp-view__meta-dot">·</span>
              <span>{resident.residentId}</span>
              <span className="rp-view__meta-dot">·</span>
              <span>DOB: {resident.dob}</span>
              <span className="rp-view__meta-dot">·</span>
              <span>Admitted: {resident.admittedDate}</span>
            </div>
            <div className="rp-view__conditions">
              {resident.conditions.map(c => (
                <span key={c} className="rp-view__condition-tag">{c}</span>
              ))}
              <span className="rp-view__care-badge">Care Level: {resident.careLevel}</span>
            </div>
          </div>
        </div>

        <div className="rp-view__header-actions">
          <button type="button" className="rp-view__action-btn">
            <PrintOutlinedIcon sx={{ fontSize: 16 }} /> Print
          </button>
          <button type="button" className="rp-view__action-btn rp-view__action-btn--primary">
            <EditOutlinedIcon sx={{ fontSize: 16 }} /> Edit Profile
          </button>
          <button type="button" className="rp-view__action-icon" title="More actions">
            <MoreVertIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="rp-view__tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            type="button"
            className={`rp-view__tab${activeTab === tab ? ' rp-view__tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab content ─────────────────────────────────────────────────── */}
      {activeTab === 'Overview' && (
        <div className="rp-view__overview">
          {/* Left column */}
          <div className="rp-view__col">
            <section className="rp-view__card">
              <h3 className="rp-view__card-title">Personal Details</h3>
              <dl className="rp-view__dl">
                <dt>Full name</dt>
                <dd>{fullName}</dd>
                <dt>Date of birth</dt>
                <dd>{resident.dob}</dd>
                <dt>Age</dt>
                <dd>{resident.age} years</dd>
                <dt>Room</dt>
                <dd>{resident.room}, {resident.wing}</dd>
                <dt>Resident ID</dt>
                <dd>{resident.residentId}</dd>
                <dt>Admitted</dt>
                <dd>{resident.admittedDate}</dd>
                <dt>Key worker</dt>
                <dd>{resident.keyWorker}</dd>
                <dt>Next of kin</dt>
                <dd>{resident.nextOfKin}</dd>
              </dl>
            </section>

            <section className="rp-view__card">
              <h3 className="rp-view__card-title">Current Medications</h3>
              <ul className="rp-view__med-list">
                {resident.medications.map(med => (
                  <li key={med} className="rp-view__med-item">
                    <span className="rp-view__med-dot" />
                    {med}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Right column */}
          <div className="rp-view__col">
            <section className="rp-view__card">
              <h3 className="rp-view__card-title">Recent Vitals</h3>
              <div className="rp-view__vitals-grid">
                {[
                  { label: 'Blood Pressure', value: '138/88 mmHg', sub: 'Taken 09:15 today', color: 'var(--cura-amber)' },
                  { label: 'Heart Rate', value: '74 bpm', sub: 'Normal range', color: 'var(--cura-green)' },
                  { label: 'O₂ Saturation', value: '96%', sub: 'SpO2 — stable', color: 'var(--cura-blue)' },
                  { label: 'Temperature', value: '36.7°C', sub: 'Normal', color: 'var(--cura-green)' },
                ].map(v => (
                  <div key={v.label} className="rp-view__vital">
                    <div className="rp-view__vital-value" style={{ color: v.color }}>{v.value}</div>
                    <div className="rp-view__vital-label">{v.label}</div>
                    <div className="rp-view__vital-sub">{v.sub}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rp-view__card">
              <h3 className="rp-view__card-title">Recent Notes</h3>
              <div className="rp-view__notes-list">
                {[
                  { author: 'Sarah Okonkwo', time: 'Today, 09:15', note: 'Morning care completed. Resident was slightly confused on waking but settled after breakfast. BP slightly elevated — monitoring.' },
                  { author: 'Helen Walsh', time: 'Yesterday, 14:30', note: 'GP visit: medication reviewed. Donepezil dose maintained. Next review in 3 months.' },
                  { author: 'James Osei', time: 'Yesterday, 18:00', note: 'Evening meal taken well. Resident engaged in activity session. Good mood overall.' },
                ].map((n, i) => (
                  <div key={i} className="rp-view__note">
                    <div className="rp-view__note-head">
                      <span className="rp-view__note-author">{n.author}</span>
                      <span className="rp-view__note-time">{n.time}</span>
                    </div>
                    <p className="rp-view__note-body">{n.note}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab !== 'Overview' && (
        <div className="rp-view__tab-placeholder">
          <p className="rp-view__tab-placeholder-text">{activeTab} content coming soon.</p>
        </div>
      )}
    </div>
  );
}
