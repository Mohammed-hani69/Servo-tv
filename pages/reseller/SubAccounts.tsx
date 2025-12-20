import React from 'react';
import { ShieldCheck, Plus, MoreVertical } from 'lucide-react';
import Button from '../../components/Button';
import { SubAccount } from '../../types';

const SubAccounts: React.FC = () => {
  const subAccounts: SubAccount[] = [
    { id: '1', name: 'Support Staff 1', username: 'support1', role: 'Support Agent', permissions: ['View Users', 'Create Tickets'], lastLogin: '2024-03-10', status: 'Active' },
    { id: '2', name: 'Sales Rep 1', username: 'sales1', role: 'Sales Manager', permissions: ['Create Codes', 'View Reports'], lastLogin: '2024-03-12', status: 'Active' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Sub-Accounts</h1>
          <p className="text-slate-400 text-sm">Manage staff access and permissions</p>
        </div>
        <Button className="gap-2">
            <Plus size={18} /> Add Sub-Account
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subAccounts.map(acc => (
            <div key={acc.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl relative group">
                 <div className="absolute top-4 right-4 text-slate-500 cursor-pointer hover:text-white">
                     <MoreVertical size={20} />
                 </div>
                 <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center text-blue-400">
                         <ShieldCheck size={24} />
                     </div>
                     <div>
                         <h3 className="font-bold text-white">{acc.name}</h3>
                         <div className="text-xs text-slate-400">@{acc.username}</div>
                     </div>
                 </div>
                 <div className="space-y-3 mb-6">
                     <div className="flex justify-between text-sm border-b border-slate-800 pb-2">
                         <span className="text-slate-500">Role</span>
                         <span className="text-white">{acc.role}</span>
                     </div>
                      <div className="flex justify-between text-sm border-b border-slate-800 pb-2">
                         <span className="text-slate-500">Last Login</span>
                         <span className="text-white">{acc.lastLogin}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                         <span className="text-slate-500">Status</span>
                         <span className="text-emerald-400">{acc.status}</span>
                     </div>
                 </div>
                 <div className="flex flex-wrap gap-2">
                     {acc.permissions.map(p => (
                         <span key={p} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">{p}</span>
                     ))}
                 </div>
            </div>
        ))}

        <button className="border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/5 transition-all min-h-[250px]">
            <Plus size={40} className="mb-2 opacity-50" />
            <span>Create New Staff Account</span>
        </button>
      </div>
    </div>
  );
};

export default SubAccounts;