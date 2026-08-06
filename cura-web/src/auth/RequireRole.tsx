import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { getAuth, roleAtLeast } from "./auth";

type Props = {
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF";
  children: ReactNode;
};

export default function RequireRole({ role, children }: Props) {
  const auth = getAuth();

  if (!auth.token) return <Navigate to="/login" replace />;
  if (!roleAtLeast(auth.role, role)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
