import React from 'react';
import { Shield, Clock, Smartphone } from 'lucide-react';
import { User as UserType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface AccountProps {
  user: UserType;
}

const Account: React.FC<AccountProps> = ({ user }) => {
  const { t } = useLanguage();

  return (
    <div className="p-8 h-screen overflow-y-auto pb-24 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl">
         
         <div className="flex items-center gap-6 mb-10 border-b border-white/10 pb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
               {user.email[0].toUpperCase()}
            </div>
            <div>
               <h1 className="text-3xl font-bold text-white">{user.email}</h1>
               <div className="flex items-center gap-2 mt-2">
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30 flex items-center gap-1">
                     <Shield size={12} /> {t('premium_sub')}
                  </span>
                  <span className="text-slate-400 text-sm">ID: {user.id}</span>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
               <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="text-blue-400" size={20} /> {t('sub_details')}
               </h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-slate-400">{t('plan')}</span>
                     <span className="text-white font-medium">Gold Package (12 Months)</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-slate-400">{t('status')}</span>
                     <span className="text-green-400 font-bold">{t('active')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-slate-400">{t('expires_on')}</span>
                     <span className="text-white font-mono">2025-10-15</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
                     <div className="bg-blue-500 w-3/4 h-full"></div>
                  </div>
                  <p className="text-xs text-end text-blue-300">245 {t('remaining')}</p>
               </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
               <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Smartphone className="text-purple-400" size={20} /> {t('device_info')}
               </h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-slate-400">{t('device_id')}</span>
                     <span className="text-white font-mono bg-black/30 px-2 py-1 rounded text-sm">
                        {user.deviceId?.substring(0, 16)}...
                     </span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-slate-400">{t('app_version')}</span>
                     <span className="text-white">v2.1.0 Pro</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-slate-400">{t('distributor')}</span>
                     <span className="text-white">Official Reseller</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="mt-10 flex gap-4">
            <button className="tv-interactive tv-focus bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
               {t('renew_btn')}
            </button>
            <button className="tv-interactive tv-focus bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-xl font-bold transition-all">
               {t('check_updates')}
            </button>
         </div>

      </div>
    </div>
  );
};

export default Account;