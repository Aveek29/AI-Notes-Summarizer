import React from 'react';
import { Settings as SettingsIcon, LogOut, Globe, Cpu } from 'lucide-react';

const MODELS = [
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (high quality)' },
  { id: 'llama3-8b-8192', label: 'Llama 3 8B (fast)' },
  { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B (balanced)' },
  { id: 'gemma2-9b-it', label: 'Gemma 2 9B (lightweight)' },
];

const LANGUAGES = ['English', 'Spanish', 'Hindi', 'French', 'German', 'Italian', 'Mandarin', 'Arabic', 'Portuguese', 'Japanese'];

export default function Settings({ user, onLogout, selectedModel, onModelChange, language, onLanguageChange }) {
  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-brand-500" />
          Settings
        </h1>
        <p className="text-slate-400 text-xs mt-1">Configure your profile and preferences</p>
      </div>

      <div className="glass-panel rounded-2xl p-6 space-y-6">
        <div className="pb-6 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-semibold font-display text-lg">
              {user.username[0]?.toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">{user.username}</h3>
              <span className="text-xs text-slate-500">{user.email}</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-brand-400" />
            AI Model
          </h3>
          <p className="text-xs text-slate-500 mb-1">Choose which Groq model to use for summarization and chat.</p>
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:border-brand-500 outline-none transition-all"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>

          <div className="pt-4 border-t border-slate-800/60">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5 mb-3">
              <Globe className="w-4 h-4 text-brand-400" />
              Chat Language
            </h3>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:border-brand-500 outline-none transition-all"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
