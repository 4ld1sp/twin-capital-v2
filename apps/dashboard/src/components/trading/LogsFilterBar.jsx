import React, { useState } from 'react';
import GlassSelect from '../ui/GlassSelect';

const LogsFilterBar = ({ 
  searchQuery, 
  setSearchQuery, 
  filterLevel, 
  setFilterLevel, 
  filterScope, 
  setFilterScope,
  className = "" 
}) => {
  return (
    <div className={`bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] rounded-2xl p-5 flex flex-wrap items-center gap-4 shadow-sm ${className}`}>
      <div className="flex-1 min-w-[280px] relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-50 text-xl">search</span>
        <input 
          className="w-full border border-[var(--border)] rounded-xl pl-12 pr-4 py-3 text-xs font-bold text-[var(--text-primary)] placeholder:text-secondary/40 placeholder:uppercase placeholder:tracking-widest focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all font-mono" 
          placeholder="SEARCH AUDIT LOGS..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Level</span>
        <div className="flex p-1 rounded-xl border border-[var(--border)]">
          {['All', 'Info', 'Warn', 'Error'].map(level => (
            <button 
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filterLevel === level ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:'}`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <GlassSelect
          value={filterScope}
          onChange={setFilterScope}
          options={['All Scopes', 'API Config', 'Trading', 'System', 'Security']}
          placeholder="Scope"
          className="w-44"
          searchable={false}
        />
      </div>
      <button className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg active:scale-95">
        <span className="material-symbols-outlined text-[16px]">download</span>
        Export
      </button>
    </div>
  );
};

export default LogsFilterBar;
