import React from 'react';
import { Search, UserX, RotateCcw } from 'lucide-react';
import { User, UserRole } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminUsers: React.FC = () => {
  const { t, isRTL } = useLanguage();
  // Mock Data
  const users: User[] = [
    { id: 'u1', email: 'user1@gmail.com', role: UserRole.USER, isActive: true, created_at: '2024-01-01', reseller_id: 'Alpha Stream', expirationDate: '2025-01-01', activeDevicesCount: 1, maxDevices: 2 },
    { id: 'u2', email: 'user2@yahoo.com', role: UserRole.USER, isActive: true, created_at: '2024-02-15', reseller_id: 'Beta IPTV', expirationDate: '2024-08-15', activeDevicesCount: 2, maxDevices: 2 },
    { id: 'u3', email: 'user3@outlook.com', role: UserRole.USER, isActive: false, created_at: '2023-11-20', reseller_id: 'Alpha Stream', expirationDate: '2023-12-20', activeDevicesCount: 0, maxDevices: 1 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
        <div>
           <h1 className="text-2xl font-bold text-white">{t('users_management')}</h1>
           <p className="text-slate-400 text-sm">{t('users_global_view')}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
             <div className="p-4 border-b border-slate-800 flex gap-4">
                 <div className="relative flex-1 max-w-md">
                    <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-500`} size={18} />
                    <input 
                        type="text" 
                        placeholder={t('search_users_placeholder')}
                        className={`w-full bg-slate-950 border border-slate-800 rounded-lg py-2 text-sm text-white focus:border-red-500 outline-none ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                    />
                 </div>
             </div>

             <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                        <th className="p-4">{t('admin_subscribers')}</th>
                        <th className="p-4">{t('admin_distributors')}</th>
                        <th className="p-4">{t('status')}</th>
                        <th className="p-4">{t('devices')}</th>
                        <th className="p-4">{t('expires')}</th>
                        <th className="p-4 text-right">{t('actions')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-800/50">
                            <td className="p-4 text-white">
                                <div>{u.email}</div>
                                <div className="text-xs text-slate-500">{u.id}</div>
                            </td>
                            <td className="p-4 text-slate-300">{u.reseller_id}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs border ${u.isActive ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900' : 'bg-red-900/30 text-red-400 border-red-900'}`}>
                                    {u.isActive ? t('active') : t('expired')}
                                </span>
                            </td>
                            <td className="p-4 text-slate-400">{u.activeDevicesCount} / {u.maxDevices}</td>
                            <td className="p-4 text-slate-400 font-mono text-sm">{u.expirationDate}</td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title={t('reset_devices')}>
                                        <RotateCcw size={16} />
                                    </button>
                                    <button className="p-2 hover:bg-red-900/30 rounded text-slate-400 hover:text-red-400" title={t('suspend_ban')}>
                                        <UserX size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </div>
    </div>
  );
};

export default AdminUsers;