import React from 'react';

const BacktestsQuickActions = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div className="p-8 rounded-3xl border border-primary/20 bg-primary/5 flex items-center gap-5 group cursor-pointer hover:bg-primary/10 transition-all shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30 group-hover:scale-105 transition-all">
          <span className="material-symbols-outlined text-3xl">auto_fix_high</span>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">AI Optimizer</p>
          <p className="text-[10px] font-bold text-secondary uppercase tracking-tighter opacity-60">Tune for Alpha</p>
        </div>
      </div>
      <div className="p-8 rounded-3xl border border-glass glass-card flex items-center gap-5 group cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 text-secondary flex items-center justify-center border border-glass group-hover:scale-110 transition-all">
          <span className="material-symbols-outlined text-3xl">cloud_sync</span>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-main mb-1">Live Deploy</p>
          <p className="text-[10px] font-bold text-secondary uppercase tracking-tighter opacity-70">Push to Paper</p>
        </div>
      </div>
      <div className="p-8 rounded-3xl border border-glass glass-card flex items-center gap-5 group cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 text-secondary flex items-center justify-center border border-glass group-hover:scale-110 transition-all">
          <span className="material-symbols-outlined text-3xl">share</span>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-main mb-1">Share Info</p>
          <p className="text-[10px] font-bold text-secondary uppercase tracking-tighter opacity-70">Public Report</p>
        </div>
      </div>
    </div>
  );
};

export default BacktestsQuickActions;
