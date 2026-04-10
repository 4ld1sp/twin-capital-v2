import React from 'react';

const BacktestsHeader = ({ onRunTestClick }) => {
  return (
    <div className="flex flex-col gap-6 mb-8 mt-2">
      {/* Top Row: Title & Actions */}
      <div className="flex flex-wrap flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">candlestick_chart</span>
            <h1 className="text-[var(--text-primary)] text-2xl font-black leading-tight tracking-tight uppercase">Strategy Backtest</h1>
          </div>
          <p className="text-[var(--text-secondary)] text-[11px] font-bold uppercase tracking-widest opacity-60">Mean Reversion Strategy: SPY/QQQ Pair</p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center justify-center gap-2 rounded-xl h-10 px-5 border border-[var(--border)] text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest hover: transition-all">
            <span className="material-symbols-outlined text-lg">download</span>
            <span>Export</span>
          </button>
          <button 
            onClick={onRunTestClick}
            className="flex items-center justify-center gap-2 rounded-xl h-10 px-6 bg-primary text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-primary/20"
          >
            <span className="material-symbols-outlined text-lg">play_arrow</span>
            <span>Run New Test</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Status Chips */}
      <div className="flex flex-wrap gap-2.5">
        <div className="flex h-9 items-center justify-center gap-x-2 rounded-xl bg-primary/5 border border-primary/10 px-4">
          <span className="material-symbols-outlined text-primary text-base">verified</span>
          <p className="text-primary text-[9px] font-black uppercase tracking-widest">V2.1 Active</p>
        </div>
        <div className="flex h-9 items-center justify-center gap-x-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 px-4">
          <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
          <p className="text-emerald-500 text-[9px] font-black uppercase tracking-widest">68.5% Win Rate</p>
        </div>
        <div className="flex h-9 items-center justify-center gap-x-2 rounded-xl bg-blue-500/5 border border-blue-500/10 px-4">
          <span className="material-symbols-outlined text-blue-500 text-base">database</span>
          <p className="text-blue-500 text-[9px] font-black uppercase tracking-widest">15m Bybit Data</p>
        </div>
        <div className="flex h-9 items-center justify-center gap-x-2 rounded-xl bg-amber-500/5 border border-amber-500/10 px-4">
          <span className="material-symbols-outlined text-amber-500 text-base">schedule</span>
          <p className="text-amber-500 text-[9px] font-black uppercase tracking-widest">Last Run: 2h ago</p>
        </div>
      </div>
    </div>
  );
};

export default BacktestsHeader;
