import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { MOCK_ANALYTICS, MOCK_LEADERBOARD } from '../../lib/mockData';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Target, Clock, Zap, CheckCircle, Award, Calendar, Activity } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const [dateRange, setDateRange] = useState('7d');

  // Generate mock heatmap data (7 weeks * 7 days)
  const heatmapData = Array.from({ length: 49 }, (_, i) => ({
    id: i,
    intensity: Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0
  }));

  const topicPerformance = [
    { topic: 'Bayesian Knowledge Tracing', attempts: 15, correct: 12, acc: 80 },
    { topic: 'Hybrid RAG', attempts: 20, correct: 15, acc: 75 },
    { topic: 'Spaced Repetition', attempts: 10, correct: 9, acc: 90 },
    { topic: 'Mistake Engine', attempts: 8, correct: 4, acc: 50 },
    { topic: 'Knowledge Graph', attempts: 12, correct: 5, acc: 41 },
  ].sort((a, b) => b.acc - a.acc);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-cyan-500" />
              Performance Analytics
            </h1>
            <p className="text-slate-400">Track your learning velocity and quiz accuracy over time.</p>
          </div>
          <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
            {['7d', '30d', 'All'].map(r => (
              <button 
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${dateRange === r ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 border-blue-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity"><Target className="w-24 h-24 text-blue-500" /></div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/20"><Target className="w-4 h-4 text-blue-400" /></div>
              <div className="text-sm font-medium text-slate-400">Total Quizzes</div>
            </div>
            <div className="text-3xl font-display font-bold text-white">{MOCK_ANALYTICS.totalQuizzes}</div>
            <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +12 this week</div>
          </div>
          
          <div className="glass-card p-5 border-emerald-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity"><CheckCircle className="w-24 h-24 text-emerald-500" /></div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/20"><CheckCircle className="w-4 h-4 text-emerald-400" /></div>
              <div className="text-sm font-medium text-slate-400">Avg Accuracy</div>
            </div>
            <div className="text-3xl font-display font-bold text-white">{MOCK_ANALYTICS.avgAccuracy}%</div>
            <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +4% from last week</div>
          </div>

          <div className="glass-card p-5 border-purple-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity"><Clock className="w-24 h-24 text-purple-500" /></div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/20"><Clock className="w-4 h-4 text-purple-400" /></div>
              <div className="text-sm font-medium text-slate-400">Study Sessions</div>
            </div>
            <div className="text-3xl font-display font-bold text-white">{MOCK_ANALYTICS.studySessions}</div>
            <div className="text-xs text-slate-500 mt-2">Across 4 subjects</div>
          </div>

          <div className="glass-card p-5 border-amber-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity"><Zap className="w-24 h-24 text-amber-500" /></div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-amber-500/20"><Zap className="w-4 h-4 text-amber-400" /></div>
              <div className="text-sm font-medium text-slate-400">Current Streak</div>
            </div>
            <div className="text-3xl font-display font-bold text-white">7 days</div>
            <div className="text-xs text-slate-500 mt-2">Personal best: 14 days</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Main Line Chart */}
          <div className="lg:col-span-2 glass-card p-6 h-[350px] flex flex-col">
            <h2 className="text-lg font-semibold text-white mb-4">Accuracy Over Time</h2>
            <div className="flex-1 w-full min-h-0">
              {isClient && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MOCK_ANALYTICS.quizHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={(val) => val.split('-')[2]} tickMargin={10} />
                    <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} tickCount={6} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 10, 25, 0.95)', borderColor: 'rgba(124, 58, 237, 0.3)', borderRadius: '12px' }}
                      itemStyle={{ color: '#a78bfa', fontWeight: 'bold' }}
                      labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#7C3AED" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#020008', stroke: '#7C3AED', strokeWidth: 2 }} 
                      activeDot={{ r: 6, fill: '#c4b5fd', stroke: '#7C3AED' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Side Column */}
          <div className="space-y-6 flex flex-col">
            
            {/* Difficulty Bar Chart */}
            <div className="glass-card p-6 flex-1 flex flex-col min-h-[160px]">
              <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">By Difficulty</h2>
              <div className="flex-1 w-full min-h-0">
                {isClient && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_ANALYTICS.byDifficulty} layout="vertical" margin={{ top: 0, right: 20, left: -10, bottom: 0 }} barSize={16}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis type="number" hide domain={[0, 100]} />
                      <YAxis type="category" dataKey="difficulty" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'rgba(15, 10, 25, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                      <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                        {MOCK_ANALYTICS.byDifficulty.map((entry, index) => {
                          const colors = ['#10b981', '#f59e0b', '#ef4444'];
                          return <Cell key={`cell-${index}`} fill={colors[index]} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Heatmap */}
            <div className="glass-card p-6">
              <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2"><Calendar className="w-4 h-4"/> Activity Heatmap</h2>
              <div className="flex flex-col gap-1 items-end">
                <div className="grid grid-cols-[repeat(7,1fr)] gap-1 w-full">
                  {heatmapData.slice(0, 49).map((cell, i) => {
                    const colors = [
                      'bg-white/5',           // 0
                      'bg-purple-500/30',     // 1
                      'bg-purple-500/60',     // 2
                      'bg-purple-500/80',     // 3
                      'bg-purple-400'         // 4
                    ];
                    return (
                      <div 
                        key={i} 
                        className={`heatmap-cell rounded-sm ${colors[cell.intensity]} cursor-pointer`}
                        title={`${cell.intensity > 0 ? cell.intensity * 2 + ' quizzes' : 'No activity'}`}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-2">
                  <span>Less</span>
                  <div className="flex gap-0.5 mx-1">
                    <div className="w-2 h-2 rounded-sm bg-white/5" />
                    <div className="w-2 h-2 rounded-sm bg-purple-500/30" />
                    <div className="w-2 h-2 rounded-sm bg-purple-500/60" />
                    <div className="w-2 h-2 rounded-sm bg-purple-500/80" />
                    <div className="w-2 h-2 rounded-sm bg-purple-400" />
                  </div>
                  <span>More</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Topic Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b border-white/10 bg-white/5">
            <h2 className="text-lg font-semibold text-white">Topic Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-black/20">
                <tr>
                  <th className="px-6 py-4 font-medium">Topic</th>
                  <th className="px-6 py-4 font-medium">Attempts</th>
                  <th className="px-6 py-4 font-medium">Correct</th>
                  <th className="px-6 py-4 font-medium">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {topicPerformance.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">{row.topic}</td>
                    <td className="px-6 py-4 text-slate-400">{row.attempts}</td>
                    <td className="px-6 py-4 text-slate-400">{row.correct}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`font-mono font-medium ${row.acc >= 70 ? 'text-emerald-400' : row.acc >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>{row.acc}%</span>
                        <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className={`h-full rounded-full ${row.acc >= 70 ? 'bg-emerald-500' : row.acc >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${row.acc}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
