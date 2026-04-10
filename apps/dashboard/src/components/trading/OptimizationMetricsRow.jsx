import React from 'react';

const OptimizationMetricsRow = () => {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-2xl p-6 shadow-sm border border-[var(--border)] transition-all duration-300">
        <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1.5 pl-1">Total Return</p>
        <p className="text-2xl font-black text-primary">+42.8%</p>
        <p className="text-[9px] text-secondary/60 font-black uppercase tracking-widest mt-2 pl-1">vs Baseline +12.4%</p>
      </div>
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-2xl p-6 shadow-sm border border-[var(--border)] transition-all duration-300">
        <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1.5 pl-1">Sharpe Ratio</p>
        <p className="text-2xl font-black text-[var(--text-primary)]">2.84</p>
        <p className="text-[9px] text-secondary/60 font-black uppercase tracking-widest mt-2 pl-1">Industrial Benchmark: 1.5</p>
      </div>
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-2xl p-6 shadow-sm border border-[var(--border)] transition-all duration-300">
        <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1.5 pl-1">Max Drawdown</p>
        <p className="text-2xl font-black text-rose-500">-8.2%</p>
        <p className="text-[9px] text-secondary/60 font-black uppercase tracking-widest mt-2 pl-1">Recovery: 14 Days</p>
      </div>
    </div>
  );
};

export default OptimizationMetricsRow;
