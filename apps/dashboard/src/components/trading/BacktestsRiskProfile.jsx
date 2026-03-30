import React from 'react';

const BacktestsRiskProfile = () => {
  return (
    <div className="glass-card border border-glass rounded-3xl p-8 shadow-sm">
      <p className="text-secondary text-[10px] font-black uppercase tracking-widest mb-6 pl-1">Risk Profile</p>
      <div className="flex flex-col gap-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">Sharpe Ratio</span>
            <span className="text-primary font-black text-sm">2.41</span>
          </div>
          <div className="w-full bg-black/5 dark:bg-white/5 h-2 rounded-full overflow-hidden border border-glass">
            <div className="bg-primary/30 h-full w-[80%] rounded-full border-r border-primary/50"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">Sortino Ratio</span>
            <span className="text-primary font-black text-sm">3.12</span>
          </div>
          <div className="w-full bg-black/5 dark:bg-white/5 h-2 rounded-full overflow-hidden border border-glass">
            <div className="bg-primary/30 h-full w-[90%] rounded-full border-r border-primary/50"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacktestsRiskProfile;
