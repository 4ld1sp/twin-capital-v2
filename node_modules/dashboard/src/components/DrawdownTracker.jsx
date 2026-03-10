import React from 'react';

const DrawdownTracker = () => {
  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-primary/10 rounded-xl p-6 shadow-sm flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-lg font-bold">Drawdown Tracker</h3>
        <p className="text-xs text-slate-500">Risk exposure heatmap</p>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-6">
        <div className="relative h-40 w-full bg-red-500/5 rounded-xl border border-red-500/10 overflow-hidden">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M0,0 L10,5 L20,15 L30,45 L40,30 L50,60 L60,85 L70,70 L80,95 L90,80 L100,100 L100,0 Z" fill="rgba(239, 68, 68, 0.15)" stroke="none"></path>
            <polyline fill="none" points="0,0 10,5 20,15 30,45 40,30 50,60 60,85 70,70 80,95 90,80 100,100" stroke="rgba(239, 68, 68, 0.5)" strokeWidth="1.5"></polyline>
          </svg>
          <div className="absolute inset-x-0 bottom-2 text-center">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Active Drawdown Zone</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-primary/5 border border-slate-100 dark:border-primary/10">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Current</p>
            <p className="text-xl font-bold text-red-500">-4.2%</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-primary/5 border border-slate-100 dark:border-primary/10">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Worst Case</p>
            <p className="text-xl font-bold">-12.4%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawdownTracker;
