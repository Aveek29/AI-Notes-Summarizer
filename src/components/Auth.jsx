import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, Phone, ArrowRight, UserPlus } from 'lucide-react';

const InputField = ({ icon: Icon, label, type, value, onChange, placeholder }) => (
  <div>
    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-sm text-slate-100 transition-all placeholder:text-slate-600`}
      />
    </div>
  </div>
);

export default function Auth({ onLogin }) {
  const [tab, setTab] = useState('signin');
  const [error, setError] = useState('');

  const [signinEmail, setSigninEmail] = useState('');
  const [signinPass, setSigninPass] = useState('');

  const [signupFirst, setSignupFirst] = useState('');
  const [signupLast, setSignupLast] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPass, setSignupPass] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');

  const clearErr = () => setError('');

  const handleSignin = (e) => {
    e.preventDefault();
    if (!signinEmail || !signinPass) { setError('Please fill in all fields.'); return; }
    if (!signinEmail.includes('@')) { setError('Please enter a valid email address.'); return; }
    onLogin({ type: 'signin', email: signinEmail, password: signinPass });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!signupFirst || !signupLast || !signupEmail || !signupPass || !signupConfirm) {
      setError('Please fill in all required fields.'); return;
    }
    if (!signupEmail.includes('@')) { setError('Please enter a valid email address.'); return; }
    if (signupPass.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (signupPass !== signupConfirm) { setError('Passwords do not match.'); return; }
    onLogin({
      type: 'signup',
      firstName: signupFirst.trim(),
      lastName: signupLast.trim(),
      email: signupEmail,
      phone: signupPhone.trim(),
      password: signupPass,
    });
  };

  return (
    <div className="min-h-screen bg-[#06070a] relative flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-accent-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel rounded-2xl p-8 relative z-10 shadow-2xl border-slate-800/80 animate-slide-up">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20 mb-3 animate-pulse-glow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-white">Briefly<span className="text-brand-500">.AI</span></h1>
          <p className="text-xs text-slate-400 mt-1">Summarize, highlight, and chat with AI</p>
        </div>

        <div className="flex bg-slate-900/60 rounded-lg p-1 mb-6 gap-1">
          <button onClick={() => { setTab('signin'); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              tab === 'signin' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}>Sign In</button>
          <button onClick={() => { setTab('signup'); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              tab === 'signup' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}>Sign Up</button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {tab === 'signin' ? (
          <form onSubmit={handleSignin} className="space-y-4">
            <InputField
              icon={Mail} label="Email Address" type="email"
              value={signinEmail} onChange={(v) => { setSigninEmail(v); clearErr(); }}
              placeholder="you@domain.com" required
            />
            <InputField
              icon={Lock} label="Password" type="password"
              value={signinPass} onChange={(v) => { setSigninPass(v); clearErr(); }}
              placeholder="Enter your password" required
            />
            <button
              type="submit"
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white rounded-lg font-medium text-sm transition-all duration-300 shadow-lg shadow-brand-500/10 flex items-center justify-center gap-2 group"
            >
              Sign In
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <InputField
                icon={User} label="First Name" type="text"
                value={signupFirst} onChange={(v) => { setSignupFirst(v); clearErr(); }}
                placeholder="John" required
              />
              <InputField
                icon={null} label="Last Name" type="text"
                value={signupLast} onChange={(v) => { setSignupLast(v); clearErr(); }}
                placeholder="Doe" required
              />
            </div>
            <InputField
              icon={Mail} label="Email Address" type="email"
              value={signupEmail} onChange={(v) => { setSignupEmail(v); clearErr(); }}
              placeholder="you@domain.com" required
            />
            <InputField
              icon={Phone} label="Phone (optional)" type="tel"
              value={signupPhone} onChange={(v) => { setSignupPhone(v); clearErr(); }}
              placeholder="+1 (555) 000-0000"
            />
            <div className="grid grid-cols-2 gap-3">
              <InputField
                icon={Lock} label="Password" type="password"
                value={signupPass} onChange={(v) => { setSignupPass(v); clearErr(); }}
                placeholder="Min. 6 chars" required
              />
              <InputField
                icon={null} label="Confirm" type="password"
                value={signupConfirm} onChange={(v) => { setSignupConfirm(v); clearErr(); }}
                placeholder="Repeat password" required
              />
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white rounded-lg font-medium text-sm transition-all duration-300 shadow-lg shadow-brand-500/10 flex items-center justify-center gap-2 group"
            >
              <UserPlus className="w-4 h-4" />
              Create Account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
