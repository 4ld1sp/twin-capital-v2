import React from 'react';

const BacktestsHeader = () => {
  return (
    <div className="flex flex-wrap justify-between items-end gap-6 mb-8 mt-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-main text-4xl font-black tracking-tight uppercase">Strategy Backtest</h1>
        <div className="flex items-center gap-3">
          <span className="bg-primary text-black text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm uppercase tracking-widest">V2.1</span>
          <p className="text-secondary text-base font-bold uppercase tracking-wider opacity-80">Mean Reversion Strategy: SPY/QQQ Pair</p>
        </div>
      </div>
      <div className="flex gap-4">
        <button className="flex items-center justify-center rounded-2xl h-12 px-6 bg-black/5 dark:bg-white/5 border border-glass text-main font-black text-[11px] uppercase tracking-widest hover:bg-black/10 dark:hover:bg-white/10 transition-all">
          <span className="material-symbols-outlined mr-2 text-xl">settings</span> Configuration
        </button>
        <button className="flex items-center justify-center rounded-2xl h-12 px-8 bg-primary text-black font-black text-[11px] uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-primary/20">
          <span className="material-symbols-outlined mr-2 text-xl">play_arrow</span> Run New Test
        </button>
      </div>
    </div>
  );
};

export default BacktestsHeader;
