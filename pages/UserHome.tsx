import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Tv, Film, ListPlus, ChevronRight } from 'lucide-react';
import { getCurrentUser } from '../services/authService';
import { useLanguage } from '../contexts/LanguageContext';

const UserHome: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { t, language } = useLanguage();
  
  // Update time based on locale
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentTime(new Date().toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, [language]);

  const MainCard = ({ title, icon: Icon, path, color, bgImage }: any) => (
    <button 
      onClick={() => navigate(path)}
      className="tv-interactive tv-focus group relative overflow-hidden rounded-3xl aspect-[1.5] flex flex-col justify-end p-6 border border-white/10 shadow-2xl hover:scale-105 transition-all duration-300"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-80 z-10`} />
      <img src={bgImage} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" />
      
      <div className="relative z-20 text-start">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 text-white border border-white/20 shadow-lg">
          <Icon size={24} />
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
        <p className="text-white/70 text-sm flex items-center gap-1">
          {t('section_enter')} <ChevronRight size={14} className={language === 'ar' ? 'rotate-180' : ''} />
        </p>
      </div>
    </button>
  );

  return (
    <div className="p-10 h-screen overflow-y-auto pb-32">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-lg text-blue-300 font-medium mb-1">{t('welcome_back')}</h2>
          <h1 className="text-4xl font-bold text-white drop-shadow-md">{user?.email?.split('@')[0] || t('guest')}</h1>
        </div>
        <div className="text-end">
          <div className="text-5xl font-thin text-white mb-1" dir="ltr">{currentTime}</div>
          <div className="text-slate-400 text-sm uppercase tracking-widest">
            {new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <MainCard 
          title={t('nav_livetv')}
          icon={Tv} 
          path="/live" 
          color="from-blue-900 via-blue-800 to-slate-900" 
          bgImage="https://images.unsplash.com/photo-1593784991095-a20506948430?q=80&w=800"
        />
        <MainCard 
          title={t('nav_movies')} 
          icon={Film} 
          path="/movies" 
          color="from-purple-900 via-purple-800 to-slate-900" 
          bgImage="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800"
        />
        <MainCard 
          title={t('nav_series')} 
          icon={Tv} 
          path="/series" 
          color="from-emerald-900 via-emerald-800 to-slate-900" 
          bgImage="https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=800"
        />
        <MainCard 
          title={t('my_playlists')} 
          icon={ListPlus} 
          path="/playlists" 
          color="from-orange-900 via-orange-800 to-slate-900" 
          bgImage="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800"
        />
      </div>

      {/* Continue Watching */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-white tracking-wide">{t('continue_watching')}</h2>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
          {[1,2,3].map((i) => (
             <button 
                key={i}
                onClick={() => navigate('/player')}
                className="tv-interactive tv-focus shrink-0 w-64 aspect-video relative rounded-xl overflow-hidden group border border-white/5 hover:border-blue-500/50 transition-all"
             >
                <img src={`https://picsum.photos/400/225?random=${i+10}`} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" alt="Show" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full"><Play fill="white" size={24} /></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
                  <div className="h-full bg-blue-500 w-2/3"></div>
                </div>
             </button>
          ))}
        </div>
      </section>

      {/* Favorites / Recent */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-white tracking-wide">{t('recently_added')}</h2>
        </div>
        <div className="grid grid-cols-5 gap-4">
             {[1,2,3,4,5].map((i) => (
               <button 
                key={i} 
                onClick={() => navigate('/player')} 
                className="tv-interactive tv-focus bg-slate-800/40 rounded-xl overflow-hidden relative group hover:scale-105 transition-transform duration-200 text-start"
               >
                   <div className="aspect-[2/3] w-full bg-slate-800 relative">
                     <img src={`https://picsum.photos/300/450?random=${i+20}`} className="w-full h-full object-cover" alt="Movie" />
                     <div className={`absolute top-2 ${language === 'ar' ? 'left-2' : 'right-2'} bg-yellow-500/90 text-black text-[10px] font-bold px-2 py-0.5 rounded`}>
                       {t('new_badge')}
                     </div>
                   </div>
                   <div className="p-3">
                     <div className="text-sm font-bold text-white truncate">New Movie {i}</div>
                     <div className="text-xs text-slate-400">2024 • Action</div>
                   </div>
               </button>
             ))}
        </div>
      </section>

    </div>
  );
};

export default UserHome;