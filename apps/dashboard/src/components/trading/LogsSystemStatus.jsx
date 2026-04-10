import React from 'react';

const LogsSystemStatus = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] p-5 rounded-2xl flex items-center gap-4 shadow-sm">
        <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
          <span className="material-symbols-outlined">database</span>
        </div>
        <div>
          <p className="text-[10px] uppercase font-black text-[var(--text-secondary)] tracking-widest">DB Persistence</p>
          <p className="text-xs font-black text-[var(--text-primary)]">Connected <span className="text-[10px] text-emerald-500 ml-1 animate-pulse">●</span></p>
        </div>
      </div>
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] p-5 rounded-2xl flex items-center gap-4 shadow-sm">
        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <span className="material-symbols-outlined">memory</span>
        </div>
        <div>
          <p className="text-[10px] uppercase font-black text-[var(--text-secondary)] tracking-widest">Engine CPU</p>
          <div className="flex items-center gap-3">
            <div className="w-16 h-2 rounded-full overflow-hidden border border-[var(--border)]">
              <div className="h-full bg-primary w-[14%] rounded-full shadow-[0_0_6px_rgba(202,255,0,0.4)]"></div>
            </div>
            <p className="text-xs font-black text-primary">14%</p>
          </div>
        </div>
      </div>
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] p-5 rounded-2xl flex items-center gap-4 shadow-sm">
        <div className="size-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
          <span className="material-symbols-outlined">router</span>
        </div>
        <div>
          <p className="text-[10px] uppercase font-black text-[var(--text-secondary)] tracking-widest">API Gateway</p>
          <p className="text-xs font-black text-[var(--text-primary)]">22ms avg latency</p>
        </div>
      </div>
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] p-5 rounded-2xl flex items-center gap-4 shadow-sm">
        <div className="size-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
          <span className="material-symbols-outlined">history_toggle_off</span>
        </div>
        <div>
          <p className="text-[10px] uppercase font-black text-[var(--text-secondary)] tracking-widest">Uptime</p>
          <p className="text-xs font-black text-[var(--text-primary)]">142d 08h 22m</p>
        </div>
      </div>
    </div>
  );
};

export default LogsSystemStatus;
