import React, { useState } from 'react';
import { Search, Filter, Plus, Copy, RefreshCcw, Ban, Trash2, Calendar, FileDown, ArrowRight } from 'lucide-react';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { ActivationCode } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const CodesManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const { t, isRTL } = useLanguage();
  
  // Create Code Form State
  const [newCodeDuration, setNewCodeDuration] = useState(12);
  const [newCodeDevices, setNewCodeDevices] = useState(1);
  const [newCodeNotes, setNewCodeNotes] = useState('');

  // Mock Data
  const [codes] = useState<ActivationCode[]>([
    { id: '1', code: 'A8B9-12X9-9988', status: 'Active', durationMonths: 12, maxDevices: 1, currentDevices: 1, assignedUser: 'John Doe', createdDate: '2024-03-01', expirationDate: '2025-03-01' },
    { id: '2', code: '777X-MM99-KK22', status: 'Not Activated', durationMonths: 6, maxDevices: 2, currentDevices: 0, createdDate: '2024-03-10' },
    { id: '3', code: 'EXPP-0000-1111', status: 'Expired', durationMonths: 1, maxDevices: 1, currentDevices: 1, assignedUser: 'Jane Smith', createdDate: '2024-01-01', expirationDate: '2024-02-01' },
    { id: '4', code: 'SUSP-9999-8888', status: 'Suspended', durationMonths: 12, maxDevices: 3, currentDevices: 2, assignedUser: 'Bad Actor', createdDate: '2024-02-15' },
    // Generate more rows for visual density
    ...Array.from({length: 5}).map((_, i) => ({
        id: `gen-${i}`, code: `CODE-${Math.floor(Math.random()*10000)}`, status: 'Active', durationMonths: 12, maxDevices: 1, currentDevices: 1, assignedUser: `User ${i}`, createdDate: '2024-03-05'
    } as ActivationCode))
  ]);

  const getStatusColor = (status: string) => {
    switch(status) {
        case 'Active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        case 'Not Activated': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'Expired': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        case 'Suspended': return 'bg-red-500/10 text-red-500 border-red-500/20';
        default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Creating code: ${newCodeDuration} months, ${newCodeDevices} devices. Points deducted: ${newCodeDuration * newCodeDevices}`);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('codes_title')}</h1>
          <p className="text-slate-400 text-sm">{t('codes_subtitle')}</p>
        </div>
        <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700">
                <FileDown size={18} /> {t('export_csv')}
             </button>
             <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20 font-medium"
             >
                <Plus size={18} /> {t('generate_code')}
             </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between">
         <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
                <Search className={`absolute top-1/2 -translate-y-1/2 text-slate-500 ${isRTL ? 'right-3' : 'left-3'}`} size={18} />
                <input 
                    type="text" 
                    placeholder={t('search_codes')} 
                    className={`w-full bg-slate-800 border border-slate-700 rounded-lg py-2 text-sm text-white focus:border-blue-500 outline-none ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                />
            </div>
            <div className={`flex items-center gap-2 border-slate-700 ${isRTL ? 'border-r pr-4' : 'border-l pl-4'}`}>
                <Filter size={16} className="text-slate-500" />
                <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-transparent text-sm text-slate-300 outline-none cursor-pointer hover:text-white"
                >
                    <option value="All">{t('all_statuses')}</option>
                    <option value="Active">Active</option>
                    <option value="Not Activated">Not Activated</option>
                    <option value="Expired">Expired</option>
                    <option value="Suspended">Suspended</option>
                </select>
            </div>
         </div>
         <div className="text-sm text-slate-500">
            Showing <span className="text-white font-bold">{codes.length}</span> results
         </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>Code</th>
                    <th className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>User</th>
                    <th className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>Plan</th>
                    <th className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>Devices</th>
                    <th className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>Status</th>
                    <th className={`p-4 ${isRTL ? 'text-right' : 'text-left'}`}>Expiration</th>
                    <th className={`p-4 ${isRTL ? 'text-left' : 'text-right'}`}>Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {codes.map((code) => (
                    <tr key={code.id} className="hover:bg-slate-800/50 transition-colors group">
                        <td className="p-4">
                            <div className="font-mono font-bold text-blue-400 flex items-center gap-2">
                                {code.code}
                                <button className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition-opacity" title="Copy">
                                    <Copy size={14} />
                                </button>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">{code.createdDate}</div>
                        </td>
                        <td className="p-4 text-sm text-white">
                            {code.assignedUser || <span className="text-slate-600 italic">Unassigned</span>}
                        </td>
                        <td className="p-4 text-sm text-slate-300">
                            {code.durationMonths} Months
                        </td>
                        <td className="p-4">
                             <div className="flex items-center gap-2">
                                <div className="w-full bg-slate-700 h-1.5 w-16 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-blue-500 h-full" 
                                        style={{ width: `${(code.currentDevices / code.maxDevices) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs text-slate-400">{code.currentDevices}/{code.maxDevices}</span>
                             </div>
                        </td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(code.status)}`}>
                                {code.status}
                            </span>
                        </td>
                        <td className="p-4 text-sm text-slate-300">
                            {code.expirationDate ? (
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-slate-500" />
                                    {code.expirationDate}
                                </div>
                            ) : '-'}
                        </td>
                        <td className={`p-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                            <div className={`flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${isRTL ? 'justify-start' : 'justify-end'}`}>
                                <button title="Extend" className="p-2 bg-slate-800 hover:bg-blue-600 hover:text-white rounded text-slate-400 transition-colors">
                                    <RefreshCcw size={16} />
                                </button>
                                <button title="Suspend" className="p-2 bg-slate-800 hover:bg-orange-600 hover:text-white rounded text-slate-400 transition-colors">
                                    <Ban size={16} />
                                </button>
                                {code.status === 'Not Activated' && (
                                     <button title="Delete" className="p-2 bg-slate-800 hover:bg-red-600 hover:text-white rounded text-slate-400 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={t('generate_code')}>
         <form onSubmit={handleCreate} className="space-y-6">
            <div>
                 <label className="block text-sm font-medium text-slate-400 mb-2">Duration (Months)</label>
                 <div className="grid grid-cols-4 gap-2">
                    {[1, 3, 6, 12].map(m => (
                        <button 
                            key={m}
                            type="button"
                            onClick={() => setNewCodeDuration(m)}
                            className={`py-2 rounded border transition-all font-medium ${newCodeDuration === m ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                        >
                            {m} Mo
                        </button>
                    ))}
                 </div>
            </div>
            
            <div>
                 <label className="block text-sm font-medium text-slate-400 mb-2">Max Devices</label>
                 <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(d => (
                        <button 
                            key={d}
                            type="button"
                            onClick={() => setNewCodeDevices(d)}
                            className={`py-2 rounded border transition-all font-medium ${newCodeDevices === d ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                        >
                            {d} Dev
                        </button>
                    ))}
                 </div>
            </div>

            <div>
                 <label className="block text-sm font-medium text-slate-400 mb-2">Notes (Optional)</label>
                 <textarea 
                    value={newCodeNotes}
                    onChange={(e) => setNewCodeNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white h-20"
                    placeholder="Client name, reference..."
                 ></textarea>
            </div>

            <div className="bg-slate-900 p-4 rounded-lg flex justify-between items-center border border-slate-800">
                <span className="text-sm text-slate-400">Total Cost</span>
                <span className="text-xl font-bold text-white">{newCodeDuration * newCodeDevices} <span className="text-xs font-normal text-slate-500">PTS</span></span>
            </div>

            <Button block className="gap-2">
                Generate Now <ArrowRight size={18} />
            </Button>
         </form>
      </Modal>
    </div>
  );
};

export default CodesManagement;