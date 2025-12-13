import React, { useState } from 'react';
import { Search, Eye, Smartphone, Power, RefreshCw, Lock, Shield, MapPin, Globe, History } from 'lucide-react';
import { User, UserRole } from '../../types';

const UsersManagement: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Mock Users
  const users: User[] = [
    { id: '1001', email: 'alex@gmail.com', role: UserRole.USER, isActive: true, created_at: '2023-11-15', points: 0, activeDevicesCount: 1, maxDevices: 2, expirationDate: '2024-11-15' },
    { id: '1002', email: 'sarah_j@outlook.com', role: UserRole.USER, isActive: true, created_at: '2024-01-20', points: 0, activeDevicesCount: 3, maxDevices: 3, expirationDate: '2025-01-20' },
    { id: '1003', email: 'mike.t@yahoo.com', role: UserRole.USER, isActive: false, created_at: '2023-05-10', points: 0, activeDevicesCount: 0, maxDevices: 1, expirationDate: '2023-11-10' },
  ];

  const handleBackToList = () => setSelectedUser(null);

  // --- Detailed Profile View ---
  if (selectedUser) {
    return (
        <div className="space-y-6 animate-fade-in">
            <button onClick={handleBackToList} className="text-slate-400 hover:text-white flex items-center gap-2 mb-4">
                &larr; Back to Users List
            </button>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">{selectedUser.email}</h1>
                    <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${selectedUser.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                            {selectedUser.isActive ? 'Active Subscription' : 'Expired / Suspended'}
                        </span>
                        <span className="text-slate-500 text-sm">ID: {selectedUser.id}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-900/20">
                        Extend Subscription
                    </button>
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium border border-slate-700">
                        Edit Settings
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Account Info */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Shield size={18} className="text-purple-400" /> Account Details
                    </h3>
                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span className="text-slate-500">Joined</span>
                            <span className="text-slate-300">{selectedUser.created_at}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span className="text-slate-500">Expires</span>
                            <span className="text-white font-mono">{selectedUser.expirationDate}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span className="text-slate-500">Max Devices</span>
                            <span className="text-slate-300">{selectedUser.maxDevices}</span>
                        </div>
                         <div className="flex justify-between pt-2">
                            <span className="text-slate-500">Last Login IP</span>
                            <span className="text-slate-300 font-mono">192.168.1.1</span>
                        </div>
                    </div>
                </div>

                {/* Devices List */}
                <div className="md:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Smartphone size={18} className="text-blue-400" /> Connected Devices
                    </h3>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
                                <tr>
                                    <th className="p-3 rounded-l-lg">Type</th>
                                    <th className="p-3">Device ID</th>
                                    <th className="p-3">Last Active</th>
                                    <th className="p-3 text-right rounded-r-lg">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {/* Mock Devices */}
                                <tr>
                                    <td className="p-3 text-white">Samsung Tizen</td>
                                    <td className="p-3 text-slate-400 font-mono text-xs">dev-88219...</td>
                                    <td className="p-3 text-slate-400">Just now</td>
                                    <td className="p-3 text-right">
                                        <button className="text-red-400 hover:text-red-300 text-xs font-bold border border-red-900/30 bg-red-900/10 px-2 py-1 rounded">
                                            Disconnect
                                        </button>
                                    </td>
                                </tr>
                                 <tr>
                                    <td className="p-3 text-white">Android TV</td>
                                    <td className="p-3 text-slate-400 font-mono text-xs">dev-55102...</td>
                                    <td className="p-3 text-slate-400">2 days ago</td>
                                    <td className="p-3 text-right">
                                        <button className="text-red-400 hover:text-red-300 text-xs font-bold border border-red-900/30 bg-red-900/10 px-2 py-1 rounded">
                                            Disconnect
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {/* Activity Log */}
             <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <History size={18} className="text-slate-400" /> Recent Activity
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-slate-500 w-32">Today, 10:40 AM</span>
                        <span className="text-slate-300">Logged in from Samsung TV (US)</span>
                    </div>
                     <div className="flex items-center gap-4 text-sm">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-slate-500 w-32">Yesterday</span>
                        <span className="text-slate-300">Subscription extended by Reseller (12 Months)</span>
                    </div>
                </div>
             </div>
        </div>
    );
  }

  // --- List View ---
  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <div>
            <h1 className="text-2xl font-bold text-white">Subscribers</h1>
            <p className="text-slate-400 text-sm">Manage your user base and permissions</p>
            </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
             {/* Toolbar */}
            <div className="p-4 border-b border-slate-800 flex gap-4">
                 <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-blue-500 outline-none" 
                    />
                 </div>
            </div>

            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-900/80 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-4">User</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Expiration</th>
                        <th className="p-4">Devices</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/50 transition-colors group">
                            <td className="p-4">
                                <div className="font-medium text-white">{u.email}</div>
                                <div className="text-xs text-slate-500">ID: {u.id}</div>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold border ${u.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                    {u.isActive ? 'Active' : 'Suspended'}
                                </span>
                            </td>
                            <td className="p-4 text-sm text-slate-300 font-mono">
                                {u.expirationDate}
                            </td>
                            <td className="p-4 text-sm text-slate-300">
                                {u.activeDevicesCount} / {u.maxDevices}
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                     <button 
                                        onClick={() => setSelectedUser(u)}
                                        className="p-2 bg-slate-800 hover:bg-blue-600 hover:text-white rounded text-slate-400 transition-colors"
                                        title="View Profile"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button className="p-2 bg-slate-800 hover:bg-orange-600 hover:text-white rounded text-slate-400 transition-colors" title="Change Password">
                                        <Lock size={16} />
                                    </button>
                                     <button className="p-2 bg-slate-800 hover:bg-red-600 hover:text-white rounded text-slate-400 transition-colors" title="Suspend">
                                        <Power size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default UsersManagement;