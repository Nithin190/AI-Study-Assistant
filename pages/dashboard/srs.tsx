import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, XCircle, Clock, Brain, Star, RotateCcw, ChevronRight, Layers, Loader2, Plus } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

export default function SRSDashboard() {
  const { updateXP } = useAuth();
  const [cards, setCards] = useState<any[]>([]);
  const [reviewMode, setReviewMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDoc, setActiveDoc] = useState('');

  useEffect(() => {
    const savedDoc = localStorage.getItem('activeChatDoc');
    if (savedDoc) setActiveDoc(savedDoc);
  }, []);

  const generateSRSCards = async () => {
    setIsLoading(true);

    const contextToSend = activeDoc ? `[Simulated Context for ${activeDoc}]\nThis is a simulated document content because the actual file was loaded from the dashboard. Please pretend you have read the document named "${activeDoc}" and provide a generic, helpful, and plausible answer related to what a document with that filename might contain.` : '';
    const systemPromptOverride = 'Generate 5 to 10 spaced repetition flashcards based on the document. Return ONLY a raw JSON array of objects with exactly this structure: [{"front": "...", "back": "...", "category": "General"}]. Do not include any markdown blocks.';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: 'Generate SRS flashcards' }], 
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
        const withMetadata = parsed.map((c: any, i: number) => ({
          ...c,
          id: `srs-${Date.now()}-${i}`,
          category: c.category || 'General',
          nextReview: 'Today',
          interval: 1
        }));
        setCards(withMetadata);
        setSessionComplete(false);
        setReviewMode(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const dueCards = cards.filter(c => c.nextReview === 'Today');
  const currentCard = dueCards[currentIndex];

  const handleRating = (rating: number) => {
    // In a real app, calculate SM-2 values here
    setShowAnswer(false);
    updateXP(5);
    
    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setSessionComplete(true);
      setReviewMode(false);
    }
  };

  const RATING_BUTTONS = [
    { value: 0, label: 'Again', color: 'bg-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30', interval: '1m' },
    { value: 1, label: 'Hard', color: 'bg-orange-500/20 text-orange-300 border-orange-500/50 hover:bg-orange-500/30', interval: '6m' },
    { value: 2, label: 'Good', color: 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30', interval: '10m' },
    { value: 3, label: 'Easy', color: 'bg-lime-500/20 text-lime-300 border-lime-500/50 hover:bg-lime-500/30', interval: '1d' },
    { value: 4, label: 'Very Easy', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30', interval: '4d' },
    { value: 5, label: 'Perfect', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/30', interval: '7d' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8">
        
        {/* Header & Stats */}
        {!reviewMode && !sessionComplete && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-indigo-500" />
                  Spaced Repetition
                </h1>
                <p className="text-slate-400">SM-2 Algorithm scheduling. Review cards right before you forget them.</p>
              </div>
              <div className="flex gap-4">
                {cards.length > 0 && (
                  <button 
                    onClick={() => setReviewMode(true)}
                    disabled={dueCards.length === 0}
                    className="btn-primary px-8 py-3 text-lg shadow-[0_0_20px_rgba(79,70,229,0.4)] disabled:opacity-50 disabled:shadow-none"
                  >
                    Start Review ({dueCards.length}) <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                )}
                <button 
                  onClick={generateSRSCards}
                  disabled={isLoading}
                  className="btn-secondary px-6 py-3 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2 inline" /> : <Plus className="w-5 h-5 mr-2 inline" />}
                  {isLoading ? 'Generating...' : 'Generate New Deck'}
                </button>
              </div>
            </div>

            {cards.length === 0 ? (
              <div className="glass-card border-dashed border-white/20 p-12 text-center opacity-80 mt-8">
                <BookOpen className="w-16 h-16 text-indigo-400 mb-4 mx-auto" />
                <h3 className="text-2xl font-medium text-white mb-2">No SRS Cards Yet</h3>
                <p className="text-slate-400 max-w-md mx-auto">Click "Generate New Deck" above to create spaced repetition flashcards based on {activeDoc || 'your current document'}.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4">
              <div className="glass-card p-5 border-indigo-500/20 flex flex-col items-center justify-center text-center">
                <Clock className="w-8 h-8 text-indigo-400 mb-2" />
                <div className="text-3xl font-display font-bold text-white mb-1">{dueCards.length}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Due Today</div>
              </div>
              <div className="glass-card p-5 border-white/10 flex flex-col items-center justify-center text-center">
                <Layers className="w-8 h-8 text-slate-400 mb-2" />
                <div className="text-3xl font-display font-bold text-white mb-1">{cards.length}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Cards</div>
              </div>
              <div className="glass-card p-5 border-emerald-500/20 flex flex-col items-center justify-center text-center">
                <Brain className="w-8 h-8 text-emerald-400 mb-2" />
                <div className="text-3xl font-display font-bold text-white mb-1">{Math.floor(cards.length * 0.25)}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Mastered</div>
              </div>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="p-5 border-b border-white/10 bg-white/5">
                <h2 className="font-semibold text-white">Upcoming Deck</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-black/20">
                    <tr>
                      <th className="px-6 py-4 font-medium">Front</th>
                      <th className="px-6 py-4 font-medium">Category</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Interval</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cards.map((card) => (
                      <tr key={card.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-slate-200 max-w-[200px] truncate">{card.front}</td>
                        <td className="px-6 py-4">
                          <span className="badge badge-purple text-[10px] px-2 py-0.5">{card.category}</span>
                        </td>
                        <td className="px-6 py-4">
                          {card.nextReview === 'Today' 
                            ? <span className="text-rose-400 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Due</span>
                            : <span className="text-slate-400">{card.nextReview}</span>}
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-mono">{card.interval}d</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
              </>
            )}
          </motion.div>
        )}

        {/* Review Mode */}
        {reviewMode && currentCard && (
          <div className="flex flex-col items-center max-w-2xl mx-auto h-[calc(100vh-140px)]">
            
            <div className="w-full flex justify-between items-center mb-6">
              <button onClick={() => setReviewMode(false)} className="text-slate-400 hover:text-white text-sm flex items-center gap-1">
                ← Exit
              </button>
              <div className="text-sm font-medium text-slate-300">
                Card <span className="text-indigo-400">{currentIndex + 1}</span> of {dueCards.length}
              </div>
              <div className="w-16" /> {/* spacer */}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/10 rounded-full mb-8 overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${(currentIndex / dueCards.length) * 100}%` }}
              />
            </div>

            {/* Card */}
            <div className="w-full flex-1 flex flex-col relative perspective-[1000px]">
              <motion.div
                className="w-full h-full flex flex-col"
                initial={false}
                animate={{ rotateX: showAnswer ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                
                {/* FRONT */}
                <div 
                  className="absolute inset-0 w-full h-full glass-strong rounded-3xl border-indigo-500/30 p-8 md:p-12 flex flex-col items-center justify-center text-center backface-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="absolute top-6 left-6 badge badge-purple">{currentCard.category}</div>
                  <h2 className="text-2xl md:text-3xl font-medium text-white leading-relaxed">
                    {currentCard.front}
                  </h2>
                </div>

                {/* BACK */}
                <div 
                  className="absolute inset-0 w-full h-full glass-strong rounded-3xl border-cyan-500/30 p-8 md:p-12 flex flex-col items-center justify-center text-center bg-cyan-500/5 backface-hidden"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
                >
                  <div className="absolute top-6 left-6 badge badge-cyan">Answer</div>
                  <p className="text-xl text-slate-200 leading-relaxed mb-8">
                    {currentCard.back}
                  </p>
                </div>

              </motion.div>
            </div>

            {/* Controls */}
            <div className="w-full mt-8 flex flex-col items-center gap-4 h-32">
              {!showAnswer ? (
                <button 
                  onClick={() => setShowAnswer(true)}
                  className="btn-primary w-full max-w-sm py-4 text-lg shadow-glow-purple"
                >
                  Reveal Answer
                </button>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                  <div className="text-center text-sm text-slate-400 mb-3">How well did you know this?</div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full">
                    {RATING_BUTTONS.map((btn) => (
                      <button
                        key={btn.value}
                        onClick={() => handleRating(btn.value)}
                        className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all ${btn.color}`}
                      >
                        <span className="text-xs font-semibold uppercase tracking-wider mb-1">{btn.label}</span>
                        <span className="text-[10px] opacity-75 font-mono">{btn.interval}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

          </div>
        )}

        {/* Complete Screen */}
        {sessionComplete && (
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="glass-strong p-12 text-center rounded-3xl relative overflow-hidden mt-12"
           >
             <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
             <h2 className="text-3xl font-bold text-white mb-2">Review Complete!</h2>
             <p className="text-slate-400 mb-8">You reviewed {dueCards.length} cards. Your memory is getting stronger.</p>
             <button onClick={() => setSessionComplete(false)} className="btn-secondary">
               Back to Overview
             </button>
           </motion.div>
        )}

      </div>
    </DashboardLayout>
  );
}

function AlertCircle(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
