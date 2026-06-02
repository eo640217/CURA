export type Role = "ADMIN" | "STAFF";

export type SidebarItem = {
  label: string;
  to: string;
  icon: string; // boxicons className
  roles?: Role[]; // omit => everyone
};

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: "bx bxs-dashboard bx-sm" },
  { label: "Facilities", to: "/facilities", icon: "bx bxs-building-house bx-sm" },
  { label: "Residents", to: "/residents/directory", icon: "bx bxs-group bx-sm" },
  { label: "Units", to: "/units", icon: "bx bxs-home bx-sm" },
  { label: "Hours", to: "/hours", icon: "bx bxs-time-five bx-sm" },

  // ADMIN-only
  { label: "Users", to: "/admin/users", icon: "bx bxs-user-detail bx-sm", roles: ["ADMIN"] },
  { label: "Audit Logs", to: "/admin/audit", icon: "bx bxs-shield bx-sm", roles: ["ADMIN"] },
];
