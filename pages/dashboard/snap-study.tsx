import React, { useState, useRef, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Camera, Upload, Sparkles, BookOpen, Zap, RotateCw,
  Brain, FileText, CheckCircle, XCircle, ChevronRight,
  ChevronLeft, Lightbulb, AlertCircle, Loader2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Concept {
  term: string;
  definition: string;
  importance: 'high' | 'medium' | 'low';
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string; // e.g. "A"
  explanation: string;
}

interface Flashcard {
  front: string;
  back: string;
}

interface SnapResult {
  extractedText: string;
  summary: string;
  concepts: Concept[];
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
}

type TabKey = 'text' | 'summary' | 'concepts' | 'quiz' | 'flashcards';

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'text',       label: 'Extracted Text', icon: FileText,  color: 'text-slate-300' },
  { key: 'summary',    label: 'Summary',         icon: BookOpen,  color: 'text-cyan-400' },
  { key: 'concepts',   label: 'Key Concepts',    icon: Lightbulb, color: 'text-amber-400' },
  { key: 'quiz',       label: 'Quiz',            icon: Zap,       color: 'text-fuchsia-400' },
  { key: 'flashcards', label: 'Flashcards',      icon: Brain,     color: 'text-violet-400' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ConceptCard({ concept }: { concept: Concept }) {
  const colorMap: Record<string, string> = {
    high:   'border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300',
    medium: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
    low:    'border-slate-500/40 bg-slate-500/10 text-slate-300',
  };
  const badge = colorMap[concept.importance] || colorMap.medium;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-semibold text-white">{concept.term}</h4>
        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${badge} shrink-0`}>
          {concept.importance}
        </span>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{concept.definition}</p>
    </motion.div>
  );
}

function QuizView({ questions }: { questions: QuizQuestion[] }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[current];
  if (!q) return <div className="text-slate-400 text-sm">No quiz questions available.</div>;

  const optionLetter = (opt: string) => opt.charAt(0); // "A" from "A) ..."

  const handleSelect = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (optionLetter(opt) === q.answer) setScore(s => s + 1);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setShowExplanation(false);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 py-10"
      >
        <div className={`w-28 h-28 rounded-full flex items-center justify-center text-3xl font-bold border-4 ${
          pct >= 80 ? 'border-emerald-500 text-emerald-400' : pct >= 50 ? 'border-amber-500 text-amber-400' : 'border-rose-500 text-rose-400'
        }`}>
          {pct}%
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-white mb-1">
            {pct >= 80 ? '🎉 Excellent!' : pct >= 50 ? '👍 Good effort!' : '📚 Keep studying!'}
          </p>
          <p className="text-slate-400 text-sm">{score} / {questions.length} correct</p>
        </div>
        <button
          onClick={handleRestart}
          className="btn-primary"
        >
          <RotateCw className="w-4 h-4" /> Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>Question {current + 1} / {questions.length}</span>
        <span className="text-emerald-400">Score: {score}</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-fuchsia-500 to-violet-500 transition-all duration-500"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex flex-col gap-4"
        >
          <p className="text-white font-medium leading-relaxed">{q.question}</p>

          <div className="grid gap-2">
            {q.options.map((opt) => {
              const letter = optionLetter(opt);
              const isCorrect = letter === q.answer;
              const isSelected = selected === opt;
              let classes = 'p-3 rounded-xl border text-sm text-left transition-all duration-200 ';

              if (!selected) {
                classes += 'border-white/10 bg-white/5 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/10 text-slate-200 cursor-pointer';
              } else if (isCorrect) {
                classes += 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300';
              } else if (isSelected && !isCorrect) {
                classes += 'border-rose-500/60 bg-rose-500/15 text-rose-300';
              } else {
                classes += 'border-white/5 bg-white/3 text-slate-500 opacity-60';
              }

              return (
                <button key={opt} className={classes} onClick={() => handleSelect(opt)} disabled={!!selected}>
                  <span className="font-mono font-bold mr-2">{letter})</span>
                  {opt.slice(2).trim()}
                  {selected && isCorrect && <CheckCircle className="inline w-4 h-4 ml-2 text-emerald-400" />}
                  {isSelected && !isCorrect && <XCircle className="inline w-4 h-4 ml-2 text-rose-400" />}
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 text-sm text-violet-200"
            >
              <span className="font-semibold text-violet-300">Explanation: </span>
              {q.explanation}
            </motion.div>
          )}

          {selected && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="btn-primary self-end"
              onClick={handleNext}
            >
              {current + 1 >= questions.length ? 'See Results' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FlashcardsView({ cards }: { cards: Flashcard[] }) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());

  if (!cards.length) return <div className="text-slate-400 text-sm">No flashcards available.</div>;

  const card = cards[current];
  const isKnown = known.has(current);

  const go = (dir: 1 | -1) => {
    setFlipped(false);
    setTimeout(() => setCurrent(c => Math.max(0, Math.min(cards.length - 1, c + dir))), 150);
  };

  const toggleKnown = () => {
    setKnown(prev => {
      const next = new Set(prev);
      next.has(current) ? next.delete(current) : next.add(current);
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Progress dots */}
      <div className="flex gap-1.5">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => { setFlipped(false); setCurrent(i); }}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              i === current ? 'bg-fuchsia-500 w-5' : known.has(i) ? 'bg-emerald-500' : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Card */}
      <div
        className="relative w-full max-w-md"
        style={{ perspective: '1000px', height: '220px' }}
        onClick={() => setFlipped(f => !f)}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d', position: 'relative', width: '100%', height: '100%' }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 glass-strong rounded-3xl border border-fuchsia-500/30 flex flex-col items-center justify-center p-8 cursor-pointer"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-xs font-mono text-fuchsia-400 uppercase tracking-wider mb-4">Tap to reveal answer</div>
            <p className="text-white font-semibold text-center text-lg leading-relaxed">{card.front}</p>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 glass-strong rounded-3xl border border-violet-500/30 flex flex-col items-center justify-center p-8 cursor-pointer"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="text-xs font-mono text-violet-400 uppercase tracking-wider mb-4">Answer</div>
            <p className="text-slate-200 text-center leading-relaxed">{card.back}</p>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          className="p-3 rounded-xl glass border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all disabled:opacity-40"
          onClick={() => go(-1)}
          disabled={current === 0}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={toggleKnown}
          className={`px-5 py-2 rounded-xl text-sm font-medium border transition-all ${
            isKnown
              ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300'
              : 'border-white/10 bg-white/5 text-slate-300 hover:border-emerald-500/40'
          }`}
        >
          {isKnown ? <><CheckCircle className="inline w-4 h-4 mr-1" />Known</> : 'Mark as Known'}
        </button>

        <button
          className="p-3 rounded-xl glass border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all disabled:opacity-40"
          onClick={() => go(1)}
          disabled={current === cards.length - 1}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <p className="text-xs text-slate-500 font-mono">
        {current + 1} / {cards.length} · {known.size} known
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SnapStudyPage() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'done' | 'error'>('idle');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [result, setResult] = useState<SnapResult | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('text');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file.');
      setStatus('error');
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setStatus('scanning');
    setResult(null);
    setErrorMsg('');
    setActiveTab('text');

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const res = await fetch('/api/snap-study', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, action: 'all' }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'API error');

        setResult(data);
        setStatus('done');
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || 'Failed to process image.');
        setStatus('error');
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const reset = () => {
    setStatus('idle');
    setSelectedImage(null);
    setResult(null);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-8 px-2">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Camera className="w-8 h-8 text-fuchsia-500" />
              Snap &amp; Study
            </h1>
            <p className="text-slate-400">
              Upload any textbook page, whiteboard, or notes — AI extracts the text and builds your study materials instantly.
            </p>
          </div>
          {status === 'done' && (
            <button onClick={reset} className="btn-secondary shrink-0">
              <RotateCw className="w-4 h-4" /> Scan Another
            </button>
          )}
        </div>

        {/* ── States ── */}
        <AnimatePresence mode="wait">

          {/* IDLE */}
          {status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className={`relative glass-card border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-16 text-center cursor-pointer group rounded-3xl ${
                isDragging ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'border-white/20 hover:border-fuchsia-500/50 hover:bg-white/3'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div className="w-24 h-24 rounded-full bg-fuchsia-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-12 h-12 text-fuchsia-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Snap a Photo or Upload an Image</h2>
              <p className="text-slate-400 mb-8 max-w-md">
                Drag & drop here, or choose a file. Supports textbook pages, handwritten notes, whiteboards, and diagrams.
              </p>
              <div className="flex flex-wrap gap-4 justify-center" onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn-primary glow-purple"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4" /> Use Camera
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" /> Upload File
                </button>
              </div>

              {/* Hidden inputs */}
              <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
              <input ref={cameraInputRef} type="file" onChange={handleFileChange} className="hidden" accept="image/*" capture="environment" />

              <p className="text-xs text-slate-500 mt-8 font-mono">
                Powered by Groq · Llama 4 Scout Vision · llama-3.3-70b
              </p>
            </motion.div>
          )}

          {/* SCANNING */}
          {status === 'scanning' && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col lg:flex-row gap-8"
            >
              {/* Image preview */}
              <div className="flex-1 glass-card rounded-3xl overflow-hidden border border-white/10 min-h-[400px] flex items-center justify-center bg-black/30 relative">
                {selectedImage && (
                  <img src={selectedImage} alt="Uploaded" className="max-w-full max-h-[500px] object-contain opacity-80" />
                )}
                {/* Scan line animation */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute inset-x-0 h-1 animate-scan bg-gradient-to-r from-transparent via-fuchsia-500/60 to-transparent" />
                </div>
              </div>

              {/* Processing status */}
              <div className="flex-1 flex flex-col items-center justify-center gap-8 py-12">
                <div className="relative w-28 h-28">
                  <div className="absolute inset-0 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin" />
                  <div className="absolute inset-4 border-4 border-cyan-500/20 border-b-cyan-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                  <Sparkles className="w-10 h-10 text-fuchsia-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-3">Analyzing Image...</h2>
                  <p className="text-slate-400 max-w-xs">
                    Groq Vision is reading your image and generating study materials. This takes about 10–20 seconds.
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  {[
                    { label: 'Extracting text via vision AI', done: true },
                    { label: 'Generating summary',            done: false },
                    { label: 'Identifying key concepts',      done: false },
                    { label: 'Building quiz questions',       done: false },
                    { label: 'Creating flashcards',           done: false },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <Loader2 className="w-4 h-4 text-fuchsia-400 animate-spin shrink-0" />
                      <span className="text-slate-300">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ERROR */}
          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-3xl p-12 flex flex-col items-center gap-6 text-center border border-rose-500/30"
            >
              <AlertCircle className="w-16 h-16 text-rose-400" />
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Processing Failed</h2>
                <p className="text-rose-300 font-mono text-sm">{errorMsg}</p>
              </div>
              <button onClick={reset} className="btn-primary">
                <RotateCw className="w-4 h-4" /> Try Again
              </button>
            </motion.div>
          )}

          {/* DONE */}
          {status === 'done' && result && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row gap-8"
            >
              {/* Left: image */}
              <div className="lg:w-72 xl:w-80 shrink-0">
                <div className="glass-card rounded-3xl overflow-hidden border border-white/10 sticky top-6">
                  <div className="bg-white/5 border-b border-white/10 px-4 py-3 flex items-center gap-2 text-sm text-slate-300">
                    <Camera className="w-4 h-4 text-fuchsia-400" />
                    <span>Source Image</span>
                  </div>
                  <div className="bg-black/30 p-3 flex items-center justify-center min-h-[260px]">
                    {selectedImage && (
                      <img src={selectedImage} alt="Source" className="max-w-full max-h-[320px] object-contain rounded-xl" />
                    )}
                  </div>
                  {/* Stats */}
                  <div className="p-4 border-t border-white/10 grid grid-cols-2 gap-3 text-center text-xs">
                    <div>
                      <div className="text-fuchsia-400 font-bold text-lg">{result.quiz.length}</div>
                      <div className="text-slate-400 uppercase tracking-wider font-mono">Quiz Qs</div>
                    </div>
                    <div>
                      <div className="text-violet-400 font-bold text-lg">{result.flashcards.length}</div>
                      <div className="text-slate-400 uppercase tracking-wider font-mono">Flashcards</div>
                    </div>
                    <div>
                      <div className="text-amber-400 font-bold text-lg">{result.concepts.length}</div>
                      <div className="text-slate-400 uppercase tracking-wider font-mono">Concepts</div>
                    </div>
                    <div>
                      <div className="text-cyan-400 font-bold text-lg">{result.extractedText.split(/\s+/).length}</div>
                      <div className="text-slate-400 uppercase tracking-wider font-mono">Words</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: tabs */}
              <div className="flex-1 flex flex-col">
                {/* Tab bar */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {TABS.map(({ key, label, icon: Icon, color }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                        activeTab === key
                          ? 'border-fuchsia-500/60 bg-fuchsia-500/15 text-white'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${activeTab === key ? 'text-fuchsia-400' : color}`} />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="glass-card rounded-3xl p-6 flex-1"
                  >
                    {activeTab === 'text' && (
                      <div>
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400" /> Extracted Text
                        </h3>
                        <div className="bg-black/30 rounded-2xl p-5 font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap max-h-[540px] overflow-y-auto border border-white/5">
                          {result.extractedText}
                        </div>
                      </div>
                    )}

                    {activeTab === 'summary' && (
                      <div>
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-cyan-400" /> AI Summary
                        </h3>
                        <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed">
                          <ReactMarkdown>{result.summary}</ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {activeTab === 'concepts' && (
                      <div>
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-400" /> Key Concepts
                        </h3>
                        <div className="grid gap-3">
                          {result.concepts.length > 0
                            ? result.concepts.map((c, i) => <ConceptCard key={i} concept={c} />)
                            : <p className="text-slate-400 text-sm">No concepts extracted.</p>
                          }
                        </div>
                      </div>
                    )}

                    {activeTab === 'quiz' && (
                      <div>
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-fuchsia-400" /> Quiz
                        </h3>
                        <QuizView questions={result.quiz} />
                      </div>
                    )}

                    {activeTab === 'flashcards' && (
                      <div>
                        <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
                          <Brain className="w-4 h-4 text-violet-400" /> Flashcards
                        </h3>
                        <FlashcardsView cards={result.flashcards} />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
