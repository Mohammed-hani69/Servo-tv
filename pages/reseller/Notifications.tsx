import React from 'react';
import { Bell, Check, Info, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { ResellerNotification } from '../../types';

const Notifications: React.FC = () => {
  const notifications: ResellerNotification[] = [
    { id: '1', title: 'Points Purchase Successful', message: 'You have successfully purchased 500 points.', type: 'success', date: '10 mins ago', read: false },
    { id: '2', title: 'User Expiration Warning', message: 'User (alex@gmail.com) subscription is expiring in 24 hours.', type: 'warning', date: '2 hours ago', read: false },
    { id: '3', title: 'System Maintenance', message: 'The dashboard will be undergoing maintenance at 03:00 UTC.', type: 'info', date: '1 day ago', read: true },
    { id: '4', title: 'Failed Activation Attempt', message: 'Multiple failed login attempts detected for Code A8B9...', type: 'error', date: '2 days ago', read: true },
  ];

  const getIcon = (type: string) => {
      switch(type) {
          case 'success': return <Check className="text-emerald-400" size={20} />;
          case 'warning': return <AlertTriangle className="text-orange-400" size={20} />;
          case 'error': return <XCircle className="text-red-400" size={20} />;
          default: return <Info className="text-blue-400" size={20} />;
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
       <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-slate-400 text-sm">Stay updated with system alerts and user activities</p>
        </div>
        <button className="text-sm text-blue-400 hover:text-white">Mark all as read</button>
      </div>

      <div className="space-y-4">
          {notifications.map(notif => (
              <div key={notif.id} className={`p-4 rounded-xl border flex items-start gap-4 transition-colors ${notif.read ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-800 border-slate-700 shadow-lg'}`}>
                   <div className={`p-2 rounded-full shrink-0 ${notif.read ? 'bg-slate-800' : 'bg-slate-700'}`}>
                       {getIcon(notif.type)}
                   </div>
                   <div className="flex-1">
                       <div className="flex justify-between items-start">
                           <h3 className={`font-bold ${notif.read ? 'text-slate-300' : 'text-white'}`}>{notif.title}</h3>
                           <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12} /> {notif.date}</span>
                       </div>
                       <p className="text-sm text-slate-400 mt-1">{notif.message}</p>
                   </div>
                   {!notif.read && (
                       <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                   )}
              </div>
          ))}
      </div>
    </div>
  );
};

export default Notifications;