import React from "react";
import { Link } from "react-router-dom";
import type { WorkletData } from "../views/homeData";
import "./WorkletCard.scss";

interface WorkletCardProps {
  data: WorkletData;
}

export default function WorkletCard({ data }: WorkletCardProps) {
  const Icon = data.icon;

  return (
    <article className="worklet-card">
      <div className="worklet-card__header">
        <div className="worklet-card__icon-wrap">
          <Icon size={18} aria-hidden="true" />
        </div>
        <span className={`worklet-card__pill worklet-card__pill--${data.pillVariant}`}>
          {data.pill}
        </span>
      </div>

      <div className="worklet-card__stat">{data.stat}</div>
      <div className="worklet-card__title">{data.title}</div>
      <p className="worklet-card__sub">{data.subLabel}</p>

      <Link to={data.route} className="worklet-card__link">
        View more
      </Link>
    </article>
  );
}
