import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword({ onNavigate }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    resetPassword(email);
    setIsSent(true);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center gradient-bg overflow-hidden px-4">
      <div className="layout-container flex w-full max-w-[1200px] flex-col z-10 relative">
        <header className="flex items-center justify-between px-6 py-8 w-full max-w-[480px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/20">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">Twin Capital</h2>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center w-full">
          <div className="glass-card w-full max-w-[480px] rounded-3xl p-10 shadow-2xl relative border border-white/10 overflow-hidden">
            {!isSent ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 text-center">
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase italic tracking-tight">Recover Access</h1>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">Enter your corporate email to receive security recovery instructions</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Corporate Email</label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                      <input 
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all relative z-10" 
                        placeholder="name@twincapital.com"
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full h-14 bg-primary text-black font-black text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 uppercase tracking-widest italic group">
                    Send Link
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                  <button onClick={() => onNavigate('login')} className="flex items-center justify-center gap-2 mx-auto text-slate-500 hover:text-primary text-xs font-bold transition-colors group">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    BACK TO LOGIN
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-in zoom-in-95 duration-500 text-center py-4">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8 animate-pulse">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h1 className="text-2xl font-black text-white italic mb-4 uppercase tracking-tight">Email Dispatched</h1>
                <p className="text-slate-400 text-sm mb-10 leading-relaxed">
                  Recovery instructions have been sent to <span className="text-white font-bold">{email}</span>. Please check your inbox and follow the secure link.
                </p>

                <button 
                  onClick={() => onNavigate('login')}
                  className="w-full h-14 bg-white/5 border border-white/10 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all uppercase tracking-widest italic"
                >
                  Return to Login
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
