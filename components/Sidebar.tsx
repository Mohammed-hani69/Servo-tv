import React from 'react';
import { Home, Tv, Film, List, Settings, LogOut, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const NavItem = ({ path, icon: Icon, label }: { path: string; icon: any; label: string }) => (
    <button
      onClick={() => navigate(path)}
      className={`tv-interactive tv-focus w-full flex flex-col items-center justify-center py-5 mb-3 rounded-2xl transition-all duration-300 group ${
        isActive(path) 
          ? 'bg-gradient-to-br from-blue-600/80 to-blue-800/80 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-105 border border-white/20' 
          : 'text-slate-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon size={24} className={`mb-1 transition-transform group-hover:scale-110 ${isActive(path) ? 'text-white' : ''}`} />
      <span className="text-[10px] font-bold tracking-wide uppercase">{label}</span>
    </button>
  );

  return (
    <div className="h-screen w-24 bg-slate-950/40 backdrop-blur-2xl border-r border-white/10 flex flex-col items-center py-6 z-40">
      
      {/* Brand Icon */}
      <div className="mb-6 p-2 bg-white/5 rounded-full border border-white/10 shadow-lg shadow-blue-900/20">
        <Logo className="w-10 h-10" />
      </div>

      <nav className="flex-1 w-full px-2 space-y-1 overflow-y-auto no-scrollbar">
        <NavItem path="/home" icon={Home} label={t('nav_home')} />
        <NavItem path="/playlists" icon={List} label={t('nav_mylist')} />
        <div className="h-px bg-white/10 w-1/2 mx-auto my-2" />
        <NavItem path="/live" icon={Tv} label={t('nav_livetv')} />
        <NavItem path="/movies" icon={Film} label={t('nav_movies')} />
        <NavItem path="/series" icon={Tv} label={t('nav_series')} />
        <div className="h-px bg-white/10 w-1/2 mx-auto my-2" />
        <NavItem path="/account" icon={User} label={t('nav_profile')} />
        <NavItem path="/settings" icon={Settings} label={t('nav_settings')} />
      </nav>

      <div className="w-full px-2 mt-2">
        <button
          onClick={onLogout}
          className="tv-interactive tv-focus w-full flex flex-col items-center justify-center py-4 rounded-xl text-red-400 hover:bg-red-500/20 hover:text-red-200 transition-colors"
        >
          <LogOut size={20} className="mb-1" />
          <span className="text-[10px] font-bold">{t('nav_logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;