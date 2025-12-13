import React, { useState } from 'react';
import { Search, Plus, MoreVertical, Shield } from 'lucide-react';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { Distributor, UserRole } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const Distributors: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { t, isRTL } = useLanguage();
  
  // Mock Data
  const distributors: Distributor[] = [
    { id: 'd1', email: 'reseller1@servo.tv', name: 'Alpha Stream', role: UserRole.RESELLER, isActive: true, points: 5000, totalUsers: 150, totalSpent: 12000, status: 'Active', lastLogin: '2024-03-15', created_at: '2023-01-01' },
    { id: 'd2', email: 'reseller2@servo.tv', name: 'Beta IPTV', role: UserRole.RESELLER, isActive: true, points: 200, totalUsers: 40, totalSpent: 2000, status: 'Active', lastLogin: '2024-03-14', created_at: '2023-05-20' },
    { id: 'd3', email: 'bad_actor@servo.tv', name: 'Gamma', role: UserRole.RESELLER, isActive: false, points: 0, totalUsers: 5, totalSpent: 500, status: 'Suspended', lastLogin: '2023-12-01', created_at: '2023-08-10' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">{t('admin_distributors')}</h1>
            <p className="text-slate-400 text-sm">{t('manage_resellers')}</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="bg-red-600 hover:bg-red-700 gap-2">
              <Plus size={18} /> {t('create_distributor')}
          </Button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
         <div className="p-4 border-b border-slate-800 flex gap-4">
             <div className="relative flex-1 max-w-md">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-500`} size={18} />
                <input 
                    type="text" 
                    placeholder={t('search_distributors')} 
                    className={`w-full bg-slate-950 border border-slate-800 rounded-lg py-2 text-sm text-white focus:border-red-500 outline-none ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`} 
                />
             </div>
         </div>

         <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold">
                <tr>
                    <th className="p-4">{t('admin_distributors')}</th>
                    <th className="p-4">{t('status')}</th>
                    <th className="p-4">{t('balance')}</th>
                    <th className="p-4">{t('users')}</th>
                    <th className="p-4">{t('revenue')}</th>
                    <th className="p-4 text-right">{t('actions')}</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {distributors.map(d => (
                    <tr key={d.id} className="hover:bg-slate-800/50">
                        <td className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                                    {d.name?.substring(0,2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-white font-medium">{d.name}</div>
                                    <div className="text-xs text-slate-500">{d.email}</div>
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs border ${d.isActive ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900' : 'bg-red-900/30 text-red-400 border-red-900'}`}>
                                {d.status}
                            </span>
                        </td>
                        <td className="p-4 text-white font-mono">{d.points} PTS</td>
                        <td className="p-4 text-slate-400">{d.totalUsers}</td>
                        <td className="p-4 text-emerald-400">${d.totalSpent}</td>
                        <td className="p-4 text-right">
                            <button className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white">
                                <MoreVertical size={16} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
         </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={t('create_distributor')}>
          <form className="space-y-4">
              <div>
                  <label className="block text-sm text-slate-400 mb-1">{t('distributor_name')}</label>
                  <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" />
              </div>
              <div>
                  <label className="block text-sm text-slate-400 mb-1">{t('email_addr')}</label>
                  <input type="email" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" />
              </div>
              <div>
                  <label className="block text-sm text-slate-400 mb-1">{t('initial_points')}</label>
                  <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" />
              </div>
              <Button block className="bg-red-600 hover:bg-red-700">{t('create_distributor')}</Button>
          </form>
      </Modal>
    </div>
  );
};

export default Distributors;