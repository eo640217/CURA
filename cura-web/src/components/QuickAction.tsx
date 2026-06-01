import React from "react";
import { useNavigate } from "react-router-dom";
import type { QuickActionData } from "../views/homeData";
import "./QuickAction.scss";

interface QuickActionProps {
  data: QuickActionData;
}

export default function QuickAction({ data }: QuickActionProps) {
  const navigate = useNavigate();
  const Icon = data.icon;

  return (
    <button
      type="button"
      className="quick-action"
      onClick={() => navigate(data.route)}
      title={data.label}
      aria-label={data.label}
    >
      <div className="quick-action__icon">
        <Icon size={20} aria-hidden="true" />
      </div>
      <span className="quick-action__label">{data.label}</span>
    </button>
  );
}
