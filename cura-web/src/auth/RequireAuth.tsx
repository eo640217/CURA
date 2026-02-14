import { Navigate } from "react-router-dom";
import { getAuth } from "./auth";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function RequireAuth({ children }: Props) {
  const { token } = getAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
