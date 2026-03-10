import React from 'react';

const BacktestsTradeDistribution = () => {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-6 backdrop-blur-sm flex-1">
      <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-4">Trade Distribution</p>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center text-sm">
          <span>Long Trades</span>
          <span className="font-bold">142</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span>Short Trades</span>
          <span className="font-bold">89</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span>Avg. Duration</span>
          <span className="font-bold">4.2 Days</span>
        </div>
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold">Profit Factor</span>
            <span className="text-primary font-bold">1.84</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacktestsTradeDistribution;
