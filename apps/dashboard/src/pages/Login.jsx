import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
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

  useEffect(() => { setAuthError(null); }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-main)] px-4">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">TC</span>
          </div>
          <span className="text-lg font-semibold text-[var(--text-primary)]">Twin Capital</span>
        </div>

        {/* Card */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-1">Sign in</h1>
            <p className="text-sm text-[var(--text-secondary)]">Enter your credentials to continue</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  className="w-full h-10 bg-[var(--bg-main)] border border-[var(--border)] rounded-lg pl-10 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="you@company.com"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-[var(--text-secondary)]">Password</label>
                <button onClick={() => onNavigate('forgot-password')} type="button" className="text-xs text-primary hover:text-primary-hover transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  className="w-full h-10 bg-[var(--bg-main)] border border-[var(--border)] rounded-lg pl-10 pr-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Enter password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer py-1">
              <input className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-main)]" type="checkbox" />
              <span className="text-sm text-[var(--text-secondary)]">Remember me</span>
            </label>

            {authError && (
              <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                <p className="text-sm text-danger">{authError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-primary hover:bg-primary-hover text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[var(--border)] text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Don't have an account?{' '}
              <button onClick={() => onNavigate('register')} className="text-primary hover:text-primary-hover font-medium transition-colors">
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
