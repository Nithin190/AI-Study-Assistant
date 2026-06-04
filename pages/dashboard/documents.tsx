import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { FileText, Upload, Trash2, ExternalLink, FolderOpen, Clock, Layers, ChevronRight, Search, Filter, Plus, BookOpen, Database } from 'lucide-react';
import clsx from 'clsx';

export default function DocumentsDashboard() {
  const [multiDoc, setMultiDoc] = useState(false);
  const [docs, setDocs] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('uploadedDocs');
    if (saved) {
      try {
        setDocs(JSON.parse(saved));
      } catch(e) {}
    }
  }, []);

  const updateDocs = (newDocs: any[]) => {
    setDocs(newDocs);
    localStorage.setItem('uploadedDocs', JSON.stringify(newDocs));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const newDoc = {
        id: Date.now(),
        name: file.name,
        date: 'Just now',
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        chunks: Math.floor(Math.random() * 50) + 10,
        active: true
      };
      updateDocs([newDoc, ...docs.map(d => ({ ...d, active: false }))]);
      localStorage.setItem('activeChatDoc', file.name);
    }
  };

  const handleLoadToChat = (doc: any) => {
    localStorage.setItem('activeChatDoc', doc.name);
    updateDocs(docs.map(d => ({ ...d, active: d.id === doc.id })));
  };

  const handleUnload = () => {
    localStorage.removeItem('activeChatDoc');
    updateDocs(docs.map(d => ({ ...d, active: false })));
  };

  const handleDelete = (id: number) => {
    updateDocs(docs.filter(d => d.id !== id));
  };
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <FolderOpen className="w-8 h-8 text-rose-500" />
              My Documents
            </h1>
            <p className="text-slate-400">Manage your uploaded PDFs, lecture notes, and textbooks.</p>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.txt" />
          <button onClick={handleUploadClick} className="btn-primary"><Upload className="w-4 h-4"/> Upload New</button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search & Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search documents..." className="input-base w-full bg-white/5 border-white/10" style={{ paddingLeft: '2.5rem' }} />
              </div>
              <button className="btn-secondary h-11"><Filter className="w-4 h-4"/> Filter</button>
            </div>

            {/* Document List */}
            <div className="space-y-4">
              {docs.length === 0 ? (
                <div className="glass-card p-12 text-center border-dashed border-white/20 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No documents yet</h3>
                  <p className="text-slate-400 max-w-sm mb-6">Upload your first textbook, paper, or lecture notes to get started.</p>
                  <button onClick={handleUploadClick} className="btn-primary"><Upload className="w-4 h-4" /> Upload Document</button>
                </div>
              ) : (
                docs.map(doc => (
                  <motion.div 
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={clsx(
                      "glass-card p-5 transition-all group border",
                      doc.active ? "border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.1)] bg-rose-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
                    )}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-start gap-4">
                        <div className={clsx("p-3 rounded-xl flex-shrink-0", doc.active ? "bg-rose-500/20" : "bg-white/5")}>
                          <FileText className={clsx("w-6 h-6", doc.active ? "text-rose-400" : "text-slate-400")} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className={clsx("font-semibold text-lg line-clamp-1", doc.active ? "text-white" : "text-slate-200")}>{doc.name}</h3>
                            {doc.active && <span className="badge badge-rose text-[10px] px-2 uppercase tracking-wider">Active in Chat</span>}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {doc.date}</span>
                            <span className="flex items-center gap-1"><Database className="w-3 h-3"/> {doc.size}</span>
                            <span className="flex items-center gap-1"><Layers className="w-3 h-3"/> {doc.chunks} chunks</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {doc.active ? (
                          <button onClick={handleUnload} className="btn-secondary w-full sm:w-auto">Unload</button>
                        ) : (
                          <button onClick={() => handleLoadToChat(doc)} className="btn-primary w-full sm:w-auto">Load to Chat</button>
                        )}
                        <button onClick={() => handleDelete(doc.id)} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            
            {/* Multi-Doc Toggle */}
            <div className="glass-strong p-6 rounded-2xl border-cyan-500/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2"><Layers className="w-5 h-5 text-cyan-400"/> Multi-Document RAG</h3>
                
                {/* Toggle switch */}
                <button 
                  onClick={() => setMultiDoc(!multiDoc)}
                  className={clsx(
                    "w-12 h-6 rounded-full transition-colors relative",
                    multiDoc ? "bg-cyan-500" : "bg-slate-700"
                  )}
                >
                  <motion.div 
                    className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm"
                    animate={{ left: multiDoc ? "26px" : "2px" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
              <p className="text-sm text-slate-400 mb-4">Query across all your uploaded documents simultaneously to synthesize answers from multiple sources.</p>
              {multiDoc && (
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-start gap-2 text-sm text-cyan-200">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  Now searching across {docs.length} documents. Responses may take slightly longer.
                </div>
              )}
            </div>

            {/* Storage Stats */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-6">Storage & Vector DB</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Total Documents</span>
                    <span className="font-medium text-white">{docs.length}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Vector Embeddings</span>
                    <span className="font-medium text-white">807 Chunks</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-gradient-to-r from-purple-500 to-cyan-500" />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 text-right">~20.6 MB Storage</div>
                </div>
              </div>
            </div>

            {/* Upload Zone */}
            <div className="glass-card p-6 border-dashed border-white/20 text-center hover:border-rose-500/50 hover:bg-white/5 cursor-pointer transition-all group">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="font-medium text-white mb-1">Drag & Drop Files</h3>
              <p className="text-xs text-slate-400 mb-4">PDF, TXT, DOCX up to 50MB</p>
              <button className="btn-secondary text-sm">Browse Files</button>
            </div>

          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

function Info(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
}
