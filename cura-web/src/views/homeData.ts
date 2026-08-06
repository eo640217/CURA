import {
  Users,
  AlertCircle,
  UserCheck,
  Building2,
  Calendar,
  ClipboardList,
  Pill,
  FileWarning,
  UserPlus,
  AlertTriangle,
  CalendarPlus,
  FilePlus,
  Bell,
  BarChart2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ── Action strip ────────────────────────────────────────────────────────────

export type ActionUrgency = "urgent" | "monitor" | "info" | "stable";

export interface ActionItem {
  id: number;
  urgency: ActionUrgency;
  label: string;
  detail: string;
  route: string;
}

export const actionItems: ActionItem[] = [
  { id: 1, urgency: "urgent",  label: "3 medication rounds overdue",      detail: "Wards B & C — action required",        route: "/scheduling" },
  { id: 2, urgency: "urgent",  label: "2 incidents pending sign-off",      detail: "Filed today — awaiting review",        route: "/incidents" },
  { id: 3, urgency: "monitor", label: "5 care plans due for review",       detail: "Overdue by 3+ days",                   route: "/care-plans" },
  { id: 4, urgency: "monitor", label: "Unit A & D near capacity",          detail: "98% occupancy — 2 beds remain",        route: "/facilities" },
  { id: 5, urgency: "info",    label: "Staff rota updated for 9 Jun",      detail: "Published by admin this morning",      route: "/scheduling" },
];

// ── Worklets ────────────────────────────────────────────────────────────────

export type PillVariant = "green" | "red" | "amber" | "blue";

export interface WorkletData {
  id: number;
  icon: LucideIcon;
  title: string;
  stat: string;
  subLabel: string;
  pill: string;
  pillVariant: PillVariant;
  route: string;
}

export const worklets: WorkletData[] = [
  {
    id: 1,
    icon: Users,
    title: "Residents",
    stat: "127",
    subLabel: "124 stable · 3 monitoring",
    pill: "Stable",
    pillVariant: "green",
    route: "/residents",
  },
  {
    id: 2,
    icon: AlertCircle,
    title: "Alerts",
    stat: "5",
    subLabel: "2 urgent · 3 low priority",
    pill: "2 Urgent",
    pillVariant: "red",
    route: "/dashboard",
  },
  {
    id: 3,
    icon: UserCheck,
    title: "Staff on Shift",
    stat: "14",
    subLabel: "Full coverage — all wards staffed",
    pill: "Good Coverage",
    pillVariant: "green",
    route: "/scheduling",
  },
  {
    id: 4,
    icon: Building2,
    title: "Occupancy",
    stat: "98%",
    subLabel: "2 beds available",
    pill: "Near Capacity",
    pillVariant: "amber",
    route: "/facilities",
  },
  {
    id: 5,
    icon: Calendar,
    title: "Today's Schedule",
    stat: "6",
    subLabel: "Next: Physio at 14:30",
    pill: "4 Remaining",
    pillVariant: "blue",
    route: "/scheduling",
  },
  {
    id: 6,
    icon: ClipboardList,
    title: "Care Plans",
    stat: "5",
    subLabel: "3 overdue for review",
    pill: "Reviews Due",
    pillVariant: "amber",
    route: "/care-plans",
  },
  {
    id: 7,
    icon: Pill,
    title: "Medications",
    stat: "On Track",
    subLabel: "Next round: 14:00",
    pill: "Last Round ✓",
    pillVariant: "green",
    route: "/dashboard",
  },
  {
    id: 8,
    icon: FileWarning,
    title: "Incident Log",
    stat: "2",
    subLabel: "Today · 0 unresolved",
    pill: "All Resolved",
    pillVariant: "green",
    route: "/incidents",
  },
];

// ── Quick actions ───────────────────────────────────────────────────────────

export interface QuickActionData {
  id: number;
  icon: LucideIcon;
  label: string;
  route: string;
}

export const quickActions: QuickActionData[] = [
  { id: 1, icon: UserPlus,      label: "Add Resident",   route: "/residents" },
  { id: 2, icon: AlertTriangle, label: "Log Incident",   route: "/incidents" },
  { id: 3, icon: CalendarPlus,  label: "Schedule Task",  route: "/scheduling" },
  { id: 4, icon: FilePlus,      label: "New Care Plan",  route: "/care-plans" },
  { id: 5, icon: Bell,          label: "Raise Alert",    route: "/dashboard" },
  { id: 6, icon: BarChart2,     label: "Run Report",     route: "/dashboard" },
];
