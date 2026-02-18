import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginView from "./views/LoginView";
import RequireAuth from "./auth/RequireAuth";
import RequireRole from "./auth/RequireRole";
import FacilitiesView from "./views/FacilitiesView";
import TopBar from "./components/TopBar";
import "./index.scss";


// Example admin page (create later if you don’t have it yet)
import AdminView from "./views/AdminView";
import AdminUsersView from "./views/AdminUsersView";
import ResidentsDirectoryView from "./views/ResidentsDirectoryView";

export default function App() {
  return (
    <BrowserRouter>
      <TopBar />

      <Routes>
        <Route path="/login" element={<LoginView />} />

        {/* ADMIN-only route example */}
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

        <Route
          path="/residents"
          element={
            <RequireAuth>
              <ResidentsDirectoryView />
            </RequireAuth>
          }
        />

        {/* everything else requires login */}
        <Route
          path="/*"
          element={
            <RequireAuth>
              <FacilitiesView />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
