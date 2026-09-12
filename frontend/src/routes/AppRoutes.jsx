import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import BusinessLayout from "../components/business/BusinessLayout";
import AdminLayout from "../components/admin/AdminLayout";
import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/officer/DashboardPage";
import ApplicationsPage from "../pages/officer/ApplicationsPage";
import RecordsPage from "../pages/officer/RecordsPage";
import BusinessDashboardPage from "../pages/business/BusinessDashboardPage";
import MyInstrumentsPage from "../pages/business/MyInstrumentsPage";
import ApplyVerificationPage from "../pages/business/ApplyVerificationPage";
import BusinessRecordsPage from "../pages/business/BusinessRecordsPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminMasterDataPage from "../pages/admin/AdminMasterDataPage";
import { useAuth } from "../context/useAuth";
const officerRecords = [
  ["schedule", "Verification Schedule"],
  ["inspections", "Inspections"],
  ["certificates", "Certificates"],
  ["instruments", "Instruments"],
  ["alerts", "Alerts & Reminders"],
  ["reports", "Reports"],
  ["users", "Users"],
  ["master-data", "Master Data"],
  ["settings", "Settings"],
];
const businessRecords = [
  ["applications", "Applications"],
  ["certificates", "Certificates"],
  ["notifications", "Notifications"],
  ["profile", "Profile"],
];
function Protected({ role = "officer" }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === "business") return <BusinessLayout />;
  if (role === "admin") return <AdminLayout />;
  return <AppLayout />;
}
function Fallback() {
  const { user } = useAuth();
  const path =
    user?.role === "business"
      ? "/business/dashboard"
      : user?.role === "admin"
        ? "/admin/dashboard"
        : "/dashboard";
  return <Navigate to={path} replace />;
}
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Protected />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        {officerRecords.map(([path, title]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <RecordsPage
                type={path === "master-data" ? "master" : path}
                title={title}
              />
            }
          />
        ))}
      </Route>
      <Route element={<Protected role="business" />}>
        <Route path="/business/dashboard" element={<BusinessDashboardPage />} />
        <Route path="/business/instruments" element={<MyInstrumentsPage />} />
        <Route path="/business/apply" element={<ApplyVerificationPage />} />
        {businessRecords.map(([path, title]) => (
          <Route
            key={path}
            path={`/business/${path}`}
            element={<BusinessRecordsPage type={path} title={title} />}
          />
        ))}
      </Route>
      <Route element={<Protected role="admin" />}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/master-data" element={<AdminMasterDataPage />} />
      </Route>
      <Route path="*" element={<Fallback />} />
    </Routes>
  );
}
