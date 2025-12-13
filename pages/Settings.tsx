import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Monitor, Globe, Link, Trash2, Save } from 'lucide-react';
import Button from '../components/Button';
import { getDeviceId } from '../services/authService';
import { useLanguage } from '../contexts/LanguageContext';

const Settings: React.FC = () => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const { t, language, setLanguage } = useLanguage();
  
  const deviceId = getDeviceId();

  useEffect(() => {
    const saved = localStorage.getItem('tv_playlist_source');
    if (saved) setPlaylistUrl(saved);
  }, []);

  const handleSavePlaylist = () => {
    if (!playlistUrl.trim()) return;
    localStorage.setItem('tv_playlist_source', playlistUrl);
    alert("Playlist URL saved! Go to 'My Library' to view the 'Imported M3U Playlist'.");
  };

  const handleClearPlaylist = () => {
    localStorage.removeItem('tv_playlist_source');
    setPlaylistUrl('');
    alert("Saved playlist removed.");
  };

  return (
    <div className="p-8 h-screen overflow-y-auto">
       <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-slate-700 rounded-lg">
            <SettingsIcon className="text-white" size={32} />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-white">{t('settings_title')}</h1>
            <p className="text-slate-400">{t('settings_desc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Playlist Configuration */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
             <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Link className="text-blue-400" />
                {t('playlist_source')}
            </h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">{t('playlist_label')}</label>
                    <input 
                        type="text" 
                        value={playlistUrl}
                        onChange={(e) => setPlaylistUrl(e.target.value)}
                        placeholder="http://example.com/playlist.m3u"
                        className="tv-interactive tv-focus w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-white focus:border-blue-500 font-mono text-sm"
                        dir="ltr" 
                    />
                    <p className="text-xs text-slate-500 mt-2">
                        {t('playlist_help')}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={handleSavePlaylist} block className="flex-1 gap-2">
                        <Save size={18} /> {t('save_playlist')}
                    </Button>
                    {playlistUrl && (
                        <Button onClick={handleClearPlaylist} variant="danger" className="gap-2">
                            <Trash2 size={18} />
                        </Button>
                    )}
                </div>
            </div>
        </div>

        {/* Device Info & Language */}
        <div className="space-y-8">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Monitor className="text-purple-400" />
                    {t('device_info')}
                </h2>
                <div className="space-y-4">
                    <div className="bg-slate-900 p-4 rounded-lg flex justify-between items-center">
                        <span className="text-slate-400">{t('device_id')}</span>
                        <span className="font-mono text-white bg-slate-800 px-2 py-1 rounded border border-slate-700 text-sm">
                            {deviceId}
                        </span>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-lg flex justify-between items-center">
                         <span className="text-slate-400">{t('app_version')}</span>
                         <span className="text-white">v1.0.2 (Beta)</span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Globe className="text-green-400" />
                    {t('language_label')}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setLanguage('en')}
                        className={`tv-interactive tv-focus p-4 rounded-lg border text-center transition-all ${language === 'en' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                    >
                        English
                    </button>
                    <button 
                        onClick={() => setLanguage('ar')}
                        className={`tv-interactive tv-focus p-4 rounded-lg border text-center transition-all ${language === 'ar' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                    >
                        العربية
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;