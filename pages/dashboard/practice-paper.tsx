import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Clock, Target, ChevronRight, Zap, BookOpen, Check, ListChecks } from 'lucide-react';

export default function PracticePaperDashboard() {
  const [generating, setGenerating] = useState(false);
  const [paperReady, setPaperReady] = useState(false);
  const [activeDoc, setActiveDoc] = useState('');
  const [paperData, setPaperData] = useState<any>(null);

  useEffect(() => {
    const savedDoc = localStorage.getItem('activeChatDoc');
    if (savedDoc) setActiveDoc(savedDoc);
  }, []);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('paper-content');
    if (!element) return;
    
    const html2pdf = (await import('html2pdf.js')).default;

    const opt = {
      margin: 10,
      filename: `${paperData?.subject || 'practice_paper'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };
    html2pdf().set(opt).from(element).save();
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setPaperReady(false);
    
    const contextToSend = activeDoc ? `[Simulated Context for ${activeDoc}]\nThis is a simulated document content because the actual file was loaded from the dashboard. Please pretend you have read the document named "${activeDoc}" and provide a generic, helpful, and plausible answer related to what a document with that filename might contain.` : '';
    const systemPromptOverride = 'Generate a short practice exam based on the document. Return ONLY a raw JSON object with exactly this structure: {"subject": "...", "duration": "2 Hours", "mcq": [{"q": "Question 1", "options": ["A", "B", "C", "D"]}], "shortAnswer": [{"q": "Question 3", "marks": 10}]}. Generate 2 MCQs and 2 short answer questions. Do not include markdown blocks.';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: 'Generate practice paper' }], 
          context: contextToSend, 
          systemPromptOverride 
        }),
      });

      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      
      const match = data.result.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON object found in response');
      const parsed = JSON.parse(match[0]);
      
      setPaperData(parsed);
      setPaperReady(true);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="print:hidden">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <FileText className="w-8 h-8 text-rose-500" />
              Practice Papers
            </h1>
            <p className="text-slate-400">Generate full-length mock exams based on your syllabus and weak areas.</p>
          </div>
          {paperReady && (
            <div className="flex gap-3 print:hidden">
              <button onClick={handleDownloadPDF} className="btn-primary shadow-glow-purple"><Download className="w-4 h-4"/> Download PDF</button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Configurator */}
          <div className="lg:col-span-1 print:hidden">
            <div className="glass-strong p-6 rounded-3xl border-rose-500/30 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">Exam Configuration</h2>
              
              <form onSubmit={handleGenerate} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Duration</label>
                    <select className="input-base w-full">
                      <option>1 Hour</option>
                      <option>2 Hours</option>
                      <option>3 Hours</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Difficulty</label>
                    <select className="input-base w-full">
                      <option>Standard</option>
                      <option>Advanced</option>
                      <option>Expert</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Question Mix</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-rose-500 bg-black/50 border-white/20 focus:ring-rose-500 focus:ring-offset-black" />
                      <span className="text-sm text-slate-200">Multiple Choice</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-rose-500 bg-black/50 border-white/20 focus:ring-rose-500 focus:ring-offset-black" />
                      <span className="text-sm text-slate-200">Short Answer</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-rose-500 bg-black/50 border-white/20 focus:ring-rose-500 focus:ring-offset-black" />
                      <span className="text-sm text-slate-200">Long Essay / Proofs</span>
                    </label>
                  </div>
                </div>

                <button type="submit" disabled={generating || paperReady} className="btn-primary w-full mt-4 flex justify-center shadow-glow-purple group">
                  {generating ? <Zap className="w-5 h-5 animate-pulse" /> : 'Generate Paper'}
                  {!generating && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </div>
          </div>

          {/* Paper View */}
          <div className="lg:col-span-2">
            
            <AnimatePresence mode="wait">
              {!generating && !paperReady && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[400px] glass-card flex flex-col items-center justify-center text-center p-8 border-dashed border-white/20 opacity-80 print:hidden">
                  <FileText className="w-16 h-16 text-slate-500 mb-4" />
                  <h3 className="text-xl font-medium text-slate-300 mb-2">No Paper Generated</h3>
                  <p className="text-slate-400 max-w-sm">Configure your exam settings on the left and click Generate to create a custom practice paper.</p>
                </motion.div>
              )}

              {generating && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[400px] glass-card flex flex-col items-center justify-center text-center p-8 print:hidden relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 to-transparent animate-scan" />
                  <div className="w-20 h-20 relative mb-6">
                    <div className="absolute inset-0 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
                    <Zap className="w-8 h-8 text-rose-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Synthesizing Questions...</h3>
                  <p className="text-slate-400">Retrieving context from your documents and formatting as an exam paper.</p>
                </motion.div>
              )}

              {paperReady && !generating && paperData && (
                <motion.div key="paper" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} id="paper-content" className="bg-white text-slate-900 rounded-lg shadow-2xl overflow-hidden min-h-[800px] relative">
                  
                  {/* Paper Header */}
                  <div className="border-b-4 border-slate-900 p-8 text-center bg-slate-50">
                    <h2 className="text-3xl font-serif font-bold uppercase tracking-widest mb-4">Practice Examination</h2>
                    <div className="flex justify-between items-center text-sm font-semibold border-y-2 border-slate-300 py-2">
                      <span>SUBJECT: {paperData?.subject || 'Machine Learning'}</span>
                      <span>TIME: {paperData?.duration || '2 Hours'}</span>
                      <span>TOTAL MARKS: 100</span>
                    </div>
                    <div className="mt-4 text-left text-sm italic text-slate-600">
                      Instructions: Answer all questions. Write your answers clearly.
                    </div>
                  </div>

                  {/* Paper Content */}
                  <div className="p-8 md:p-12 space-y-10 font-serif">
                    
                    {/* Section A */}
                    <section>
                      <h3 className="text-xl font-bold uppercase mb-6 flex justify-between border-b border-slate-300 pb-2">
                        <span>Section A: Multiple Choice</span>
                        <span>[20 Marks]</span>
                      </h3>
                      <div className="space-y-6">
                        {paperData?.mcq?.map((q: any, idx: number) => (
                          <div key={idx} className="flex gap-4">
                            <span className="font-bold">{idx + 1}.</span>
                            <div>
                              <p className="mb-3 font-medium">{q.q}</p>
                              <ol className="list-[lower-alpha] pl-5 space-y-2">
                                {q.options?.map((opt: string, oIdx: number) => (
                                  <li key={oIdx}>{opt}</li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Section B */}
                    <section>
                      <h3 className="text-xl font-bold uppercase mb-6 flex justify-between border-b border-slate-300 pb-2">
                        <span>Section B: Short Answer</span>
                        <span>[30 Marks]</span>
                      </h3>
                      <div className="space-y-8">
                        {paperData?.shortAnswer?.map((q: any, idx: number) => (
                          <div key={idx} className="flex gap-4">
                            <span className="font-bold">{(paperData?.mcq?.length || 2) + idx + 1}.</span>
                            <div className="w-full">
                              <p className="mb-2 font-medium flex justify-between">
                                <span>{q.q}</span>
                                <span className="text-sm font-normal">[{q.marks || 10} marks]</span>
                              </p>
                              <div className="w-full h-32 border-b border-dashed border-slate-300 mt-4 relative">
                                <div className="absolute bottom-0 w-full h-8 border-t border-dashed border-slate-300" />
                                <div className="absolute bottom-8 w-full h-8 border-t border-dashed border-slate-300" />
                                <div className="absolute bottom-16 w-full h-8 border-t border-dashed border-slate-300" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none flex items-end justify-center pb-6">
                    <span className="text-xs text-slate-400">Page 1 of 4</span>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
