import React from 'react';
import { Settings as SettingsIcon, LogOut, Globe, Cpu, Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const MODELS = [
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (high quality)' },
  { id: 'llama3-8b-8192', label: 'Llama 3 8B (fast)' },
  { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B (balanced)' },
  { id: 'gemma2-9b-it', label: 'Gemma 2 9B (lightweight)' },
];

const LANGUAGES = ['English', 'Spanish', 'Hindi', 'French', 'German', 'Italian', 'Mandarin', 'Arabic', 'Portuguese', 'Japanese'];

export default function Settings({ user, onLogout, selectedModel, onModelChange, language, onLanguageChange }) {
  const { theme, setTheme, themes, mode, setMode } = useTheme();
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

          <div className="pt-4 border-t border-slate-800/60">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5 mb-3">
              <Palette className="w-4 h-4 text-brand-400" />
              Theme
            </h3>
            <p className="text-xs text-slate-500 mb-3">Choose your color scheme and mode.</p>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMode('dark')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  mode === 'dark'
                    ? 'bg-slate-700/80 text-white ring-1 ring-slate-500'
                    : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
                Dark
              </button>
              <button
                onClick={() => setMode('light')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  mode === 'light'
                    ? 'bg-slate-700/80 text-white ring-1 ring-slate-500'
                    : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
                Light
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
              {themes.map(t => {
                const active = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                      active
                        ? 'bg-slate-700/60 ring-1 ring-slate-500'
                        : 'hover:bg-slate-800/60'
                    }`}
                    title={t.label}
                  >
                    <div className="w-full h-7 rounded-lg flex gap-0.5 overflow-hidden">
                      <div className="flex-1" style={{ backgroundColor: t.brand }} />
                      <div className="flex-1" style={{ backgroundColor: t.accent }} />
                    </div>
                    <span className={`text-[9px] font-medium ${active ? 'text-white' : 'text-slate-400'}`}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
