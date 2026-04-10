import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Smartphone, Laptop, Key, Monitor, Save, LogOut, User, Bell, ChevronRight, ChevronDown, Loader2, ShieldCheck, ShieldOff, X } from 'lucide-react';
import GlassSelect from './ui/GlassSelect';

export const AccountSettingsList = () => {
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    timezone: user.timezone || 'UTC',
    language: user.language || 'English (US)'
  });

  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      timezone: user.timezone || 'UTC',
      language: user.language || 'English (US)'
    });
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveSettings = () => {
    updateUser(formData);
    setExpandedSection(null);
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-3xl border border-[var(--border)] p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">Account Information</h2>
      </div>
      
      <div className="flex flex-col gap-2">
        <div 
          className="flex items-start md:items-center justify-between p-4 hover:dark:hover:bg-white/[0.03] rounded-2xl cursor-pointer group transition-colors"
          onClick={() => setExpandedSection(expandedSection === 'personal' ? null : 'personal')}
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl dark:bg-white/[0.03] flex items-center justify-center shrink-0 shadow-sm border border-[var(--border)]">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[var(--text-primary)] font-bold text-sm">Personal Information</p>
              <p className="text-[var(--text-secondary)] text-xs mt-0.5">{user.name}, {user.email}</p>
            </div>
          </div>
          <div className="shrink-0 ml-4 group-hover:text-primary text-[var(--text-secondary)] transition-colors">
            {expandedSection === 'personal' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </div>
        
        {expandedSection === 'personal' && (
          <div className="p-6 dark:bg-white/[0.02] rounded-2xl border border-[var(--border)] mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full rounded-xl border border-[var(--border)] dark:bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full rounded-xl border border-[var(--border)] dark:bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full rounded-xl border border-[var(--border)] dark:bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-1.5 min-w-[140px]">
                <GlassSelect
                  label="Language"
                  value={formData.language}
                  onChange={(val) => setFormData({ ...formData, language: val })}
                  options={['English (US)', 'Indonesian (ID)', 'Spanish (ES)']}
                  searchable={false}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={handleSaveSettings} className="px-5 py-2.5 bg-primary text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                <Save className="w-4 h-4" /> Save Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const SecuritySettingsList = () => {
  const { is2FAEnabled, disable2FA, logActivity, listSessions, revokeSession, user } = useAuth();
  const [expandedSection, setExpandedSection] = useState(null);

  // 2FA disable modal
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isDisabling, setIsDisabling] = useState(false);

  // Real sessions from Better Auth
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Fetch real sessions when devices section is expanded
  useEffect(() => {
    if (expandedSection === 'devices') {
      fetchSessions();
    }
  }, [expandedSection]);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    const data = await listSessions();
    setSessions(data);
    setLoadingSessions(false);
  };

  const handleToggle2FA = () => {
    if (is2FAEnabled) {
      // Show OTP modal before disabling
      setShowDisableModal(true);
      setOtpCode('');
      setOtpError('');
    } else {
      // TODO: Redirect to 2FA setup flow
      alert('To enable 2FA, please go to the registration flow or use the profile setup.');
    }
  };

  const handleDisable2FA = async () => {
    if (otpCode.length !== 6) {
      setOtpError('Please enter a 6-digit code');
      return;
    }
    setIsDisabling(true);
    setOtpError('');
    const result = await disable2FA(otpCode);
    setIsDisabling(false);
    if (result.success) {
      setShowDisableModal(false);
    } else {
      setOtpError(result.error || 'Invalid code');
    }
  };

  const handleRevokeSession = async (token, index) => {
    const result = await revokeSession(token);
    if (result.success) {
      setSessions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const toggleAccordion = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const getDeviceIcon = (userAgent) => {
    if (!userAgent) return <Monitor className="w-5 h-5 text-primary" />;
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return <Smartphone className="w-5 h-5 text-primary" />;
    if (ua.includes('mac') || ua.includes('macbook')) return <Laptop className="w-5 h-5 text-primary" />;
    return <Monitor className="w-5 h-5 text-primary" />;
  };

  const getDeviceName = (userAgent) => {
    if (!userAgent) return 'Unknown Device';
    if (userAgent.includes('Chrome')) return 'Chrome Browser';
    if (userAgent.includes('Firefox')) return 'Firefox Browser';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari Browser';
    if (userAgent.includes('Edge')) return 'Edge Browser';
    return 'Web Browser';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Active now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  };

  return (
    <>
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-3xl border border-[var(--border)] p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">Security & Access</h2>
        </div>

        <div className="flex flex-col gap-2">
          {/* TFA */}
          <div className="flex items-start md:items-center justify-between p-4 hover:dark:hover:bg-white/[0.03] rounded-2xl transition-colors">
            <div className="flex items-center gap-4">
               <div className="w-11 h-11 rounded-xl dark:bg-white/[0.03] flex items-center justify-center shrink-0 shadow-sm border border-[var(--border)]">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[var(--text-primary)] font-bold text-sm">Two-Factor Authentication</p>
                <p className="text-[var(--text-secondary)] text-xs mt-0.5">
                  {is2FAEnabled 
                    ? <span className="text-emerald-500 font-bold">Active — Protected by TOTP</span>
                    : 'Adds an extra layer of security'
                  }
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
              <input type="checkbox" className="sr-only peer" checked={is2FAEnabled} onChange={handleToggle2FA} />
              <div className="w-11 h-6  peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Password */}
          <div 
            className="flex items-start md:items-center justify-between p-4 hover:dark:hover:bg-white/[0.03] rounded-2xl cursor-pointer group transition-colors"
            onClick={() => toggleAccordion('password')}
          >
            <div className="flex items-center gap-4">
               <div className="w-11 h-11 rounded-xl dark:bg-white/[0.03] flex items-center justify-center shrink-0 shadow-sm border border-[var(--border)]">
                <Key className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[var(--text-primary)] font-bold text-sm">Password Management</p>
                <p className="text-[var(--text-secondary)] text-xs mt-0.5">Update your security credentials</p>
              </div>
            </div>
            <div className="shrink-0 ml-4 group-hover:text-primary text-[var(--text-secondary)] transition-colors">
              {expandedSection === 'password' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </div>
          </div>

          {expandedSection === 'password' && (
            <div className="p-6 dark:bg-white/[0.02] rounded-2xl border border-[var(--border)] mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
               <div className="space-y-4">
                 <div>
                   <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">New Password</label>
                   <input type="password" placeholder="••••••••" className="w-full rounded-xl border border-[var(--border)] dark:bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                 </div>
                 <button className="w-full py-2.5 bg-primary/20 text-primary font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-primary/30 transition-all">Update Password</button>
               </div>
            </div>
          )}

          {/* Devices — Real sessions from Better Auth */}
          <div 
            className="flex items-start md:items-center justify-between p-4 hover:dark:hover:bg-white/[0.03] rounded-2xl cursor-pointer group transition-colors"
            onClick={() => toggleAccordion('devices')}
          >
            <div className="flex items-center gap-4">
               <div className="w-11 h-11 rounded-xl dark:bg-white/[0.03] flex items-center justify-center shrink-0 shadow-sm border border-[var(--border)]">
                <Laptop className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[var(--text-primary)] font-bold text-sm">Trusted Devices</p>
                <p className="text-[var(--text-secondary)] text-xs mt-0.5">{sessions.length || '...'} active sessions</p>
              </div>
            </div>
            <div className="shrink-0 ml-4 group-hover:text-primary text-[var(--text-secondary)] transition-colors">
              {expandedSection === 'devices' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </div>
          </div>

          {expandedSection === 'devices' && (
            <div className="p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              {loadingSessions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="ml-2 text-xs text-[var(--text-secondary)] font-bold">Loading sessions...</span>
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-xs text-[var(--text-secondary)] text-center py-4">No active sessions found</p>
              ) : (
                sessions.map((session, index) => (
                  <div key={session.id || index} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] transition-all hover:border-primary/20">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(session.userAgent)}
                      <div>
                        <p className="text-xs font-bold text-[var(--text-primary)]">{getDeviceName(session.userAgent)}</p>
                        <p className="text-[10px] text-[var(--text-secondary)]">
                          {session.ipAddress || 'Unknown IP'} • {formatDate(session.createdAt)}
                        </p>
                      </div>
                    </div>
                    {index > 0 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRevokeSession(session.token, index); }}
                        className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                      >
                        Revoke
                      </button>
                    )}
                    {index === 0 && (
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Current</span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Disable 2FA Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl w-full max-w-md rounded-3xl p-8 border border-[var(--border)] shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowDisableModal(false)} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
                <ShieldOff className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Disable 2FA</h3>
              <p className="text-[var(--text-secondary)] text-xs mt-2">Enter your authenticator code to confirm</p>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full h-14 text-center text-2xl font-black tracking-[0.5em] border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                autoFocus
              />
              
              {otpError && (
                <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest text-center">{otpError}</p>
              )}
              
              <button
                onClick={handleDisable2FA}
                disabled={isDisabling || otpCode.length !== 6}
                className="w-full h-12 bg-rose-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-rose-600 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDisabling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Disable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
