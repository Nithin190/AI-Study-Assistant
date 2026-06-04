import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpenCheck, Loader2, Sparkles, CheckCircle2, Circle, Search, LayoutList } from 'lucide-react';

export default function ChapterTracker() {
  const [isLoading, setIsLoading] = useState(false);
  const [chapters, setChapters] = useState<any[]>([]);
  const [activeDoc, setActiveDoc] = useState('');

  useEffect(() => {
    const savedDoc = localStorage.getItem('activeChatDoc');
    if (savedDoc) setActiveDoc(savedDoc);
    
    // Check if we have cached chapters for this doc
    if (savedDoc) {
      const cached = localStorage.getItem(`chapters_${savedDoc}`);
      if (cached) {
        setChapters(JSON.parse(cached));
      }
    }
  }, []);

  const extractChapters = async () => {
    setIsLoading(true);
    const contextToSend = activeDoc ? `[Context for ${activeDoc}]\nPlease pretend you have read the document named "${activeDoc}".` : '';
    const systemPromptOverride = `Extract the main chapters or sections from the document. Return ONLY a raw JSON array of objects with exactly this structure: [{"id": 1, "title": "Chapter 1: Intro", "summary": "Brief summary", "completed": false}]. Do not output markdown blocks. Limit to 8-10 chapters max.`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: `Extract chapters` }], 
          context: contextToSend, 
          systemPromptOverride 
        }),
      });

      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      const matchArray = data.result.match(/\[[\s\S]*\]/);
      if (matchArray) {
        const parsed = JSON.parse(matchArray[0]);
        setChapters(parsed);
        localStorage.setItem(`chapters_${activeDoc}`, JSON.stringify(parsed));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChapter = (id: number) => {
    const updated = chapters.map(ch => ch.id === id ? { ...ch, completed: !ch.completed } : ch);
    setChapters(updated);
    if (activeDoc) {
      localStorage.setItem(`chapters_${activeDoc}`, JSON.stringify(updated));
    }
  };

  const progress = chapters.length > 0 ? Math.round((chapters.filter(c => c.completed).length / chapters.length) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <BookOpenCheck className="w-8 h-8 text-fuchsia-500" />
              Chapter Tracker
            </h1>
            <p className="text-slate-400">Extract chapters from your document and track your reading progress.</p>
          </div>
          <button 
            onClick={extractChapters} 
            disabled={isLoading || !activeDoc}
            className="btn-primary shadow-[0_0_20px_rgba(217,70,239,0.3)]"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : <LayoutList className="w-4 h-4 mr-2 inline"/>}
            {isLoading ? 'Extracting...' : (chapters.length > 0 ? 'Re-extract Chapters' : 'Extract Chapters')}
          </button>
        </div>

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {!isLoading && chapters.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card flex flex-col items-center justify-center text-center p-12 border-dashed border-white/20 opacity-80 min-h-[400px]">
              <LayoutList className="w-16 h-16 text-fuchsia-500 mb-4 opacity-50" />
              <h3 className="text-xl font-medium text-white mb-2">No Chapters Extracted</h3>
              <p className="text-slate-400 max-w-md">Click the "Extract Chapters" button to automatically scan {activeDoc || 'your document'} and generate a trackable syllabus.</p>
            </motion.div>
          )}

          {isLoading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card flex flex-col items-center justify-center text-center p-12 min-h-[400px]">
              <Loader2 className="w-12 h-12 text-fuchsia-400 animate-spin mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Scanning Document...</h3>
              <p className="text-slate-400">Identifying chapters and generating summaries.</p>
            </motion.div>
          )}

          {!isLoading && chapters.length > 0 && (
            <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              {/* Progress Bar */}
              <div className="glass-strong p-6 rounded-3xl border-fuchsia-500/30">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <h3 className="font-bold text-white text-lg">Overall Progress</h3>
                    <p className="text-sm text-slate-400">{chapters.filter(c => c.completed).length} of {chapters.length} chapters completed</p>
                  </div>
                  <div className="text-3xl font-display font-bold text-fuchsia-400">{progress}%</div>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${progress}%` }} 
                    className="h-full bg-fuchsia-500 rounded-full"
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* List */}
              <div className="space-y-3">
                {chapters.map(chapter => (
                  <div 
                    key={chapter.id} 
                    onClick={() => toggleChapter(chapter.id)}
                    className={`glass p-5 rounded-2xl flex gap-4 items-start cursor-pointer transition-all border ${chapter.completed ? 'border-fuchsia-500/50 bg-fuchsia-500/5' : 'border-white/5 hover:border-white/20'}`}
                  >
                    <button className="shrink-0 mt-1 focus:outline-none">
                      {chapter.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-fuchsia-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-500" />
                      )}
                    </button>
                    <div>
                      <h4 className={`font-bold text-lg mb-1 transition-colors ${chapter.completed ? 'text-fuchsia-100' : 'text-white'}`}>{chapter.title}</h4>
                      <p className={`text-sm ${chapter.completed ? 'text-fuchsia-200/60' : 'text-slate-400'}`}>{chapter.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}
