import React from 'react';

const OptimizationHeader = ({ onExportClick, onRunClick }) => {
  return (
    <div className="flex flex-col gap-6 mb-8 mt-2">
      {/* Top Row: Title & Actions */}
      <div className="flex flex-wrap flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">monitoring</span>
            <h1 className="text-main text-2xl font-black leading-tight tracking-tight uppercase">Strategy Optimization</h1>
          </div>
          <p className="text-secondary text-[11px] font-bold uppercase tracking-widest opacity-60">Unified Intelligence Center</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={onExportClick}
            className="flex items-center justify-center gap-2 rounded-xl h-10 px-5 border border-glass text-secondary text-[10px] font-black uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            <span>Export</span>
          </button>
          <button 
            onClick={onRunClick}
            className="flex items-center justify-center gap-2 rounded-xl h-10 px-6 bg-primary text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-primary/20"
          >
            <span className="material-symbols-outlined text-lg">play_arrow</span>
            <span>Run New Optimization</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Status Chips */}
      <div className="flex flex-wrap gap-2.5">
        <div className="flex h-9 items-center justify-center gap-x-2 rounded-xl bg-primary/5 border border-primary/10 px-4">
          <span className="material-symbols-outlined text-primary text-base">trending_up</span>
          <p className="text-primary text-[9px] font-black uppercase tracking-widest">Bullish Regime</p>
        </div>
        <div className="flex h-9 items-center justify-center gap-x-2 rounded-xl bg-amber-500/5 border border-amber-500/10 px-4">
          <span className="material-symbols-outlined text-amber-500 text-base">bolt</span>
          <p className="text-amber-500 text-[9px] font-black uppercase tracking-widest">High Volatility</p>
        </div>
        <div className="flex h-9 items-center justify-center gap-x-2 rounded-xl bg-blue-500/5 border border-blue-500/10 px-4">
          <span className="material-symbols-outlined text-blue-500 text-base">database</span>
          <p className="text-blue-500 text-[9px] font-black uppercase tracking-widest">15m Binance Data</p>
        </div>
      </div>
    </div>
  );
};

export default OptimizationHeader;
