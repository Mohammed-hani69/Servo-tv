import React from 'react';
import { BarChart3, Download, Map, Users, TrendingUp, AlertOctagon, FileText } from 'lucide-react';
import Button from '../../components/Button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminReports: React.FC = () => {
  const { t } = useLanguage();
  const salesData = [
    { name: 'Jan', revenue: 4000, users: 240 },
    { name: 'Feb', revenue: 3000, users: 139 },
    { name: 'Mar', revenue: 2000, users: 980 },
    { name: 'Apr', revenue: 2780, users: 390 },
    { name: 'May', revenue: 1890, users: 480 },
    { name: 'Jun', revenue: 2390, users: 380 },
    { name: 'Jul', revenue: 3490, users: 430 },
  ];

  const ReportCard = ({ title, desc, icon: Icon, color }: any) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative group hover:border-blue-500/30 transition-all">
        <div className={`absolute top-6 right-6 p-2 rounded-lg opacity-20 ${color}`}>
            <Icon size={24} />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 mb-6">{desc}</p>
        <div className="flex gap-2">
            <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded font-bold flex items-center justify-center gap-1 transition-colors">
                <FileText size={12} /> {t('export_pdf')}
            </button>
            <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded font-bold flex items-center justify-center gap-1 transition-colors">
                <Download size={12} /> {t('export_excel')}
            </button>
        </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('admin_reports')}</h1>
          <p className="text-slate-400 text-sm">{t('deep_insights')}</p>
        </div>
        <div className="flex gap-2">
            <select className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 outline-none">
                <option>Last 30 Days</option>
                <option>This Year</option>
            </select>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <h3 className="font-bold text-white mb-6">{t('revenue_growth')}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                        <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                </ResponsiveContainer>
              </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <h3 className="font-bold text-white mb-6">{t('active_vs_expired')}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                        <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* Report Generation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard 
            title={t('active_subscribers_report')} 
            desc={t('active_subscribers_desc')} 
            icon={Users}
            color="bg-blue-500 text-blue-500"
        />
        <ReportCard 
            title={t('device_locations')} 
            desc={t('device_locations_desc')} 
            icon={Map}
            color="bg-purple-500 text-purple-500"
        />
         <ReportCard 
            title={t('revenue_report')} 
            desc={t('revenue_report_desc')} 
            icon={TrendingUp}
            color="bg-emerald-500 text-emerald-500"
        />
         <ReportCard 
            title={t('expired_subs')} 
            desc={t('expired_subs_desc')} 
            icon={AlertOctagon}
            color="bg-red-500 text-red-500"
        />
      </div>

      {/* Distributor Performance */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
         <div className="p-6 border-b border-slate-800">
             <h3 className="font-bold text-white">{t('top_distributors')}</h3>
         </div>
         <table className="w-full text-left">
             <thead className="bg-slate-950 text-xs font-bold text-slate-500 uppercase">
                 <tr>
                     <th className="p-4">{t('rank')}</th>
                     <th className="p-4">{t('admin_distributors')}</th>
                     <th className="p-4">{t('total_users')}</th>
                     <th className="p-4">{t('contribution')}</th>
                     <th className="p-4">{t('trend')}</th>
                 </tr>
             </thead>
             <tbody className="divide-y divide-slate-800">
                 {[1,2,3].map(i => (
                     <tr key={i} className="hover:bg-slate-800/50">
                         <td className="p-4 font-mono text-slate-500">#{i}</td>
                         <td className="p-4 text-white font-medium">Alpha Stream {i}</td>
                         <td className="p-4 text-slate-300">{1500 - (i*100)}</td>
                         <td className="p-4 text-emerald-400 font-bold">${25000 - (i*2000)}</td>
                         <td className="p-4 text-green-500 text-xs">+1{i}%</td>
                     </tr>
                 ))}
             </tbody>
         </table>
      </div>
    </div>
  );
};

export default AdminReports;