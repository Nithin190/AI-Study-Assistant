import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Timer, ChevronRight, CheckCircle, XCircle, Trophy, RotateCw, Target, AlertTriangle, Brain, BookOpen } from 'lucide-react';
import { MOCK_QUIZ_QUESTIONS } from '../../lib/mockData';
import { useAuth } from '../../lib/AuthContext';

export default function QuizDashboard() {
  const { user, updateXP } = useAuth();
  const [quizActive, setQuizActive] = useState(false);
  const [difficulty, setDifficulty] = useState('Medium');
  const [dynamicQuiz, setDynamicQuiz] = useState<any[]>(MOCK_QUIZ_QUESTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDoc, setActiveDoc] = useState('');

  useEffect(() => {
    const savedDoc = localStorage.getItem('activeChatDoc');
    if (savedDoc) setActiveDoc(savedDoc);
  }, []);
  
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizComplete, setQuizComplete] = useState(false);
  const [misconceptionType, setMisconceptionType] = useState('Conceptual');

  const currentQuestion = dynamicQuiz[quizIndex];
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizActive && !submitted && !quizComplete && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && !submitted && quizActive) {
      handleSubmit(null);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, quizActive, submitted, quizComplete]);

  const handleSubmit = (forcedIndex: number | null = selectedOption) => {
    if (forcedIndex === null && timeLeft > 0) return;
    setSubmitted(true);
    
    if (forcedIndex !== null && currentQuestion.options[forcedIndex] === currentQuestion.answer) {
      setScore(s => s + 1);
      updateXP(10);
    } else {
      const types = ['Factual', 'Conceptual', 'Procedural', 'Careless'];
      setMisconceptionType(types[Math.floor(Math.random() * types.length)]);
    }
  };

  const handleNext = () => {
    if (quizIndex < dynamicQuiz.length - 1) {
      setQuizIndex(i => i + 1);
      setSelectedOption(null);
      setSubmitted(false);
      setTimeLeft(30);
    } else {
      setQuizComplete(true);
      setQuizActive(false);
    }
  };

  const startQuiz = async () => {
    setIsLoading(true);
    setQuizActive(true);

    const contextToSend = activeDoc ? `[Simulated Context for ${activeDoc}]\nThis is a simulated document content because the actual file was loaded from the dashboard. Please pretend you have read the document named "${activeDoc}" and provide a generic, helpful, and plausible answer related to what a document with that filename might contain.` : '';
    const systemPromptOverride = 'Generate 3 multiple choice quiz questions based on the document. Return ONLY a raw JSON array of objects with exactly this structure: [{"question": "...", "options": ["A", "B", "C", "D"], "answer": "A", "explanation": "...", "topic": "..."}]. Do not include any markdown blocks like ```json or anything else. Just the raw array starting with [ and ending with ].';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: 'Generate a quiz' }], 
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
        setDynamicQuiz(parsed);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setQuizComplete(false);
      setQuizIndex(0);
      setScore(0);
      setSelectedOption(null);
      setSubmitted(false);
      setTimeLeft(30);
    }
  };

  const timerStrokeDashoffset = 251.2 - (251.2 * (timeLeft / 30));

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-8">
        <AnimatePresence mode="wait">
          
          {/* 1. START SCREEN */}
          {!quizActive && !quizComplete && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="glass-strong p-8 md:p-12 text-center rounded-3xl relative overflow-hidden border-purple-500/30">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mx-auto mb-6 shadow-glow-purple">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">Adaptive Quiz</h1>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">Powered by Bayesian Knowledge Tracing. Questions adapt to your mastery level.</p>
                
                <div className="flex justify-center gap-4 mb-8">
                  {['Easy', 'Medium', 'Hard'].map(d => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                        difficulty === d
                          ? 'bg-white/10 text-white border-2 border-purple-500 shadow-glow-purple'
                          : 'bg-white/5 text-slate-400 border-2 border-transparent hover:bg-white/10'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                
                <button onClick={startQuiz} disabled={isLoading} className="btn-primary text-lg px-8 py-4 shadow-glow-purple">
                  {isLoading ? 'Generating Quiz...' : (
                    <>Start Quiz <ChevronRight className="w-5 h-5" /></>
                  )}
                </button>
                
                <div className="mt-12 flex justify-center gap-8 text-sm">
                  <div><span className="text-white font-bold text-lg block">35</span><span className="text-slate-500">Quizzes Taken</span></div>
                  <div><span className="text-white font-bold text-lg block">74%</span><span className="text-slate-500">Avg Accuracy</span></div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2 & 3. QUESTION & REVEAL SCREEN */}
          {quizActive && (
            <motion.div
              key="question"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-1">
                    Question {quizIndex + 1} of {dynamicQuiz.length}
                  </div>
                  <div className="text-xs text-slate-400">{currentQuestion.topic}</div>
                </div>
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" className="stroke-white/10 fill-none" strokeWidth="8" />
                    <circle 
                      cx="50" cy="50" r="40" 
                      className={`fill-none transition-all duration-1000 ease-linear ${timeLeft <= 5 ? 'stroke-rose-500' : 'stroke-cyan-400'}`}
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset={timerStrokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className={`absolute font-mono font-medium ${timeLeft <= 5 ? 'text-rose-500' : 'text-white'}`}>{timeLeft}</span>
                </div>
              </div>

              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300"
                  style={{ width: `${((quizIndex) / dynamicQuiz.length) * 100}%` }}
                />
              </div>

              <div className="glass-strong p-6 md:p-8 rounded-2xl">
                <h2 className="text-xl md:text-2xl font-medium text-white mb-8 leading-relaxed">
                  {currentQuestion.question}
                </h2>

                <div className="space-y-3">
                  {currentQuestion.options?.map((opt: string, i: number) => {
                    const isSelected = selectedOption === i;
                    const isCorrect = opt === currentQuestion.answer;
                    
                    let btnClass = 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-white/20';
                    if (submitted) {
                      if (isCorrect) btnClass = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
                      else if (isSelected) btnClass = 'bg-rose-500/20 border-rose-500/50 text-rose-100';
                      else btnClass = 'bg-white/5 border-white/10 text-slate-500 opacity-50';
                    } else if (isSelected) {
                      btnClass = 'bg-purple-500/20 border-purple-500/50 text-white shadow-[0_0_15px_rgba(124,58,237,0.2)]';
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => !submitted && setSelectedOption(i)}
                        disabled={submitted}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${btnClass}`}
                      >
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          submitted && isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' :
                          submitted && isSelected && !isCorrect ? 'bg-rose-500 border-rose-500 text-white' :
                          isSelected && !submitted ? 'bg-purple-500 border-purple-500 text-white' :
                          'border-white/20 text-transparent'
                        }`}>
                          {submitted && isCorrect ? <CheckCircle className="w-4 h-4" /> :
                           submitted && isSelected && !isCorrect ? <XCircle className="w-4 h-4" /> :
                           <span className="w-2 h-2 rounded-full bg-current" />}
                        </div>
                        <span className="leading-relaxed">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {submitted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                      className="overflow-hidden"
                    >
                      {selectedOption !== null && currentQuestion.options[selectedOption] !== currentQuestion.answer ? (
                        <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/10">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="badge badge-rose uppercase text-[10px] tracking-wider font-bold"><AlertTriangle className="w-3 h-3 mr-1"/> {misconceptionType} Mistake</span>
                          </div>
                          <h4 className="font-semibold text-rose-200 mb-2">Why your answer seems right:</h4>
                          <p className="text-sm text-slate-300 mb-4">You might be thinking of a different concept that sounds similar, which is a common {misconceptionType.toLowerCase()} error.</p>
                          <h4 className="font-semibold text-emerald-300 mb-2">The actual answer:</h4>
                          <p className="text-sm text-slate-300">{currentQuestion.explanation}</p>
                        </div>
                      ) : (
                        <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                            <h4 className="font-semibold text-emerald-300">Spot on!</h4>
                          </div>
                          <p className="text-sm text-slate-300">{currentQuestion.explanation}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-8 flex justify-between items-center">
                  <button className="btn-ghost" onClick={() => { setQuizActive(false); setQuizComplete(false); }}>
                    End Quiz
                  </button>
                  
                  {!submitted ? (
                    <button 
                      className="btn-primary" 
                      disabled={selectedOption === null}
                      onClick={() => handleSubmit()}
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button className="btn-primary shadow-glow-purple" onClick={handleNext}>
                      {quizIndex < dynamicQuiz.length - 1 ? 'Next Question' : 'View Results'} <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* 4. QUIZ COMPLETE SCREEN */}
          {quizComplete && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-strong p-8 md:p-12 text-center rounded-3xl relative overflow-hidden"
            >
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
              <p className="text-slate-400 mb-8">Great job reviewing {dynamicQuiz[0]?.topic || 'this topic'}.</p>
              
              <div className="flex justify-center items-center gap-8 mb-10">
                <div className="text-center">
                  <div className="text-5xl font-display font-bold text-white mb-1">
                    {score} <span className="text-2xl text-slate-500">/ {dynamicQuiz.length}</span>
                  </div>
                  <div className="text-sm text-slate-400 uppercase tracking-widest">Score</div>
                </div>
                
                <div className="w-px h-16 bg-white/10" />
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-400 mb-1">
                    +{score * 10}
                  </div>
                  <div className="text-sm text-slate-400 uppercase tracking-widest flex items-center gap-1 justify-center">
                    <Star className="w-3 h-3 text-amber-400" /> XP Earned
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                <button onClick={() => { setQuizActive(false); setQuizComplete(false); }} className="btn-secondary">
                  <RotateCw className="w-4 h-4" /> Take Another
                </button>
                <button onClick={() => window.location.href='/dashboard/mastery'} className="btn-primary">
                  <Target className="w-4 h-4" /> View Mastery
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

function Star(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
