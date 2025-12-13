import React from 'react';
import { Shield, Search, Filter, AlertTriangle, FileText, Globe } from 'lucide-react';
import { AuditLog } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminSecurity: React.FC = () => {
  const { t, isRTL } = useLanguage();
  // Mock Logs
  const logs: AuditLog[] = [
    { id: 'log-101', action: 'LOGIN_ATTEMPT', actor: 'reseller@beta.tv', target: 'System', ip: '192.168.1.55', timestamp: '2024-03-20 14:30:05', details: 'Successful login' },
    { id: 'log-102', action: 'UPDATE_SETTINGS', actor: 'admin@servo.tv', target: 'Global Config', ip: '10.0.0.1', timestamp: '2024-03-20 12:15:00', details: 'Changed price per point to 1.5' },
    { id: 'log-103', action: 'SUSPEND_USER', actor: 'admin@servo.tv', target: 'user_x', ip: '10.0.0.1', timestamp: '2024-03-19 09:00:22', details: 'Reason: Fraud detected' },
    { id: 'log-104', action: 'FAILED_LOGIN', actor: 'unknown', target: 'Admin Panel', ip: '45.33.22.11', timestamp: '2024-03-18 23:45:10', details: 'Invalid password (3 attempts)' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
       <div>
          <h1 className="text-2xl font-bold text-white">{t('audit_logs')}</h1>
          <p className="text-slate-400 text-sm">{t('track_actions')}</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-4">
               <div className="p-3 bg-red-900/20 text-red-500 rounded-lg"><AlertTriangle /></div>
               <div>
                   <div className="text-2xl font-bold text-white">12</div>
                   <div className="text-xs text-slate-400">{t('failed_login')}</div>
               </div>
           </div>
           <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-4">
               <div className="p-3 bg-blue-900/20 text-blue-500 rounded-lg"><Shield /></div>
               <div>
                   <div className="text-2xl font-bold text-white">Admin</div>
                   <div className="text-xs text-slate-400">{t('highest_privilege')}</div>
               </div>
           </div>
           <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-4">
               <div className="p-3 bg-emerald-900/20 text-emerald-500 rounded-lg"><Globe /></div>
               <div>
                   <div className="text-2xl font-bold text-white">US, EG, DE</div>
                   <div className="text-xs text-slate-400">{t('top_locations')}</div>
               </div>
           </div>
       </div>

       <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
             {/* Toolbar */}
             <div className="p-4 border-b border-slate-800 flex flex-wrap gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-500`} size={18} />
                    <input 
                        type="text" 
                        placeholder={t('search_logs_placeholder')} 
                        className={`w-full bg-slate-950 border border-slate-800 rounded-lg py-2 text-sm text-white focus:border-red-500 outline-none ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`} 
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 text-sm">
                        <Filter size={16} /> {t('filter')}
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 text-sm">
                        <FileText size={16} /> {t('export_logs')}
                    </button>
                </div>
            </div>

            <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                        <th className="p-4">{t('timestamp')}</th>
                        <th className="p-4">{t('actor')}</th>
                        <th className="p-4">{t('actions')}</th>
                        <th className="p-4">{t('target')}</th>
                        <th className="p-4">{t('ip_address')}</th>
                        <th className="p-4">{t('details')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {logs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-800/50">
                            <td className="p-4 text-slate-400 text-sm font-mono">{log.timestamp}</td>
                            <td className="p-4 text-white font-medium">{log.actor}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                    log.action.includes('FAIL') || log.action.includes('SUSPEND') ? 'bg-red-900/30 text-red-400 border-red-900' :
                                    log.action.includes('UPDATE') ? 'bg-blue-900/30 text-blue-400 border-blue-900' :
                                    'bg-slate-800 text-slate-300 border-slate-700'
                                }`}>
                                    {log.action}
                                </span>
                            </td>
                            <td className="p-4 text-slate-300 text-sm">{log.target}</td>
                            <td className="p-4 text-slate-400 text-sm font-mono">{log.ip}</td>
                            <td className="p-4 text-slate-500 text-sm max-w-xs truncate">{log.details}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
       </div>
    </div>
  );
};

export default AdminSecurity;