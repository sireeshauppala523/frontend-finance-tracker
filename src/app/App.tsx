import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { ToastCenter } from "../components/ui/ToastCenter";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { TransactionsPage } from "../pages/TransactionsPage";
import { BudgetsPage } from "../pages/BudgetsPage";
import { GoalsPage } from "../pages/GoalsPage";
import { ReportsPage } from "../pages/ReportsPage";
import { RecurringPage } from "../pages/RecurringPage";
import { AccountsPage } from "../pages/AccountsPage";
import { SettingsPage } from "../pages/SettingsPage";
import { useAuthStore } from "../store/authStore";

function ProtectedLayout() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return accessToken ? <AppShell /> : <Navigate to="/login" replace />;
}

export function App() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return (
    <>
      <ToastCenter />
      <Routes>
        <Route path="/login" element={accessToken ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route element={<ProtectedLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/recurring" element={<RecurringPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </>
  );
}
