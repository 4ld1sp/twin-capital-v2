import React from 'react';

const OptimizationMetricsRow = () => {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="bg-background-light dark:bg-primary/5 rounded-xl border border-primary/10 p-4">
        <p className="text-xs text-primary/60 font-medium mb-1">Total Return</p>
        <p className="text-2xl font-black text-primary">+42.8%</p>
        <p className="text-[10px] text-primary/40 mt-1">vs Baseline +12.4%</p>
      </div>
      <div className="bg-background-light dark:bg-primary/5 rounded-xl border border-primary/10 p-4">
        <p className="text-xs text-primary/60 font-medium mb-1">Sharpe Ratio</p>
        <p className="text-2xl font-black text-slate-900 dark:text-slate-100">2.84</p>
        <p className="text-[10px] text-primary/40 mt-1">Industrial Benchmark: 1.5</p>
      </div>
      <div className="bg-background-light dark:bg-primary/5 rounded-xl border border-primary/10 p-4">
        <p className="text-xs text-primary/60 font-medium mb-1">Max Drawdown</p>
        <p className="text-2xl font-black text-rose-500">-8.2%</p>
        <p className="text-[10px] text-primary/40 mt-1">Recovery: 14 Days</p>
      </div>
    </div>
  );
};

export default OptimizationMetricsRow;
