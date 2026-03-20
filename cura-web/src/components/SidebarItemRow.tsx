import React from "react";
import { NavLink, useMatch } from "react-router-dom";

export default function SidebarItemRow({
  to,
  icon,
  label,
  end,
}: {
  to: string;
  icon: string;
  label: string;
  end?: boolean;
}) {
  const match = useMatch({ path: to, end: !!end });

  return (
    <li className={match ? "active" : ""}>
      <NavLink to={to} end={end}>
        <i className={icon} />
        <span className="text">{label}</span>
      </NavLink>
    </li>
  );
}