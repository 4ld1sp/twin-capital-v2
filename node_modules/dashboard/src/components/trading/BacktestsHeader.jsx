import React from 'react';

const BacktestsHeader = () => {
  return (
    <div className="flex flex-wrap justify-between items-end gap-4 mb-8 mt-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-black tracking-tight">Strategy Backtest</h1>
        <div className="flex items-center gap-2">
          <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded">V2.1</span>
          <p className="text-slate-500 dark:text-slate-400 text-base font-medium">Mean Reversion Strategy: SPY/QQQ Pair</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button className="flex items-center justify-center rounded-lg h-11 px-6 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-sm hover:opacity-90 transition-all">
          <span className="material-symbols-outlined mr-2 text-lg">settings</span> Configuration
        </button>
        <button className="flex items-center justify-center rounded-lg h-11 px-6 bg-primary text-background-dark font-bold text-sm hover:opacity-90 transition-all">
          <span className="material-symbols-outlined mr-2 text-lg">play_arrow</span> Run New Test
        </button>
      </div>
    </div>
  );
};

export default BacktestsHeader;
