import React from 'react';

const BacktestsTradeDistribution = () => {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] rounded-3xl p-8 shadow-sm flex-1">
      <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest mb-6 pl-1">Trade Distribution</p>
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          <span>Long Positions</span>
          <span className="text-[var(--text-primary)] font-black">142</span>
        </div>
        <div className="flex justify-between items-center text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          <span>Short Positions</span>
          <span className="text-[var(--text-primary)] font-black">89</span>
        </div>
        
        {/* L/S Ratio Bar */}
        <div className="space-y-2 py-2">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 px-1">
            <span>Long 61%</span>
            <span>Short 39%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden flex border border-[var(--border)]">
            <div className="h-full bg-primary/30 border-r border-primary/50" style={{ width: '61.5%' }}></div>
            <div className="h-full bg-secondary/10" style={{ width: '38.5%' }}></div>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          <span>Avg. Duration</span>
          <span className="text-[var(--text-primary)] font-black">4.2 Days</span>
        </div>
        <div className="pt-6 border-t border-[var(--border)] mt-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest">Profit Factor</span>
            <span className="text-primary font-black text-lg">1.84</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacktestsTradeDistribution;
