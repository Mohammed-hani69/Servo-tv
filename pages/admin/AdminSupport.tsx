import React, { useState } from 'react';
import { Ticket, Search, Filter, MessageSquare, Paperclip, Send, StickyNote, AlertCircle, Shield } from 'lucide-react';
import Button from '../../components/Button';
import { Ticket as TicketType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminSupport: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [internalNote, setInternalNote] = useState('');
  const [reply, setReply] = useState('');

  // Mock Tickets Data
  const [tickets, setTickets] = useState<TicketType[]>([
    { 
        id: 'T-1001', 
        distributorName: 'Alpha Stream',
        subject: 'Cannot generate codes for 12 months', 
        status: 'Open', 
        priority: 'High', 
        lastUpdate: '2024-03-20',
        internalNotes: 'Checked logs, API error 500 on endpoint /codes',
        messages: [
            { sender: 'Alpha Stream', text: 'I am getting an error when trying to generate 12 month codes.', date: '2024-03-20 10:00' },
            { sender: 'System', text: 'Ticket Created.', date: '2024-03-20 10:00', isInternal: true }
        ]
    },
    { 
        id: 'T-1002', 
        distributorName: 'Beta IPTV',
        subject: 'Request for point refund', 
        status: 'In Progress', 
        priority: 'Medium', 
        lastUpdate: '2024-03-19',
        messages: [
            { sender: 'Beta IPTV', text: 'I accidentally bought too many points.', date: '2024-03-19 14:00' },
            { sender: 'Admin', text: 'We are reviewing your transaction history.', date: '2024-03-19 14:30' }
        ]
    },
    { 
        id: 'T-1003', 
        distributorName: 'Gamma Reseller',
        subject: 'User login issue', 
        status: 'Closed', 
        priority: 'Low', 
        lastUpdate: '2024-03-18',
        messages: [] 
    }
  ]);

  const handleSaveInternalNote = () => {
      if(!selectedTicket) return;
      const updatedTickets = tickets.map(t => 
          t.id === selectedTicket.id ? { ...t, internalNotes: internalNote } : t
      );
      setTickets(updatedTickets);
      setSelectedTicket({ ...selectedTicket, internalNotes: internalNote });
      alert('Internal note saved.');
  };

  const handleSendReply = () => {
      if(!selectedTicket || !reply.trim()) return;
      const newMessage = { sender: 'Admin', text: reply, date: new Date().toISOString().slice(0, 16).replace('T', ' ') };
      const updatedTickets = tickets.map(t => 
        t.id === selectedTicket.id 
            ? { ...t, messages: [...t.messages, newMessage] } 
            : t
      );
      setTickets(updatedTickets);
      setSelectedTicket({ ...selectedTicket, messages: [...selectedTicket.messages, newMessage] });
      setReply('');
  };

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('support_center')}</h1>
          <p className="text-slate-400 text-sm">{t('support_desc')}</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Ticket List (Sidebar) */}
        <div className="w-1/3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 space-y-3">
                <div className="relative">
                    <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-500`} size={16} />
                    <input 
                        type="text" 
                        placeholder={t('search_tickets')} 
                        className={`w-full bg-slate-950 border border-slate-800 rounded-lg py-2 text-sm text-white focus:border-red-500 outline-none ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`} 
                    />
                </div>
                <div className="flex gap-2 text-xs">
                    <button className="flex-1 py-1.5 bg-slate-800 text-slate-300 rounded hover:text-white">{t('filter_all')}</button>
                    <button className="flex-1 py-1.5 bg-slate-800 text-slate-300 rounded hover:text-white">{t('status_open')}</button>
                    <button className="flex-1 py-1.5 bg-slate-800 text-slate-300 rounded hover:text-white">{t('priority_high')}</button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                {tickets.map(ticket => (
                    <button 
                        key={ticket.id}
                        onClick={() => { setSelectedTicket(ticket); setInternalNote(ticket.internalNotes || ''); }}
                        className={`w-full text-start p-4 border-b border-slate-800 hover:bg-slate-800 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-slate-800 border-l-4 border-l-red-500' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-mono text-xs text-slate-500">#{ticket.id}</span>
                            <div className="flex gap-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                    ticket.priority === 'High' ? 'bg-red-900/50 text-red-400' :
                                    ticket.priority === 'Medium' ? 'bg-orange-900/50 text-orange-400' :
                                    'bg-blue-900/50 text-blue-400'
                                }`}>{ticket.priority}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                    ticket.status === 'Open' ? 'bg-green-900/50 text-green-400' :
                                    ticket.status === 'In Progress' ? 'bg-blue-900/50 text-blue-400' :
                                    'bg-slate-700 text-slate-400'
                                }`}>{ticket.status}</span>
                            </div>
                        </div>
                        <div className="font-bold text-white text-sm mb-1 line-clamp-1">{ticket.subject}</div>
                        <div className="flex justify-between items-center text-xs text-slate-400">
                            <span>{ticket.distributorName}</span>
                            <span>{ticket.lastUpdate}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>

        {/* Ticket Detail (Main Panel) */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
            {selectedTicket ? (
                <>
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800 bg-slate-900 flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">{selectedTicket.subject}</h2>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <Ticket size={14} /> Ticket #{selectedTicket.id} 
                                <span className="mx-2">•</span> 
                                <span className="text-white">{selectedTicket.distributorName}</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                             <select 
                                className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 outline-none"
                                defaultValue={selectedTicket.priority}
                             >
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                             </select>
                             <select 
                                className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 outline-none"
                                defaultValue={selectedTicket.status}
                             >
                                <option>Open</option>
                                <option>In Progress</option>
                                <option>Closed</option>
                             </select>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Internal Notes Section */}
                            <div className="bg-yellow-900/10 border border-yellow-700/30 p-4 rounded-xl">
                                <h4 className="text-xs font-bold text-yellow-500 uppercase mb-2 flex items-center gap-2">
                                    <StickyNote size={12} /> {t('internal_notes')} <span className="text-slate-500 normal-case font-normal">({t('internal_notes_desc')})</span>
                                </h4>
                                <textarea 
                                    className="w-full bg-slate-950/50 border border-yellow-900/30 rounded-lg p-2 text-sm text-slate-300 focus:border-yellow-600 outline-none"
                                    rows={2}
                                    placeholder={t('internal_notes_placeholder')}
                                    value={internalNote}
                                    onChange={(e) => setInternalNote(e.target.value)}
                                />
                                <div className="flex justify-end mt-2">
                                    <button onClick={handleSaveInternalNote} className="text-xs bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-500 px-3 py-1 rounded transition-colors">{t('save_note')}</button>
                                </div>
                            </div>

                            {/* Chat History */}
                            {selectedTicket.messages.map((msg, i) => (
                                <div key={i} className={`flex flex-col ${msg.sender === 'Admin' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-xl shadow-md ${
                                        msg.sender === 'Admin' ? 'bg-blue-600 text-white rounded-br-none' : 
                                        msg.isInternal ? 'bg-slate-800 text-slate-400 italic border border-slate-700' :
                                        'bg-slate-800 text-slate-200 rounded-bl-none'
                                    }`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                    <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                        {msg.sender === 'Admin' && <Shield size={10} />} {msg.sender} • {msg.date}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Reply Area */}
                        <div className="p-4 border-t border-slate-800 bg-slate-900">
                             <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex flex-col">
                                <textarea 
                                    className="bg-transparent text-white text-sm p-2 outline-none h-20 resize-none"
                                    placeholder={t('ticket_reply')}
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                />
                                <div className="flex justify-between items-center px-2 pb-1">
                                    <button className="text-slate-500 hover:text-white"><Paperclip size={18} /></button>
                                    <Button onClick={handleSendReply} className="h-8 px-4 text-xs gap-1">
                                        {t('send_reply')} <Send size={12} className={isRTL ? 'rotate-180' : ''} />
                                    </Button>
                                </div>
                             </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                    <MessageSquare size={64} className="mb-6 opacity-20" />
                    <p className="text-lg">{t('select_ticket')}</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupport;