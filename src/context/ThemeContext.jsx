import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const THEMES = [
  { id: 'midnight', label: 'Midnight', brand: '#8b5cf6', accent: '#10b981' },
  { id: 'royal', label: 'Royal', brand: '#6366f1', accent: '#f59e0b' },
  { id: 'emerald', label: 'Emerald', brand: '#14b8a6', accent: '#22c55e' },
  { id: 'ruby', label: 'Ruby', brand: '#f87171', accent: '#f97316' },
  { id: 'sapphire', label: 'Sapphire', brand: '#60a5fa', accent: '#06b6d4' },
  { id: 'amber', label: 'Amber', brand: '#fbbf24', accent: '#ef4444' },
  { id: 'plasma', label: 'Plasma', brand: '#f472b6', accent: '#a855f7' },
  { id: 'ocean', label: 'Ocean', brand: '#2dd4bf', accent: '#6366f1' },
  { id: 'forest', label: 'Forest', brand: '#4ade80', accent: '#eab308' },
  { id: 'lavender', label: 'Lavender', brand: '#a78bfa', accent: '#ec4899' },
  { id: 'crimson', label: 'Crimson', brand: '#ef4444', accent: '#eab308' },
  { id: 'slate', label: 'Slate', brand: '#94a3b8', accent: '#818cf8' },
  { id: 'aurora', label: 'Aurora', brand: '#818cf8', accent: '#10b981' },
  { id: 'cyber', label: 'Cyber', brand: '#22d3ee', accent: '#d946ef' },
];

const STORAGE_KEY_THEME = 'briefly_theme';
const STORAGE_KEY_MODE = 'briefly_mode';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY_THEME) || 'midnight'; }
    catch { return 'midnight'; }
  });

  const [mode, setModeState] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY_MODE) || 'dark'; }
    catch { return 'dark'; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY_THEME, theme); } catch {}
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
    try { localStorage.setItem(STORAGE_KEY_MODE, mode); } catch {}
  }, [mode]);

  const setTheme = useCallback((id) => {
    if (THEMES.some(t => t.id === id)) setThemeState(id);
  }, []);

  const setMode = useCallback((m) => {
    if (m === 'dark' || m === 'light') setModeState(m);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES, mode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export { THEMES };
