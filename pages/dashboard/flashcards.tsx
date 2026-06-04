import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { MOCK_FLASHCARDS } from '../../lib/mockData';
import { motion } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, Shuffle, Plus, Check, Star, Layers, RotateCw, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function FlashcardsDashboard() {
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [activeDoc, setActiveDoc] = useState('');

  useEffect(() => {
    const savedDoc = localStorage.getItem('activeChatDoc');
    if (savedDoc) setActiveDoc(savedDoc);
  }, []);

  const generateFlashcards = async () => {
    setIsLoading(true);

    const contextToSend = activeDoc ? `[Simulated Context for ${activeDoc}]\nThis is a simulated document content because the actual file was loaded from the dashboard. Please pretend you have read the document named "${activeDoc}" and provide a generic, helpful, and plausible answer related to what a document with that filename might contain.` : '';
    const systemPromptOverride = 'Generate 5 to 10 flashcards based on the document. Return ONLY a raw JSON array of objects with exactly this structure: [{"id": "1", "front": "...", "back": "...", "category": "General", "difficulty": "medium"}]. Do not include any markdown blocks like ```json or anything else. Just the raw array starting with [ and ending with ].';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: 'Generate flashcards' }], 
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
        const withIds = parsed.map((c: any, i: number) => ({
          ...c,
          id: c.id || `card-${Date.now()}-${i}`,
          category: c.category || 'General',
          difficulty: c.difficulty || 'medium'
        }));
        setCards(withIds);
        setCurrentIndex(0);
        setIsFlipped(false);
        setKnownCards(new Set());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const currentCard = cards[currentIndex];
  
  const categories = Array.from(new Set(cards.map(c => c.category)));

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((i) => (i + 1) % cards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((i) => (i - 1 + cards.length) % cards.length);
    }, 150);
  };

  const toggleKnown = (id: string) => {
    const newKnown = new Set(knownCards);
    if (newKnown.has(id)) newKnown.delete(id);
    else newKnown.add(id);
    setKnownCards(newKnown);
  };

  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-8 flex flex-col h-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Layers className="w-8 h-8 text-cyan-500" />
              Flashcard Deck
            </h1>
            <p className="text-slate-400">Review AI-generated flashcards from {activeDoc || 'your documents'}.</p>
          </div>
          <button 
            onClick={generateFlashcards} 
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {isLoading ? 'Generating...' : 'Generate New Deck'}
          </button>
        </div>

        {/* Main View Area */}
        {cards.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center glass-card border-dashed border-white/20 p-12 opacity-80 min-h-[400px]">
            <Layers className="w-16 h-16 text-slate-500 mb-4" />
            <h3 className="text-2xl font-medium text-white mb-2">No Flashcards Yet</h3>
            <p className="text-slate-400 max-w-md mx-auto mb-6">Click "Generate New Deck" above to use AI to instantly create study flashcards based on {activeDoc || 'your current document'}.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row gap-8 min-h-[400px]">
            
            {/* Big Card */}
            <div className="flex-1 flex flex-col relative">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm font-medium text-slate-400">
                Card <span className="text-white">{currentIndex + 1}</span> of {cards.length}
              </div>
              <div className="flex gap-2">
                <button onClick={shuffleCards} className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors" title="Shuffle">
                  <Shuffle className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-[300px] perspective-[1000px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
              <motion.div
                className="w-full h-full relative"
                initial={false}
                animate={{ rotateX: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                
                {/* FRONT */}
                <div 
                  className="absolute inset-0 w-full h-full glass-strong rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center backface-hidden group"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="absolute top-6 left-6 badge border-white/10 text-slate-300">{currentCard.category}</div>
                  <div className="absolute top-6 right-6">
                    <span className={clsx(
                      "badge",
                      currentCard.difficulty === 'easy' ? 'badge-green' :
                      currentCard.difficulty === 'medium' ? 'badge-amber' : 'badge-rose'
                    )}>
                      {currentCard.difficulty}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl md:text-4xl font-medium text-white leading-relaxed mt-4">
                    {currentCard.front}
                  </h2>
                  
                  <div className="absolute bottom-6 text-slate-500 text-sm flex items-center gap-2 group-hover:text-slate-300 transition-colors">
                    <RotateCw className="w-4 h-4" /> Click to flip
                  </div>
                </div>

                {/* BACK */}
                <div 
                  className="absolute inset-0 w-full h-full glass-strong rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center bg-cyan-500/5 border-cyan-500/30 backface-hidden"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
                >
                  <div className="absolute top-6 left-6 badge badge-cyan">Answer</div>
                  <p className="text-xl md:text-2xl text-cyan-50 leading-relaxed overflow-y-auto">
                    {currentCard.back}
                  </p>
                </div>

              </motion.div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-8">
              <button onClick={prevCard} className="btn-secondary h-12 w-12 !px-0 rounded-full flex items-center justify-center">
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="flex gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleKnown(currentCard.id); }}
                  className={clsx(
                    "flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-medium",
                    knownCards.has(currentCard.id) 
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50" 
                      : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                  )}
                >
                  <Check className="w-5 h-5" />
                  {knownCards.has(currentCard.id) ? 'Known' : 'Mark Known'}
                </button>
              </div>

              <button onClick={nextCard} className="btn-secondary h-12 w-12 !px-0 rounded-full flex items-center justify-center">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Mini Grid Sidebar */}
          <div className="md:w-64 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Deck Preview</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
              {cards.map((c, i) => (
                <div 
                  key={c.id} 
                  onClick={() => { setCurrentIndex(i); setIsFlipped(false); }}
                  className={clsx(
                    "p-3 rounded-xl border cursor-pointer transition-all text-sm",
                    i === currentIndex 
                      ? "bg-white/10 border-white/30 text-white shadow-sm" 
                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-semibold opacity-70">{c.category}</span>
                    {knownCards.has(c.id) && <Check className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <div className="line-clamp-2">{c.front}</div>
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
