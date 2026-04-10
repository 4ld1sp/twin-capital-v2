import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, RefreshCcw, Lock, ArrowRight } from 'lucide-react';

export default function TwoFactorAuth({ onNavigate }) {
  const { verify2FA, authError, setAuthError } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleInput = (index, value) => {
    if (isNaN(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      setLoading(true);
      const success = await verify2FA(fullCode);
      if (!success) setLoading(false);
    }
  };

  useEffect(() => {
    setAuthError(null);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center gradient-bg overflow-hidden px-4">
      <div className="layout-container flex w-full max-w-[1200px] flex-col z-10 relative">
        <header className="flex items-center justify-between px-6 py-8 w-full max-w-[480px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-slate-900  text-2xl font-bold tracking-tight uppercase tracking-tight">Two-Factor</h2>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center w-full">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl w-full max-w-[480px] rounded-3xl p-10 shadow-2xl relative border border-white/10 text-center overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8 shadow-inner shadow-primary/5">
              <Lock className="w-8 h-8 text-primary" />
            </div>

            <h1 className="text-3xl font-black text-white italic mb-2 uppercase tracking-tight">Security ID</h1>
            <p className="text-slate-500 text-sm font-medium mb-10 leading-relaxed uppercase tracking-widest">Enter the 6-digit code from your authenticator app</p>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="flex justify-between gap-2 sm:gap-3">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={e => handleInput(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className="w-12 h-16 sm:w-14 sm:h-20 bg-white/5 border border-white/10 rounded-2xl text-center text-2xl font-black text-white focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-lg"
                    required
                  />
                ))}
              </div>

              {authError && <p className="text-red-500 text-xs font-bold animate-shake uppercase tracking-widest leading-relaxed">{authError}</p>}

              <button 
                type="submit" 
                disabled={loading || code.some(d => d === '')}
                className="w-full h-16 bg-primary text-black font-black text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 uppercase tracking-widest italic disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : (
                  <>
                    Verify & Access
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-10 border-t border-white/5 space-y-4">
              <p className="text-[10px] text-slate-600 font-bold tracking-[0.2em] uppercase">Trouble authenticating?</p>
              <div className="flex justify-center gap-6">
                <button className="text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors tracking-widest">Use Recovery Key</button>
                <button onClick={() => onNavigate('login')} className="text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors tracking-widest">Cancel Login</button>
              </div>
            </div>
          </div>
          
          <p className="mt-8 text-slate-700 dark:text-slate-600 text-[10px] font-black uppercase tracking-widest opacity-50 italic">Protected by Advanced Encryption Standard</p>
        </main>
      </div>
    </div>
  );
}
