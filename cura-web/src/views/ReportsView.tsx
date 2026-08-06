// Occupancy is live (facilities/units API). Incidents and care plans have no
// backend yet (see IncidentsView / CarePlansView), so this reuses the same
// mockData source those views already use, to stay consistent.
import { useMemo } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import BedOutlinedIcon from '@mui/icons-material/BedOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import EventSeatOutlinedIcon from '@mui/icons-material/EventSeatOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import AssignmentLateOutlinedIcon from '@mui/icons-material/AssignmentLateOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import { useNavigate } from 'react-router-dom';
import { Facility, listFacilities } from '../api/facilities';
import { Unit, listUnitsByFacility } from '../api/units';
import { apiErrorMessage } from '../api/api-error';
import { incidents, carePlans } from '../lib/mockData';
import CuraStatCard from '../components/cura/CuraStatCard';
import CuraStatusPill from '../components/cura/CuraStatusPill';
import './ReportsView.scss';

type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; facilities: Facility[]; unitsByFacility: Record<number, Unit[]> }
  | { status: 'error'; message: string };

export default function ReportsView() {
  const navigate = useNavigate();

  const facilitiesQuery = useQuery({
    queryKey: ['facilities'],
    queryFn: listFacilities,
  });
  const facilities = facilitiesQuery.data ?? [];

  const unitsQueries = useQueries({
    queries: facilities.map(f => ({
      queryKey: ['units', f.id],
      queryFn: () => listUnitsByFacility(f.id),
      enabled: facilitiesQuery.isSuccess,
    })),
  });

  const state: LoadState = facilitiesQuery.isLoading
    ? { status: 'loading' }
    : facilitiesQuery.isError
      ? { status: 'error', message: apiErrorMessage(facilitiesQuery.error) }
      : facilitiesQuery.isSuccess
        ? {
            status: 'success',
            facilities,
            unitsByFacility: Object.fromEntries(
              facilities.map((f, i) => [f.id, unitsQueries[i]?.data ?? []])
            ),
          }
        : { status: 'idle' };

  const occupancy = useMemo(() => {
    if (state.status !== 'success') return { beds: 0, occupied: 0, available: 0, rate: 0 };
    const allUnits = Object.values(state.unitsByFacility).flat();
    const beds = allUnits.reduce((s, u) => s + (u.capacity ?? 0), 0);
    const occupied = allUnits.reduce((s, u) => s + (u.occupiedCount ?? 0), 0);
    const available = Math.max(0, beds - occupied);
    const rate = beds > 0 ? Math.round((occupied / beds) * 100) : 0;
    return { beds, occupied, available, rate };
  }, [state]);

  const incidentStats = useMemo(() => ({
    open: incidents.filter(i => i.status === 'open').length,
    pending: incidents.filter(i => i.status === 'pending').length,
    critical: incidents.filter(i => i.severity === 'critical').length,
    resolved30d: incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length,
  }), []);

  const carePlanStats = useMemo(() => ({
    overdue: carePlans.filter(p => p.status === 'overdue').length,
    dueSoon: carePlans.filter(p => p.status === 'due-soon').length,
    upToDate: carePlans.filter(p => p.status === 'up-to-date' || p.status === 'active').length,
  }), []);

  const facilityRows = state.status === 'success' ? state.facilities.map(f => {
    const units = state.unitsByFacility[f.id] ?? [];
    const beds = units.reduce((s, u) => s + (u.capacity ?? 0), 0);
    const occupied = units.reduce((s, u) => s + (u.occupiedCount ?? 0), 0);
    const rate = beds > 0 ? Math.round((occupied / beds) * 100) : 0;
    return { facility: f, beds, occupied, rate };
  }) : [];

  return (
    <div className="rv">
      <div className="rv__header">
        <div>
          <h1 className="rv__title">Reports</h1>
          <p className="rv__subtitle">Occupancy, incidents, and care plan status across your facilities</p>
        </div>
      </div>

      {state.status === 'loading' && <p className="rv__msg">Loading…</p>}
      {state.status === 'error' && <p className="rv__msg rv__msg--error">{state.message}</p>}

      {state.status === 'success' && (
        <>
          {/* ── Occupancy ──────────────────────────────────────────────── */}
          <section className="rv__section">
            <h2 className="rv__section-title">Occupancy</h2>
            <div className="rv__stats">
              <CuraStatCard icon={ApartmentOutlinedIcon} iconBg="var(--cura-blue-light)" iconColor="var(--cura-navy)"
                value={state.facilities.length} label="Facilities" />
              <CuraStatCard icon={BedOutlinedIcon} iconBg="var(--cura-blue-light)" iconColor="var(--cura-navy)"
                value={occupancy.beds} label="Total beds" />
              <CuraStatCard icon={EventSeatOutlinedIcon} iconBg="var(--cura-green-bg)" iconColor="var(--cura-green-text)"
                value={occupancy.available} label="Beds available" />
              <CuraStatCard icon={EventSeatOutlinedIcon} iconBg="var(--cura-amber-bg)" iconColor="var(--cura-amber-text)"
                value={`${occupancy.rate}%`} label="Occupancy rate" />
            </div>

            <div className="rv__table-wrap">
              <table className="rv__table">
                <thead>
                  <tr>
                    <th>Facility</th>
                    <th>Beds</th>
                    <th>Occupied</th>
                    <th>Occupancy</th>
                  </tr>
                </thead>
                <tbody>
                  {facilityRows.length === 0 && (
                    <tr><td colSpan={4} className="rv__table-msg">No facilities yet.</td></tr>
                  )}
                  {facilityRows.map(row => (
                    <tr
                      key={row.facility.id}
                      className="rv__table-row--clickable"
                      onClick={() => navigate('/facilities')}
                    >
                      <td>{row.facility.name}</td>
                      <td>{row.beds}</td>
                      <td>{row.occupied}</td>
                      <td>
                        <span className={`rv__rate-pill rv__rate-pill--${row.rate >= 90 ? 'high' : row.rate >= 70 ? 'mid' : 'low'}`}>
                          {row.rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Incidents ──────────────────────────────────────────────── */}
          <section className="rv__section">
            <div className="rv__section-head">
              <h2 className="rv__section-title">Incidents</h2>
              <button type="button" className="rv__link-btn" onClick={() => navigate('/incidents')}>
                View all
              </button>
            </div>
            <div className="rv__stats">
              <CuraStatCard icon={ReportProblemOutlinedIcon} iconBg="var(--cura-red-bg)" iconColor="var(--cura-red-text)"
                value={incidentStats.open} label="Open" />
              <CuraStatCard icon={ReportProblemOutlinedIcon} iconBg="var(--cura-amber-bg)" iconColor="var(--cura-amber-text)"
                value={incidentStats.pending} label="Pending" />
              <CuraStatCard icon={ReportProblemOutlinedIcon} iconBg="var(--cura-red-bg)" iconColor="var(--cura-red-text)"
                value={incidentStats.critical} label="Critical severity" />
              <CuraStatCard icon={ReportProblemOutlinedIcon} iconBg="var(--cura-green-bg)" iconColor="var(--cura-green-text)"
                value={incidentStats.resolved30d} label="Resolved / closed" />
            </div>
          </section>

          {/* ── Care plans ─────────────────────────────────────────────── */}
          <section className="rv__section">
            <div className="rv__section-head">
              <h2 className="rv__section-title">Care plans</h2>
              <button type="button" className="rv__link-btn" onClick={() => navigate('/care-plans')}>
                View all
              </button>
            </div>
            <div className="rv__stats">
              <CuraStatCard icon={AssignmentLateOutlinedIcon} iconBg="var(--cura-red-bg)" iconColor="var(--cura-red-text)"
                value={carePlanStats.overdue} label="Overdue" />
              <CuraStatCard icon={AssignmentLateOutlinedIcon} iconBg="var(--cura-amber-bg)" iconColor="var(--cura-amber-text)"
                value={carePlanStats.dueSoon} label="Due soon" />
              <CuraStatCard icon={AssignmentTurnedInOutlinedIcon} iconBg="var(--cura-green-bg)" iconColor="var(--cura-green-text)"
                value={carePlanStats.upToDate} label="Up to date" />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
