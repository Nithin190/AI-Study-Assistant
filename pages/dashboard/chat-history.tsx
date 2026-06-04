import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Trash2, Clock, User, Bot, ChevronDown, Filter, Calendar } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../lib/AuthContext';

export default function ChatHistoryDashboard() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const savedChat = localStorage.getItem('chatHistory');
    if (savedChat) {
      const parsedMsgs = JSON.parse(savedChat);
      
      // Group by date
      const grouped = parsedMsgs.reduce((acc: any, msg: any) => {
        let dateStr = 'Today';
        try {
          const d = new Date(msg.timestamp);
          if (!isNaN(d.getTime())) {
            dateStr = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
            // Very basic "Today" check
            if (d.toDateString() === new Date().toDateString()) dateStr = 'Today';
          }
        } catch(e) {}
        
        if (!acc[dateStr]) acc[dateStr] = [];
        // Extract time
        let timeStr = '12:00 PM';
        try {
          const d = new Date(msg.timestamp);
          if (!isNaN(d.getTime())) {
            timeStr = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
          }
        } catch(e) {}

        acc[dateStr].push({ ...msg, time: timeStr });
        return acc;
      }, {});

      const formattedHistory = Object.keys(grouped).map(date => ({
        date,
        messages: grouped[date]
      }));

      // Reverse so newest is first? Usually chat history is newest at bottom or top depending on UI
      // The original mockup had Today first, then Yesterday. 
      setHistory(formattedHistory.reverse());
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('chatHistory');
    setHistory([]);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8 h-[calc(100vh-100px)] flex flex-col">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-cyan-500" />
              Chat History
            </h1>
            <p className="text-slate-400">Review past conversations, explanations, and generated study materials.</p>
          </div>
          <button onClick={clearHistory} className="btn-secondary text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30">
            <Trash2 className="w-4 h-4" /> Clear History
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search past conversations..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base w-full bg-white/5 border-white/10"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <button className="btn-secondary px-4"><Filter className="w-4 h-4"/> Filter</button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-hide">
          {history.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-4">
              <div className="sticky top-0 z-10 flex items-center gap-4 py-2 bg-[#020008]/90 backdrop-blur-md">
                <div className="h-px bg-white/10 flex-1" />
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> {group.date}
                </div>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              <div className="glass-card divide-y divide-white/5 overflow-hidden">
                {group.messages.map((msg: any) => (
                  <div key={msg.id} className="p-5 hover:bg-white/5 transition-colors">
                    <div className="flex items-start gap-4">
                      {msg.role === 'user' ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs mt-1">
                          {user?.username.charAt(0).toUpperCase() || 'U'}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="w-4 h-4 text-cyan-400" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className={clsx("text-sm font-semibold", msg.role === 'user' ? 'text-purple-300' : 'text-cyan-400')}>
                            {msg.role === 'user' ? (user?.username || 'You') : 'Study Assistant'}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3"/> {msg.time}</span>
                        </div>
                        <p className={clsx(
                          "text-sm whitespace-pre-wrap leading-relaxed", 
                          msg.role === 'user' ? 'text-slate-200 font-medium' : 'text-slate-300'
                        )}>
                          {msg.content || msg.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="py-8 text-center">
            <button className="text-sm text-slate-400 hover:text-white flex items-center justify-center gap-2 mx-auto">
              <ChevronDown className="w-4 h-4" /> Load Older Messages
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
