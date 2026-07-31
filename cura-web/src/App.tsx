import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import LoginView from "./views/LoginView";
import LogoutView from "./views/LogoutView";
import SetupPasswordView from "./views/SetupPasswordView";
import RequireAuth from "./auth/RequireAuth";
import RequireRole from "./auth/RequireRole";

import AppShell from "./layout/AppShell";
import DashboardView from "./views/DashboardView";
import FacilitiesView from "./views/FacilitiesView";
import ResidentsDirectoryView from "./views/ResidentsDirectoryView";
import ResidentsView from "./views/ResidentsView";
import CreateResidentPage from "./views/CreateResidentPage";
import ResidentProfileView from "./views/ResidentProfileView";
import CarePlansView from "./views/CarePlansView";
import SchedulingView from "./views/SchedulingView";
import IncidentsView from "./views/IncidentsView";
import UnitsView from "./views/UnitsView";
import HomeView from "./views/HomeView";

import PublicLayout from "./layout/PublicLayout";
import PackagesView from "./views/PackagesView";
import ContactView from "./views/ContactView";
import SolutionsView from "./views/SolutionsView";
import AboutView from "./views/AboutView";
import FaqView from "./views/FaqView";

import AdminView from "./views/AdminView";
import AdminUsersView from "./views/AdminUsersView";
import StaffView from "./views/StaffView";
import ProfileView from "./views/ProfileView";
import OrganizationsView from "./views/OrganizationsView";
import SettingsView from "./views/SettingsView";
import "./App.scss";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomeView />} />
          <Route path="/packages" element={<PackagesView />} />
          <Route path="/contact" element={<ContactView />} />
          <Route path="/solutions" element={<SolutionsView />} />
          <Route path="/about" element={<AboutView />} />
          <Route path="/faq" element={<FaqView />} />
        </Route>
        <Route path="/login" element={<LoginView />} />
        <Route path="/logout" element={<LogoutView />} />
        <Route path="/setup-password" element={<SetupPasswordView />} />

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
          <Route path="/residents/new" element={<CreateResidentPage />} />
          <Route path="/residents/:id" element={<ResidentProfileView />} />
          <Route path="/residents/directory" element={<ResidentsDirectoryView />} />

          {/* Care plans */}
          <Route path="/care-plans" element={<CarePlansView />} />

          {/* Scheduling (replaces /hours) */}
          <Route path="/scheduling" element={<SchedulingView />} />
          <Route path="/hours" element={<Navigate to="/scheduling" replace />} />

          {/* Incidents */}
          <Route path="/incidents" element={<IncidentsView />} />

          {/* Profile + Settings — all authenticated */}
          <Route path="/profile" element={<ProfileView />} />
          <Route path="/settings" element={<SettingsView />} />

          {/* Organizations — SUPER_ADMIN only */}
          <Route path="/organizations" element={<RequireRole role="SUPER_ADMIN"><OrganizationsView /></RequireRole>} />

          {/* Staff — admin only */}
          <Route path="/staff" element={<RequireRole role="ADMIN"><StaffView /></RequireRole>} />

          {/* Legacy */}
          <Route path="/units" element={<UnitsView />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
