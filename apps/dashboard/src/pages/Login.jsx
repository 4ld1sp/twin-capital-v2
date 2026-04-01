import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Key, ShieldAlert, RefreshCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onNavigate }) {
  const { login, authError, setAuthError } = useAuth();
  const [email, setEmail] = useState('admin@twincapital.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    if (!success) setLoading(false);
  };

  useEffect(() => {
    setAuthError(null);
  }, []);
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center gradient-bg overflow-hidden px-4">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
      
      <div className="layout-container flex w-full max-w-[1200px] flex-col z-10 relative">
        {/* Header / Logo */}
        <header className="flex items-center justify-between px-6 py-8 w-full max-w-[480px] mx-auto animate-in fade-in duration-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/10">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight uppercase italic tracking-tight">Twin Capital</h2>
          </div>
        </header>

        {/* Login Card */}
        <main className="flex-1 flex flex-col items-center justify-center w-full animate-in zoom-in-95 duration-500">
          <div className="glass-card w-full max-w-[480px] rounded-3xl p-10 shadow-2xl relative border border-white/10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            
            <div className="mb-10 text-center">
              <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 leading-tight uppercase italic tracking-tighter">Terminal Access</h1>
              <p className="text-slate-500 text-sm font-medium tracking-wide">Enter credentials for secure identity verification</p>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Corporate Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <input 
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all shadow-inner" 
                    placeholder="admin@twincapital.com" 
                    type="email" 
                    required 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Identity Key</label>
                  <button onClick={() => onNavigate('forgot-password')} type="button" className="text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors italic">Forgot Entry?</button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <input 
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-11 pr-12 text-sm focus:ring-2 focus:ring-primary outline-none transition-all shadow-inner" 
                    placeholder="••••••••••••" 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {/* Remember Me */}
              <div className="flex items-center gap-3 py-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input className="w-5 h-5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary focus:ring-offset-background-dark outline-none transition-all" id="remember" type="checkbox" />
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest group-hover:text-slate-300 transition-colors">Remember Station</span>
                </label>
              </div>

              {authError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-shake">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">Identity Check Failed: {authError}</p>
                </div>
              )}
              
              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="group w-full h-14 bg-primary text-black font-black text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 uppercase tracking-widest italic"
              >
                {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : (
                  <>
                    Establish Identity
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic mb-4 opacity-70 italic">New Operative? Access Required</p>
              <button 
                onClick={() => onNavigate('register')}
                className="w-full h-14 bg-white/5 border border-white/10 text-white font-black text-[10px] rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all uppercase tracking-widest italic shadow-lg"
              >
                Request Authorization
              </button>
            </div>
          </div>
          
          {/* Footer Links */}
          <footer className="mt-8 flex gap-6 text-slate-500 text-xs font-medium uppercase tracking-widest relative z-10">
            <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <span className="opacity-30">•</span>
            <a className="hover:text-primary transition-colors" href="#">Security Protocol</a>
            <span className="opacity-30">•</span>
            <a className="hover:text-primary transition-colors" href="#">Contact Support</a>
          </footer>
        </main>
      </div>

      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent z-50"></div>
    </div>
  );
}
