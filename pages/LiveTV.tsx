import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ChevronRight } from 'lucide-react';
import { MOCK_CHANNELS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

const LiveTV: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { t, language } = useLanguage();

  const categories = ['All', 'Favorites', 'Sports', 'News', 'Movies', 'Kids', 'Documentary', 'Music', 'International'];

  // Map category keys to translation keys for display
  const getCatLabel = (cat: string) => {
    switch(cat) {
      case 'All': return t('cat_all');
      case 'Favorites': return t('cat_fav');
      case 'Sports': return t('cat_sports');
      case 'News': return t('cat_news');
      case 'Movies': return t('cat_movies');
      case 'Kids': return t('cat_kids');
      default: return cat;
    }
  };

  // Filter channels (Mock)
  const channels = selectedCategory === 'All' 
    ? MOCK_CHANNELS 
    : MOCK_CHANNELS.filter(c => c.category === selectedCategory);

  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* Categories Sidebar */}
      <div className="w-64 bg-slate-900/60 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col">
        <h2 className={`text-xl font-bold text-white mb-6 px-2 ${language === 'ar' ? 'border-r-4' : 'border-l-4'} border-blue-500`}>
          {t('categories_title')}
        </h2>
        <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar px-1">
          {categories.map((cat, i) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`tv-interactive tv-focus w-full text-start px-4 py-3 rounded-lg transition-all flex justify-between items-center ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="font-medium">{getCatLabel(cat)}</span>
              {selectedCategory === cat && <ChevronRight size={16} className={language === 'ar' ? 'rotate-180' : ''} />}
            </button>
          ))}
        </div>
      </div>

      {/* Channels List */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
           <h1 className="text-3xl font-bold text-white">{getCatLabel(selectedCategory)}</h1>
           <span className="text-slate-400 text-sm">{channels.length} {t('channels_found')}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
           {channels.map((channel, idx) => (
             <button
               key={channel.id}
               onClick={() => navigate(`/player?url=${encodeURIComponent(channel.url)}`)}
               className="tv-interactive tv-focus bg-slate-800/40 border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-slate-700/60 hover:border-blue-500/50 transition-all group"
             >
               <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 border border-white/10 group-hover:scale-110 transition-transform">
                  <img src={channel.logo} alt={channel.name} className="w-full h-full object-cover" />
               </div>
               <div className="flex-1 text-start overflow-hidden">
                  <h3 className="font-bold text-white truncate group-hover:text-blue-400 transition-colors">{channel.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="px-1.5 py-0.5 rounded bg-slate-700 text-[10px] text-slate-300 font-mono">1080p</span>
                     <span className="text-xs text-slate-500 truncate">{channel.category}</span>
                  </div>
               </div>
               <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Star size={18} className="text-slate-400 hover:text-yellow-500" />
               </div>
             </button>
           ))}
           {/* Mock filler to show grid */}
           {Array.from({length: 12}).map((_, i) => (
              <button key={`mock-${i}`} className="tv-interactive tv-focus bg-slate-800/20 border border-white/5 rounded-xl p-4 flex items-center gap-4 opacity-50">
                  <div className="w-16 h-16 rounded-full bg-slate-800"></div>
                  <div className="h-4 bg-slate-800 w-24 rounded"></div>
              </button>
           ))}
        </div>
      </div>
    </div>
  );
};

export default LiveTV;