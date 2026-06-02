import React from "react";
import type { ActionItem } from "../views/homeData";
import "./ActionStrip.scss";

const URGENCY_LABEL: Record<string, string> = {
  urgent:  "Urgent",
  monitor: "Monitor",
  info:    "Info",
  stable:  "Stable",
};

interface ActionStripProps {
  items: ActionItem[];
}

export default function ActionStrip({ items }: ActionStripProps) {
  return (
    <div className="action-strip" role="list">
      {items.map((item) => (
        <article
          key={item.id}
          role="listitem"
          className={`action-strip__card action-strip__card--${item.urgency}`}
        >
          <p className="action-strip__label">{item.label}</p>
          <p className="action-strip__detail">{item.detail}</p>
          <div className="action-strip__footer">
            <span className={`action-strip__pill action-strip__pill--${item.urgency}`}>
              {URGENCY_LABEL[item.urgency]}
            </span>
            <button type="button" className="action-strip__review">
              Review
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
