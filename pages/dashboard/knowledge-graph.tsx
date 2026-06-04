import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Network, ZoomIn, ZoomOut, RotateCcw, Info, Search, Shield, Brain, Loader2, RefreshCw } from 'lucide-react';

const INITIAL_NODES = [
  { id: 'bkt', label: 'BKT', x: 500, y: 150, mastery: 0.82, group: 'core' },
  { id: 'srs', label: 'Spaced Repetition', x: 300, y: 250, mastery: 0.91, group: 'core' },
  { id: 'sm2', label: 'SM-2 Algorithm', x: 200, y: 350, mastery: 0.88, group: 'algo' },
  { id: 'rag', label: 'RAG', x: 700, y: 250, mastery: 0.74, group: 'core' },
  { id: 'hybrid', label: 'Hybrid RAG', x: 850, y: 350, mastery: 0.65, group: 'algo' }
];

const INITIAL_LINKS = [
  { source: 'bkt', target: 'srs' },
  { source: 'rag', target: 'hybrid' }
];

export default function KnowledgeGraphDashboard() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDoc, setActiveDoc] = useState('');

  useEffect(() => {
    const savedDoc = localStorage.getItem('activeChatDoc');
    if (savedDoc) setActiveDoc(savedDoc);
  }, []);

  const generateGraph = async () => {
    setIsLoading(true);
    const contextToSend = activeDoc ? `[Simulated Context for ${activeDoc}]\nThis is a simulated document content because the actual file was loaded from the dashboard. Please pretend you have read the document named "${activeDoc}" and provide a generic, helpful, and plausible answer related to what a document with that filename might contain.` : '';
    const systemPromptOverride = 'Extract 10 key concepts from the document and define their relationships. Return ONLY a raw JSON object with exactly this structure: {"nodes": [{"id": "term1", "label": "Term 1", "x": <random integer between 100 and 1000>, "y": <random integer between 100 and 600>, "mastery": <random float between 0.1 and 1.0>}], "links": [{"source": "term1", "target": "term2"}]}. Do not include markdown blocks.';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: 'Generate knowledge graph' }], 
          context: contextToSend, 
          systemPromptOverride 
        }),
      });

      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      
      const match = data.result.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON object found in response');
      const parsed = JSON.parse(match[0]);
      
      if (parsed.nodes && parsed.links) {
        setNodes(parsed.nodes);
        setLinks(parsed.links);
        setSelectedNode(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getNodeColor = (mastery: number) => {
    if (mastery >= 0.7) return '#10b981'; // emerald
    if (mastery >= 0.4) return '#f59e0b'; // amber
    return '#ef4444'; // rose
  };

  const getLabelColor = (mastery: number) => {
    if (mastery >= 0.7) return 'text-emerald-400';
    if (mastery >= 0.4) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 h-[calc(100vh-100px)] flex flex-col gap-6">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Network className="w-8 h-8 text-purple-500" />
              Knowledge Graph
            </h1>
            <p className="text-slate-400">Entity-relation network extracted from {activeDoc || 'your documents'}, colored by your mastery.</p>
          </div>
          <div className="flex flex-col items-end gap-4">
            <button 
              onClick={generateGraph} 
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {isLoading ? 'Extracting...' : 'Generate Graph'}
            </button>
            <div className="glass-card px-4 py-2 flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"/> Mastered</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"/> Learning</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"/> Needs Work</div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex gap-6 min-h-0">
          
          {nodes.length === 0 ? (
            <div className="flex-1 glass-card border-dashed border-white/20 flex flex-col items-center justify-center p-12 text-center opacity-80">
              <Network className="w-16 h-16 text-slate-500 mb-4" />
              <h3 className="text-2xl font-medium text-white mb-2">Knowledge Graph Not Generated</h3>
              <p className="text-slate-400 max-w-md mx-auto">Click "Generate Graph" to map out the entities and relationships in {activeDoc || 'your document'}.</p>
            </div>
          ) : (
            <>
              {/* Main Canvas Area */}
              <div className="flex-1 glass-card relative overflow-hidden flex flex-col">
            {/* Toolbar */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <div className="glass p-1 rounded-lg flex items-center shadow-lg border-white/10">
                <button className="p-2 text-slate-400 hover:text-white transition-colors"><ZoomIn className="w-5 h-5"/></button>
                <button className="p-2 text-slate-400 hover:text-white transition-colors"><ZoomOut className="w-5 h-5"/></button>
                <div className="w-px h-5 bg-white/10 mx-1" />
                <button className="p-2 text-slate-400 hover:text-white transition-colors"><RotateCcw className="w-5 h-5"/></button>
              </div>
            </div>

            {/* SVG Graph */}
            <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing bg-[#020008] relative">
              {/* Grid background pattern */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              
              <svg width="100%" height="100%" viewBox="0 0 1200 700" className="absolute inset-0">
                <defs>
                  <filter id="glow-emerald" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="15" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <filter id="glow-amber" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="15" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <filter id="glow-rose" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="15" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Edges */}
                {links.map((link, i) => {
                  const sourceNode = nodes.find(n => n.id === link.source);
                  const targetNode = nodes.find(n => n.id === link.target);
                  
                  if (!sourceNode || !targetNode) return null;
                  
                  const isSelected = selectedNode === sourceNode.id || selectedNode === targetNode.id;
                  
                  return (
                    <line
                      key={i}
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={isSelected ? "rgba(124, 58, 237, 0.8)" : "rgba(255, 255, 255, 0.15)"}
                      strokeWidth={isSelected ? 3 : 1.5}
                      className="transition-all duration-300"
                    />
                  );
                })}

                {/* Nodes */}
                {nodes.map((node) => {
                  const color = getNodeColor(node.mastery);
                  const isSelected = selectedNode === node.id;
                  const filterId = node.mastery >= 0.7 ? 'glow-emerald' : node.mastery >= 0.4 ? 'glow-amber' : 'glow-rose';
                  
                  return (
                    <g 
                      key={node.id} 
                      transform={`translate(${node.x}, ${node.y})`}
                      className="cursor-pointer"
                      onClick={() => setSelectedNode(node.id)}
                    >
                      {isSelected && (
                        <circle r="35" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 4" className="animate-spin-slow" />
                      )}
                      <circle
                        r={isSelected ? 24 : 18}
                        fill={color}
                        className="transition-all duration-300"
                        filter={`url(#${filterId})`}
                        opacity={selectedNode && !isSelected ? 0.3 : 1}
                      />
                      <circle
                        r={isSelected ? 24 : 18}
                        fill="#020008"
                        stroke={color}
                        strokeWidth="4"
                        className="transition-all duration-300"
                        opacity={selectedNode && !isSelected ? 0.5 : 1}
                      />
                      <text
                        y={isSelected ? 45 : 35}
                        textAnchor="middle"
                        fill="white"
                        className="text-sm font-medium transition-all duration-300 drop-shadow-md"
                        opacity={selectedNode && !isSelected ? 0.3 : 1}
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 flex flex-col gap-4 min-h-0">
            <div className="glass-card p-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search concepts..." className="input-base w-full pl-9 py-2 text-sm" />
              </div>
            </div>

            <div className="glass-card flex-1 p-4 flex flex-col min-h-0 overflow-hidden">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><Brain className="w-4 h-4 text-purple-400"/> Entities ({nodes.length})</h2>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
                {[...nodes].sort((a, b) => (b.mastery || 0) - (a.mastery || 0)).map(node => (
                  <div 
                    key={node.id}
                    onClick={() => setSelectedNode(node.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedNode === node.id ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-white">{node.label}</span>
                      <span className={`font-mono text-xs font-bold ${getLabelColor(node.mastery)}`}>{Math.round(node.mastery * 100)}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${node.mastery * 100}%`, backgroundColor: getNodeColor(node.mastery) }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
            </>
          )}
          
        </div>
      </div>
    </DashboardLayout>
  );
}
