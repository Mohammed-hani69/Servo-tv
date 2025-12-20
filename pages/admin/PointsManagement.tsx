import React, { useState } from 'react';
import { Coins, TrendingUp, ArrowDownRight, ArrowUpRight, Search, Filter, Calculator, Ticket } from 'lucide-react';
import Button from '../../components/Button';
import { PointTransaction } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const PointsManagement: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'config' | 'transactions'>('config');

  // Mock Settings including Consumption Rules
  const [config, setConfig] = useState({
    pricePerPoint: 1.00,
    currency: 'USD',
    minPurchaseBonus: 1000,
    bonusPercentage: 5,
    enablePromotions: true,
    // Subscription Costs (Points deducted from Reseller)
    subscriptionCosts: {
        month1: 1,
        month3: 3,
        month6: 5, // Discounted
        month12: 8, // Highly Discounted
        costPerExtraDevice: 2,
    }
  });

  // Mock Calculator State
  const [calcDuration, setCalcDuration] = useState('month12');
  const [calcDevices, setCalcDevices] = useState(1);

  // Mock Transactions
  const transactions: PointTransaction[] = [
    { id: 'TX-1001', distributorName: 'Alpha Stream', type: 'Buy', amount: 500, adminApprover: 'System', date: '2024-03-20 14:30', description: 'Stripe Auto-Purchase' },
    { id: 'TX-1002', distributorName: 'Beta IPTV', type: 'Bonus', amount: 50, adminApprover: 'Admin(You)', date: '2024-03-19 10:00', description: 'Loyalty Bonus' },
    { id: 'TX-1003', distributorName: 'Gamma Reseller', type: 'Adjust', amount: -20, adminApprover: 'Admin(You)', date: '2024-03-18 09:15', description: 'Correction' },
    { id: 'TX-1004', distributorName: 'Alpha Stream', type: 'Buy', amount: 1000, adminApprover: 'System', date: '2024-03-15 16:45', description: 'Stripe Auto-Purchase' },
  ];

  const calculatePreviewCost = () => {
      // @ts-ignore
      const baseCost = config.subscriptionCosts[calcDuration];
      const extraDevices = Math.max(0, calcDevices - 1);
      const extraCost = extraDevices * config.subscriptionCosts.costPerExtraDevice;
      return baseCost + extraCost;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('points_system')}</h1>
          <p className="text-slate-400 text-sm">{t('global_pricing')}</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setActiveTab('config')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'config' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
                {t('configuration')}
            </button>
            <button 
                onClick={() => setActiveTab('transactions')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'transactions' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
                {t('transactions_log')}
            </button>
        </div>
      </div>

      {activeTab === 'config' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Global Purchase Pricing */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Coins className="text-yellow-500" /> {t('global_pricing')}
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">{t('price_per_point')}</label>
                        <div className="flex items-center gap-3">
                            <input 
                                type="number" 
                                value={config.pricePerPoint} 
                                onChange={e => setConfig({...config, pricePerPoint: parseFloat(e.target.value)})}
                                className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white w-full"
                            />
                            <select 
                                value={config.currency}
                                onChange={e => setConfig({...config, currency: e.target.value})}
                                className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white w-24"
                            >
                                <option>USD</option>
                                <option>EUR</option>
                                <option>EGP</option>
                            </select>
                        </div>
                    </div>
                    <div className="p-4 bg-blue-900/20 border border-blue-900/50 rounded-lg text-sm text-blue-200">
                        {t('base_price_note')}
                    </div>
                </div>
            </div>

            {/* Reseller Consumption Configuration */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><Ticket size={100} /></div>
                
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                    <Ticket className="text-purple-500" /> {t('sub_costs_config')}
                </h2>
                <p className="text-sm text-slate-400 mb-6 relative z-10">{t('sub_costs_desc')}</p>
                
                <div className="space-y-4 relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">{t('cost_1_month')} ({t('points')})</label>
                            <input 
                                type="number" 
                                value={config.subscriptionCosts.month1}
                                onChange={e => setConfig({...config, subscriptionCosts: {...config.subscriptionCosts, month1: parseFloat(e.target.value)}})}
                                className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white w-full focus:border-purple-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">{t('cost_3_months')} ({t('points')})</label>
                            <input 
                                type="number" 
                                value={config.subscriptionCosts.month3}
                                onChange={e => setConfig({...config, subscriptionCosts: {...config.subscriptionCosts, month3: parseFloat(e.target.value)}})}
                                className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white w-full focus:border-purple-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">{t('cost_6_months')} ({t('points')})</label>
                            <input 
                                type="number" 
                                value={config.subscriptionCosts.month6}
                                onChange={e => setConfig({...config, subscriptionCosts: {...config.subscriptionCosts, month6: parseFloat(e.target.value)}})}
                                className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white w-full focus:border-purple-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">{t('cost_12_months')} ({t('points')})</label>
                            <input 
                                type="number" 
                                value={config.subscriptionCosts.month12}
                                onChange={e => setConfig({...config, subscriptionCosts: {...config.subscriptionCosts, month12: parseFloat(e.target.value)}})}
                                className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white w-full focus:border-purple-500 transition-colors"
                            />
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-800">
                        <label className="block text-sm font-medium text-slate-400 mb-2">{t('cost_extra_device')}</label>
                        <input 
                            type="number" 
                            value={config.subscriptionCosts.costPerExtraDevice}
                            onChange={e => setConfig({...config, subscriptionCosts: {...config.subscriptionCosts, costPerExtraDevice: parseFloat(e.target.value)}})}
                            className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white w-full focus:border-purple-500 transition-colors"
                        />
                        <p className="text-xs text-slate-500 mt-1">Cost added for each device beyond the first one.</p>
                    </div>
                </div>
            </div>

            {/* Promotions */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="text-emerald-500" /> {t('bonus_promotions')}
                </h2>
                <div className="space-y-4">
                     <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                        <span className="text-white text-sm">{t('enable_automated_bonuses')}</span>
                        <div 
                            className={`w-12 h-6 rounded-full relative cursor-pointer ${config.enablePromotions ? 'bg-green-600' : 'bg-slate-600'}`}
                            onClick={() => setConfig({...config, enablePromotions: !config.enablePromotions})}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config.enablePromotions ? 'left-7' : 'left-1'}`} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">{t('min_purchase')}</label>
                            <input 
                                type="number" 
                                value={config.minPurchaseBonus}
                                onChange={e => setConfig({...config, minPurchaseBonus: parseInt(e.target.value)})}
                                className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white w-full"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">{t('bonus_percentage')}</label>
                            <input 
                                type="number" 
                                value={config.bonusPercentage}
                                onChange={e => setConfig({...config, bonusPercentage: parseInt(e.target.value)})}
                                className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Calculator Preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Calculator className="text-blue-400" /> {t('cost_calculator')}
                </h2>
                <div className="bg-slate-950 p-4 rounded-lg space-y-4">
                    <div className="flex gap-4">
                        <select 
                            value={calcDuration} 
                            onChange={(e) => setCalcDuration(e.target.value)}
                            className="bg-slate-800 border border-slate-700 text-white rounded p-2 text-sm flex-1 outline-none"
                        >
                            <option value="month1">1 Month</option>
                            <option value="month3">3 Months</option>
                            <option value="month6">6 Months</option>
                            <option value="month12">12 Months</option>
                        </select>
                        <select 
                            value={calcDevices}
                            onChange={(e) => setCalcDevices(parseInt(e.target.value))}
                            className="bg-slate-800 border border-slate-700 text-white rounded p-2 text-sm w-24 outline-none"
                        >
                            <option value={1}>1 Dev</option>
                            <option value={2}>2 Devs</option>
                            <option value={3}>3 Devs</option>
                            <option value={4}>4 Devs</option>
                        </select>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                        <span className="text-slate-400 text-sm">Reseller Deducted Amount:</span>
                        <span className="text-2xl font-bold text-white">{calculatePreviewCost()} <span className="text-sm font-normal text-slate-500">PTS</span></span>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 flex justify-end">
                <Button className="bg-red-600 hover:bg-red-700 w-48">{t('save_changes')}</Button>
            </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex gap-4">
                <div className="relative flex-1 max-w-md">
                   <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-500`} size={18} />
                   <input 
                       type="text" 
                       placeholder={t('search_transactions')}
                       className={`w-full bg-slate-950 border border-slate-800 rounded-lg py-2 text-sm text-white focus:border-red-500 outline-none ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                   />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-slate-500" />
                    <select className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 outline-none">
                        <option>{t('all_types')}</option>
                        <option>{t('buy')}</option>
                        <option>{t('bonus')}</option>
                        <option>{t('deduct')}</option>
                    </select>
                </div>
            </div>

            <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                        <th className="p-4">TX ID</th>
                        <th className="p-4">{t('admin_distributors')}</th>
                        <th className="p-4">{t('actions')}</th>
                        <th className="p-4">{t('amount')}</th>
                        <th className="p-4">{t('approver')}</th>
                        <th className="p-4">{t('date')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-800/50">
                            <td className="p-4 font-mono text-sm text-slate-500">{tx.id}</td>
                            <td className="p-4 font-medium text-white">{tx.distributorName}</td>
                            <td className="p-4">
                                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded w-fit ${
                                    tx.type === 'Buy' ? 'bg-emerald-900/30 text-emerald-400' :
                                    tx.type === 'Bonus' ? 'bg-purple-900/30 text-purple-400' :
                                    tx.type === 'Deduct' || tx.type === 'Adjust' ? 'bg-red-900/30 text-red-400' : 'bg-slate-700 text-slate-300'
                                }`}>
                                    {tx.type === 'Buy' && <ArrowDownRight size={12} />}
                                    {tx.type === 'Deduct' && <ArrowUpRight size={12} />}
                                    {tx.type}
                                </span>
                            </td>
                            <td className={`p-4 font-bold font-mono ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {tx.amount > 0 ? '+' : ''}{tx.amount}
                            </td>
                            <td className="p-4 text-sm text-slate-300">{tx.adminApprover}</td>
                            <td className="p-4 text-sm text-slate-500">{tx.date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

export default PointsManagement;