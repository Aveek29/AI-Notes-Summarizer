import React, { useState, useEffect, useRef } from 'react';
import { Palette, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeSwitcher() {
  const { theme, setTheme, themes, mode, setMode, toggleMode } = useTheme();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={panelRef}>
      {open && (
        <div className="absolute bottom-14 right-0 mb-2 p-3 rounded-2xl glass-panel shadow-2xl animate-scale-in origin-bottom-right" style={{ width: '290px' }}>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Theme</p>
            <div className="flex bg-slate-800/60 rounded-lg p-0.5">
              <button
                onClick={() => setMode('dark')}
                className={`p-1.5 rounded-md transition-all ${mode === 'dark' ? 'bg-slate-700 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
                title="Dark mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setMode('light')}
                className={`p-1.5 rounded-md transition-all ${mode === 'light' ? 'bg-slate-700 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
                title="Light mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {themes.map(t => {
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); setOpen(false); }}
                  className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
                    active
                      ? 'bg-slate-700/60 ring-1 ring-slate-500'
                      : 'hover:bg-slate-800/60'
                  }`}
                  title={t.label}
                >
                  <div className="w-full h-6 rounded-lg flex gap-0.5 overflow-hidden">
                    <div className="flex-1" style={{ backgroundColor: t.brand }} />
                    <div className="flex-1" style={{ backgroundColor: t.accent }} />
                  </div>
                  <span className={`text-[9px] font-medium leading-tight ${active ? 'text-white' : 'text-slate-400'}`}>
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-11 h-11 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-brand-400 hover:border-brand-500/40 shadow-lg transition-all"
        title="Switch theme"
      >
        <Palette className="w-5 h-5" />
      </button>
    </div>
  );
}
