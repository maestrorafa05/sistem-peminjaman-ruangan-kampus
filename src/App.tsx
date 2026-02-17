import { Navigate, Route, Routes } from "react-router-dom";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/layout/AppShell";
import DashboardPage from "@/pages/DashboardPage";
import AvailabilityPage from "@/pages/AvailabilityPage";
import LoginPage from "@/pages/LoginPage";
import { ForbiddenPage } from "@/pages/ForbiddenPage";

import { RoomsPage } from "@/pages/RoomsPage";
import { LoansPage } from "@/pages/LoansPage";
import { AdminPage } from "@/pages/AdminPage";

import { LoanDetailPage } from "@/pages/LoanDetailPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />

      <Route
        element={(
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        )}
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/availability" element={<AvailabilityPage />} />
        <Route path="/loans" element={<LoansPage />} />
        <Route path="/loans/:id" element={<LoanDetailPage />} />
        <Route
          path="/admin"
          element={(
            <RequireAuth roles={["Admin"]}>
              <AdminPage />
            </RequireAuth>
          )}
        />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
