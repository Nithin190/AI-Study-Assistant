import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, BookOpen, Target, Clock, ChevronRight, Plus, Check, CalendarDays, Sparkles } from 'lucide-react';

export default function StudyPlanDashboard() {
  const [generating, setGenerating] = useState(false);
  const [planReady, setPlanReady] = useState(false);
  const [plan, setPlan] = useState<any[]>([]);
  
  const [subject, setSubject] = useState('Machine Learning Final');
  const [examDate, setExamDate] = useState(new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [topics, setTopics] = useState('Neural Networks, SVMs, Decision Trees, Bayesian Learning');
  const [timePerDay, setTimePerDay] = useState('2 Hours');
  const [activeDoc, setActiveDoc] = useState('');

  useEffect(() => {
    const savedDoc = localStorage.getItem('activeChatDoc');
    if (savedDoc) setActiveDoc(savedDoc);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setPlanReady(false);

    const contextToSend = activeDoc ? `[Simulated Context for ${activeDoc}]\nThis is a simulated document content because the actual file was loaded from the dashboard. Please pretend you have read the document named "${activeDoc}" and provide a generic, helpful, and plausible answer related to what a document with that filename might contain.` : '';
    const systemPromptOverride = 'Generate a structured study plan based on the provided details and context. Return ONLY a raw JSON array of objects with exactly this structure: [{"week": "Week 1", "title": "Topic Name", "tasks": ["Task 1", "Task 2", "Task 3"]}]. Generate exactly 4 weeks of content. Do not include any markdown blocks.';
    const userPrompt = `Create a study plan for:
Subject: ${subject}
Exam Date: ${examDate}
Topics: ${topics}
Available Time: ${timePerDay}/day`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: userPrompt }], 
          context: contextToSend, 
          systemPromptOverride 
        }),
      });
      const data = await res.json();
      const match = data.result.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        const colors = ['bg-emerald-500', 'bg-cyan-500', 'bg-purple-500', 'bg-slate-700'];
        const formatted = parsed.map((item: any, idx: number) => ({
          ...item,
          status: idx === 0 ? 'active' : 'pending',
          color: colors[idx % colors.length]
        }));
        setPlan(formatted);
        setPlanReady(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <CalendarDays className="w-8 h-8 text-emerald-500" />
              AI Revision Scheduler
            </h1>
            <p className="text-slate-400">Generate a personalized study timeline leading up to your exam.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column - Form */}
          <div className="glass-strong p-6 rounded-3xl border-emerald-500/30 h-max">
            <h2 className="text-xl font-bold text-white mb-6">Create New Plan</h2>
            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subject / Exam Name</label>
                <input type="text" className="input-base w-full" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Exam Date</label>
                <input type="date" className="input-base w-full text-slate-300" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Topics to Cover (comma separated)</label>
                <textarea className="input-base w-full min-h-[100px] resize-none" value={topics} onChange={(e) => setTopics(e.target.value)} />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Available Time per day</label>
                <select className="input-base w-full" value={timePerDay} onChange={(e) => setTimePerDay(e.target.value)}>
                  <option value="1 Hour">1 Hour</option>
                  <option value="2 Hours">2 Hours</option>
                  <option value="3+ Hours">3+ Hours</option>
                </select>
              </div>

              <button type="submit" disabled={generating} className="btn-primary w-full mt-4 flex justify-center shadow-glow-purple">
                {generating ? <Sparkles className="w-5 h-5 animate-pulse" /> : 'Generate Plan'}
              </button>
            </form>
          </div>

          {/* Right Column - Timeline */}
          <div className="lg:col-span-2">
            
            <AnimatePresence mode="wait">
              {!generating && !planReady && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[400px] glass-card flex flex-col items-center justify-center text-center p-8 border-dashed border-white/20 opacity-80">
                  <CalendarDays className="w-16 h-16 text-emerald-400 mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-white mb-2">No Study Plan Yet</h3>
                  <p className="text-slate-400 max-w-sm">Adjust the settings on the left and click "Generate Plan" to create your customized AI study roadmap.</p>
                </motion.div>
              )}
              {generating && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[400px] glass-card flex flex-col items-center justify-center text-center p-8">
                  <Sparkles className="w-12 h-12 text-emerald-400 animate-spin-slow mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Crafting your syllabus...</h3>
                  <p className="text-slate-400">Analyzing topics and spacing them out for optimal retention.</p>
                </motion.div>
              )}

              {planReady && !generating && plan.length > 0 && (
                <motion.div key="plan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  
                  {/* Top Stats */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="glass-card p-4 border-l-4 border-emerald-500">
                      <div className="text-sm text-slate-400 mb-1">Time until Exam</div>
                      <div className="text-2xl font-bold text-white">{Math.max(0, Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))} Days</div>
                    </div>
                    <div className="glass-card p-4 border-l-4 border-cyan-500">
                      <div className="text-sm text-slate-400 mb-1">Total Topics</div>
                      <div className="text-2xl font-bold text-white">{plan.reduce((sum, p) => sum + p.tasks.length, 0)}</div>
                    </div>
                    <div className="glass-card p-4 border-l-4 border-purple-500">
                      <div className="text-sm text-slate-400 mb-1">Required Study</div>
                      <div className="text-2xl font-bold text-white">{parseInt(timePerDay) * 28} Hours</div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="glass-card p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Target className="w-5 h-5 text-emerald-400"/> Your Roadmap</h2>
                    
                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-cyan-500 before:to-purple-500">
                      
                      {plan.map((w, i) => (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#020008] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg ${w.color} z-10`}>
                            {w.status === 'done' ? <Check className="w-4 h-4 text-white" /> : <span className="text-white font-bold text-xs">{i+1}</span>}
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass p-5 rounded-xl border border-white/10 group-hover:border-white/30 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-bold uppercase tracking-wider ${w.status === 'active' ? 'text-cyan-400' : 'text-slate-400'}`}>{w.week}</span>
                              {w.status === 'active' && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                            </div>
                            <h3 className="font-bold text-white text-lg mb-3">{w.title}</h3>
                            <ul className="space-y-2">
                              {w.tasks.map((taskItem: any, j: number) => {
                                const taskText = typeof taskItem === 'string' ? taskItem : (taskItem.task || taskItem.title || taskItem.name || JSON.stringify(taskItem));
                                return (
                                  <li key={j} className="flex items-start gap-2 text-sm">
                                    <button className={`mt-0.5 shrink-0 w-4 h-4 rounded flex items-center justify-center border ${w.status === 'done' ? 'bg-emerald-500/20 border-emerald-500' : 'border-white/20'}`}>
                                      {w.status === 'done' && <Check className="w-3 h-3 text-emerald-400" />}
                                    </button>
                                    <span className={w.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-300'}>{taskText}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      ))}

                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
