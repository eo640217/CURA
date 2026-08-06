import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { roleAtLeast } from "../auth/auth";
import {
  LayoutDashboard,
  Building2,
  Users,
  LayoutGrid,
  Clock,
  ShieldCheck,
  BarChart2,
  FileWarning,
  IdCard,
  Settings,
  LogOut,
} from "lucide-react";
import cura_logo from "../assets/images/cura_logo_2.png";
import "./Sidebar.scss";

interface SidebarProps {
  role: string | null;
  onLogout: () => void;
}

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard",           icon: <LayoutDashboard size={20} />, label: "Dashboard",  end: true },
  { to: "/facilities",          icon: <Building2       size={20} />, label: "Facilities" },
  { to: "/residents/directory", icon: <Users           size={20} />, label: "Residents" },
  { to: "/units",               icon: <LayoutGrid      size={20} />, label: "Units" },
  { to: "/hours",               icon: <Clock           size={20} />, label: "Hours" },
  { to: "/staff",               icon: <IdCard          size={20} />, label: "Staff",      adminOnly: true },
  { to: "/admin/users",         icon: <ShieldCheck     size={20} />, label: "Admin",      adminOnly: true },
  { to: "/reports",             icon: <BarChart2       size={20} />, label: "Reports" },
  { to: "/incidents",           icon: <FileWarning     size={20} />, label: "Incidents" },
];

export default function Sidebar({ role, onLogout }: SidebarProps) {
  const navigate = useNavigate();
  const visible = NAV_ITEMS.filter((item) => !item.adminOnly || roleAtLeast(role, "ADMIN"));

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <NavLink to="/dashboard" title="Dashboard">
          <img src={cura_logo} alt="Cura" />
        </NavLink>
      </div>

      <ul className="sidebar__nav">
        {visible.map((item) => (
          <li key={item.to} className="sidebar__item">
            <NavLink to={item.to} end={item.end} title={item.label}>
              {item.icon}
            </NavLink>
          </li>
        ))}
      </ul>

      <ul className="sidebar__nav-bottom">
        <li className="sidebar__item">
          <button
            type="button"
            title="Settings"
            onClick={() => navigate("/settings")}
          >
            <Settings size={20} />
          </button>
        </li>
        <li className="sidebar__item">
          <button
            type="button"
            title="Log out"
            className="sidebar__logout"
            onClick={onLogout}
          >
            <LogOut size={20} />
          </button>
        </li>
      </ul>
    </aside>
  );
}
