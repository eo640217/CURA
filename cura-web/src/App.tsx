import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginView from "./views/LoginView";
import RequireAuth from "./auth/RequireAuth";
import RequireRole from "./auth/RequireRole";

import AppShell from "./layout/AppShell";
import DashboardView from "./views/DashboardView";
import FacilitiesView from "./views/FacilitiesView";
import ResidentsDirectoryView from "./views/ResidentsDirectoryView";
import ResidentsView from "./views/ResidentsView";
import ResidentProfileView from "./views/ResidentProfileView";
import CarePlansView from "./views/CarePlansView";
import SchedulingView from "./views/SchedulingView";
import IncidentsView from "./views/IncidentsView";
import UnitsView from "./views/UnitsView";
import HomeView from "./views/HomeView";

import AdminView from "./views/AdminView";
import AdminUsersView from "./views/AdminUsersView";
import "./App.scss";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeView />} />
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

        {/* AUTH APP — all routes nested inside AppShell (CuraLayout) */}
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/facilities" element={<FacilitiesView />} />

          {/* Residents */}
          <Route path="/residents" element={<ResidentsView />} />
          <Route path="/residents/:id" element={<ResidentProfileView />} />
          <Route path="/residents/directory" element={<ResidentsDirectoryView />} />

          {/* Care plans */}
          <Route path="/care-plans" element={<CarePlansView />} />

          {/* Scheduling (replaces /hours) */}
          <Route path="/scheduling" element={<SchedulingView />} />
          <Route path="/hours" element={<Navigate to="/scheduling" replace />} />

          {/* Incidents */}
          <Route path="/incidents" element={<IncidentsView />} />

          {/* Legacy */}
          <Route path="/units" element={<UnitsView />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
