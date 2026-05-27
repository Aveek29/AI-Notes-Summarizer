import React from 'react';
import { 
  Sparkles, 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  FolderHeart, 
  Settings as SettingsIcon, 
  LogOut, 
  X 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout, mobileMenuOpen, setMobileMenuOpen }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'summarizer', label: 'Summarizer', icon: FileText },
    { id: 'chatbot', label: 'Chat', icon: MessageSquare },
    { id: 'saved-notes', label: 'Saved Library', icon: FolderHeart },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 glass-panel border-r border-slate-800/80 
        flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="h-16 border-b border-slate-800/60 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold tracking-tight text-white">Briefly<span className="text-brand-500">.AI</span></span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-200 md:hidden border border-slate-800 rounded-lg bg-slate-950/40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group
                  ${isSelected 
                    ? 'bg-gradient-to-r from-brand-600/20 to-purple-600/10 text-brand-400 border border-brand-500/20 shadow-inner' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent'}
                `}
              >
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isSelected ? 'text-brand-400' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/60">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-500/5 border border-transparent rounded-xl text-sm font-medium transition-all group"
          >
            <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
