import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginView from "./views/LoginView";
import RequireAuth from "./auth/RequireAuth";
import RequireRole from "./auth/RequireRole";

import AppShell from "./layout/AppShell";
import DashboardView from "./views/DashboardView";
import FacilitiesView from "./views/FacilitiesView";
import ResidentsDirectoryView from "./views/ResidentsDirectoryView";
import UnitsView from "./views/UnitsView";
import HoursView from "./views/HoursView";

import AdminView from "./views/AdminView";
import AdminUsersView from "./views/AdminUsersView";
import "./App.scss";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginView />} />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <RequireRole role="ADMIN">
                <AdminView />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireAuth>
              <RequireRole role="ADMIN">
                <AdminUsersView />
              </RequireRole>
            </RequireAuth>
          }
        />

        {/* AUTH APP */}
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/" element={<DashboardView />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/facilities" element={<FacilitiesView />} />
          <Route path="/residents/directory" element={<ResidentsDirectoryView />} />
          <Route path="/units" element={<UnitsView />} />
          <Route path="/hours" element={<HoursView />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}