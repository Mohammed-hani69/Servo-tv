import React, { useState } from 'react';
import { Send, Bell, Info, AlertTriangle, Zap, CheckCircle } from 'lucide-react';
import Button from '../../components/Button';
import { AdminNotification } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminNotifications: React.FC = () => {
  const { t } = useLanguage();
  const [target, setTarget] = useState('All Distributors');
  const [type, setType] = useState('Alert');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Mock History
  const history: AdminNotification[] = [
    { id: '1', target: 'All Distributors', type: 'Alert', title: 'Maintenance Notice', message: 'System down at 3AM', sentAt: '2024-03-20 10:00', sentBy: 'SuperAdmin' },
    { id: '2', target: 'Specific Distributor', type: 'Warning', title: 'Low Balance', message: 'Please top up your points', sentAt: '2024-03-19 15:30', sentBy: 'Finance' },
    { id: '3', target: 'All Users', type: 'Promotion', title: 'Eid Sale', message: '50% Off Renewals', sentAt: '2024-03-18 09:00', sentBy: 'Marketing' },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(t('msg_queued'));
    setTimeout(() => setSuccessMsg(''), 3000);
    setTitle('');
    setMessage('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('notifications_center')}</h1>
        <p className="text-slate-400 text-sm">{t('broadcast_messages')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Compose Form */}
        <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                    <Send size={18} className="text-blue-400" /> {t('compose_message')}
                </h3>
                
                <form onSubmit={handleSend} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">{t('target_audience')}</label>
                        <select 
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
                        >
                            <option>{t('all_distributors')}</option>
                            <option>{t('specific_distributor')}</option>
                            <option>{t('all_users')}</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">{t('message_type')}</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Alert', 'Warning', 'Promotion'].map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                                        type === t 
                                        ? 'bg-slate-800 border-white text-white' 
                                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-900'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">{t('title')}</label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
                            placeholder={t('brief_subject')}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">{t('message_body')}</label>
                        <textarea 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white h-32"
                            placeholder={t('type_message')}
                        ></textarea>
                    </div>

                    {successMsg && (
                        <div className="p-3 bg-emerald-900/20 border border-emerald-900/50 rounded-lg text-emerald-400 text-sm flex items-center gap-2">
                            <CheckCircle size={16} /> {successMsg}
                        </div>
                    )}

                    <Button block className="bg-blue-600 hover:bg-blue-700">
                        {t('compose_message')}
                    </Button>
                </form>
            </div>
        </div>

        {/* History List */}
        <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                    <h3 className="font-bold text-white">{t('sent_history')}</h3>
                </div>
                <div className="divide-y divide-slate-800">
                    {history.map(item => (
                        <div key={item.id} className="p-4 hover:bg-slate-800/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${
                                        item.type === 'Alert' ? 'bg-red-900/20 text-red-400' :
                                        item.type === 'Warning' ? 'bg-orange-900/20 text-orange-400' :
                                        'bg-purple-900/20 text-purple-400'
                                    }`}>
                                        {item.type === 'Alert' && <AlertTriangle size={18} />}
                                        {item.type === 'Warning' && <Info size={18} />}
                                        {item.type === 'Promotion' && <Zap size={18} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{item.title}</h4>
                                        <div className="text-xs text-slate-500">To: {item.target}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-400">{item.sentAt}</div>
                                    <div className="text-[10px] text-slate-600">By: {item.sentBy}</div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-300 pl-12">{item.message}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;