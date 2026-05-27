import React from 'react';
import {
  Sparkles,
  FileText,
  ArrowRight,
  BookOpen,
  Clock,
  BrainCircuit,
} from 'lucide-react';

export default function Dashboard({ user, notes, setActiveTab }) {
  const recentNotes = notes.slice(-3).reverse();

  return (
    <div className="space-y-8 animate-fade-in">

      <div className="p-6 md:p-8 rounded-2xl glass-panel relative overflow-hidden bg-gradient-to-r from-brand-600/10 via-purple-600/5 to-slate-900 shadow-xl">
        <div className="absolute top-0 right-0 w-[30%] h-full bg-gradient-to-l from-brand-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-full text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Study Tool
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-white leading-tight">
            Turn complexity into <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-500">clarity</span>.
          </h1>
          <p className="text-slate-400 mt-3 text-sm md:text-base leading-relaxed">
            Paste text, share a link, or drop a YouTube URL. Briefly extracts highlights, generates study questions, and chats with you in any language.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('summarizer')}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium text-sm transition-all duration-300 shadow-lg shadow-brand-500/20 flex items-center gap-2 group"
            >
              New Summary
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setActiveTab('chatbot')}
              className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 rounded-xl font-medium text-sm transition-all"
            >
              Ask AI
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="glass-card rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Saved Notes</span>
            <h3 className="text-2xl font-display font-bold text-white mt-0.5">{notes.length}</h3>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-accent-500/10 flex items-center justify-center text-accent-400">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Status</span>
            <h3 className="text-xs font-semibold text-slate-300 mt-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
              Ready
            </h3>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Data</span>
            <h3 className="text-xs font-semibold text-slate-300 mt-1.5">Stored Locally</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-400" />
              Recent Documents
            </h2>
            {notes.length > 0 && (
              <button onClick={() => setActiveTab('saved-notes')} className="text-xs text-brand-400 hover:underline">
                See All
              </button>
            )}
          </div>

          {recentNotes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-slate-800/80 rounded-xl bg-slate-950/20 text-center">
              <BookOpen className="w-8 h-8 text-slate-600 mb-3" />
              <h3 className="text-sm font-medium text-slate-400">No summaries yet</h3>
              <p className="text-xs text-slate-600 max-w-xs mt-1">Go to the Summarizer tab to create your first study note.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setActiveTab('saved-notes')}
                  className="p-4 bg-slate-900/30 border border-slate-800/50 hover:border-slate-700 rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 group"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <h4 className="text-sm font-medium text-slate-200 truncate group-hover:text-brand-400 transition-colors">{note.title}</h4>
                    <span className="text-[10px] text-slate-500 mt-1 block">{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-accent-400" />
            Quick Start
          </h2>

          <ol className="space-y-3.5 text-xs text-slate-400 list-decimal list-inside">
            <li>Open the <button onClick={() => setActiveTab('summarizer')} className="text-brand-400 hover:underline">Summarizer</button> to generate study notes</li>
            <li>Use the <button onClick={() => setActiveTab('chatbot')} className="text-brand-400 hover:underline">Chat</button> to ask questions</li>
            <li>All data stays in your browser</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
