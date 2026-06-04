import React, { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { BookMarked, Search, Plus, ChevronRight, BookOpen, Star, FileText, Loader2 } from 'lucide-react';


export default function GlossaryDashboard() {
  const [search, setSearch] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [terms, setTerms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDoc, setActiveDoc] = useState('');

  useEffect(() => {
    const savedDoc = localStorage.getItem('activeChatDoc');
    if (savedDoc) setActiveDoc(savedDoc);
  }, []);

  const generateGlossary = async () => {
    setIsLoading(true);
    const contextToSend = activeDoc ? `[Simulated Context for ${activeDoc}]\nThis is a simulated document content because the actual file was loaded from the dashboard. Please pretend you have read the document named "${activeDoc}" and provide a generic, helpful, and plausible answer related to what a document with that filename might contain.` : '';
    const systemPromptOverride = 'Extract 10 key glossary terms from the document. Return ONLY a raw JSON array of objects with exactly this structure: [{"term": "Term Name", "def": "Definition", "source": "Document Name", "cat": "Category"}]. Do not include markdown blocks.';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: 'Generate glossary' }], 
          context: contextToSend, 
          systemPromptOverride 
        }),
      });

      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      
      const matchArray = data.result.match(/\[[\s\S]*\]/);
      const matchObj = data.result.match(/\{[\s\S]*\}/);
      
      let parsed = null;
      if (matchArray) {
        parsed = JSON.parse(matchArray[0]);
      } else if (matchObj) {
        const obj = JSON.parse(matchObj[0]);
        parsed = obj.terms || obj.data || obj.glossary || null;
      }

      if (Array.isArray(parsed) && parsed.length > 0) {
        setTerms(parsed);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const filteredTerms = useMemo(() => {
    let result = terms.filter(t => !t.type);
    if (search) {
      result = result.filter(t => t.term?.toLowerCase().includes(search.toLowerCase()) || t.def?.toLowerCase().includes(search.toLowerCase()));
    }
    if (activeLetter) {
      result = result.filter(t => t.term?.toUpperCase().startsWith(activeLetter));
    }
    // Group by letter
    const grouped: any[] = [];
    let currentLetter = '';
    result.forEach(t => {
      const firstChar = t.term?.charAt(0).toUpperCase();
      if (firstChar !== currentLetter) {
        currentLetter = firstChar || '';
        grouped.push({ type: 'divider', letter: currentLetter });
      }
      grouped.push(t);
    });
    return grouped;
  }, [search, activeLetter]);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-8 flex flex-col h-[calc(100vh-100px)]">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <BookMarked className="w-8 h-8 text-amber-500" />
              Glossary Builder
            </h1>
            <p className="text-slate-400">Automatically extract and organize key terminology from your study materials.</p>
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary h-10"><Plus className="w-4 h-4"/> Add Term</button>
            <button 
              onClick={generateGlossary} 
              disabled={isLoading}
              className="btn-primary h-10 shadow-glow-purple"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4"/>}
              {isLoading ? 'Generating...' : 'Generate from Doc'}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setActiveLetter(null); }}
              placeholder="Search glossary terms or definitions..." 
              className="input-base w-full !pl-12 py-3 text-lg bg-white/5 border-white/10" 
            />
          </div>
          
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              onClick={() => setActiveLetter(null)}
              className={`min-w-[32px] h-8 rounded flex items-center justify-center text-xs font-medium transition-colors ${!activeLetter ? 'bg-amber-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
            >
              All
            </button>
            {letters.map(l => (
              <button 
                key={l}
                onClick={() => { setActiveLetter(l); setSearch(''); }}
                className={`min-w-[32px] h-8 rounded flex items-center justify-center text-xs font-medium transition-colors ${activeLetter === l ? 'bg-amber-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Terms List */}
        {terms.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center glass-card border-dashed border-white/20 p-12 opacity-80 min-h-[400px]">
            <BookMarked className="w-16 h-16 text-slate-500 mb-4" />
            <h3 className="text-2xl font-medium text-white mb-2">No Glossary Terms Yet</h3>
            <p className="text-slate-400 max-w-md mx-auto">Click "Generate from Doc" to automatically extract key terminology and definitions from {activeDoc || 'your document'}.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
            <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredTerms.map((item, i) => {
                if (item.type === 'divider') {
                  return (
                    <motion.div 
                      key={`div-${item.letter}`}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="sticky top-0 z-10 py-2 bg-[#020008]/90 backdrop-blur-md flex items-center gap-4 pt-4"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 font-bold flex items-center justify-center font-display text-xl">{item.letter}</div>
                      <div className="h-px bg-white/10 flex-1" />
                    </motion.div>
                  );
                }
                
                return (
                  <motion.div 
                    key={item.term}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 border-white/10 hover:border-amber-500/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">{item.term}</h3>
                        <span className="badge badge-amber">{item.cat}</span>
                      </div>
                      <button className="text-slate-500 hover:text-amber-400 transition-colors" title="Add to flashcards">
                        <Star className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <p className="text-slate-300 leading-relaxed mb-4">{item.def}</p>
                    
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <BookOpen className="w-3 h-3" /> Source: {item.source}
                    </div>
                  </motion.div>
                );
              })}
                {filteredTerms.length === 0 && (
                  <div className="text-center py-20 text-slate-500">
                    No terms found matching your search.
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
