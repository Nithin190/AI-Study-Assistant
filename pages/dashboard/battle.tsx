import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Users, Trophy, Timer, Crown, Zap, Copy, ChevronRight, CheckCircle, XCircle, Plus, Play, Star, Flame, Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import clsx from 'clsx';

type GameState = 'HOME' | 'LOBBY' | 'PLAYING' | 'REVEAL' | 'LEADERBOARD';

export default function BattleRooms() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>('HOME');
  const [roomCode, setRoomCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDoc, setActiveDoc] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    const savedDoc = localStorage.getItem('activeChatDoc');
    if (savedDoc) setActiveDoc(savedDoc);
  }, []);
  
  // Lobby state
  const [players, setPlayers] = useState([
    { id: '1', name: 'You', isHost: true, score: 0, isReady: true, avatar: 'Y' },
    { id: '2', name: 'Alex Chen', isHost: false, score: 0, isReady: true, avatar: 'A' },
    { id: '3', name: 'Priya Sharma', isHost: false, score: 0, isReady: false, avatar: 'P' }
  ]);

  const [roomTitle, setRoomTitle] = useState('Machine Learning Battle');
  const [numQuestions, setNumQuestions] = useState(10);
  const [timePerQ, setTimePerQ] = useState(15);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [answeredPlayers, setAnsweredPlayers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (gameState === 'PLAYING') {
      setAnsweredPlayers(new Set());
      
      const bot1Timer = setTimeout(() => {
        setAnsweredPlayers(prev => new Set(prev).add('2'));
      }, Math.random() * 3000 + 2000);
      
      const bot2Timer = setTimeout(() => {
        setAnsweredPlayers(prev => new Set(prev).add('3'));
      }, Math.random() * 4000 + 4000);

      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            if (currentQuestionIdx >= (questions.length > 0 ? questions.length - 1 : 1)) {
              setGameState('LEADERBOARD');
              clearInterval(timer);
              return 0;
            } else {
              setCurrentQuestionIdx(prev => prev + 1);
              return timePerQ;
            }
          }
          return t - 1;
        });
      }, 1000);
      
      return () => {
        clearInterval(timer);
        clearTimeout(bot1Timer);
        clearTimeout(bot2Timer);
      };
    }
  }, [gameState, currentQuestionIdx]);

  const handleCreateRoom = async () => {
    setIsGenerating(true);
    const contextToSend = activeDoc ? `[Simulated Context for ${activeDoc}]\nThis is a simulated document content because the actual file was loaded from the dashboard. Please pretend you have read the document named "${activeDoc}" and provide a generic, helpful, and plausible answer related to what a document with that filename might contain.` : '';
    const systemPromptOverride = `Generate ${numQuestions} multiple-choice questions based on the document. Return ONLY a raw JSON array of objects with exactly this structure: [{"q": "Question text?", "options": ["A", "B", "C", "D"], "answerIndex": 0}]. Do not include any markdown blocks.`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: 'Generate battle questions' }], 
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
        setQuestions(parsed);
        setRoomCode(Math.random().toString(36).substring(2, 8).toUpperCase());
        setGameState('LOBBY');
        setCurrentQuestionIdx(0);
        setTimeLeft(timePerQ);
      }
    } catch (e) {
      console.error(e);
      // Fallback
      setRoomCode('X7K9M2');
      setGameState('LOBBY');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleJoinRoom = () => {
    if (roomCode.length === 6) {
      setGameState('LOBBY');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    // Would show toast here
  };

  const startGame = () => {
    setGameState('PLAYING');
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-8 px-4 h-[calc(100vh-100px)] flex flex-col relative">
        
        <AnimatePresence mode="wait">
          
          {/* --- HOME SCREEN --- */}
          {gameState === 'HOME' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
              <div className="text-center mb-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                  <Sword className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">Live Quiz Battles</h1>
                <p className="text-slate-400 max-w-lg mx-auto">Compete in real-time. Score points for correct answers and speed. May the best scholar win.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
                
                {/* Create Room */}
                <div className="glass-strong p-8 rounded-3xl border-amber-500/30 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Crown className="w-32 h-32 text-amber-500" /></div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Plus className="text-amber-400"/> Create Battle</h2>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Battle Topic</label>
                      <input type="text" value={roomTitle} onChange={e => setRoomTitle(e.target.value)} className="input-base" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Questions</label>
                        <select className="input-base cursor-pointer" value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))}>
                          <option value={5}>5 Questions</option>
                          <option value={10}>10 Questions</option>
                          <option value={15}>15 Questions</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Time per Q</label>
                        <select className="input-base cursor-pointer" value={timePerQ} onChange={e => setTimePerQ(Number(e.target.value))}>
                          <option value={15}>15 Seconds</option>
                          <option value={20}>20 Seconds</option>
                          <option value={30}>30 Seconds</option>
                        </select>
                      </div>
                    </div>
                    
                    <button onClick={handleCreateRoom} disabled={isGenerating} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:shadow-none">
                      {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                      {isGenerating ? 'Generating...' : 'Create Room'}
                    </button>
                  </div>
                </div>

                {/* Join Room */}
                <div className="glass-strong p-8 rounded-3xl border-cyan-500/30 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Users className="w-32 h-32 text-cyan-500" /></div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Users className="text-cyan-400"/> Join Battle</h2>
                  
                  <div className="space-y-6 h-full flex flex-col">
                    <p className="text-sm text-slate-400">Enter a 6-character room code from your host to join an active battle.</p>
                    
                    <div className="mt-auto">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Room Code</label>
                      <input 
                        type="text" 
                        value={roomCode} 
                        onChange={e => setRoomCode(e.target.value.toUpperCase())} 
                        maxLength={6}
                        placeholder="e.g. X7K9M2"
                        className="input-base font-mono text-2xl text-center tracking-widest py-4 uppercase" 
                      />
                    </div>
                    
                    <button 
                      onClick={handleJoinRoom} 
                      disabled={roomCode.length !== 6}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50 disabled:hover:shadow-none"
                    >
                      Join Battle
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* --- LOBBY SCREEN --- */}
          {gameState === 'LOBBY' && (
            <motion.div key="lobby" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center">
              
              <div className="glass-strong p-10 rounded-3xl w-full max-w-2xl border-purple-500/30 text-center relative">
                <button onClick={() => setGameState('HOME')} className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium">
                  ← Leave
                </button>
                
                <h2 className="text-3xl font-bold text-white mb-2 mt-4">{roomTitle}</h2>
                <div className="flex items-center justify-center gap-4 text-sm text-slate-400 mb-8">
                  <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-amber-400"/> {numQuestions} Questions</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Timer className="w-4 h-4 text-cyan-400"/> {timePerQ}s per question</span>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 mb-10 inline-block mx-auto shadow-inner">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Room Code</div>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl font-mono font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                      {roomCode || 'X7K9M2'}
                    </div>
                    <button onClick={handleCopyCode} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors group">
                      <Copy className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>

                <div className="text-left mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-400"/> Players ({players.length})
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {players.map(p => (
                      <div key={p.id} className="glass p-3 rounded-xl flex items-center gap-3 relative overflow-hidden">
                        {p.isReady && <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none border border-emerald-500/20 rounded-xl" />}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0 relative">
                          {p.avatar}
                          {p.isHost && <div className="absolute -top-1 -right-1 bg-amber-500 text-black rounded-full p-0.5"><Crown className="w-3 h-3"/></div>}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white truncate">{p.name}</div>
                          <div className={`text-xs ${p.isReady ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {p.isReady ? 'Ready' : 'Joining...'}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="glass p-3 rounded-xl flex items-center justify-center gap-2 border-dashed border-white/20 text-slate-500 text-sm opacity-50">
                      <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" /> Waiting...
                    </div>
                  </div>
                </div>

                <button onClick={startGame} className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-xl hover:shadow-glow-purple transition-all flex items-center justify-center gap-2 mt-4">
                  <Play className="w-6 h-6 fill-current" /> Start Battle Now
                </button>
              </div>

            </motion.div>
          )}

          {/* PLAYING STATE MOCK (Simplified for demo) */}
          {gameState === 'PLAYING' && (
             <motion.div key="playing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full">
                
                <div className="w-full flex justify-between items-center mb-8">
                  <div className="badge badge-amber px-4 py-2 text-lg">Question {currentQuestionIdx + 1}/{questions.length > 0 ? questions.length : 2}</div>
                  <div className="flex items-center gap-2 text-2xl font-mono font-bold text-rose-400">
                    <Timer className="w-6 h-6" /> 00:{timeLeft.toString().padStart(2, '0')}
                  </div>
                </div>

                <div className="glass-strong p-10 rounded-3xl w-full text-center border-amber-500/30 mb-8">
                  <h2 className="text-3xl font-bold text-white leading-relaxed">
                    {questions[currentQuestionIdx]?.q || (currentQuestionIdx === 0 ? "What does BKT stand for?" : "Which algorithm is used for spaced repetition in this app?")}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {(questions[currentQuestionIdx]?.options || [
                    currentQuestionIdx === 0 ? "Bayesian Knowledge Tracing" : "SuperMemo SM-2",
                    currentQuestionIdx === 0 ? "Binary Knowledge Tree" : "K-Means Clustering",
                    currentQuestionIdx === 0 ? "Basic Kernel Testing" : "Apriori Algorithm",
                    currentQuestionIdx === 0 ? "Bayes-Kullback Theory" : "Ebbinghaus Curve"
                  ]).map((opt: string, i: number) => (
                    <button key={i} onClick={() => setAnsweredPlayers(prev => new Set(prev).add('1'))} className={clsx("glass p-6 rounded-2xl text-lg font-medium text-white transition-all text-left", answeredPlayers.has('1') ? "bg-amber-500/20 border-amber-500/50" : "hover:bg-amber-500/20 border-white/10 hover:border-amber-500/50")}>
                      {opt}
                    </button>
                  ))}
                </div>
                
                <div className="mt-8 flex items-center justify-between w-full p-4 glass-card rounded-2xl">
                  <div className="text-slate-400">
                    {answeredPlayers.size === 3 ? "All players answered! Waiting for timer..." : "Waiting for other players to answer..."}
                  </div>
                  <div className="flex gap-2">
                    <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all", answeredPlayers.has('2') ? "bg-emerald-500/20 border border-emerald-500 text-emerald-400" : "bg-white/5 border border-white/10 text-slate-500")} title="Alex Chen">A</div>
                    <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all", answeredPlayers.has('3') ? "bg-emerald-500/20 border border-emerald-500 text-emerald-400" : "bg-white/5 border border-white/10 text-slate-500")} title="Priya Sharma">P</div>
                  </div>
                </div>

             </motion.div>
          )}

          {/* LEADERBOARD STATE */}
          {gameState === 'LEADERBOARD' && (
             <motion.div key="leaderboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
                <div className="text-center mb-8">
                  <Crown className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                  <h2 className="text-4xl font-bold text-white mb-2">Battle Complete!</h2>
                  <p className="text-slate-400">Here are the final standings based on speed and accuracy.</p>
                </div>

                <div className="w-full space-y-3 mb-8">
                  <div className="glass-strong p-4 rounded-2xl border-amber-500/50 flex items-center justify-between bg-amber-500/10">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-amber-500 w-8 text-center">1</div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl">Y</div>
                      <span className="font-bold text-lg text-white">You</span>
                    </div>
                    <div className="text-2xl font-bold text-amber-400">2,450 pts</div>
                  </div>
                  <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-slate-400 w-8 text-center">2</div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">A</div>
                      <span className="font-medium text-lg text-slate-200">Alex Chen</span>
                    </div>
                    <div className="text-xl font-bold text-slate-300">1,820 pts</div>
                  </div>
                  <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-amber-700 w-8 text-center">3</div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">P</div>
                      <span className="font-medium text-lg text-slate-200">Priya Sharma</span>
                    </div>
                    <div className="text-xl font-bold text-slate-300">1,100 pts</div>
                  </div>
                </div>

                <button onClick={() => { setGameState('HOME'); setCurrentQuestionIdx(0); setTimeLeft(15); }} className="btn-secondary w-full max-w-sm">Return to Lobby</button>
             </motion.div>
          )}

        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
