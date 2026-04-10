import React from 'react';

const LogsHeader = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight uppercase">System Logs</h1>
        <p className="text-[var(--text-secondary)] text-base font-bold uppercase tracking-wider opacity-80 mt-1">Real-time engine events & trading signals</p>
      </div>
      <div className="flex gap-4">
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] rounded-2xl px-6 py-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-black mb-1">Events (24h)</p>
          <p className="text-xl font-black text-primary">124,802</p>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] rounded-2xl px-6 py-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-black mb-1">Error Rate</p>
          <p className="text-xl font-black text-rose-500">0.02%</p>
        </div>
      </div>
    </div>
  );
};

export default LogsHeader;
