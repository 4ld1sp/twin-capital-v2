import React from 'react';

const CurrentParametersList = () => {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-3xl border border-[var(--border)] p-8 shadow-sm">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-6 pl-1">Strategy Parameters</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center py-3.5 border-b border-[var(--border)] hover: px-1 transition-colors rounded-lg">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Risk Per Trade</span>
          <span className="text-xs font-black text-primary uppercase tracking-widest">1.5%</span>
        </div>
        <div className="flex justify-between items-center py-3.5 border-b border-[var(--border)] hover: px-1 transition-colors rounded-lg">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Max Exposure</span>
          <span className="text-xs font-black text-primary uppercase tracking-widest">400k USD</span>
        </div>
        <div className="flex justify-between items-center py-3.5 border-b border-[var(--border)] hover: px-1 transition-colors rounded-lg">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Stop Loss Buffer</span>
          <span className="text-xs font-black text-primary uppercase tracking-widest">2.4 ATR</span>
        </div>
        <div className="flex justify-between items-center py-3.5 border-b border-[var(--border)] hover: px-1 transition-colors rounded-lg">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Entry Filter</span>
          <span className="text-xs font-black text-primary uppercase tracking-widest">RSI &lt; 30</span>
        </div>
      </div>
      <button className="w-full mt-8 flex items-center justify-center gap-2 rounded-2xl h-12 border border-[var(--border)] text-[var(--text-secondary)] text-[11px] font-black uppercase tracking-widest hover:  transition-all">
        <span className="material-symbols-outlined text-lg">tune</span>
        <span>Override Parameters</span>
      </button>
    </div>
  );
};

export default CurrentParametersList;
