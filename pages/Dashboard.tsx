import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Star, Clock } from 'lucide-react';
import { MOCK_CHANNELS } from '../constants';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const featured = MOCK_CHANNELS[0];

  return (
    <div className="p-8 h-screen overflow-hidden flex flex-col animate-fade-in">
      {/* Hero Section */}
      <div className="relative w-full h-80 rounded-2xl overflow-hidden mb-8 group bg-slate-800 shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10" />
        <img 
          src="https://picsum.photos/1200/400" 
          alt="Featured" 
          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
        />
        <div className="absolute bottom-0 left-0 p-8 z-20 w-2/3">
            <span className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-2 inline-block">Live Now</span>
            <h1 className="text-4xl font-bold text-white mb-2">Global News 24/7</h1>
            <p className="text-slate-300 mb-6 line-clamp-2">Catch up with the latest updates from around the world. Exclusive coverage and analysis.</p>
            <button 
                onClick={() => navigate('/player')}
                className="tv-interactive tv-focus bg-white text-slate-900 px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:scale-105 transition-transform"
            >
                <Play fill="currentColor" size={20} />
                Watch Now
            </button>
        </div>
      </div>

      {/* Categories / Lists */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                <Star className="text-yellow-500" size={20} />
                Popular Channels
            </h2>
            <span className="text-sm text-slate-400">Use Arrows to Navigate</span>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-8 pt-2 px-2 scroll-smooth no-scrollbar">
            {MOCK_CHANNELS.map((channel) => (
                <button
                    key={channel.id}
                    onClick={() => navigate('/player')}
                    className="tv-interactive tv-focus shrink-0 w-48 bg-slate-800 rounded-xl overflow-hidden relative group transition-all duration-300 hover:scale-110 focus:scale-110 focus:ring-4 ring-blue-500"
                >
                    <div className="aspect-video bg-slate-900 relative">
                        <img src={channel.logo} alt={channel.name} className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-focus:opacity-100 transition-opacity">
                            <Play className="text-white" size={32} fill="white" />
                        </div>
                    </div>
                    <div className="p-3 text-left">
                        <h3 className="font-bold text-white text-sm truncate">{channel.name}</h3>
                        <p className="text-xs text-slate-400">{channel.category}</p>
                    </div>
                </button>
            ))}
             {/* Mock more items for scrolling */}
             {[1,2,3].map((i) => (
                <button
                    key={`mock-${i}`}
                    className="tv-interactive tv-focus shrink-0 w-48 bg-slate-800 rounded-xl p-8 flex items-center justify-center text-slate-500"
                >
                    <Clock size={32} />
                </button>
             ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;