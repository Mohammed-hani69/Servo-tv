import React from 'react';
import { Search, Monitor, Smartphone, Ban, Globe } from 'lucide-react';
import { Device } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminDevices: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const devices: Device[] = [
    { id: '1', deviceId: 'dev-111', userId: 'user1@gmail.com', userName: 'User One', platform: 'Samsung', appVersion: '2.1.0', lastLogin: '10 mins ago', ip: '192.168.1.1', status: 'Active' },
    { id: '2', deviceId: 'dev-222', userId: 'user2@yahoo.com', userName: 'User Two', platform: 'Android TV', appVersion: '2.0.0', lastLogin: '1 hour ago', ip: '10.0.0.5', status: 'Active' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
       <div>
           <h1 className="text-2xl font-bold text-white">{t('connected_devices')}</h1>
           <p className="text-slate-400 text-sm">{t('monitoring_sessions')}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
             <div className="p-4 border-b border-slate-800 flex gap-4">
                 <div className="relative flex-1 max-w-md">
                    <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-500`} size={18} />
                    <input 
                        type="text" 
                        placeholder={t('search_devices')} 
                        className={`w-full bg-slate-950 border border-slate-800 rounded-lg py-2 text-sm text-white focus:border-red-500 outline-none ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                    />
                 </div>
             </div>
             
             <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                        <th className="p-4">{t('device_info')}</th>
                        <th className="p-4">{t('admin_subscribers')}</th>
                        <th className="p-4">{t('ip_address')}</th>
                        <th className="p-4">{t('last_activity')}</th>
                        <th className="p-4 text-right">{t('actions')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {devices.map(d => (
                        <tr key={d.id} className="hover:bg-slate-800/50">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-800 rounded">
                                        {d.platform.includes('Android') ? <Smartphone size={16} className="text-green-400" /> : <Monitor size={16} className="text-blue-400" />}
                                    </div>
                                    <div>
                                        <div className="text-white text-sm font-mono">{d.deviceId}</div>
                                        <div className="text-xs text-slate-500">{d.platform} v{d.appVersion}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-slate-300">{d.userId}</td>
                            <td className="p-4">
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Globe size={14} /> {d.ip}
                                </div>
                            </td>
                            <td className="p-4 text-slate-400">{d.lastLogin}</td>
                            <td className="p-4 text-right">
                                <button className="text-red-400 hover:text-white flex items-center gap-1 ml-auto text-xs border border-red-900/30 bg-red-900/10 px-2 py-1 rounded">
                                    <Ban size={12} /> {t('block_device')}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </div>
    </div>
  );
};

export default AdminDevices;