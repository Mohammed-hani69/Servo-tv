import React from 'react';
import { Users, Shield, Smartphone, Activity, DollarSign, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const data = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
  ];

  const StatBox = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-lg bg-opacity-10 ${color.bg} ${color.text}`}>
                <Icon size={24} />
            </div>
            <span className="text-xs text-slate-500 font-mono">+12%</span>
        </div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-xs text-slate-400">{title}</div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">{t('system_overview')}</h1>
          <div className="flex gap-2">
              <span className="flex items-center gap-2 px-3 py-1 bg-emerald-900/30 text-emerald-400 rounded-full text-xs border border-emerald-900/50">
                  <Activity size={12} /> {t('system_healthy')}
              </span>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatBox title={t('total_users')} value="12,450" icon={Users} color={{bg:'bg-blue-500', text:'text-blue-500'}} />
        <StatBox title={t('admin_distributors')} value="45" icon={Shield} color={{bg:'bg-purple-500', text:'text-purple-500'}} />
        <StatBox title={t('active_devices')} value="8,920" icon={Smartphone} color={{bg:'bg-emerald-500', text:'text-emerald-500'}} />
        <StatBox title={t('monthly_revenue')} value="$45,200" icon={DollarSign} color={{bg:'bg-yellow-500', text:'text-yellow-500'}} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-6">{t('revenue_analytics')}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                        <Bar dataKey="revenue" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
              </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4">{t('recent_alerts')}</h3>
              <div className="space-y-4">
                  {[1,2,3].map(i => (
                      <div key={i} className="flex gap-3 items-start p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                          <AlertTriangle size={16} className="text-orange-500 mt-1 shrink-0" />
                          <div>
                              <div className="text-sm text-white font-medium">{t('alert_login_spike')}</div>
                              <div className="text-xs text-slate-500">{t('alert_login_spike_desc')}</div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;