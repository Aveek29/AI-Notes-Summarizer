import React from 'react';
import { Menu, User } from 'lucide-react';

export default function Navbar({ user, setMobileMenuOpen, setActiveTab }) {
  return (
    <header className="h-16 border-b border-slate-800/60 bg-darkBg/60 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 text-slate-400 hover:text-slate-200 md:hidden border border-slate-800 rounded-lg bg-slate-900/40"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden sm:block">
          <span className="text-xs text-slate-400">Welcome back,</span>
          <h2 className="text-sm font-semibold text-slate-200">{user.username}</h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div 
          onClick={() => setActiveTab('settings')} 
          className="w-9 h-9 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:border-brand-500 cursor-pointer transition-colors"
        >
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
