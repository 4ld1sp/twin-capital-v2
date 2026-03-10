import React from 'react';

const BacktestsQuickActions = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div className="p-6 rounded-xl border border-primary/30 bg-primary/5 flex items-center gap-4">
        <span className="material-symbols-outlined text-primary text-3xl">auto_fix_high</span>
        <div>
          <p className="font-bold">AI Optimizer</p>
          <p className="text-xs text-slate-500">Auto-tune parameters for lower drawdown</p>
        </div>
      </div>
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex items-center gap-4">
        <span className="material-symbols-outlined text-slate-400 text-3xl">cloud_sync</span>
        <div>
          <p className="font-bold">Live Deployment</p>
          <p className="text-xs text-slate-500">Deploy this strategy to Paper Trading</p>
        </div>
      </div>
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex items-center gap-4">
        <span className="material-symbols-outlined text-slate-400 text-3xl">share</span>
        <div>
          <p className="font-bold">Share Report</p>
          <p className="text-xs text-slate-500">Generate public link for strategy results</p>
        </div>
      </div>
    </div>
  );
};

export default BacktestsQuickActions;
