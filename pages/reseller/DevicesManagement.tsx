import React, { useState } from 'react';
import { Search, Monitor, Smartphone, Ban, Unlock, Trash2, Filter } from 'lucide-react';
import { Device } from '../../types';

const DevicesManagement: React.FC = () => {
  const [filter, setFilter] = useState('All');

  // Mock Devices
  const devices: Device[] = [
    { id: '1', deviceId: 'dev-9988-sams', userId: 'u-1001', userName: 'Alex Doe', platform: 'Samsung Tizen', appVersion: '2.1.0', lastLogin: '2024-03-15 10:30', ip: '192.168.1.44', status: 'Active' },
    { id: '2', deviceId: 'dev-7766-lgos', userId: 'u-1002', userName: 'Sarah Smith', platform: 'LG WebOS', appVersion: '2.0.5', lastLogin: '2024-03-14 22:15', ip: '10.0.0.5', status: 'Active' },
    { id: '3', deviceId: 'dev-5544-andr', userId: 'u-1003', userName: 'Mike T', platform: 'Android TV', appVersion: '2.1.0', lastLogin: '2024-03-10 09:00', ip: '172.16.0.1', status: 'Blocked' },
    { id: '4', deviceId: 'dev-3322-appl', userId: 'u-1001', userName: 'Alex Doe', platform: 'Apple TV', appVersion: '2.1.0', lastLogin: '2024-03-15 11:00', ip: '192.168.1.45', status: 'Active' },
  ];

  const getIcon = (platform: string) => {
    if (platform.includes('Android') || platform.includes('Apple')) return <Smartphone size={18} />;
    return <Monitor size={18} />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Devices Management</h1>
          <p className="text-slate-400 text-sm">Monitor and control connected devices across your user base</p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Search by Device ID, User, or IP..." 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-blue-500 outline-none" 
                />
            </div>
            <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-500" />
                <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 outline-none"
                >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Blocked">Blocked</option>
                </select>
            </div>
        </div>

        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-900/80 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Device Info</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Platform</th>
                    <th className="p-4">Last Login</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {devices.map((dev) => (
                    <tr key={dev.id} className="hover:bg-slate-800/50 transition-colors group">
                        <td className="p-4">
                            <div className="font-mono text-sm text-white">{dev.deviceId}</div>
                            <div className="text-xs text-slate-500">IP: {dev.ip}</div>
                        </td>
                        <td className="p-4 text-sm text-slate-300">
                            <div className="font-medium text-white">{dev.userName}</div>
                            <div className="text-xs text-slate-500">ID: {dev.userId}</div>
                        </td>
                        <td className="p-4">
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                {getIcon(dev.platform)}
                                <span>{dev.platform}</span>
                                <span className="text-xs bg-slate-800 px-1.5 rounded text-slate-500">{dev.appVersion}</span>
                            </div>
                        </td>
                        <td className="p-4 text-sm text-slate-400">
                            {dev.lastLogin}
                        </td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold border ${dev.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                {dev.status}
                            </span>
                        </td>
                        <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {dev.status === 'Active' ? (
                                    <button title="Block" className="p-2 bg-slate-800 hover:bg-orange-600 hover:text-white rounded text-slate-400 transition-colors">
                                        <Ban size={16} />
                                    </button>
                                ) : (
                                    <button title="Unblock" className="p-2 bg-slate-800 hover:bg-emerald-600 hover:text-white rounded text-slate-400 transition-colors">
                                        <Unlock size={16} />
                                    </button>
                                )}
                                <button title="Force Logout / Remove" className="p-2 bg-slate-800 hover:bg-red-600 hover:text-white rounded text-slate-400 transition-colors">
                                    <Trash2 size={16} />
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

export default DevicesManagement;