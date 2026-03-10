import React from 'react';

const OptimizationHeader = ({ activeOptTab, onTabChange, onExportClick, onRunClick }) => {
  return (
    <>
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-black leading-tight tracking-tight">Research & Optimization</h1>
          <p className="text-slate-500 dark:text-primary/60 text-base font-normal">Analyze market regimes and optimize strategy parameters in real-time.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onExportClick}
            className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 border border-primary/30 text-primary text-sm font-bold hover:bg-primary/5 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            <span>Export Report</span>
          </button>
          <button 
            onClick={onRunClick}
            className="flex items-center justify-center gap-2 rounded-lg h-10 px-6 bg-primary text-background-dark text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-lg">play_arrow</span>
            <span>Run New Optimization</span>
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        <div className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary/10 border border-primary/20 px-4">
          <span className="material-symbols-outlined text-primary text-lg">trending_up</span>
          <p className="text-primary text-sm font-bold">Regime: Bullish</p>
        </div>
        <div className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4">
          <span className="material-symbols-outlined text-amber-500 text-lg">bolt</span>
          <p className="text-amber-500 text-sm font-bold">Volatility: High</p>
        </div>
        <div className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4">
          <span className="material-symbols-outlined text-blue-500 text-lg">database</span>
          <p className="text-blue-500 text-sm font-bold">Data: 15m Binance</p>
        </div>
      </div>

      <div className="border-b border-primary/10 mb-6 flex overflow-x-auto">
        <div className="flex gap-8 whitespace-nowrap">
          <button 
            onClick={() => onTabChange('logs')}
            className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeOptTab === 'logs' ? 'border-primary text-primary' : 'border-transparent text-primary/60 hover:text-primary hover:border-primary/50'}`}
          >
            Parameter Logs
          </button>
          <button 
            onClick={() => onTabChange('equity')}
            className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeOptTab === 'equity' ? 'border-primary text-primary' : 'border-transparent text-primary/60 hover:text-primary hover:border-primary/50'}`}
          >
            Equity Curve
          </button>
          <button 
            onClick={() => onTabChange('ab_testing')}
            className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeOptTab === 'ab_testing' ? 'border-primary text-primary' : 'border-transparent text-primary/60 hover:text-primary hover:border-primary/50'}`}
          >
            A/B Testing
          </button>
          <button 
            onClick={() => onTabChange('correlations')}
            className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeOptTab === 'correlations' ? 'border-primary text-primary' : 'border-transparent text-primary/60 hover:text-primary hover:border-primary/50'}`}
          >
            Correlations
          </button>
        </div>
      </div>
    </>
  );
};

export default OptimizationHeader;
