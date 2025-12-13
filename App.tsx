import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import UserApp from './UserApp';

// Reseller Imports
import ResellerLayout from './layouts/ResellerLayout';
import ResellerLogin from './pages/reseller/ResellerLogin';
import DashboardOverview from './pages/reseller/DashboardOverview';
import CodesManagement from './pages/reseller/CodesManagement';
import UsersManagement from './pages/reseller/UsersManagement';
import Billing from './pages/reseller/Billing';
import DevicesManagement from './pages/reseller/DevicesManagement';
import ResellerSettings from './pages/reseller/ResellerSettings';
import Support from './pages/reseller/Support';
import Reports from './pages/reseller/Reports';
import SubAccounts from './pages/reseller/SubAccounts';
import Notifications from './pages/reseller/Notifications';
import SubscriptionPlans from './pages/reseller/SubscriptionPlans';

// Admin Imports
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import Distributors from './pages/admin/Distributors';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDevices from './pages/admin/AdminDevices';
import PlansManagement from './pages/admin/PlansManagement';
import AdminCodes from './pages/admin/AdminCodes';
import PointsManagement from './pages/admin/PointsManagement';
import AdminPayments from './pages/admin/AdminPayments';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminReports from './pages/admin/AdminReports';
import AdminRoles from './pages/admin/AdminRoles';
import AdminSecurity from './pages/admin/AdminSecurity';
import AdminSettingsPage from './pages/admin/AdminSettings';
import AdminSupport from './pages/admin/AdminSupport';
import PartnerFinancials from './pages/admin/PartnerFinancials';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
          {/* Main Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* User TV Application Module */}
          <Route path="/app/*" element={<UserApp />} />

          {/* Reseller/Distributor Module */}
          <Route path="/reseller/login" element={<ResellerLogin />} />
          <Route path="/reseller" element={<ResellerLayout />}>
              <Route index element={<Navigate to="dashboard" />} />
              <Route path="dashboard" element={<DashboardOverview />} />
              <Route path="codes" element={<CodesManagement />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="devices" element={<DevicesManagement />} />
              <Route path="billing" element={<Billing />} />
              <Route path="plans" element={<SubscriptionPlans />} />
              <Route path="reports" element={<Reports />} />
              <Route path="support" element={<Support />} />
              <Route path="sub-accounts" element={<SubAccounts />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<ResellerSettings />} />
              <Route path="*" element={<div className="p-8 text-slate-500">Page Not Found</div>} />
          </Route>

          {/* Admin Module */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="distributors" element={<Distributors />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="devices" element={<AdminDevices />} />
              <Route path="plans" element={<PlansManagement />} />
              <Route path="codes" element={<AdminCodes />} />
              <Route path="points" element={<PointsManagement />} />
              <Route path="billing" element={<AdminPayments />} />
              <Route path="financials" element={<PartnerFinancials />} />
              <Route path="support" element={<AdminSupport />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="roles" element={<AdminRoles />} />
              <Route path="security" element={<AdminSecurity />} />
              <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;