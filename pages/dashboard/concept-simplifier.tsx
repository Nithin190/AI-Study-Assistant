import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Search, Loader2, Sparkles, Brain } from 'lucide-react';

export default function ConceptSimplifier() {
  const [isLoading, setIsLoading] = useState(false);
  const [concept, setConcept] = useState('');
  const [result, setResult] = useState<any>(null);
  const [activeDoc, setActiveDoc] = useState('');

  useEffect(() => {
    const savedDoc = localStorage.getItem('activeChatDoc');
    if (savedDoc) setActiveDoc(savedDoc);
  }, []);

  const simplifyConcept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;
    
    setIsLoading(true);
    setResult(null);
    const contextToSend = activeDoc ? `[Context for ${activeDoc}]\nPlease pretend you have read the document named "${activeDoc}".` : '';
    const systemPromptOverride = `You are an expert teacher. The user is struggling to understand the concept: "${concept}". Explain it to them like they are 5 years old (ELI5). Return ONLY a raw JSON object with this structure: {"analogy": "A simple relatable analogy...", "explanation": "A simplified breakdown..."}. Do not output markdown blocks.`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: `Explain: ${concept}` }], 
          context: contextToSend, 
          systemPromptOverride 
        }),
      });

      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      const matchObj = data.result.match(/\{[\s\S]*\}/);
      if (matchObj) {
        setResult(JSON.parse(matchObj[0]));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
              Concept Simplifier
            </h1>
            <p className="text-slate-400">Struggling with a hard topic? Let AI explain it to you like you're 5.</p>
          </div>
        </div>

        {/* Input Form */}
        <div className="glass-strong p-8 rounded-3xl border-yellow-500/30 mb-8">
          <form onSubmit={simplifyConcept} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-slate-300 mb-3">What concept are you struggling with?</label>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="e.g., Quantum Entanglement, Support Vector Machines, Inflation..."
                  className="input-base w-full !pl-12 py-4 text-lg bg-black/20"
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={isLoading || !concept.trim()}
              className="btn-primary shadow-[0_0_20px_rgba(234,179,8,0.3)] whitespace-nowrap h-[60px] px-8 text-lg"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2 inline" /> : <Sparkles className="w-5 h-5 mr-2 inline"/>}
              {isLoading ? 'Thinking...' : 'Simplify It!'}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {!isLoading && !result && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card flex flex-col items-center justify-center text-center p-12 border-dashed border-white/20 opacity-80 min-h-[300px]">
              <Brain className="w-16 h-16 text-yellow-500 mb-4 opacity-50" />
              <h3 className="text-xl font-medium text-white mb-2">Awaiting your question</h3>
              <p className="text-slate-400 max-w-md">Type a complex theory or vocabulary word above, and we'll break it down using easy analogies.</p>
            </motion.div>
          )}

          {isLoading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card flex flex-col items-center justify-center text-center p-12 min-h-[300px]">
              <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Breaking down "{concept}"...</h3>
              <p className="text-slate-400">Finding the perfect analogy.</p>
            </motion.div>
          )}

          {!isLoading && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="glass-card p-8 border-l-4 border-l-yellow-500 bg-yellow-500/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white">The Analogy</h3>
                </div>
                <p className="text-lg text-slate-300 leading-relaxed italic">"{result.analogy}"</p>
              </div>

              <div className="glass-card p-8">
                <h3 className="text-lg font-bold text-white mb-4">Simplified Explanation</h3>
                <p className="text-slate-300 leading-relaxed">{result.explanation}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}
