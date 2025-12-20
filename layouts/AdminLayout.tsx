import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Smartphone, Layers, FileKey, LogOut, ShieldAlert, Settings, Coins, CreditCard, Bell, BarChart3, Lock, ShieldCheck, Ticket, DollarSign } from 'lucide-react';
import Logo from '../components/Logo';
import { getCurrentUser, logout } from '../services/authService';
import { useLanguage } from '../contexts/LanguageContext';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const { t, isRTL } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: t('admin_overview') },
    { path: '/admin/distributors', icon: Users, label: t('admin_distributors') },
    { path: '/admin/users', icon: ShieldAlert, label: t('admin_subscribers') },
    { path: '/admin/devices', icon: Smartphone, label: t('admin_devices') },
    { path: '/admin/financials', icon: DollarSign, label: t('admin_financials') },
    { path: '/admin/plans', icon: Layers, label: t('admin_plans') },
    { path: '/admin/codes', icon: FileKey, label: t('admin_codes') },
    { path: '/admin/points', icon: Coins, label: t('admin_points') },
    { path: '/admin/billing', icon: CreditCard, label: t('admin_billing') },
    { path: '/admin/support', icon: Ticket, label: t('admin_support') },
    { path: '/admin/notifications', icon: Bell, label: t('admin_notifications') },
    { path: '/admin/reports', icon: BarChart3, label: t('admin_reports') },
    { path: '/admin/roles', icon: ShieldCheck, label: t('admin_roles') },
    { path: '/admin/security', icon: Lock, label: t('admin_security') },
    { path: '/admin/settings', icon: Settings, label: t('admin_settings') },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20 shadow-xl ${isRTL ? 'border-l border-r-0' : ''}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="bg-red-600/20 p-2 rounded-lg border border-red-500/30">
             <Logo className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide">SERVO</h1>
            <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold">{t('admin_panel_title')}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin_overview')}</div>
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center gap-3 mb-4 px-2">
               <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs">
                   AD
               </div>
               <div className="overflow-hidden">
                   <div className="text-sm font-bold text-white truncate">{user?.email}</div>
                   <div className="text-[10px] text-slate-400">{t('super_admin')}</div>
               </div>
           </div>
           
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
           >
             <LogOut size={16} /> {t('nav_logout')}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-950">
        <main className="flex-1 overflow-y-auto p-8 relative z-10 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;