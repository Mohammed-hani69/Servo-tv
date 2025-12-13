import React, { useState } from 'react';
import { MessageSquare, Plus, Paperclip, Send } from 'lucide-react';
import { Ticket } from '../../types';
import Modal from '../../components/Modal';
import Button from '../../components/Button';

const Support: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Mock Tickets
  const tickets: Ticket[] = [
    { 
        id: 'T-1001', 
        subject: 'Cannot generate codes for 12 months', 
        status: 'In Progress', 
        priority: 'High', 
        lastUpdate: '2024-03-15',
        messages: [
            { sender: 'You', text: 'I am getting an error when trying to generate 12 month codes.', date: '2024-03-14 10:00' },
            { sender: 'Admin', text: 'We are investigating this issue. Please hold on.', date: '2024-03-15 09:00' }
        ]
    },
    { 
        id: 'T-1002', 
        subject: 'Request for point refund', 
        status: 'Closed', 
        priority: 'Medium', 
        lastUpdate: '2024-03-10',
        messages: [] 
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Center</h1>
          <p className="text-slate-400 text-sm">Get help directly from the administration team</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus size={18} /> Open Ticket
        </Button>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Ticket List */}
        <div className="w-1/3 bg-slate-900/50 border border-slate-800 rounded-xl overflow-y-auto">
            {tickets.map(ticket => (
                <button 
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full text-left p-4 border-b border-slate-800 hover:bg-slate-800 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-slate-800 border-l-4 border-l-blue-500' : ''}`}
                >
                    <div className="flex justify-between items-start mb-1">
                        <span className="font-mono text-xs text-slate-500">#{ticket.id}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            ticket.status === 'Open' ? 'bg-green-900/50 text-green-400' :
                            ticket.status === 'In Progress' ? 'bg-blue-900/50 text-blue-400' :
                            'bg-slate-700 text-slate-400'
                        }`}>{ticket.status}</span>
                    </div>
                    <div className="font-bold text-white text-sm mb-1 line-clamp-1">{ticket.subject}</div>
                    <div className="text-xs text-slate-400">{ticket.lastUpdate}</div>
                </button>
            ))}
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
            {selectedTicket ? (
                <>
                    <div className="p-4 border-b border-slate-800 bg-slate-900">
                        <h3 className="font-bold text-white">{selectedTicket.subject}</h3>
                        <div className="text-xs text-slate-400 mt-1">Ticket #{selectedTicket.id} • {selectedTicket.priority} Priority</div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {selectedTicket.messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-xl ${msg.sender === 'You' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                                <span className="text-[10px] text-slate-500 mt-1">{msg.date} • {msg.sender}</span>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-slate-800 bg-slate-900 flex gap-2">
                        <button className="p-3 text-slate-400 hover:text-white bg-slate-800 rounded-lg">
                            <Paperclip size={20} />
                        </button>
                        <input 
                            type="text" 
                            placeholder="Type your message..." 
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 text-white focus:border-blue-500 outline-none"
                        />
                        <button className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg">
                            <Send size={20} />
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                    <MessageSquare size={48} className="mb-4 opacity-20" />
                    <p>Select a ticket to view the conversation</p>
                </div>
            )}
        </div>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Support Ticket">
          <form className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Subject</label>
                  <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Priority</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Message</label>
                  <textarea className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white h-32"></textarea>
              </div>
              <Button block>Submit Ticket</Button>
          </form>
      </Modal>
    </div>
  );
};

export default Support;