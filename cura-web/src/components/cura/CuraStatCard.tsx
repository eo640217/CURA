import React from 'react';
import type { SvgIconComponent } from '@mui/icons-material';

interface CuraStatCardProps {
  icon: SvgIconComponent;
  iconBg: string;
  iconColor: string;
  value: string | number;
  label: string;
}

export default function CuraStatCard({ icon: Icon, iconBg, iconColor, value, label }: CuraStatCardProps) {
  return (
    <div
      style={{
        background: 'var(--cura-surface)',
        border: '0.5px solid var(--cura-border)',
        borderRadius: 'var(--cura-radius-md)',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 20, color: iconColor }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--cura-navy)',
            lineHeight: 1.1,
            fontFamily: '"Fraunces", Georgia, serif',
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: 12, color: 'var(--cura-text-muted)', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}
