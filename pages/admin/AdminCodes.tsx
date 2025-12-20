import React from 'react';
import { Search, FileKey } from 'lucide-react';
import { ActivationCode } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminCodes: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const codes: ActivationCode[] = [
    { id: '1', code: 'AAAA-BBBB-CCCC', status: 'Active', durationMonths: 12, maxDevices: 1, currentDevices: 1, assignedUser: 'user1@gmail.com', distributorId: 'Alpha Stream', createdDate: '2024-01-01' },
    { id: '2', code: 'XXXX-YYYY-ZZZZ', status: 'Not Activated', durationMonths: 6, maxDevices: 2, currentDevices: 0, distributorId: 'Beta IPTV', createdDate: '2024-03-01' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
        <div>
           <h1 className="text-2xl font-bold text-white">{t('admin_codes')}</h1>
           <p className="text-slate-400 text-sm">{t('audit_codes')}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
             <div className="p-4 border-b border-slate-800 flex gap-4">
                 <div className="relative flex-1 max-w-md">
                    <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-500`} size={18} />
                    <input 
                        type="text" 
                        placeholder={t('search_code')}
                        className={`w-full bg-slate-950 border border-slate-800 rounded-lg py-2 text-sm text-white focus:border-red-500 outline-none ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                    />
                 </div>
             </div>

             <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                        <th className="p-4">{t('activation_code')}</th>
                        <th className="p-4">{t('admin_distributors')}</th>
                        <th className="p-4">{t('assigned_to')}</th>
                        <th className="p-4">{t('duration')}</th>
                        <th className="p-4">{t('status')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {codes.map(c => (
                        <tr key={c.id} className="hover:bg-slate-800/50">
                            <td className="p-4 font-mono text-blue-400">{c.code}</td>
                            <td className="p-4 text-white">{c.distributorId}</td>
                            <td className="p-4 text-slate-400">{c.assignedUser || '-'}</td>
                            <td className="p-4 text-slate-300">{c.durationMonths} {t('months')}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs border ${c.status === 'Active' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                    {c.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </div>
    </div>
  );
};

export default AdminCodes;