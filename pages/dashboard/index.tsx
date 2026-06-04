import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Upload, FileText, Zap, Brain, BookOpen, Map, ClipboardCheck, X, RotateCw, ChevronRight, Sparkles, Plus, Mic, Settings2, Bot } from 'lucide-react';
import { MOCK_MESSAGES, MOCK_QUIZ_QUESTIONS, MOCK_FLASHCARDS } from '../../lib/mockData';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function DashboardChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [activeDoc, setActiveDoc] = useState('Machine_Learning_Ch1.pdf');
  const [docContext, setDocContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicQuiz, setDynamicQuiz] = useState<any[]>(MOCK_QUIZ_QUESTIONS);
  const [dynamicFlashcards, setDynamicFlashcards] = useState<any[]>(MOCK_FLASHCARDS);

  useEffect(() => {
    const savedDoc = localStorage.getItem('activeChatDoc');
    if (savedDoc) {
      setActiveDoc(savedDoc);
    }
    const savedChat = localStorage.getItem('chatHistory');
    if (savedChat) {
      setMessages(JSON.parse(savedChat));
    } else {
      setMessages(MOCK_MESSAGES as Message[]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActiveDoc(file.name);
    localStorage.setItem('activeChatDoc', file.name);

    if (file.type === 'application/pdf') {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
        setDocContext(text);
        handleCommand(`I just uploaded ${file.name}. Can you summarize it?`, text);
      } catch (err) {
        console.error('Failed to parse PDF', err);
        handleCommand(`I just uploaded ${file.name}. Can you summarize it?`, '');
      }
    } else {
      const text = await file.text();
      const truncated = text.substring(0, 5000);
      setDocContext(truncated);
      handleCommand(`I just uploaded ${file.name}. Can you summarize it?`, truncated);
    }
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showFlashcards, showQuiz]);

  const handleCommand = async (cmd: string, overrideContext?: string) => {
    const newMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: cmd,
      timestamp: new Date().toISOString(),
    };
    
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    let systemPromptOverride = undefined;
    if (cmd.includes('quiz')) {
      systemPromptOverride = 'Generate 3 multiple choice quiz questions based on the document. Return ONLY a raw JSON array of objects with exactly this structure: [{"question": "...", "options": ["A", "B", "C", "D"], "answer": "A", "explanation": "..."}]. Do not include any markdown blocks like ```json or anything else. Just the raw array starting with [ and ending with ].';
    } else if (cmd.includes('flashcards')) {
      systemPromptOverride = 'Generate 5 flashcards based on the document. Return ONLY a raw JSON array of objects with exactly this structure: [{"front": "...", "back": "...", "category": "General"}]. Do not include any markdown blocks like ```json or anything else. Just the raw array starting with [ and ending with ].';
    }

    try {
      const apiMessages = updatedMessages.map(m => ({ role: m.role, content: m.content }));
      
      const currentContext = overrideContext !== undefined ? overrideContext : docContext;
      const contextToSend = currentContext || (activeDoc !== 'No document loaded' && activeDoc !== '' 
        ? `[Simulated Context for ${activeDoc}]\nThis is a simulated document content because the actual file was loaded from the dashboard. Please pretend you have read the document named "${activeDoc}" and provide a generic, helpful, and plausible answer related to what a document with that filename might contain.`
        : '');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, context: contextToSend, systemPromptOverride }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'API Error');
      }
      const data = await res.json();
      let responseContent = data.result;

      if (cmd.includes('quiz')) {
        try {
          const match = responseContent.match(/\[[\s\S]*\]/);
          if (!match) throw new Error('No JSON array found in response');
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDynamicQuiz(parsed);
            setShowQuiz(true);
            setQuizIndex(0);
            setQuizScore(0);
            setQuizSubmitted(false);
            setQuizSelected(null);
            responseContent = '🎯 I have generated an adaptive quiz for you from the document!';
          } else {
            throw new Error('Invalid JSON array');
          }
        } catch (e) {
          console.error('Quiz JSON Parse Error:', e, responseContent);
          responseContent = 'Sorry, I failed to generate the quiz properly.';
        }
      } else if (cmd.includes('flashcards')) {
        try {
          const match = responseContent.match(/\[[\s\S]*\]/);
          if (!match) throw new Error('No JSON array found in response');
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDynamicFlashcards(parsed);
            setShowFlashcards(true);
            setFlashcardIndex(0);
            setFlashcardFlipped(false);
            responseContent = `📇 I have generated ${parsed.length} flashcards from the material. Review them below!`;
          } else {
            throw new Error('Invalid JSON array');
          }
        } catch (e) {
          console.error('Flashcards JSON Parse Error:', e, responseContent);
          responseContent = 'Sorry, I failed to generate the flashcards properly.';
        }
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toISOString(),
      }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}`,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    handleCommand(inputValue);
    setInputValue('');
  };

  const currentFlashcard = dynamicFlashcards[flashcardIndex];
  const currentQuestion = dynamicQuiz[quizIndex];

  const renderMessageContent = (content: string) => {
    return (
      <div className="flex flex-col gap-2">
        {content.split('\n\n').map((paragraph, pIdx) => {
          const lines = paragraph.split('\n');
          return (
            <div key={pIdx} className="leading-relaxed text-[14.5px]">
              {lines.map((line, lIdx) => {
                if (line.startsWith('## ')) {
                  return <h3 key={lIdx} className="text-lg font-semibold text-white mt-3 mb-1">{line.slice(3)}</h3>;
                }
                if (line.startsWith('# ')) {
                  return <h2 key={lIdx} className="text-xl font-bold text-white mt-3 mb-1">{line.slice(2)}</h2>;
                }
                
                let isList = false;
                let textToParse = line;
                if (line.trim().startsWith('- ')) {
                  isList = true;
                  textToParse = line.replace(/^\s*-\s*/, '');
                }

                const parts = textToParse.split(/(\*\*.*?\*\*|`.*?`)/g);
                const formattedLine = parts.map((part, i) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="font-semibold text-white tracking-wide">{part.slice(2, -2)}</strong>;
                  }
                  if (part.startsWith('`') && part.endsWith('`')) {
                    return <code key={i} className="px-1.5 py-0.5 rounded-md bg-black/30 border border-white/10 font-mono text-[13px] text-purple-300">{part.slice(1, -1)}</code>;
                  }
                  return <span key={i} className="opacity-90">{part}</span>;
                });

                if (isList) {
                  return (
                    <div key={lIdx} className="flex items-start gap-2 ml-1 mt-1.5">
                      <span className="text-purple-400 font-bold mt-[2px] opacity-80 text-[10px]">●</span>
                      <div>{formattedLine}</div>
                    </div>
                  );
                }
                
                return <div key={lIdx} className="min-h-[1.25rem] mt-0.5">{formattedLine}</div>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-80px)] max-w-5xl mx-auto pb-4 gap-4">
        
        {/* Document Panel */}
        <div className="glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <FileText className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-white max-w-[200px] sm:max-w-[300px] truncate">{activeDoc || 'No document loaded'}</div>
              <div className="text-xs text-slate-400">{activeDoc ? 'Ready for Q&A' : 'Upload to begin'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="hidden sm:block text-xs text-slate-400">RAG Mode:</div>
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
              <button className="px-3 py-1 text-xs font-medium rounded-md bg-white/10 text-white">Hybrid</button>
              <button className="px-3 py-1 text-xs font-medium rounded-md text-slate-400 hover:text-white">TF-IDF</button>
            </div>
            <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".pdf,.txt,.doc,.docx" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition-colors ml-auto sm:ml-0 whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" /> Upload PDF
            </button>
          </div>
        </div>

        {/* Quick Commands */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'summarize', label: 'Summarize', icon: FileText, prompt: 'Please provide a comprehensive summary of this document.' },
            { id: 'notes', label: 'Generate Notes', icon: ClipboardCheck, prompt: 'Generate detailed, structured study notes based on this document. Use headings, bullet points, and highlight key terms.' },
            { id: 'quiz', label: 'Take Quiz', icon: Zap, prompt: 'Generate a quiz' },
            { id: 'flashcards', label: 'Flashcards', icon: Brain, prompt: 'Generate flashcards' },
            { id: 'mindmap', label: 'Mind Map', icon: Map, prompt: 'Create a text-based mind map of the core concepts in this document using nested bullet points.' },
          ].map(cmd => (
            <button
              key={cmd.id}
              onClick={() => handleCommand(cmd.prompt)}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass whitespace-nowrap text-sm text-slate-200 hover:text-white hover:border-purple-500/50 transition-colors"
            >
              <cmd.icon className="w-4 h-4 text-purple-400" />
              {cmd.label}
            </button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
            >
              <div className={`flex items-end gap-2 mb-1 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="text-xs text-slate-500">
                  {msg.role === 'user' ? user?.username : 'Study Assistant'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className={`p-4 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-purple-600 text-white rounded-tr-sm' 
                  : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm'
              }`}>
                {renderMessageContent(msg.content)}
              </div>
            </motion.div>
          ))}

          {/* Flashcard Mini-view */}
          <AnimatePresence>
            {showFlashcards && currentFlashcard && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 mb-2 max-w-lg mx-auto w-full"
              >
                <div className="glass-card p-4 relative">
                  <button onClick={() => setShowFlashcards(false)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex justify-between items-center mb-4">
                    <span className="badge badge-purple text-[10px] uppercase tracking-wider">{currentFlashcard.category || 'Concept'}</span>
                    <span className="text-xs text-slate-400">{flashcardIndex + 1} / {dynamicFlashcards.length}</span>
                  </div>
                  
                  <div className="flashcard-container h-48 cursor-pointer" onClick={() => setFlashcardFlipped(!flashcardFlipped)}>
                    <div className={`flashcard-inner h-full ${flashcardFlipped ? 'flipped' : ''}`}>
                      <div className="flashcard-front flex flex-col items-center justify-center text-center p-6 bg-white/5 rounded-xl border border-white/10 absolute inset-0">
                        <h3 className="text-lg font-medium text-white">{currentFlashcard.front}</h3>
                        <div className="mt-4 text-xs text-slate-400 flex items-center gap-1"><RotateCw className="w-3 h-3" /> Click to reveal</div>
                      </div>
                      <div className="flashcard-back flex items-center justify-center text-center p-6 bg-cyan-500/10 rounded-xl border border-cyan-500/30 absolute inset-0">
                        <p className="text-sm text-cyan-50">{currentFlashcard.back}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <button 
                      onClick={() => { setFlashcardIndex(Math.max(0, flashcardIndex - 1)); setFlashcardFlipped(false); }}
                      disabled={flashcardIndex === 0}
                      className="btn-ghost disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <button 
                      onClick={() => {
                        if (flashcardIndex < dynamicFlashcards.length - 1) {
                          setFlashcardIndex(flashcardIndex + 1);
                          setFlashcardFlipped(false);
                        } else {
                          setShowFlashcards(false);
                        }
                      }}
                      className="btn-primary"
                    >
                      {flashcardIndex < dynamicFlashcards.length - 1 ? 'Next' : 'Done'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quiz Mini-view */}
          <AnimatePresence>
            {showQuiz && currentQuestion && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 mb-2 w-full max-w-xl mx-auto"
              >
                <div className="glass-card p-6 border-cyan-500/30 relative">
                  <button onClick={() => setShowQuiz(false)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10">
                    <X className="w-4 h-4" />
                  </button>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm font-medium text-cyan-400 flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Q{quizIndex + 1} of {dynamicQuiz.length}
                    </div>
                    <div className="text-xs text-slate-400">Score: {quizScore}</div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-white mb-6">{currentQuestion.question}</h3>
                  
                  <div className="space-y-2 mb-6">
                    {currentQuestion.options?.map((opt: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => !quizSubmitted && setQuizSelected(i)}
                        disabled={quizSubmitted}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          quizSubmitted
                            ? opt === currentQuestion.answer
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100'
                              : quizSelected === i
                                ? 'bg-rose-500/20 border-rose-500/50 text-rose-100'
                                : 'bg-white/5 border-white/10 text-slate-400'
                            : quizSelected === i
                              ? 'bg-purple-500/20 border-purple-500/50 text-white'
                              : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  
                  {quizSubmitted && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg bg-black/40 border border-white/10 mb-4">
                      <div className="text-sm font-medium mb-1 text-slate-200">Explanation</div>
                      <div className="text-sm text-slate-400">{currentQuestion.explanation}</div>
                    </motion.div>
                  )}
                  
                  <div className="flex justify-end">
                    {!quizSubmitted ? (
                      <button 
                        onClick={() => {
                          setQuizSubmitted(true);
                          if (currentQuestion.options[quizSelected!] === currentQuestion.answer) {
                            setQuizScore(s => s + 1);
                          }
                        }}
                        disabled={quizSelected === null}
                        className="btn-primary disabled:opacity-50"
                      >
                        Submit Answer
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          if (quizIndex < dynamicQuiz.length - 1) {
                            setQuizIndex(i => i + 1);
                            setQuizSelected(null);
                            setQuizSubmitted(false);
                          } else {
                            setShowQuiz(false);
                            handleCommand('I finished the quiz!');
                          }
                        }}
                        className="btn-primary"
                      >
                        {quizIndex < dynamicQuiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isLoading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="flex gap-4 max-w-3xl mb-6">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-cyan-400">Study Assistant</span>
                  </div>
                  <div className="mt-2 text-slate-300 glass-card inline-flex p-3 rounded-2xl rounded-tl-sm border border-white/5">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={endOfMessagesRef} />
        </div>

        {/* Input Area */}
        <div className="mt-auto pt-2 relative">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything or use quick commands..."
              className="w-full bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20 rounded-2xl py-4 pl-5 pr-24 text-white focus:outline-none focus:border-purple-500/50 focus:bg-slate-900/80 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-500"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button type="button" className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <button 
                type="submit" 
                disabled={!inputValue.trim()}
                className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:hover:shadow-none"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
          <div className="text-center mt-2 text-[10px] text-slate-500">
            AI can make mistakes. Always verify important information.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
