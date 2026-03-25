import React from 'react';

const OptimizationHeader = ({ activeOptTab, onTabChange, onExportClick, onRunClick }) => {
  return (
    <>
      <div className="flex flex-wrap justify-between items-end gap-6 mb-8 mt-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-main text-3xl font-black leading-tight tracking-tight uppercase">Research & Optimization</h1>
          <p className="text-secondary text-base font-bold uppercase tracking-wider opacity-80">Analyze market regimes and optimize strategy parameters in real-time.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onExportClick}
            className="flex items-center justify-center gap-2 rounded-xl h-11 px-6 border border-glass text-secondary text-xs font-black uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined text-xl">download</span>
            <span>Export Report</span>
          </button>
          <button 
            onClick={onRunClick}
            className="flex items-center justify-center gap-2 rounded-xl h-11 px-8 bg-primary text-black text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-primary/20"
          >
            <span className="material-symbols-outlined text-xl">play_arrow</span>
            <span>Run New Optimization</span>
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-8 overflow-x-auto pb-4">
        <div className="flex h-10 shrink-0 items-center justify-center gap-x-2.5 rounded-xl bg-primary/10 border border-primary/20 px-5 shadow-sm">
          <span className="material-symbols-outlined text-primary text-xl">trending_up</span>
          <p className="text-primary text-[10px] font-black uppercase tracking-widest">Regime: Bullish</p>
        </div>
        <div className="flex h-10 shrink-0 items-center justify-center gap-x-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-5 shadow-sm">
          <span className="material-symbols-outlined text-amber-500 text-xl">bolt</span>
          <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest">Volatility: High</p>
        </div>
        <div className="flex h-10 shrink-0 items-center justify-center gap-x-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 px-5 shadow-sm">
          <span className="material-symbols-outlined text-blue-500 text-xl">database</span>
          <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest">Data: 15m Binance</p>
        </div>
      </div>

      <div className="mb-8">
        <nav className="flex items-center gap-2 p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-glass overflow-x-auto w-full sm:w-auto">
          <button 
            onClick={() => onTabChange('logs')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeOptTab === 'logs' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-secondary hover:text-main'}`}
          >
            Parameter Logs
          </button>
          <button 
            onClick={() => onTabChange('equity')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeOptTab === 'equity' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-secondary hover:text-main'}`}
          >
            Equity Curve
          </button>
          <button 
            onClick={() => onTabChange('ab_testing')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeOptTab === 'ab_testing' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-secondary hover:text-main'}`}
          >
            A/B Testing
          </button>
          <button 
            onClick={() => onTabChange('correlations')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeOptTab === 'correlations' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-secondary hover:text-main'}`}
          >
            Correlations
          </button>
        </nav>
      </div>
    </>
  );
};

export default OptimizationHeader;
