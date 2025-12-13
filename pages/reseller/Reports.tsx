import React from 'react';
import { BarChart3, Download, Calendar, Map, FileText } from 'lucide-react';
import Button from '../../components/Button';

const Reports: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
        <p className="text-slate-400 text-sm">Export detailed data about your sales and activations</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl">
             <div className="text-slate-400 text-sm mb-2">Total Revenue (Points)</div>
             <div className="text-3xl font-bold text-white">45,200</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl">
             <div className="text-slate-400 text-sm mb-2">Activations (This Month)</div>
             <div className="text-3xl font-bold text-white">142</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl">
             <div className="text-slate-400 text-sm mb-2">Avg. Device per User</div>
             <div className="text-3xl font-bold text-white">1.8</div>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-900/30 rounded-lg text-blue-400">
                      <FileText size={24} />
                  </div>
                  <Button variant="secondary" className="text-xs h-8 px-3">Generate</Button>
              </div>
              <h3 className="font-bold text-white mb-1">Daily Activations Report</h3>
              <p className="text-sm text-slate-400">Detailed list of codes activated in the last 24 hours.</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-purple-900/30 rounded-lg text-purple-400">
                      <Calendar size={24} />
                  </div>
                  <Button variant="secondary" className="text-xs h-8 px-3">Generate</Button>
              </div>
              <h3 className="font-bold text-white mb-1">Monthly Sales Summary</h3>
              <p className="text-sm text-slate-400">Aggregated data of point usage and renewals.</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-emerald-900/30 rounded-lg text-emerald-400">
                      <Map size={24} />
                  </div>
                  <Button variant="secondary" className="text-xs h-8 px-3">Generate</Button>
              </div>
              <h3 className="font-bold text-white mb-1">Geographical Login Map</h3>
              <p className="text-sm text-slate-400">Heatmap of IP locations for user logins.</p>
          </div>

           <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-red-900/30 rounded-lg text-red-400">
                      <BarChart3 size={24} />
                  </div>
                  <Button variant="secondary" className="text-xs h-8 px-3">Generate</Button>
              </div>
              <h3 className="font-bold text-white mb-1">Expired Subscriptions</h3>
              <p className="text-sm text-slate-400">List of users who expired in the last 30 days.</p>
          </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
         <h3 className="font-bold text-white mb-4">Export History</h3>
         <table className="w-full text-left text-sm">
             <thead>
                 <tr className="text-slate-500 border-b border-slate-800">
                     <th className="pb-2">Report Name</th>
                     <th className="pb-2">Date Generated</th>
                     <th className="pb-2">Format</th>
                     <th className="pb-2 text-right">Action</th>
                 </tr>
             </thead>
             <tbody className="divide-y divide-slate-800">
                 <tr>
                     <td className="py-3 text-white">Nov 2024 Sales</td>
                     <td className="py-3 text-slate-400">2024-12-01 09:00</td>
                     <td className="py-3"><span className="bg-green-900/30 text-green-400 px-2 rounded text-xs">Excel</span></td>
                     <td className="py-3 text-right"><button className="text-blue-400 hover:text-white"><Download size={16} /></button></td>
                 </tr>
                  <tr>
                     <td className="py-3 text-white">Daily Activations</td>
                     <td className="py-3 text-slate-400">2024-12-05 14:30</td>
                     <td className="py-3"><span className="bg-red-900/30 text-red-400 px-2 rounded text-xs">PDF</span></td>
                     <td className="py-3 text-right"><button className="text-blue-400 hover:text-white"><Download size={16} /></button></td>
                 </tr>
             </tbody>
         </table>
      </div>
    </div>
  );
};

export default Reports;