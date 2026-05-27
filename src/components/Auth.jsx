import React, { useState } from 'react';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    onLogin({ email, password });
  };

  return (
    <div className="min-h-screen bg-[#06070a] relative flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-accent-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel rounded-2xl p-8 relative z-10 shadow-2xl border-slate-800/80 animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20 mb-3 animate-pulse-glow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-white">Briefly<span className="text-brand-500">.AI</span></h1>
          <p className="text-xs text-slate-400 mt-1">Summarize, highlight, and chat with AI</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-sm text-slate-100 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-sm text-slate-100 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3.5 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white rounded-lg font-medium text-sm transition-all duration-300 shadow-lg shadow-brand-500/10 flex items-center justify-center gap-2 group"
          >
            Sign In
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}
