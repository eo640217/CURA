import React from 'react';
import { useNavigate } from 'react-router-dom';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import CuraStatusPill from '../components/cura/CuraStatusPill';
import type { WidgetKey } from '../types/dashboard';

type StatusVariant = 'stable' | 'monitor' | 'urgent' | 'active' | 'review' | 'pending';

interface TileData {
  icon: React.ComponentType<{ sx?: object }>;
  value: string;
  label: string;
  pill: string;
  pillVariant: StatusVariant;
  route: string;
}

function WidgetTile({ data }: { data: TileData }) {
  const navigate = useNavigate();
  const Icon = data.icon;
  return (
    <div
      className="dwc__body"
      role="button"
      tabIndex={0}
      onClick={() => navigate(data.route)}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && navigate(data.route)}
    >
      <div className="dwc__head">
        <div className="dwc__icon"><Icon sx={{ fontSize: 18 }} /></div>
        <CuraStatusPill status={data.pillVariant} label={data.pill} />
      </div>
      <div className="dwc__stat">{data.value}</div>
      <div className="dwc__label">{data.label}</div>
      <span className="dwc__link">View more</span>
    </div>
  );
}

const TILE: Record<WidgetKey, TileData> = {
  residents:   { icon: PeopleAltOutlinedIcon,      value: '127',      label: 'Total Residents',    pill: 'Stable',        pillVariant: 'stable',  route: '/residents'  },
  alerts:      { icon: WarningAmberOutlinedIcon,   value: '5',        label: 'Active Alerts',      pill: '2 Urgent',      pillVariant: 'urgent',  route: '/dashboard'  },
  staff:       { icon: BadgeOutlinedIcon,           value: '14',       label: 'Staff on Shift',     pill: 'Full Cover',    pillVariant: 'stable',  route: '/scheduling' },
  occupancy:   { icon: ApartmentOutlinedIcon,       value: '98%',      label: 'Occupancy',          pill: 'Near Cap.',     pillVariant: 'monitor', route: '/facilities' },
  schedule:    { icon: CalendarMonthOutlinedIcon,   value: '6',        label: "Today's Schedule",   pill: '4 Remaining',   pillVariant: 'active',  route: '/scheduling' },
  careplans:   { icon: AssignmentOutlinedIcon,      value: '5',        label: 'Care Plans',         pill: 'Reviews Due',   pillVariant: 'monitor', route: '/care-plans' },
  medications: { icon: MedicalServicesOutlinedIcon, value: 'On Track', label: 'Medications',        pill: 'Last Round ✓',  pillVariant: 'stable',  route: '/dashboard'  },
  incidents:   { icon: ReportProblemOutlinedIcon,   value: '2',        label: 'Incident Log',       pill: 'All Resolved',  pillVariant: 'stable',  route: '/incidents'  },
};

const ResidentsWidget:   React.ComponentType = () => <WidgetTile data={TILE.residents} />;
const AlertsWidget:      React.ComponentType = () => <WidgetTile data={TILE.alerts} />;
const StaffWidget:       React.ComponentType = () => <WidgetTile data={TILE.staff} />;
const OccupancyWidget:   React.ComponentType = () => <WidgetTile data={TILE.occupancy} />;
const ScheduleWidget:    React.ComponentType = () => <WidgetTile data={TILE.schedule} />;
const CarePlansWidget:   React.ComponentType = () => <WidgetTile data={TILE.careplans} />;
const MedicationsWidget: React.ComponentType = () => <WidgetTile data={TILE.medications} />;
const IncidentsWidget:   React.ComponentType = () => <WidgetTile data={TILE.incidents} />;

export interface WidgetMeta {
  key: WidgetKey;
  label: string;
  icon: React.ComponentType<{ sx?: object }>;
  component: React.ComponentType;
}

export const WIDGET_REGISTRY: Record<WidgetKey, WidgetMeta> = {
  residents:   { key: 'residents',   label: 'Residents',        icon: PeopleAltOutlinedIcon,      component: ResidentsWidget   },
  alerts:      { key: 'alerts',      label: 'Active Alerts',    icon: WarningAmberOutlinedIcon,   component: AlertsWidget      },
  staff:       { key: 'staff',       label: 'Staff on Shift',   icon: BadgeOutlinedIcon,          component: StaffWidget       },
  occupancy:   { key: 'occupancy',   label: 'Occupancy',        icon: ApartmentOutlinedIcon,      component: OccupancyWidget   },
  schedule:    { key: 'schedule',    label: "Today's Schedule", icon: CalendarMonthOutlinedIcon,  component: ScheduleWidget    },
  careplans:   { key: 'careplans',   label: 'Care Plans',       icon: AssignmentOutlinedIcon,     component: CarePlansWidget   },
  medications: { key: 'medications', label: 'Medications',      icon: MedicalServicesOutlinedIcon, component: MedicationsWidget },
  incidents:   { key: 'incidents',   label: 'Incident Log',     icon: ReportProblemOutlinedIcon,  component: IncidentsWidget   },
};

export const ALL_WIDGET_KEYS: WidgetKey[] = [
  'residents', 'alerts', 'staff', 'occupancy', 'schedule', 'careplans', 'medications', 'incidents',
];
