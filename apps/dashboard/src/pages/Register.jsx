import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, User, CheckCircle2, ArrowRight, Eye, EyeOff, AlertTriangle, ShieldCheck, Loader2, Copy, Check, ChevronLeft } from 'lucide-react';

export default function Register({ onNavigate }) {
  const { register, checkAvailability, get2FASecret, enable2FA, setIsRegistering, logout } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    enable2FA: true
  });
  
  const [status, setStatus] = useState({
    name: 'idle', 
    email: 'idle'
  });

  const [totpData, setTotpData] = useState({ uri: '', secret: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputs = useRef([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [error, setError] = useState('');
  const [strength, setStrength] = useState({ score: 0, label: 'None', color: 'bg-slate-700', recommendations: [] });

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleNameBlur = async () => {
    if (!formData.name.trim()) return;
    setStatus(prev => ({ ...prev, name: 'checking' }));
    const available = await checkAvailability('name', formData.name);
    setStatus(prev => ({ ...prev, name: available ? 'available' : 'taken' }));
    if (!available) setError('This name is already associated with an account.');
    else if (error.includes('name')) setError('');
  };

  const handleEmailBlur = async () => {
    if (!formData.email.trim()) return;
    if (!validateEmail(formData.email)) {
      setStatus(prev => ({ ...prev, email: 'invalid' }));
      setError('Please enter a valid corporate email.');
      return;
    }
    setStatus(prev => ({ ...prev, email: 'checking' }));
    const available = await checkAvailability('email', formData.email);
    setStatus(prev => ({ ...prev, email: available ? 'available' : 'taken' }));
    if (!available) setError('This email is already registered.');
    else if (error.includes('email')) setError('');
  };

  const calculateStrength = (pass) => {
    let score = 0;
    const recommendations = [];
    if (pass.length === 0) return { score: 0, label: 'None', color: 'bg-slate-700', recommendations: [] };
    if (pass.length >= 8) score++;
    else recommendations.push('At least 8 characters');
    if (/[A-Z]/.test(pass)) score++;
    else recommendations.push('Add an uppercase letter');
    if (/[0-9]/.test(pass)) score++;
    else recommendations.push('Add a number');
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    else recommendations.push('Add a special character');

    const levels = [
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Strong', color: 'bg-emerald-500' },
      { label: 'Excellent', color: 'bg-primary' }
    ];
    
    return { score, label: levels[score].label, color: levels[score].color, recommendations };
  };

  useEffect(() => {
    setStrength(calculateStrength(formData.password));
  }, [formData.password]);

  const canSubmit = 
    formData.name.length > 0 && 
    status.name === 'available' && 
    status.email === 'available' && 
    strength.score >= 2 && 
    formData.password === formData.confirmPassword;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    
    setError('');
    setIsRegistering(true);
    const success = await register(formData);
    if (success) {
      if (formData.enable2FA) {
        const data = await get2FASecret(formData.password);
        if (data) {
          setTotpData({ uri: data.totpUri, secret: data.secret });
          setStep(2);
        } else {
          setError('Sesi terdeteksi, namun gagal membuat kunci 2FA. Klik "INITIAL SETUP" kembali untuk mencoba men-generate QR Code.');
          setIsRegistering(true); 
        }
      } else {
        setIsRegistering(false);
        onNavigate('dashboard');
      }
    } else {
      setIsRegistering(false);
      setError('Registration failed. Please try again.');
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpInputs.current[index + 1].focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const handleConfirm2FA = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setIsVerifying(true);
    const result = await enable2FA(code);
    setIsVerifying(false);
    if (result.success) {
      // 2FA setup complete! Logout and force re-login with 2FA
      setIsRegistering(false);
      await logout();
      onNavigate('login');
    } else {
      setError(result.error || 'Invalid verification code. Please try again.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(totpData.secret);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const renderStatusIcon = (fieldStatus) => {
    if (fieldStatus === 'checking') return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
    if (fieldStatus === 'available') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (fieldStatus === 'taken' || fieldStatus === 'invalid') return <AlertTriangle className="w-4 h-4 text-red-500" />;
    return null;
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center gradient-bg overflow-hidden px-4">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>

      <div className="layout-container flex w-full max-w-[1200px] flex-col z-10 relative">
        <header className="flex items-center justify-between px-6 py-8 w-full max-w-[540px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/20">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-slate-900  text-2xl font-bold tracking-tight">Twin Capital</h2>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center w-full">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl w-full max-w-[540px] rounded-[2.5rem] p-10 shadow-2xl relative border border-white/10 overflow-hidden">
            {step === 1 ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-10 text-center">
                  <h1 className="text-3xl font-black text-slate-900  mb-2 uppercase italic tracking-tight">Create Identity</h1>
                  <p className="text-slate-500 text-sm font-medium tracking-wide">Join the elite capital management network</p>
                </div>

                <form className="space-y-6" onSubmit={handleRegister}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 text-sm focus:ring-2 focus:ring-primary outline-none transition-all text-white placeholder:text-slate-600" 
                        placeholder="John Doe"
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => {
                          setFormData({ ...formData, name: e.target.value });
                          setStatus(prev => ({...prev, name: 'idle'}));
                        }}
                        onBlur={handleNameBlur}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {renderStatusIcon(status.name)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Corporate Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 text-sm focus:ring-2 focus:ring-primary outline-none transition-all text-white placeholder:text-slate-600" 
                        placeholder="name@twincapital.com"
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => {
                          setFormData({ ...formData, email: e.target.value });
                          setStatus(prev => ({...prev, email: 'idle'}));
                        }}
                        onBlur={handleEmailBlur}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {renderStatusIcon(status.email)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                          className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 text-sm focus:ring-2 focus:ring-primary outline-none transition-all text-white placeholder:text-slate-600" 
                          placeholder="••••••••"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
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
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Confirm</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                          className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 text-sm focus:ring-2 focus:ring-primary outline-none transition-all text-white placeholder:text-slate-600" 
                          placeholder="••••••••"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={formData.confirmPassword}
                          onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {formData.password && (
                    <div className="space-y-2 py-2 animate-in fade-in slide-in-from-top-1 duration-300">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Security Level:</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${strength.color} text-black`}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                        {[1, 2, 3, 4].map((s) => (
                          <div 
                            key={s} 
                            className={`h-full flex-1 transition-all duration-500 ${s <= strength.score ? strength.color : 'bg-slate-800'}`}
                          />
                        ))}
                      </div>
                      {strength.recommendations.length > 0 && (
                        <div className="flex flex-col gap-1.5 mt-3">
                          {strength.recommendations.map((rec, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                              <AlertTriangle className="w-3 h-3 text-orange-500/50" />
                              {rec}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {error && <p className="text-red-500 text-xs font-bold text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>}

                  <div className="flex items-center gap-4 p-5 bg-primary/5 border border-primary/20 rounded-2xl group transition-all hover:bg-primary/10">
                    <input 
                      type="checkbox" 
                      id="2fa"
                      className="w-5 h-5 rounded-lg text-primary focus:ring-primary bg-black/20 border-white/10 cursor-pointer"
                      checked={formData.enable2FA}
                      onChange={e => setFormData({ ...formData, enable2FA: e.target.checked })}
                    />
                    <label htmlFor="2fa" className="text-xs font-bold text-slate-300 cursor-pointer select-none">Enable 2FA Protection (Recommended)</label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={!canSubmit}
                    className="w-full h-16 bg-primary text-black font-black text-sm rounded-2xl flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest italic group disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed"
                  >
                    Initial Setup
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                <div className="mt-10 text-center">
                  <p className="text-slate-500 text-xs font-bold">
                    ALREADY REGISTERED? {' '}
                    <button onClick={() => onNavigate('login')} className="text-primary hover:underline uppercase italic ml-1">Back to Login</button>
                  </p>
                </div>
              </div>
            ) : (
              <div className="animate-in zoom-in-95 duration-500">
                <div className="relative mb-8">
                  <div className="bg-red-900/30 -mx-10 -mt-10 px-10 py-5 border-b border-white/10 mb-8">
                     <h1 className="text-xl font-black text-white italic uppercase tracking-tight">Aktifkan Verifikasi 2 Langkah</h1>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-slate-200">Cara verifikasi melalui aplikasi autentikator:</p>
                      <ol className="space-y-2 text-xs text-slate-400 font-medium">
                        <li className="flex gap-3">
                          <span className="w-5 h-5 flex-shrink-0 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white">1</span>
                          Cari aplikasi dengan kata kunci "autentikator" di toko aplikasi dan unduh.
                        </li>
                        <li className="flex gap-3">
                        <span className="w-5 h-5 flex-shrink-0 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white">2</span>
                          Buka aplikasi autentikator pilihan Anda.
                        </li>
                        <li className="flex gap-3">
                        <span className="w-5 h-5 flex-shrink-0 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white">3</span>
                          Pindai kode QR di bawah ini melalui aplikasi autentikator.
                        </li>
                        <li className="flex gap-3">
                        <span className="w-5 h-5 flex-shrink-0 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white">4</span>
                          Masukkan kode yang muncul di aplikasi autentikator.
                        </li>
                      </ol>
                    </div>

                    <div className="bg-white/5 rounded-[2rem] p-8 text-center border border-white/5">
                      <p className="text-sm font-black text-white uppercase tracking-widest mb-6">Kode QR</p>
                      <div className="w-48 h-48 bg-white p-3 rounded-2xl mx-auto mb-8 shadow-2xl relative group overflow-hidden">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(totpData.uri)}`} 
                          alt="2FA QR Code" 
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left relative group">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2 text-center">
                          Jika kode QR gagal dipindai, salin kode ini:
                        </p>
                        <div className="flex items-center justify-between gap-3 bg-black/20 px-4 py-3 rounded-xl border border-white/5">
                          <code className="text-primary font-mono text-sm font-bold truncate">{totpData.secret}</code>
                          <button 
                            onClick={copyToClipboard}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
                          >
                            {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between gap-3">
                        {otp.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={el => otpInputs.current[idx] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleOtpChange(idx, e.target.value)}
                            onKeyDown={e => handleKeyDown(idx, e)}
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-xl text-center text-xl font-black text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                          />
                        ))}
                      </div>
                      
                      {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

                      <div className="flex gap-4 pt-4">
                        <button 
                          onClick={() => setStep(1)}
                          className="flex-1 h-16 bg-white/5 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all uppercase tracking-widest italic"
                        >
                          Kembali
                        </button>
                        <button 
                          onClick={handleConfirm2FA}
                          disabled={otp.join('').length !== 6 || isVerifying}
                          className="flex-[2] h-16 bg-white text-black font-black text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all shadow-xl shadow-white/5 uppercase tracking-widest italic disabled:opacity-50"
                        >
                          {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Konfirmasi <CheckCircle2 className="w-5 h-5" /></>}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
