import React from 'react';
import { Users, CreditCard, Activity, UserPlus, FileKey, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { MOCK_RESELLER_STATS } from '../../constants';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const DashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Use mock data extended for visual appeal
  const data = [
    { name: '01', sales: 12 }, { name: '05', sales: 19 }, { name: '10', sales: 3 }, 
    { name: '15', sales: 25 }, { name: '20', sales: 42 }, { name: '25', sales: 30 }, { name: '30', sales: 55 }
  ];

  const StatCard = ({ title, value, subtext, icon: Icon, trend, color }: any) => (
    <div className="bg-slate-900/50 backdrop-blur border border-white/5 p-6 rounded-2xl shadow-xl hover:border-blue-500/30 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-opacity-10 ${color.bg} ${color.text}`}>
          <Icon size={24} />
        </div>
        {trend && (
           <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
              {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(trend)}%
           </div>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{title}</div>
      {subtext && <div className="text-xs text-slate-500 mt-2">{subtext}</div>}
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('points_balance')}
          value={MOCK_RESELLER_STATS.pointsBalance} 
          icon={CreditCard} 
          color={{ bg: 'bg-emerald-500', text: 'text-emerald-500' }}
          subtext={`~ $850.00 (${t('approx_value')})`}
        />
        <StatCard 
          title={t('active_subscribers')}
          value={MOCK_RESELLER_STATS.activeUsers} 
          icon={Users} 
          trend={12.5}
          color={{ bg: 'bg-blue-500', text: 'text-blue-500' }}
        />
        <StatCard 
          title={t('codes_today')}
          value="24" 
          icon={FileKey} 
          trend={-5.2}
          color={{ bg: 'bg-purple-500', text: 'text-purple-500' }}
        />
        <StatCard 
          title={t('expired_users')}
          value="12" 
          icon={AlertCircle} 
          color={{ bg: 'bg-orange-500', text: 'text-orange-500' }}
          subtext="Action required"
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur border border-white/5 p-6 rounded-2xl shadow-xl">
           <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">{t('activation_history')}</h3>
                <p className="text-sm text-slate-400">{t('history_desc')}</p>
              </div>
              <select className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 outline-none">
                 <option>Last 30 Days</option>
                 <option>Last 7 Days</option>
              </select>
           </div>
           
           <div className="h-80 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="url(#colorGradient)" />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#2563EB" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-white/5 p-6 rounded-2xl shadow-xl flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6">{t('quick_actions')}</h3>
            
            <div className="space-y-3">
               <button 
                onClick={() => navigate('/reseller/codes')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl flex items-center justify-between transition-all group"
               >
                  <div className="flex items-center gap-3">
                     <div className="bg-white/20 p-2 rounded-lg"><FileKey size={20} /></div>
                     <span className="font-semibold">{t('generate_code')}</span>
                  </div>
                  <UserPlus size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
               </button>

               <button 
                onClick={() => navigate('/reseller/users')}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-xl flex items-center justify-between transition-all group"
               >
                  <div className="flex items-center gap-3">
                     <div className="bg-slate-700 p-2 rounded-lg group-hover:bg-slate-600"><Users size={20} /></div>
                     <span className="font-semibold">{t('manage_users')}</span>
                  </div>
               </button>

               <button 
                onClick={() => navigate('/reseller/billing')}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-xl flex items-center justify-between transition-all group"
               >
                  <div className="flex items-center gap-3">
                     <div className="bg-slate-700 p-2 rounded-lg group-hover:bg-slate-600"><CreditCard size={20} /></div>
                     <span className="font-semibold">{t('purchase_points')}</span>
                  </div>
               </button>
            </div>

            <div className="mt-auto pt-6 border-t border-white/5">
                <div className="flex items-start gap-3 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                    <AlertCircle className="text-yellow-500 shrink-0 mt-0.5" size={16} />
                    <div>
                        <div className="text-yellow-400 text-sm font-bold">{t('system_maintenance')}</div>
                        <div className="text-yellow-200/60 text-xs mt-1">Scheduled for tonight 03:00 UTC. Dashboard might be unavailable for 10 mins.</div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardOverview;