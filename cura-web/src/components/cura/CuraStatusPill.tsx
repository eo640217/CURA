import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type PillStatus =
  | 'urgent' | 'monitor' | 'stable' | 'new'
  | 'open' | 'resolved' | 'review' | 'closed'
  | 'overdue' | 'due-soon' | 'up-to-date' | 'active'
  | 'critical' | 'major' | 'minor' | 'low' | 'pending';

interface CuraStatusPillProps {
  status: PillStatus;
  label?: string;
}

const CONFIG: Record<PillStatus, { bg: string; color: string; defaultLabel: string }> = {
  urgent:       { bg: 'var(--cura-red-bg)',    color: 'var(--cura-red-text)',    defaultLabel: 'Urgent'     },
  critical:     { bg: 'var(--cura-red-bg)',    color: 'var(--cura-red-text)',    defaultLabel: 'Critical'   },
  major:        { bg: '#FEF0E6',               color: '#7A3000',                 defaultLabel: 'Major'      },
  monitor:      { bg: 'var(--cura-amber-bg)',  color: 'var(--cura-amber-text)', defaultLabel: 'Monitor'    },
  pending:      { bg: 'var(--cura-amber-bg)',  color: 'var(--cura-amber-text)', defaultLabel: 'Pending'    },
  review:       { bg: 'var(--cura-amber-bg)',  color: 'var(--cura-amber-text)', defaultLabel: 'In Review'  },
  due_soon:     { bg: 'var(--cura-amber-bg)',  color: 'var(--cura-amber-text)', defaultLabel: 'Due Soon'   },
  'due-soon':   { bg: 'var(--cura-amber-bg)',  color: 'var(--cura-amber-text)', defaultLabel: 'Due Soon'   },
  overdue:      { bg: 'var(--cura-red-bg)',    color: 'var(--cura-red-text)',    defaultLabel: 'Overdue'    },
  stable:       { bg: 'var(--cura-green-bg)',  color: 'var(--cura-green-text)', defaultLabel: 'Stable'     },
  resolved:     { bg: 'var(--cura-green-bg)',  color: 'var(--cura-green-text)', defaultLabel: 'Resolved'   },
  'up-to-date': { bg: 'var(--cura-green-bg)', color: 'var(--cura-green-text)', defaultLabel: 'Up to date' },
  active:       { bg: 'var(--cura-blue-light)',color: 'var(--cura-navy)',        defaultLabel: 'Active'     },
  new:          { bg: 'var(--cura-purple-bg)', color: 'var(--cura-purple-text)',defaultLabel: 'New'        },
  open:         { bg: 'var(--cura-blue-light)',color: 'var(--cura-navy)',        defaultLabel: 'Open'       },
  closed:       { bg: '#F0F2F5',              color: 'var(--cura-text-muted)',   defaultLabel: 'Closed'     },
  minor:        { bg: '#F0F2F5',              color: 'var(--cura-text-muted)',   defaultLabel: 'Minor'      },
  low:          { bg: '#F0F2F5',              color: 'var(--cura-text-muted)',   defaultLabel: 'Low'        },
};

export default function CuraStatusPill({ status, label }: CuraStatusPillProps) {
  const cfg = CONFIG[status] ?? CONFIG.closed;
  const reduced = useReducedMotion();

  return (
    <motion.span
      // Re-keying on value change triggers the brief scale pulse
      key={`${status}-${label ?? ''}`}
      initial={reduced ? false : { scale: 1.14, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.02em',
        background: cfg.bg,
        color: cfg.color,
        whiteSpace: 'nowrap',
        lineHeight: 1.5,
      }}
    >
      {label ?? cfg.defaultLabel}
    </motion.span>
  );
}
