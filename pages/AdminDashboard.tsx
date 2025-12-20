import React, { useState } from 'react';
import { Shield, Settings, RefreshCw, Smartphone, DollarSign, Save, CheckCircle } from 'lucide-react';
import Button from '../components/Button';
import { AdminSettings } from '../types';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('settings');
  const [settings, setSettings] = useState<AdminSettings>({
    pointPriceCents: 10000,
    pointsPerUser: 1,
    subscriptionCosts: {
        month1: 1,
        month3: 3,
        month6: 5,
        month12: 10,
        costPerExtraDevice: 1
    },
    allowMultiDevice: false,
    defaultDeviceLimit: 1,
    maintenanceMode: false,
    minAppVersion: '1.0.0',
    tokenExpirationHours: 24
  });
  
  // Mock Data for User Search
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');

  const handleSaveSettings = () => {
    setMessage('Global settings updated successfully.');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUnbindDevice = (email: string) => {
    // In real app: API call to set device_hash = null
    alert(`Device binding removed for ${email}. Next login will prompt for binding.`);
  };

  return (
    <div className="p-8 h-screen overflow-y-auto pb-24">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-red-600 rounded-lg">
            <Shield className="text-white" size={32} />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-white">Admin Console</h1>
            <p className="text-slate-400">System configuration and security override</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-slate-700 pb-1">
        <button 
            onClick={() => setActiveTab('settings')}
            className={`tv-interactive tv-focus px-6 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'settings' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
        >
            Global Settings
        </button>
        <button 
            onClick={() => setActiveTab('users')}
            className={`tv-interactive tv-focus px-6 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'users' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
        >
            User Management
        </button>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-emerald-900/30 border border-emerald-800 text-emerald-400 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} /> {message}
        </div>
      )}

      {activeTab === 'settings' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <DollarSign className="text-emerald-400" />
                    Economy Configuration
                </h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Price per Point (Cents)</label>
                        <input 
                            type="number" 
                            value={settings.pointPriceCents}
                            onChange={(e) => setSettings({...settings, pointPriceCents: parseInt(e.target.value)})}
                            className="tv-interactive tv-focus w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                        />
                        <p className="text-xs text-slate-500 mt-1">Current: ${(settings.pointPriceCents / 100).toFixed(2)} USD</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Points Required per User</label>
                        <input 
                            type="number" 
                            value={settings.pointsPerUser}
                            onChange={(e) => setSettings({...settings, pointsPerUser: parseInt(e.target.value)})}
                            className="tv-interactive tv-focus w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Smartphone className="text-blue-400" />
                    Device Policy
                </h3>
                
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
                        <span className="text-white">Allow Multi-Device (Global)</span>
                        <div 
                            className={`w-12 h-6 rounded-full relative cursor-pointer ${settings.allowMultiDevice ? 'bg-green-600' : 'bg-slate-600'}`}
                            onClick={() => setSettings({...settings, allowMultiDevice: !settings.allowMultiDevice})}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.allowMultiDevice ? 'left-7' : 'left-1'}`} />
                        </div>
                    </div>
                </div>
                
                <div className="mt-8">
                    <Button onClick={handleSaveSettings} block className="gap-2">
                        <Save size={20} /> Save Changes
                    </Button>
                </div>
            </div>
        </div>
      ) : (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="flex gap-4 mb-6">
                <input 
                    type="text" 
                    placeholder="Search user by email or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="tv-interactive tv-focus flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                />
                <Button>Search</Button>
            </div>

            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-sm">
                        <th className="pb-3">User</th>
                        <th className="pb-3">Role</th>
                        <th className="pb-3">Device Status</th>
                        <th className="pb-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    <tr className="group">
                        <td className="py-4 text-white">demo@tvapp.com</td>
                        <td className="py-4 text-slate-300">Reseller</td>
                        <td className="py-4">
                            <span className="bg-emerald-900/50 text-emerald-400 px-2 py-1 rounded text-xs border border-emerald-800">
                                Bound
                            </span>
                        </td>
                        <td className="py-4 text-right">
                            <button 
                                onClick={() => handleUnbindDevice('demo@tvapp.com')}
                                className="tv-interactive tv-focus text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1 justify-end ml-auto"
                            >
                                <RefreshCw size={14} /> Unbind Device
                            </button>
                        </td>
                    </tr>
                    {/* Fake Data */}
                    <tr className="group">
                        <td className="py-4 text-white">client_x@example.com</td>
                        <td className="py-4 text-slate-300">User</td>
                        <td className="py-4">
                            <span className="bg-emerald-900/50 text-emerald-400 px-2 py-1 rounded text-xs border border-emerald-800">
                                Bound
                            </span>
                        </td>
                        <td className="py-4 text-right">
                             <button 
                                onClick={() => handleUnbindDevice('client_x@example.com')}
                                className="tv-interactive tv-focus text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1 justify-end ml-auto"
                            >
                                <RefreshCw size={14} /> Unbind Device
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;