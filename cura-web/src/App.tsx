import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginView from "./views/LoginView";
import RequireAuth from "./auth/RequireAuth";
import FacilitiesView from "./views/FacilitiesView";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginView />} />
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
