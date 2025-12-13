import React, { useState } from 'react';
import { Layers, Plus, CheckCircle } from 'lucide-react';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { PaymentPlan } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const PlansManagement: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { t } = useLanguage();
  
  const plans: PaymentPlan[] = [
    { id: 'p1', name: 'Starter Pack', durationMonths: 1, points: 10, maxDevices: 1, isActive: true },
    { id: 'p2', name: 'Standard Pack', durationMonths: 6, points: 50, maxDevices: 2, isActive: true },
    { id: 'p3', name: 'Ultimate Pack', durationMonths: 12, points: 90, maxDevices: 4, isActive: true },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">{t('admin_plans')}</h1>
            <p className="text-slate-400 text-sm">{t('base_packages')}</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="bg-red-600 hover:bg-red-700 gap-2">
              <Plus size={18} /> {t('create_plan')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => (
                <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative group">
                    <div className="absolute top-4 right-4 text-emerald-500">
                        {plan.isActive && <CheckCircle size={20} />}
                    </div>
                    <div className="mb-4 p-3 bg-slate-800 rounded-lg w-fit text-slate-300">
                        <Layers size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="space-y-2 mt-4 text-sm">
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span className="text-slate-500">{t('duration')}</span>
                            <span className="text-white">{plan.durationMonths} {t('months')}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span className="text-slate-500">{t('cost_points')}</span>
                            <span className="text-yellow-500 font-bold">{plan.points}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">{t('max_devices')}</span>
                            <span className="text-white">{plan.maxDevices}</span>
                        </div>
                    </div>
                    <div className="mt-6 flex gap-2">
                        <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm text-white">{t('edit')}</button>
                        <button className="flex-1 py-2 bg-slate-800 hover:bg-red-900/50 hover:text-red-400 rounded text-sm text-slate-400">{t('disabled')}</button>
                    </div>
                </div>
            ))}
        </div>

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={t('create_plan')}>
             <form className="space-y-4">
                <div>
                    <label className="block text-sm text-slate-400 mb-1">{t('plan')}</label>
                    <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">{t('duration')} ({t('months')})</label>
                        <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">{t('cost_points')}</label>
                        <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" />
                    </div>
                 </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">{t('max_devices')}</label>
                    <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" />
                </div>
                <Button block className="bg-red-600 hover:bg-red-700">{t('save')}</Button>
            </form>
        </Modal>
    </div>
  );
};

export default PlansManagement;