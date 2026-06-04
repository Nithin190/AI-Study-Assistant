import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, FileText, Loader2, Languages, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MultilingualNotes() {
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [activeDoc, setActiveDoc] = useState('');
  const [targetLang, setTargetLang] = useState('Spanish');

  useEffect(() => {
    const savedDoc = localStorage.getItem('activeChatDoc');
    if (savedDoc) setActiveDoc(savedDoc);
  }, []);

  const generateNotes = async () => {
    setIsLoading(true);
    setNotes('');
    const contextToSend = activeDoc ? `[Context for ${activeDoc}]\nPlease pretend you have read the document named "${activeDoc}" and provide notes.` : '';
    const systemPromptOverride = `You are a multilingual study assistant. Generate comprehensive, well-structured study notes based on the document, but write them entirely in ${targetLang}. Use bullet points and clear headings. Do NOT output markdown code blocks (\`\`\`), just raw markdown text.`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: `Generate notes in ${targetLang}` }], 
          context: contextToSend, 
          systemPromptOverride 
        }),
      });

      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setNotes(data.result);
    } catch (e) {
      console.error(e);
      setNotes('Failed to generate notes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const LANGUAGES = ['Spanish', 'French', 'German', 'Mandarin', 'Hindi', 'Japanese', 'Korean', 'Arabic', 'Portuguese', 'Russian'];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Globe className="w-8 h-8 text-teal-500" />
              Multilingual Notes
            </h1>
            <p className="text-slate-400">Generate structured study notes from your active document in any language.</p>
          </div>
        </div>

        {/* Configurator */}
        <div className="glass-strong p-6 rounded-3xl border-teal-500/30 mb-8 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Language</label>
            <div className="relative">
              <Languages className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="input-base w-full !pl-10"
              >
                {LANGUAGES.map(lang => <option key={lang} value={lang} className="bg-slate-900 text-white">{lang}</option>)}
              </select>
            </div>
          </div>
          <button 
            onClick={generateNotes} 
            disabled={isLoading}
            className="btn-primary shadow-[0_0_20px_rgba(20,184,166,0.3)] whitespace-nowrap h-[42px]"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : <Sparkles className="w-4 h-4 mr-2 inline"/>}
            {isLoading ? 'Translating...' : 'Generate Notes'}
          </button>
        </div>

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {!isLoading && !notes && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card flex flex-col items-center justify-center text-center p-12 border-dashed border-white/20 opacity-80 min-h-[300px]">
              <Globe className="w-16 h-16 text-teal-500 mb-4 opacity-50" />
              <h3 className="text-xl font-medium text-white mb-2">Ready to Translate</h3>
              <p className="text-slate-400 max-w-md">Select your preferred language and click Generate to extract translated notes from {activeDoc || 'your document'}.</p>
            </motion.div>
          )}

          {isLoading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card flex flex-col items-center justify-center text-center p-12 min-h-[300px]">
              <Loader2 className="w-12 h-12 text-teal-400 animate-spin mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Generating Notes in {targetLang}...</h3>
              <p className="text-slate-400">Processing the document and translating concepts accurately.</p>
            </motion.div>
          )}

          {!isLoading && notes && (
            <motion.div key="notes" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
              <div className="prose prose-invert prose-teal max-w-none prose-headings:text-teal-300 prose-a:text-teal-400">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {notes}
                </ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}
