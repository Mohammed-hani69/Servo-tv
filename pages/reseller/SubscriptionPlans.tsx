import React, { useState } from 'react';
import { Layers, Plus, Edit2, Trash } from 'lucide-react';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

const SubscriptionPlans: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    // Mock Plans
    const plans = [
        { id: 1, name: 'Standard Monthly', duration: '1 Month', cost: 1, devices: 1, description: 'Basic access for 1 device' },
        { id: 2, name: 'Family Quarterly', duration: '3 Months', cost: 4, devices: 2, description: 'Multi-device support for families' },
        { id: 3, name: 'Premium Yearly', duration: '12 Months', cost: 10, devices: 3, description: 'Best value for long term' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <div>
                <h1 className="text-2xl font-bold text-white">Subscription Plans</h1>
                <p className="text-slate-400 text-sm">Define custom packages for your customers</p>
                </div>
                <Button onClick={() => setShowModal(true)} className="gap-2">
                    <Plus size={18} /> Create Plan
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <div key={plan.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-blue-500/50 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-900/20 text-blue-400 rounded-lg">
                                <Layers size={24} />
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded"><Edit2 size={16} /></button>
                                <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded"><Trash size={16} /></button>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                        <p className="text-sm text-slate-400 mb-6 h-10">{plan.description}</p>
                        
                        <div className="space-y-3 pt-4 border-t border-slate-800">
                             <div className="flex justify-between text-sm">
                                 <span className="text-slate-500">Duration</span>
                                 <span className="text-white font-medium">{plan.duration}</span>
                             </div>
                             <div className="flex justify-between text-sm">
                                 <span className="text-slate-500">Cost</span>
                                 <span className="text-emerald-400 font-bold">{plan.cost} Points</span>
                             </div>
                             <div className="flex justify-between text-sm">
                                 <span className="text-slate-500">Devices</span>
                                 <span className="text-white font-medium">{plan.devices}</span>
                             </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Plan">
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Plan Name</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" placeholder="e.g. VIP Package" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-medium text-slate-400 mb-2">Duration (Months)</label>
                             <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-400 mb-2">Cost (Points)</label>
                             <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Max Devices</label>
                        <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                        <textarea className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white h-24"></textarea>
                    </div>
                    <Button block>Create Plan</Button>
                </form>
            </Modal>
        </div>
    );
};

export default SubscriptionPlans;