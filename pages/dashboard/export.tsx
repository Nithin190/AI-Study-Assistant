import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Download, FileText, CheckCircle } from 'lucide-react';

export default function ExportDashboard() {
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-10 h-10 text-purple-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Export to PDF</h1>
        <p className="text-slate-400 mb-8">
          Download a beautiful, formatted PDF of all your recent notes, chat history, and generated flashcards for offline studying.
        </p>

        <div className="glass p-8 rounded-2xl border border-white/10 max-w-md mx-auto mb-8 text-left">
          <h3 className="font-semibold text-white mb-4">What's included:</h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> All Chat History (Last 30 Days)</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Saved Concept Explanations</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Mastered Flashcards List</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Generated Study Plans</li>
          </ul>
        </div>

        <button 
          onClick={handleExport} 
          disabled={exporting || success}
          className="btn-primary w-full max-w-md text-lg py-4 shadow-glow-purple flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
        >
          {exporting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating PDF...
            </>
          ) : success ? (
            <>
              <CheckCircle className="w-5 h-5" /> PDF Downloaded!
            </>
          ) : (
            <>
              <Download className="w-5 h-5" /> Generate & Download PDF
            </>
          )}
        </button>
      </div>
    </DashboardLayout>
  );
}
