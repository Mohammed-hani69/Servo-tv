import React from 'react';
import { DollarSign, TrendingUp, Users, ShoppingCart, Lock, FileText, Download, ShieldCheck, AlertOctagon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid } from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';
import Button from '../../components/Button';
import { FinancialRecord } from '../../types';

const PartnerFinancials: React.FC = () => {
  const { t, isRTL } = useLanguage();

  // --- Mock Immutable Ledger Data ---
  const ledgerData: FinancialRecord[] = [
    { id: 'REC-9981', transactionId: 'TX-1005', type: 'Credit', amount: 5000, currency: 'USD', gateway: 'Stripe', distributorName: 'Alpha Stream', date: '2024-03-20 10:00:00', status: 'Verified', ledgerHash: '8f4343...a91', previousHash: '000000...000' },
    { id: 'REC-9982', transactionId: 'TX-1006', type: 'Debit', amount: 200, currency: 'USD', gateway: 'System', distributorName: 'Alpha Stream', date: '2024-03-20 10:05:00', status: 'Verified', ledgerHash: '1a2b3c...9d8', previousHash: '8f4343...a91' },
    { id: 'REC-9983', transactionId: 'TX-1007', type: 'Credit', amount: 1500, currency: 'USD', gateway: 'PayMob', distributorName: 'Beta IPTV', date: '2024-03-20 11:30:00', status: 'Verified', ledgerHash: '7e6f5g...4h3', previousHash: '1a2b3c...9d8' },
    { id: 'REC-9984', transactionId: 'TX-1008', type: 'Commission', amount: 150, currency: 'USD', gateway: 'System', distributorName: 'Gamma Reseller', date: '2024-03-20 12:00:00', status: 'Verified', ledgerHash: '9z8y7x...6w5', previousHash: '7e6f5g...4h3' },
    { id: 'REC-9985', transactionId: 'TX-1009', type: 'Credit', amount: 3000, currency: 'USD', gateway: 'Fawry', distributorName: 'Alpha Stream', date: '2024-03-20 14:15:00', status: 'Verified', ledgerHash: '3j2k1l...0m9', previousHash: '9z8y7x...6w5' },
  ];

  // --- Charts Data ---
  const revenueData = [
    { name: 'Jan', value: 45000 }, { name: 'Feb', value: 52000 }, { name: 'Mar', value: 48000 },
    { name: 'Apr', value: 61000 }, { name: 'May', value: 55000 }, { name: 'Jun', value: 67000 },
  ];
  
  const gatewayData = [
    { name: 'Stripe', value: 45 }, { name: 'PayMob', value: 25 }, { name: 'Fawry', value: 20 }, { name: 'Manual', value: 10 }
  ];
  const gatewayColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

  const distributorData = [
    { name: 'Alpha', value: 32000 }, { name: 'Beta', value: 21000 }, { name: 'Gamma', value: 15000 }
  ];

  // --- KPIS ---
  const kpis = [
    { title: t('total_sales'), value: '$345,200', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-900/20' },
    { title: t('total_profit'), value: '$124,500', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-900/20' },
    { title: t('total_subscriptions'), value: '12,450', icon: Users, color: 'text-purple-400', bg: 'bg-purple-900/20' },
    { title: t('total_points_sold'), value: '3.2M', icon: ShoppingCart, color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Header & Integrity Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
             <h1 className="text-3xl font-bold text-white">{t('partner_dashboard_title')}</h1>
             <Lock size={20} className="text-slate-500" />
          </div>
          <p className="text-slate-400 text-sm mt-1">{t('partner_dashboard_desc')}</p>
        </div>
        
        <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700">
               <FileText size={16} /> PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700">
               <Download size={16} /> CSV
            </button>
        </div>
      </div>

      {/* Integrity Banner */}
      <div className="w-full bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-400">
                  <ShieldCheck size={24} />
              </div>
              <div>
                  <h3 className="font-bold text-emerald-400">{t('ledger_integrity')}</h3>
                  <p className="text-xs text-emerald-200/60 font-mono">Last Hash Check: {new Date().toISOString()}</p>
              </div>
          </div>
          <div className="text-emerald-500 font-bold text-sm tracking-wider uppercase px-4 py-1 bg-emerald-900/40 rounded border border-emerald-500/20">
              Secure
          </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
            <div key={index} className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group">
                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${kpi.color}`}>
                    <kpi.icon size={64} />
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${kpi.bg} ${kpi.color}`}>
                    <kpi.icon size={24} />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{kpi.value}</div>
                <div className="text-sm text-slate-400">{kpi.title}</div>
            </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Area Chart */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-6">{t('revenue_growth')}</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
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
                        <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                </ResponsiveContainer>
              </div>
          </div>

          {/* Gateway Breakdown Pie */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-6">{t('revenue_breakdown')} ({t('by_gateway')})</h3>
              <div className="h-64 w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={gatewayData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {gatewayData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={gatewayColors[index % gatewayColors.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                    </PieChart>
                 </ResponsiveContainer>
                 {/* Legend */}
                 <div className="flex flex-wrap justify-center gap-4 mt-2">
                     {gatewayData.map((entry, index) => (
                         <div key={index} className="flex items-center gap-2 text-xs text-slate-400">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: gatewayColors[index] }}></div>
                             {entry.name}
                         </div>
                     ))}
                 </div>
              </div>
          </div>
      </div>

      {/* Financial Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-white flex items-center gap-2">
                  <Lock size={16} className="text-emerald-500" /> Financial Ledger (Immutable)
              </h3>
              <span className="text-xs text-slate-500 font-mono">HASH CHAIN: ACTIVE</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-950 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <th className="p-4">{t('transaction_id')}</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">{t('amount')}</th>
                        <th className="p-4">{t('gateway')}</th>
                        <th className="p-4">{t('by_distributor')}</th>
                        <th className="p-4">{t('date')}</th>
                        <th className="p-4">{t('ledger_hash')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {ledgerData.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-4">
                                <div className="font-mono text-sm text-white">{record.transactionId}</div>
                                <div className="text-[10px] text-slate-500">{record.id}</div>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                    record.type === 'Credit' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900' :
                                    record.type === 'Debit' ? 'bg-red-900/30 text-red-400 border-red-900' :
                                    'bg-blue-900/30 text-blue-400 border-blue-900'
                                }`}>
                                    {record.type}
                                </span>
                            </td>
                            <td className={`p-4 font-bold font-mono ${record.type === 'Credit' ? 'text-emerald-400' : 'text-slate-200'}`}>
                                {record.type === 'Credit' ? '+' : '-'}{record.amount.toLocaleString()} {record.currency}
                            </td>
                            <td className="p-4 text-sm text-slate-300">{record.gateway}</td>
                            <td className="p-4 text-sm text-slate-300">{record.distributorName}</td>
                            <td className="p-4 text-sm text-slate-400 font-mono">{record.date.split(' ')[0]}</td>
                            <td className="p-4">
                                <div className="font-mono text-[10px] text-slate-500 bg-black/20 p-1.5 rounded border border-slate-800 max-w-[150px] truncate" title={record.ledgerHash}>
                                    {record.ledgerHash}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-800 bg-slate-900/50 text-center text-xs text-slate-500">
              End of Ledger Page 1 • 50 Records Loaded • Read Only Mode
          </div>
      </div>

    </div>
  );
};

export default PartnerFinancials;