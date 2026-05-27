import React, { useState, useRef, useEffect } from 'react';
import {
  FolderHeart,
  Search,
  Trash2,
  Copy,
  Check,
  Download,
  FileText,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { copyToClipboard } from '../utils';

export default function SavedNotes({ notes, onSaveNotes, setActiveTab }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(copiedTimeoutRef.current);
  }, []);

  const filteredNotes = notes.filter(note =>
    note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content?.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to permanently delete this saved summary?")) {
      const updated = notes.filter(n => n.id !== id);
      onSaveNotes(updated);
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
    }
  };

  const handleCopy = (content) => {
    clearTimeout(copiedTimeoutRef.current);
    const parts = [
      `Briefly AI Summary - ${selectedNote.title}:`,
      content.summary,
    ];
    if (content.highlights?.length) {
      parts.push('', 'Key Takeaways:', ...content.highlights.map(h => `- ${h}`));
    }
    if (content.topics?.length) {
      parts.push('', 'Topics Covered:', ...content.topics.map(t => `- ${t.name || t.topic}: ${t.description || t.meaning}`));
    }
    if (content.questions?.length) {
      parts.push('', 'Questions & Answers:');
      content.questions.forEach((q, i) => parts.push(`Q${i + 1}: ${q.question}\nA: ${q.answer}`));
    }
    copyToClipboard(parts.join('\n')).then(() => {
      setCopied(true);
      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      setCopied(false);
    });
  };

  const handleExportPDF = async () => {
    if (!selectedNote) return;
    const opt = {
      margin: 0.5,
      filename: `${selectedNote.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    };
    
    const element = document.getElementById('printable-note-library');
    
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      html2pdf().set(opt).from(element).save();
    } catch (err) {
      alert("Failed to export PDF: " + err.message);
    }
  };

  if (selectedNote) {
    const { content } = selectedNote;
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Detail view toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl">
          <button 
            onClick={() => setSelectedNote(null)}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Saved Notes
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleCopy(content)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-accent-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button 
              onClick={handleExportPDF}
              className="px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export PDF
            </button>
            <button 
              onClick={() => handleDelete(selectedNote.id)}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/40 text-red-400 rounded-lg transition-colors"
              title="Delete Note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Library Note */}
        <div id="printable-note-library" className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-8 text-slate-100">
          <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-display font-extrabold text-white">{selectedNote.title}</h2>
              <span className="text-[10px] text-slate-500 block">Saved Note</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">{new Date(selectedNote.createdAt).toLocaleDateString()}</span>
          </div>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-400 border-l-2 border-brand-500 pl-3">Summary Overview</h3>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">{content.summary}</p>
          </section>

          {content.highlights?.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-400 border-l-2 border-accent-500 pl-3">Key Takeaways</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
              {content.highlights.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/20 border border-slate-800/40 p-3 rounded-xl font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
          )}

          {content.topics && content.topics.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400 border-l-2 border-purple-500 pl-3">Concepts & Terms</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
                {content.topics.map((t, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-950/30 border border-slate-800/80 rounded-xl">
                    <strong className="text-slate-200 text-xs font-semibold block">{t.name || t.topic}</strong>
                    <span className="text-[11px] text-slate-400 mt-1 block">{t.description || t.meaning}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {content.questions?.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-400 border-l-2 border-brand-500 pl-3">Study Questions</h3>
            <div className="space-y-3 pl-2">
              {content.questions.map((q, idx) => (
                <div key={idx} className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl space-y-2">
                  <h4 className="text-xs font-semibold text-slate-200 flex gap-2">
                    <span className="text-brand-400">Q{idx + 1}:</span>
                    {q.question}
                  </h4>
                  <p className="text-xs text-slate-400 pl-6 leading-relaxed font-sans">{q.answer}</p>
                </div>
              ))}
            </div>
          </section>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white flex items-center gap-2">
            <FolderHeart className="w-7 h-7 text-brand-500" />
            Saved Notes
          </h1>
          <p className="text-slate-400 text-xs mt-1">View, copy, export, or delete your notes</p>
      </div>

      {/* Search toolbar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by note title or keyword contents..."
          className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800/80 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none rounded-xl text-xs text-slate-100 placeholder:text-slate-600 transition-all"
        />
      </div>

      {/* Grid List */}
      {filteredNotes.length === 0 ? (
        <div className="p-12 glass-panel border border-dashed border-slate-800/80 rounded-2xl flex flex-col items-center justify-center text-center">
          <FileText className="w-10 h-10 text-slate-700 mb-3" />
          <h3 className="text-sm font-medium text-slate-400">No matching summaries found</h3>
          <p className="text-xs text-slate-600 max-w-sm mt-1">
            {notes.length === 0 
              ? "You haven't generated any summaries yet. Go to the Summarizer page to get started."
              : "Try altering your keyword query terms or filter options."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div 
              key={note.id}
              className="glass-card rounded-2xl p-5 flex flex-col justify-between border-slate-800 hover:scale-[1.01] hover:shadow-brand-500/5 duration-300 transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-sm font-semibold text-slate-200 line-clamp-1 mb-2">{note.title}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed font-sans mb-4">{note.content.summary}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 mt-auto">
                <span className="text-[9px] text-slate-500">{new Date(note.createdAt).toLocaleDateString()}</span>
                <button
                  onClick={() => setSelectedNote(note)}
                  className="flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300 font-medium transition-colors group"
                >
                  Open Study Notes
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
