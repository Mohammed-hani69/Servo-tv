import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Ticket, Users, FileKey, CreditCard, Settings, LogOut, Bell, Search, BarChart3, Smartphone, Layers, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';
import { getCurrentUser, logout } from '../services/authService';
import { useLanguage } from '../contexts/LanguageContext';

const ResellerLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const { t, isRTL } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/reseller/login');
  };

  const menuItems = [
    { path: '/reseller/dashboard', icon: LayoutDashboard, label: t('reseller_dashboard') },
    { path: '/reseller/codes', icon: FileKey, label: t('reseller_codes') },
    { path: '/reseller/users', icon: Users, label: t('reseller_users') },
    { path: '/reseller/devices', icon: Smartphone, label: t('reseller_devices') },
    { path: '/reseller/billing', icon: CreditCard, label: t('reseller_billing') },
    { path: '/reseller/plans', icon: Layers, label: t('reseller_plans') },
    { path: '/reseller/reports', icon: BarChart3, label: t('reseller_reports') },
    { path: '/reseller/support', icon: Ticket, label: t('reseller_support') },
    { path: '/reseller/sub-accounts', icon: ShieldCheck, label: t('reseller_subaccounts') },
    { path: '/reseller/notifications', icon: Bell, label: t('reseller_notifications') },
    { path: '/reseller/settings', icon: Settings, label: t('reseller_settings') },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex overflow-hidden selection:bg-blue-500/30">
      {/* Sidebar */}
      <aside className={`w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20 shadow-xl ${isRTL ? 'border-l border-r-0' : 'border-r'}`}>
        <div className="p-6 flex items-center gap-3">
          <Logo className="w-8 h-8" />
          <div>
            <h1 className="font-bold text-white tracking-wide">SERVO</h1>
            <p className="text-[10px] text-blue-400 uppercase tracking-widest font-semibold">{t('reseller_distributor')}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
          <div className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Main Menu</div>
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
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
           <div className="bg-slate-800 rounded-xl p-4 mb-4">
              <div className="text-xs text-slate-400 mb-1">{t('reseller_balance')}</div>
              <div className="text-xl font-bold text-emerald-400 flex items-center gap-1">
                 {user?.points || 850} <span className="text-xs font-normal text-slate-500">PTS</span>
              </div>
              <button onClick={() => navigate('/reseller/billing')} className="mt-2 w-full py-1.5 bg-emerald-600/20 text-emerald-400 text-xs rounded hover:bg-emerald-600 hover:text-white transition-colors">
                {t('reseller_topup')}
              </button>
           </div>
           
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
           >
             <LogOut size={16} /> {t('reseller_logout')}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop')] bg-cover">
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-0 pointer-events-none" />
        
        {/* Top Header */}
        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-10 relative">
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full">
              <Search className={`absolute top-1/2 -translate-y-1/2 text-slate-500 ${isRTL ? 'right-3' : 'left-3'}`} size={16} />
              <input 
                type="text" 
                placeholder={t('reseller_search_placeholder')}
                className={`w-full bg-slate-800 border border-slate-700 rounded-full py-1.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-500 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate('/reseller/notifications')}
                className="relative p-2 text-slate-400 hover:text-white transition-colors"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
            </button>
            <div className="h-8 w-px bg-slate-800 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <div className="text-sm font-bold text-white">{user?.email}</div>
                <div className="text-xs text-slate-400">ID: {user?.id}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                {user?.email?.[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 relative z-10 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ResellerLayout;