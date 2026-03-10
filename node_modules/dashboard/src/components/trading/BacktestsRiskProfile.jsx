import React from 'react';

const BacktestsRiskProfile = () => {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-6 backdrop-blur-sm">
      <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-4">Risk Profile</p>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-sm">Sharpe Ratio</span>
          <span className="text-primary font-bold">2.41</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div className="bg-primary h-full w-[80%] rounded-full"></div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Sortino Ratio</span>
          <span className="text-primary font-bold">3.12</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div className="bg-primary h-full w-[90%] rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default BacktestsRiskProfile;
