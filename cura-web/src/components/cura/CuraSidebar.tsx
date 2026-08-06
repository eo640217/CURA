import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { roleAtLeast } from '../../auth/auth';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import './CuraSidebar.scss';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',  icon: <DashboardOutlinedIcon sx={{ fontSize: 20 }} />,  label: 'Dashboard', end: true },
  { to: '/residents',  icon: <PeopleAltOutlinedIcon sx={{ fontSize: 20 }} />,  label: 'Residents' },
  { to: '/care-plans', icon: <AssignmentOutlinedIcon sx={{ fontSize: 20 }} />, label: 'Care Plans' },
  { to: '/scheduling', icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 20 }} />, label: 'Scheduling' },
  { to: '/facilities', icon: <BadgeOutlinedIcon sx={{ fontSize: 20 }} />,            label: 'Facilities' },
  { to: '/staff',      icon: <ManageAccountsOutlinedIcon sx={{ fontSize: 20 }} />, label: 'Staff', adminOnly: true },
];

const NAV_BOTTOM_MAIN: NavItem[] = [
  { to: '/reports',   icon: <BarChartOutlinedIcon sx={{ fontSize: 20 }} />,    label: 'Reports' },
  { to: '/incidents', icon: <ReportProblemOutlinedIcon sx={{ fontSize: 20 }} />, label: 'Incidents' },
];

interface CuraSidebarProps {
  activePage?: string;
  role: string | null;
  onLogout: () => void;
}

export default function CuraSidebar({ role, onLogout }: CuraSidebarProps) {
  const navigate = useNavigate();
  const visibleMain = NAV_ITEMS.filter(item => !item.adminOnly || roleAtLeast(role, 'ADMIN'));

  return (
    <aside className="cura-sidebar">
      {/* Logo */}
      <div className="cura-sidebar__brand">
        <NavLink to="/dashboard" title="Dashboard">
          <div className="cura-sidebar__logo">C.</div>
        </NavLink>
      </div>

      {/* Main nav */}
      <ul className="cura-sidebar__nav">
        {visibleMain.map(item => (
          <li key={item.to} className="cura-sidebar__item">
            <NavLink to={item.to} end={item.end} title={item.label}>
              {item.icon}
            </NavLink>
          </li>
        ))}

        <li><div className="cura-sidebar__divider" /></li>

        {NAV_BOTTOM_MAIN.map(item => (
          <li key={item.to} className="cura-sidebar__item">
            <NavLink to={item.to} title={item.label}>
              {item.icon}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Bottom utility nav */}
      <ul className="cura-sidebar__nav-bottom">
        <li className="cura-sidebar__item">
          <button type="button" title="Notifications" aria-label="Notifications">
            <NotificationsOutlinedIcon sx={{ fontSize: 20 }} />
          </button>
        </li>
        <li className="cura-sidebar__item">
          <button
            type="button"
            title="Settings"
            aria-label="Settings"
            onClick={() => navigate('/settings')}
          >
            <SettingsOutlinedIcon sx={{ fontSize: 20 }} />
          </button>
        </li>
        <li className="cura-sidebar__item">
          <button
            type="button"
            title="Log out"
            aria-label="Log out"
            className="cura-sidebar__logout"
            onClick={onLogout}
          >
            <LogoutIcon sx={{ fontSize: 20 }} />
          </button>
        </li>
      </ul>
    </aside>
  );
}
