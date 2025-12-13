import React, { useState, useMemo } from 'react';
import { Play, Star, Search, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface MoviesProps {
  type?: 'movie' | 'series';
}

const MOCK_TITLES = [
  "The Dark Knight", "Inception", "Interstellar", "Avengers: Endgame", 
  "The Matrix", "Gladiator", "Titanic", "Avatar", "The Godfather", 
  "Pulp Fiction", "Fight Club", "Forrest Gump", "The Lion King",
  "Joker", "Black Panther", "Frozen", "Toy Story", "Spider-Man: No Way Home",
  "Breaking Bad", "Stranger Things", "Game of Thrones", "The Crown",
  "The Mandalorian", "The Witcher", "Friends", "The Office"
];

const Movies: React.FC<MoviesProps> = ({ type = 'movie' }) => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { t, language } = useLanguage();
  
  const cats = ['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi'];

  // Generate stable mock data
  const allItems = useMemo(() => {
      return Array.from({ length: 40 }).map((_, i) => {
        const titleBase = MOCK_TITLES[i % MOCK_TITLES.length];
        return {
          id: i,
          title: type === 'series' ? `${titleBase} (Series)` : titleBase,
          rating: (Math.random() * 2 + 7.5).toFixed(1),
          year: 2020 + Math.floor(Math.random() * 5),
          image: `https://picsum.photos/300/450?random=${i + (type==='series'?100:200)}`,
          category: cats[1 + (i % 5)], // Assign random category excluding 'All'
          isNew: i < 5
        };
      });
  }, [type]);

  // Filter Logic
  const filteredItems = allItems.filter(item => {
      const matchesCategory = category === 'All' || item.category === category;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-8 h-screen overflow-y-auto pb-24">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-white">
            {type === 'series' ? t('nav_series') : t('nav_movies')} {t('library')}
        </h1>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
           <div className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none`}>
              <Search size={18} />
           </div>
           <input 
             type="text" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder={t('search_placeholder')} 
             className={`tv-interactive tv-focus w-full bg-slate-800/50 border border-white/10 rounded-full py-3 ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-white text-sm focus:bg-slate-800 focus:border-blue-500 transition-all shadow-sm`}
           />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar mb-4">
        {cats.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`tv-interactive tv-focus px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              category === c 
                ? 'bg-white text-black scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => navigate('/player')} 
              className="tv-interactive tv-focus group relative aspect-[2/3] bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:scale-110 hover:z-20 text-start"
            >
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-focus:opacity-100 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <div className="transform translate-y-4 group-focus:translate-y-0 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-bold text-white text-lg leading-tight mb-1">{item.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-300 mb-3">
                      <span className="flex items-center gap-1 text-yellow-500"><Star size={10} fill="currentColor" /> {item.rating}</span>
                      <span>•</span>
                      <span>{item.year}</span>
                      <span>•</span>
                      <span className="border border-slate-500 px-1 rounded">HD</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-white text-black py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 hover:bg-blue-500 hover:text-white">
                        <Play size={12} fill="currentColor" /> {t('play_btn')}
                      </div>
                    </div>
                </div>
              </div>
              
              {/* Badges */}
              {item.isNew && (
                <div className={`absolute top-2 ${language === 'ar' ? 'right-2' : 'left-2'} bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md`}>
                  {t('new_badge')}
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <AlertCircle size={48} className="mb-4 opacity-50" />
          <p className="text-xl font-medium">{t('no_results')} "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};

export default Movies;