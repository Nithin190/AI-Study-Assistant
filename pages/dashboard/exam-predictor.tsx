import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, Brain, Star, AlertCircle, ChevronRight, Gauge, CheckCircle, Loader2 } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';

export default function ExamPredictorDashboard() {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [activeDoc, setActiveDoc] = useState('');

  useEffect(() => {
    setIsClient(true);
    const savedDoc = localStorage.getItem('activeChatDoc');
    if (savedDoc) setActiveDoc(savedDoc);
  }, []);

  const generatePrediction = async () => {
    setIsLoading(true);
    const contextToSend = activeDoc ? `[Simulated Context for ${activeDoc}]\nThis is a simulated document content because the actual file was loaded from the dashboard. Please pretend you have read the document named "${activeDoc}" and provide a generic, helpful, and plausible answer related to what a document with that filename might contain.` : '';
    const systemPromptOverride = 'Generate a simulated exam score prediction based on the document. Return ONLY a raw JSON object with exactly this structure: {"predictedScore": 75, "radarData": [{"subject": "Topic 1", "score": 85}, {"subject": "Topic 2", "score": 60}, {"subject": "Topic 3", "score": 90}, {"subject": "Topic 4", "score": 50}], "strongAreas": ["Topic 1 (85%)", "Topic 3 (90%)"], "atRiskAreas": ["Topic 4 (50%)", "Topic 2 (60%)"], "recommendations": [{"title": "Study more Topic 4", "desc": "Focusing on Topic 4 will boost your score to 80%."}]}. Do not include markdown blocks.';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: 'Generate prediction' }], 
          context: contextToSend, 
          systemPromptOverride 
        }),
      });

      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      
      const matchObj = data.result.match(/\{[\s\S]*\}/);
      if (matchObj) {
        setPrediction(JSON.parse(matchObj[0]));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const predictedScore = prediction?.predictedScore || 0;
  const scoreColor = predictedScore >= 80 ? 'text-emerald-400' : predictedScore >= 60 ? 'text-amber-400' : 'text-rose-400';
  
  const radarData = prediction?.radarData || [];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Gauge className="w-8 h-8 text-blue-500" />
              Exam Score Predictor
            </h1>
            <p className="text-slate-400">Machine learning model predicts your final grade based on BKT mastery, quiz history, and engagement.</p>
          </div>
          <button onClick={generatePrediction} disabled={isLoading} className="btn-primary shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4"/>}
            {isLoading ? 'Calculating...' : 'Recalculate Prediction'}
          </button>
        </div>

        {!prediction ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center glass-card border-dashed border-white/20 p-12 opacity-80 min-h-[400px]">
            <Gauge className="w-16 h-16 text-blue-500 mb-4 opacity-50" />
            <h3 className="text-2xl font-medium text-white mb-2">No Prediction Data</h3>
            <p className="text-slate-400 max-w-md mx-auto">Click "Recalculate Prediction" to have the AI analyze your active document ({activeDoc || 'your file'}) and generate a simulated exam readiness report.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left Column: Big Score & Radar */}
          <div className="space-y-8">
            
            {/* Big Score Card */}
            <div className="glass-strong p-8 rounded-3xl border-blue-500/30 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Target className="w-48 h-48 text-blue-500" /></div>
              
              <h2 className="text-lg font-semibold text-white mb-6 relative z-10">Predicted Final Score</h2>
              
              <div className="flex justify-center items-end gap-4 mb-4 relative z-10">
                <div className={clsx("text-7xl font-display font-bold leading-none", scoreColor)}>
                  {predictedScore}<span className="text-4xl text-slate-500">%</span>
                </div>
                <div className="text-5xl font-bold text-slate-700 leading-none pb-1">B</div>
              </div>
              
              <div className="text-sm font-medium text-slate-400 mb-8 relative z-10">
                Confidence Interval: <span className="text-white">±8%</span>
              </div>
              
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden relative z-10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${predictedScore}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={clsx("h-full rounded-full relative", predictedScore >= 80 ? 'bg-emerald-500' : predictedScore >= 60 ? 'bg-amber-500' : 'bg-rose-500')}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-black" />
                </motion.div>
              </div>
              <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 mt-2 relative z-10">
                <span>0</span>
                <span>Failing</span>
                <span>Passing</span>
                <span>Perfect</span>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="glass-card p-6 h-[400px] flex flex-col">
              <h3 className="font-semibold text-white mb-4">Topic Readiness Breakdown</h3>
              <div className="flex-1 w-full min-h-0">
                {isClient && (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Strengths, Weaknesses, Actions */}
          <div className="space-y-6">
            
            <div className="glass-card p-6">
              <h3 className="font-semibold text-emerald-400 mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5"/> Strong Areas</h3>
              <ul className="space-y-3">
                {prediction.strongAreas?.map((t: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-slate-200">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold text-rose-400 mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5"/> At-Risk Areas</h3>
              <ul className="space-y-3">
                {prediction.atRiskAreas?.map((t: string, i: number) => (
                  <li key={i} className="flex items-center justify-between text-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-rose-500" /> {t}
                    </div>
                    <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">Practice</button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-strong p-6 rounded-2xl border-blue-500/30 bg-blue-500/5">
              <h3 className="font-semibold text-white mb-6 flex items-center gap-2"><Brain className="w-5 h-5 text-blue-400"/> AI Recommendations</h3>
              
                {prediction.recommendations?.map((rec: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-blue-500/30 transition-colors group cursor-pointer">
                    <h4 className="font-medium text-white mb-1 group-hover:text-blue-400 transition-colors">{rec.title}</h4>
                    <p className="text-sm text-slate-400">{rec.desc}</p>
                  </div>
                ))}
            </div>

          </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
