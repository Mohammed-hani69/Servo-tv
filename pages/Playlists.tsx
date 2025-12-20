import React, { useState } from 'react';
import { Plus, Link, Server, Trash2, Edit } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { useLanguage } from '../contexts/LanguageContext';

const Playlists: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [method, setMethod] = useState<'m3u' | 'xtream'>('m3u');
  const { t } = useLanguage();

  // Mock Playlists
  const [playlists, setPlaylists] = useState([
    { id: 1, name: 'Premium IPTV', type: 'Xtream', count: 5400, expiry: '2024-12-31', url: 'http://line.iptv.com' },
    { id: 2, name: 'My Sports List', type: 'M3U', count: 120, expiry: 'N/A', url: 'Local File' },
  ]);

  return (
    <div className="p-8 h-screen overflow-y-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('my_playlists')}</h1>
          <p className="text-slate-400">{t('manage_content')}</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus size={20} /> {t('add_playlist')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((pl) => (
          <div key={pl.id} className="tv-interactive tv-focus bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative group hover:border-blue-500/50 transition-all">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="p-2 bg-blue-600/20 text-blue-400 rounded-full hover:bg-blue-600 hover:text-white"><Edit size={16} /></button>
               <button className="p-2 bg-red-600/20 text-red-400 rounded-full hover:bg-red-600 hover:text-white"><Trash2 size={16} /></button>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${pl.type === 'Xtream' ? 'bg-purple-900/50 text-purple-400' : 'bg-orange-900/50 text-orange-400'}`}>
                 {pl.type === 'Xtream' ? <Server size={24} /> : <Link size={24} />}
               </div>
               <div>
                 <h3 className="font-bold text-white text-lg">{pl.name}</h3>
                 <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-slate-300">{pl.type}</span>
               </div>
            </div>

            <div className="space-y-2 text-sm text-slate-400">
               <div className="flex justify-between border-b border-white/5 pb-2">
                 <span>{t('channels_count')}</span>
                 <span className="text-white font-mono">{pl.count}</span>
               </div>
               <div className="flex justify-between border-b border-white/5 pb-2">
                 <span>{t('expires')}</span>
                 <span className={`${pl.expiry !== 'N/A' ? 'text-green-400' : ''}`}>{pl.expiry}</span>
               </div>
               <div className="truncate text-xs opacity-50">{pl.url}</div>
            </div>

            <Button block className="mt-4 bg-white/5 hover:bg-white/10 border-white/5">
               {t('open_playlist')}
            </Button>
          </div>
        ))}

        {/* Add New Placeholder */}
        <button 
          onClick={() => setShowAddModal(true)}
          className="tv-interactive tv-focus border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/5 transition-all min-h-[250px]"
        >
           <Plus size={48} className="mb-4 opacity-50" />
           <span className="font-medium">{t('add_new_source')}</span>
        </button>
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t('add_playlist')}>
         <div className="flex gap-4 mb-6">
            <button 
              onClick={() => setMethod('m3u')}
              className={`flex-1 py-3 rounded-lg border text-center font-bold transition-all ${method === 'm3u' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-transparent border-slate-600 text-slate-400'}`}
            >
              M3U Link
            </button>
            <button 
              onClick={() => setMethod('xtream')}
              className={`flex-1 py-3 rounded-lg border text-center font-bold transition-all ${method === 'xtream' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-transparent border-slate-600 text-slate-400'}`}
            >
              Xtream Codes API
            </button>
         </div>

         <form className="space-y-4">
            <div>
               <label className="block text-sm text-slate-400 mb-1">Playlist Name</label>
               <input type="text" className="tv-interactive tv-focus w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" placeholder="e.g. My Sports" />
            </div>

            {method === 'm3u' ? (
              <div>
                 <label className="block text-sm text-slate-400 mb-1">M3U URL</label>
                 <input type="text" className="tv-interactive tv-focus w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" placeholder="http://domain.com/get.php?..." dir="ltr" />
              </div>
            ) : (
              <>
                 <div>
                    <label className="block text-sm text-slate-400 mb-1">Server URL</label>
                    <input type="text" className="tv-interactive tv-focus w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" placeholder="http://domain.com:8080" dir="ltr" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Username</label>
                        <input type="text" className="tv-interactive tv-focus w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Password</label>
                        <input type="password" className="tv-interactive tv-focus w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" />
                    </div>
                 </div>
              </>
            )}

            <Button block className="mt-6">{t('add_playlist')}</Button>
         </form>
      </Modal>
    </div>
  );
};

export default Playlists;