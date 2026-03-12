import React from 'react';

const CurrentParametersList = () => {
  return (
    <div className="glass-card rounded-3xl border border-glass p-8 shadow-sm">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-secondary mb-6 pl-1">Strategy Parameters</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center py-3.5 border-b border-glass hover:bg-black/5 dark:hover:bg-white/5 px-1 transition-colors rounded-lg">
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">Risk Per Trade</span>
          <span className="text-xs font-black text-primary uppercase tracking-widest">1.5%</span>
        </div>
        <div className="flex justify-between items-center py-3.5 border-b border-glass hover:bg-black/5 dark:hover:bg-white/5 px-1 transition-colors rounded-lg">
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">Max Exposure</span>
          <span className="text-xs font-black text-primary uppercase tracking-widest">400k USD</span>
        </div>
        <div className="flex justify-between items-center py-3.5 border-b border-glass hover:bg-black/5 dark:hover:bg-white/5 px-1 transition-colors rounded-lg">
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">Stop Loss Buffer</span>
          <span className="text-xs font-black text-primary uppercase tracking-widest">2.4 ATR</span>
        </div>
        <div className="flex justify-between items-center py-3.5 border-b border-glass hover:bg-black/5 dark:hover:bg-white/5 px-1 transition-colors rounded-lg">
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">Entry Filter</span>
          <span className="text-xs font-black text-primary uppercase tracking-widest">RSI &lt; 30</span>
        </div>
      </div>
      <button className="w-full mt-8 flex items-center justify-center gap-2 rounded-2xl h-12 bg-black/5 dark:bg-white/5 border border-glass text-secondary text-[11px] font-black uppercase tracking-widest hover:bg-black/10 dark:hover:bg-white/10 transition-all">
        <span className="material-symbols-outlined text-lg">tune</span>
        <span>Override Parameters</span>
      </button>
    </div>
  );
};

export default CurrentParametersList;
