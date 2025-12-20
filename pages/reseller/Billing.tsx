import React, { useState } from 'react';
import { CreditCard, Download, ExternalLink, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Transaction } from '../../types';
import Modal from '../../components/Modal';

const Billing: React.FC = () => {
    const [showBuyModal, setShowBuyModal] = useState(false);

    // Mock Transactions
    const transactions: Transaction[] = [
        { id: 'tx-9921', type: 'Deduction', amount: 12, description: 'Generated 12 Month Code', date: '2024-03-12 14:30', status: 'Completed' },
        { id: 'tx-9920', type: 'Deduction', amount: 1, description: 'Generated 1 Month Code', date: '2024-03-12 10:15', status: 'Completed' },
        { id: 'tx-9918', type: 'Purchase', amount: 500, description: 'Points Top-up (Stripe)', date: '2024-03-10 09:00', status: 'Completed' },
        { id: 'tx-9915', type: 'Deduction', amount: 6, description: 'Generated 6 Month Code', date: '2024-03-09 16:45', status: 'Completed' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
             <div className="flex justify-between items-center">
                <div>
                <h1 className="text-2xl font-bold text-white">Points & Billing</h1>
                <p className="text-slate-400 text-sm">Track your credit usage and purchase history</p>
                </div>
                <button 
                    onClick={() => setShowBuyModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20 font-bold"
                >
                    <CreditCard size={18} /> Buy Points
                </button>
            </div>

            {/* Balance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-900/50 to-slate-900 border border-emerald-500/30 p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><CreditCard size={100} /></div>
                    <div className="relative z-10">
                        <div className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-1">Current Balance</div>
                        <div className="text-4xl font-bold text-white">850 <span className="text-lg font-medium text-emerald-200">PTS</span></div>
                        <div className="mt-4 text-xs text-slate-400">1 Point ≈ $1.00 USD</div>
                    </div>
                </div>

                 <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                    <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Spent this Month</div>
                    <div className="text-3xl font-bold text-white">45 <span className="text-lg font-medium text-slate-500">PTS</span></div>
                    <div className="mt-4 text-xs text-red-400 flex items-center gap-1">
                        <ArrowUpRight size={12} /> +12% vs last month
                    </div>
                </div>

                 <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                    <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Total Purchased</div>
                    <div className="text-3xl font-bold text-white">2,500 <span className="text-lg font-medium text-slate-500">PTS</span></div>
                     <div className="mt-4 text-xs text-slate-500">Lifetime value</div>
                </div>
            </div>

            {/* Transactions History */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 font-bold text-white flex justify-between items-center">
                    <span>Transaction History</span>
                    <button className="text-xs text-blue-400 flex items-center gap-1 hover:text-white">
                        <Download size={12} /> Export CSV
                    </button>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-900/80 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <th className="p-4">Transaction ID</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-right">Amount</th>
                            <th className="p-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="p-4 font-mono text-sm text-slate-500">{tx.id}</td>
                                <td className="p-4">
                                    <div className={`flex items-center gap-2 text-sm ${tx.type === 'Purchase' ? 'text-emerald-400' : 'text-slate-300'}`}>
                                        <div className={`p-1 rounded-full ${tx.type === 'Purchase' ? 'bg-emerald-900/50' : 'bg-slate-700'}`}>
                                            {tx.type === 'Purchase' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                                        </div>
                                        {tx.type}
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-white">{tx.description}</td>
                                <td className="p-4 text-sm text-slate-400">{tx.date}</td>
                                <td className={`p-4 text-right font-bold font-mono ${tx.type === 'Purchase' ? 'text-emerald-400' : 'text-white'}`}>
                                    {tx.type === 'Purchase' ? '+' : '-'}{tx.amount}
                                </td>
                                <td className="p-4 text-right">
                                    <span className="text-xs font-bold text-emerald-500 bg-emerald-900/20 px-2 py-1 rounded border border-emerald-900/30">
                                        {tx.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mock Buy Modal */}
            <Modal isOpen={showBuyModal} onClose={() => setShowBuyModal(false)} title="Purchase Points">
                <div className="grid grid-cols-2 gap-4">
                    {[100, 250, 500, 1000].map(amt => (
                        <button key={amt} className="p-6 border border-slate-700 rounded-xl hover:bg-blue-600 hover:border-blue-500 hover:text-white transition-all group text-center">
                            <div className="text-2xl font-bold mb-1">{amt} Points</div>
                            <div className="text-slate-400 group-hover:text-blue-200 text-sm mb-4">${amt}.00 USD</div>
                            <div className="text-xs font-bold uppercase tracking-wider bg-slate-800 group-hover:bg-blue-500 px-2 py-1 rounded inline-block">Select</div>
                        </button>
                    ))}
                </div>
            </Modal>
        </div>
    );
};

export default Billing;