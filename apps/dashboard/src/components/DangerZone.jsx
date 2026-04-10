import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, AlertTriangle, X, Loader2, LogOut as LogOutIcon } from 'lucide-react';

const DangerZone = () => {
  const { logout } = useAuth();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleDeactivate = () => {
    setIsDeactivating(true);
    // Simulate API delay, then execute global app logout
    setTimeout(() => {
      logout();
    }, 2000);
  };

  return (
    <>
      <div className="space-y-6 mt-8">

        {/* Danger Zone Section */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-3xl border border-rose-500/10 p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <h3 className="text-rose-500 font-black text-sm uppercase tracking-widest flex items-center gap-2">
              Deactivate Account
            </h3>
            <p className="text-[var(--text-secondary)] text-xs mt-2 font-bold">Once deactivated, all your data will be archived.</p>
          </div>
          <button 
            onClick={() => setIsConfirming(true)}
            className="px-6 py-2.5 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-colors w-full md:w-auto shadow-sm"
          >
            Deactivate
          </button>
        </div>

        {/* Global Logout Section */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-3xl border border-[var(--border)] p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl dark:bg-white/[0.03] flex items-center justify-center border border-[var(--border)]">
                <LogOut className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-[var(--text-primary)] font-black text-sm uppercase tracking-widest flex items-center gap-2">
                 Log Out Session
              </h3>
              <p className="text-[var(--text-secondary)] text-xs font-bold">Sign out from the current session.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsConfirmingLogout(true)}
            className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors w-full md:w-auto dark:bg-white/[0.03] text-primary hover:text-[var(--text-primary)] border border-[var(--border)] hover:border-primary/30"
          >
            Log Out Now
          </button>
        </div>

      </div>

      {/* Deactivate Confirmation Modal */}
      {isConfirming && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-3xl shadow-2xl w-full max-w-sm border border-rose-500/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-rose-500/10 flex justify-between items-center">
              <h3 className="font-black text-sm text-rose-500 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Final Warning
              </h3>
              <button onClick={() => setIsConfirming(false)} disabled={isDeactivating} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-xs text-[var(--text-secondary)] font-bold leading-relaxed">
                Are you sure you want to deactivate your Twincapital account? You will be logged out immediately.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-[var(--border)] flex justify-end gap-3">
              <button 
                onClick={() => setIsConfirming(false)} 
                disabled={isDeactivating}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover: rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeactivate} 
                disabled={isDeactivating}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-80"
              >
                {isDeactivating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isDeactivating ? 'Deactivating...' : 'Yes, Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isConfirmingLogout && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-3xl shadow-2xl w-full max-w-sm border border-[var(--border)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center">
              <h3 className="font-black text-sm text-primary uppercase tracking-widest flex items-center gap-2">
                <LogOutIcon className="w-5 h-5" /> Log Out
              </h3>
              <button onClick={() => setIsConfirmingLogout(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-xs text-[var(--text-secondary)] font-bold leading-relaxed">
                Are you sure you want to end your current session? You will need to log in again.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-[var(--border)] flex justify-end gap-3">
              <button 
                onClick={() => setIsConfirmingLogout(false)} 
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover: rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => logout()} 
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-primary text-black rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/10"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DangerZone;
