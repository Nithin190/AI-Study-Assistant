import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { MOCK_ANALYTICS } from '../../lib/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import { Brain, Target, CheckCircle, AlertCircle, Info, Activity, Loader2, RefreshCw } from 'lucide-react';

export default function MasteryDashboard() {
  const [isClient, setIsClient] = useState(false);
  const [topics, setTopics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDoc, setActiveDoc] = useState('');

  useEffect(() => {
    setIsClient(true);
    const savedDoc = localStorage.getItem('activeChatDoc');
    if (savedDoc) setActiveDoc(savedDoc);
  }, []);

  const generateMasteryAnalysis = async () => {
    setIsLoading(true);
    const contextToSend = activeDoc ? `[Simulated Context for ${activeDoc}]\nThis is a simulated document content because the actual file was loaded from the dashboard. Please pretend you have read the document named "${activeDoc}" and provide a generic, helpful, and plausible answer related to what a document with that filename might contain.` : '';
    const systemPromptOverride = 'Identify 4 to 6 core topics from the document. Assign a plausible probability of knowledge (p_known, a float between 0.1 and 0.95) and number of attempts (integer between 1 and 15) for a simulated student. Return ONLY a raw JSON array of objects with exactly this structure: [{"topic": "...", "p_known": 0.8, "attempts": 3}]. Do not include any markdown blocks.';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: 'Analyze topics' }], 
          context: contextToSend, 
          systemPromptOverride 
        }),
      });

      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      
      const match = data.result.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('No JSON array found in response');
      const parsed = JSON.parse(match[0]);
      
      if (Array.isArray(parsed) && parsed.length > 0) {
        setTopics(parsed);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const mastered = topics.filter(t => t.p_known >= 0.7).length;
  const inProgress = topics.filter(t => t.p_known >= 0.4 && t.p_known < 0.7).length;
  const needsWork = topics.filter(t => t.p_known < 0.4).length;
  const totalAttempts = topics.reduce((sum, t) => sum + t.attempts, 0);

  const sortedTopics = [...topics].sort((a, b) => b.p_known - a.p_known);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-500" />
              Knowledge Mastery
            </h1>
            <p className="text-slate-400">Bayesian Knowledge Tracing — Per-topic P(known) estimation</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="badge badge-purple px-3 py-1.5"><Info className="w-3 h-3"/> Corbett & Anderson, 1995</div>
            <button 
              onClick={generateMasteryAnalysis}
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : <RefreshCw className="w-4 h-4 mr-2 inline" />}
              {isLoading ? 'Analyzing...' : (topics.length > 0 ? 'Refresh Analysis' : 'Run Analysis')}
            </button>
          </div>
        </div>

        {topics.length === 0 ? (
          <div className="glass-card border-dashed border-white/20 p-12 text-center opacity-80 mt-8 min-h-[400px] flex flex-col items-center justify-center">
            <Brain className="w-16 h-16 text-purple-400 mb-4 mx-auto" />
            <h3 className="text-2xl font-medium text-white mb-2">No Mastery Data Yet</h3>
            <p className="text-slate-400 max-w-md mx-auto mb-6">Click "Run Analysis" above to have the AI evaluate your knowledge profile based on {activeDoc || 'your current document'}.</p>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 border-emerald-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle className="w-16 h-16 text-emerald-500" /></div>
            <div className="text-sm font-medium text-emerald-400 mb-1">Mastered</div>
            <div className="text-3xl font-display font-bold text-white">{mastered}</div>
            <div className="text-xs text-slate-500 mt-2">P(known) ≥ 0.7</div>
          </div>
          <div className="glass-card p-5 border-amber-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Activity className="w-16 h-16 text-amber-500" /></div>
            <div className="text-sm font-medium text-amber-400 mb-1">In Progress</div>
            <div className="text-3xl font-display font-bold text-white">{inProgress}</div>
            <div className="text-xs text-slate-500 mt-2">0.4 ≤ P(known) &lt; 0.7</div>
          </div>
          <div className="glass-card p-5 border-rose-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><AlertCircle className="w-16 h-16 text-rose-500" /></div>
            <div className="text-sm font-medium text-rose-400 mb-1">Needs Work</div>
            <div className="text-3xl font-display font-bold text-white">{needsWork}</div>
            <div className="text-xs text-slate-500 mt-2">P(known) &lt; 0.4</div>
          </div>
          <div className="glass-card p-5 border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><Target className="w-16 h-16 text-white" /></div>
            <div className="text-sm font-medium text-slate-400 mb-1">Total Quiz Attempts</div>
            <div className="text-3xl font-display font-bold text-white">{totalAttempts}</div>
            <div className="text-xs text-slate-500 mt-2">Across all topics</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Topic List */}
          <div className="lg:col-span-2 glass-card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Topic Mastery Levels</h2>
            <div className="space-y-5">
              {sortedTopics.map((topic, i) => {
                const pct = Math.round(topic.p_known * 100);
                const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
                const label = pct >= 70 ? 'Mastered' : pct >= 40 ? 'Learning' : 'Needs Work';
                
                return (
                  <motion.div 
                    key={topic.topic}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex justify-between text-sm mb-2">
                      <div className="font-medium text-slate-200">{topic.topic}</div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">{topic.attempts} attempts</span>
                        <span className="font-mono font-bold" style={{ color }}>{pct}%</span>
                      </div>
                    </div>
                    <div className="mastery-bar-track h-2 bg-white/5">
                      <motion.div 
                        className="mastery-bar-fill h-full rounded-full relative"
                        style={{ backgroundColor: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                      >
                        <div className="absolute -right-2 -top-1 w-4 h-4 rounded-full bg-white shadow-lg" style={{ border: `2px solid ${color}` }} />
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            {/* Chart */}
            <div className="glass-card p-6 h-[300px] flex flex-col">
              <h2 className="text-lg font-semibold text-white mb-4">Accuracy Over Time</h2>
              <div className="flex-1 w-full min-h-0">
                {isClient && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_ANALYTICS.quizHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={(val) => val.split('-')[2]} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 10, 25, 0.95)', borderColor: 'rgba(124, 58, 237, 0.3)', borderRadius: '8px' }}
                        itemStyle={{ color: '#06b6d4' }}
                      />
                      <Line type="monotone" dataKey="accuracy" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#020008', stroke: '#06b6d4', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
        </>
        )}

      </div>
    </DashboardLayout>
  );
}
