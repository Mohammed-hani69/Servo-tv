import React, { useState } from 'react';
import { CreditCard, Download, CheckCircle, XCircle, RefreshCw, AlertTriangle, Settings } from 'lucide-react';
import Button from '../../components/Button';
import { PaymentRecord } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminPayments: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'payments' | 'gateways'>('payments');

  // Mock Payment Data
  const payments: PaymentRecord[] = [
    { id: 'PAY-8821', distributorName: 'Alpha Stream', method: 'Stripe', amount: 500, currency: 'USD', status: 'Completed', date: '2024-03-20 14:30', invoiceUrl: '#' },
    { id: 'PAY-8822', distributorName: 'Beta IPTV', method: 'PayMob', amount: 20000, currency: 'EGP', status: 'Pending', date: '2024-03-20 15:00', invoiceUrl: '#' },
    { id: 'PAY-8823', distributorName: 'Gamma Reseller', method: 'Manual', amount: 100, currency: 'USD', status: 'Failed', date: '2024-03-19 09:00', invoiceUrl: '#' },
    { id: 'PAY-8824', distributorName: 'Alpha Stream', method: 'Fawry', amount: 5000, currency: 'EGP', status: 'Completed', date: '2024-03-18 11:20', invoiceUrl: '#' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('payments_billing')}</h1>
          <p className="text-slate-400 text-sm">{t('manage_gateways')}</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setActiveTab('payments')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'payments' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
                {t('transactions')}
            </button>
            <button 
                onClick={() => setActiveTab('gateways')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'gateways' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
                {t('gateways_settings')}
            </button>
        </div>
      </div>

      {activeTab === 'payments' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <div className="text-sm text-slate-400 font-bold uppercase tracking-wider">{t('all_payments')}</div>
                <button className="flex items-center gap-2 text-xs text-blue-400 hover:text-white">
                    <Download size={14} /> {t('export_report')}
                </button>
            </div>
            
            <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                        <th className="p-4">ID</th>
                        <th className="p-4">{t('admin_distributors')}</th>
                        <th className="p-4">{t('method')}</th>
                        <th className="p-4">{t('amount')}</th>
                        <th className="p-4">{t('date')}</th>
                        <th className="p-4">{t('status')}</th>
                        <th className="p-4 text-right">{t('actions')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {payments.map(pay => (
                        <tr key={pay.id} className="hover:bg-slate-800/50">
                            <td className="p-4 font-mono text-sm text-slate-500">{pay.id}</td>
                            <td className="p-4 font-medium text-white">{pay.distributorName}</td>
                            <td className="p-4 text-sm text-slate-300">{pay.method}</td>
                            <td className="p-4 font-bold text-white">{pay.amount} <span className="text-xs font-normal text-slate-500">{pay.currency}</span></td>
                            <td className="p-4 text-sm text-slate-500">{pay.date}</td>
                            <td className="p-4">
                                <span className={`flex items-center gap-1 w-fit px-2 py-1 rounded text-xs font-bold border ${
                                    pay.status === 'Completed' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900' :
                                    pay.status === 'Pending' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-900' :
                                    pay.status === 'Failed' ? 'bg-red-900/30 text-red-400 border-red-900' : 'bg-slate-800 text-slate-400'
                                }`}>
                                    {pay.status === 'Completed' && <CheckCircle size={12} />}
                                    {pay.status === 'Pending' && <AlertTriangle size={12} />}
                                    {pay.status === 'Failed' && <XCircle size={12} />}
                                    {pay.status}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                {pay.status === 'Pending' ? (
                                    <div className="flex justify-end gap-2">
                                        <button className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs">{t('approve')}</button>
                                        <button className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs">{t('reject')}</button>
                                    </div>
                                ) : pay.status === 'Completed' ? (
                                    <button className="text-slate-400 hover:text-white flex items-center gap-1 justify-end ml-auto text-xs">
                                        <Download size={14} /> {t('invoice')}
                                    </button>
                                ) : (
                                    <span className="text-xs text-slate-600">-</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Stripe Config */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <CreditCard size={80} />
                </div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">Stripe <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded">{t('active')}</span></h3>
                
                <div className="space-y-4 relative z-10">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">{t('publishable_key')}</label>
                        <input type="text" value="pk_live_..." className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">{t('secret_key')}</label>
                        <input type="password" value="sk_live_..." className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-sm" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">{t('webhook_secret')}</label>
                        <input type="password" value="whsec_..." className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-sm" />
                    </div>
                    <Button block className="mt-4 bg-slate-800 hover:bg-slate-700">{t('update_credentials')}</Button>
                </div>
            </div>

            {/* PayMob Config */}
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <CreditCard size={80} />
                </div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">PayMob / Fawry <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded">{t('active')}</span></h3>
                
                <div className="space-y-4 relative z-10">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">{t('api_key')}</label>
                        <input type="password" value="ZXlKaGJ..." className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">{t('integration_id')}</label>
                            <input type="text" value="123456" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-sm" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">{t('frame_id')}</label>
                            <input type="text" value="998877" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-sm" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <input type="checkbox" id="fawry_enabled" defaultChecked className="rounded bg-slate-800 border-slate-700" />
                        <label htmlFor="fawry_enabled" className="text-sm text-slate-300">{t('enable_fawry')}</label>
                    </div>
                    <Button block className="mt-4 bg-slate-800 hover:bg-slate-700">{t('update_credentials')}</Button>
                </div>
            </div>
            
             {/* Manual Payments */}
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:col-span-2">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Settings size={20} /> {t('manual_bank_transfer')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">{t('instructions_distributors')}</label>
                        <textarea className="w-full h-32 bg-slate-950 border border-slate-700 rounded p-3 text-white text-sm" defaultValue={`Bank Name: Citibank\nAccount: 123456789\nSwift: CITIUS33\nSend receipt to billing@servo.tv`}></textarea>
                    </div>
                    <div>
                        <div className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800 mb-4">
                            <span className="text-white text-sm">{t('enable_manual_payments')}</span>
                            <div className="w-12 h-6 bg-green-600 rounded-full relative cursor-pointer">
                                <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                        <Button block className="bg-slate-800 hover:bg-slate-700">{t('save')}</Button>
                    </div>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;