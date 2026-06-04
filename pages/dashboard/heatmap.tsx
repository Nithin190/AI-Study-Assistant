import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Flame, Target, TrendingDown, BarChart2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export default function HeatmapDashboard() {
  const topics = ['Bayesian Knowledge Tracing', 'Hybrid RAG', 'Spaced Repetition', 'Mistake Engine', 'Knowledge Graph', 'Evaluation Metrics'];
  
  // 6 topics x 7 days
  const data = topics.map(t => ({
    topic: t,
    days: Array.from({ length: 7 }, () => Math.random() * 100)
  }));

  const getHeatColor = (val: number) => {
    if (val > 80) return 'bg-emerald-500';
    if (val > 60) return 'bg-lime-500';
    if (val > 40) return 'bg-amber-500';
    if (val > 20) return 'bg-orange-500';
    return 'bg-rose-500';
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-500" />
              Weakness Heatmap
            </h1>
            <p className="text-slate-400">Identify knowledge gaps across topics over the past 7 days.</p>
          </div>
          <button className="btn-primary shadow-glow-purple"><Target className="w-4 h-4"/> Practice Weak Topics</button>
        </div>

        {/* Heatmap Grid */}
        <div className="glass-strong p-8 rounded-3xl overflow-x-auto mb-8">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-[200px_repeat(7,1fr)] gap-2 mb-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
              <div className="text-left">Topic</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
              <div>Sun</div>
            </div>
            
            <div className="space-y-2">
              {data.map((row, i) => (
                <div key={i} className="grid grid-cols-[200px_repeat(7,1fr)] gap-2 items-center">
                  <div className="text-sm font-medium text-slate-200 truncate pr-4">{row.topic}</div>
                  {row.days.map((val, j) => (
                    <motion.div 
                      key={j}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: (i * 0.1) + (j * 0.05) }}
                      className="group relative"
                    >
                      <div className={clsx("h-10 rounded-lg w-full transition-all hover:scale-110 border border-black/20", getHeatColor(val))} style={{ opacity: Math.max(0.3, val / 100) }} />
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-[#020008] border border-white/10 rounded-lg shadow-xl text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 flex flex-col items-center">
                        <span className="text-slate-400 mb-0.5">{Math.round(val)}% Accuracy</span>
                        <div className="w-2 h-2 bg-[#020008] border-b border-r border-white/10 absolute -bottom-1 rotate-45" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end items-center gap-2 mt-8 text-xs font-medium text-slate-400">
              <span className="text-rose-500">Needs Work</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-rose-500 opacity-50" />
                <div className="w-4 h-4 rounded bg-orange-500 opacity-60" />
                <div className="w-4 h-4 rounded bg-amber-500 opacity-70" />
                <div className="w-4 h-4 rounded bg-lime-500 opacity-80" />
                <div className="w-4 h-4 rounded bg-emerald-500 opacity-90" />
              </div>
              <span className="text-emerald-500">Mastered</span>
            </div>
          </div>
        </div>

        {/* Priority Action Area */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card p-6 border-rose-500/30">
            <h3 className="font-semibold text-rose-400 mb-4 flex items-center gap-2"><TrendingDown className="w-5 h-5"/> Highest Priority</h3>
            <ul className="space-y-3">
              <li className="flex justify-between items-center bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                <span className="font-medium text-slate-200">Knowledge Graph</span>
                <span className="badge badge-rose">38%</span>
              </li>
              <li className="flex justify-between items-center bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                <span className="font-medium text-slate-200">Mistake Engine</span>
                <span className="badge badge-rose">45%</span>
              </li>
            </ul>
          </div>
          <div className="glass-card p-6 border-amber-500/30 text-center flex flex-col justify-center items-center">
             <AlertCircle className="w-12 h-12 text-amber-500 mb-3" />
             <h3 className="font-bold text-white text-lg mb-2">Attention Required</h3>
             <p className="text-slate-400 text-sm mb-4">You have consistently scored below 50% on Knowledge Graphs for the last 3 days.</p>
             <button className="btn-secondary text-amber-400 hover:bg-amber-500/10 border-amber-500/30">Generate Targeted Quiz</button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
