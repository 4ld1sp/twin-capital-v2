import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';

const StrategyManager = () => {
  const { savedStrategies, deleteStrategy, deployStrategy, activeStrategy } = useTrading();
  const [expandedId, setExpandedId] = useState(null);

  if (savedStrategies.length === 0) return null;

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] rounded-3xl p-6">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-[var(--text-primary)] text-sm font-black uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">folder_special</span>
          Saved Strategies ({savedStrategies.length})
        </h3>
      </div>

      <div className="space-y-3">
        {savedStrategies.map((strategy) => {
          const isDeployed = activeStrategy?.id === strategy.id;
          const isExpanded = expandedId === strategy.id;
          const r = strategy.results || {};

          return (
            <div key={strategy.id} className={`rounded-2xl border transition-all ${isDeployed ? 'border-primary/40 bg-primary/5' : 'border-[var(--border)] hover:border-primary/20'}`}>
              {/* Strategy Summary Row */}
              <div className="p-4 flex items-center justify-between gap-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : strategy.id)}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${strategy.language === 'pine' ? 'bg-primary/10' : 'bg-blue-500/10'}`}>
                    <span className={`material-symbols-outlined text-lg ${strategy.language === 'pine' ? 'text-primary' : 'text-blue-500'}`}>
                      {strategy.language === 'pine' ? 'candlestick_chart' : 'code'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[var(--text-primary)] text-xs font-black truncate">{strategy.name}</p>
                      {isDeployed && (
                        <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[8px] font-black uppercase tracking-widest shrink-0">Active</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[var(--text-secondary)] text-[10px] font-bold">{strategy.symbol}</span>
                      <span className="text-secondary/40 text-[10px]">•</span>
                      <span className="text-[var(--text-secondary)] text-[10px] font-bold">{strategy.timeframe}</span>
                      <span className="text-secondary/40 text-[10px]">•</span>
                      <span className={`text-[10px] font-black ${strategy.language === 'pine' ? 'text-primary' : 'text-blue-500'}`}>
                        {strategy.language === 'pine' ? 'Pine' : 'Python'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {r.totalPnL && <span className="text-emerald-500 text-xs font-black hidden sm:block">{r.totalPnL}</span>}
                  {r.winRate && <span className="text-primary text-xs font-black hidden sm:block">{r.winRate}</span>}
                  <span className={`material-symbols-outlined text-[var(--text-secondary)] text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-[var(--border)] pt-4">
                  {r.totalPnL && (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
                      {[
                        { label: 'P&L', value: r.totalPnL, color: 'emerald' },
                        { label: 'Win Rate', value: r.winRate, color: 'primary' },
                        { label: 'Profit Factor', value: r.profitFactor, color: 'main' },
                        { label: 'Sharpe', value: r.sharpeRatio, color: 'main' },
                        { label: 'Drawdown', value: r.maxDrawdown, color: 'rose' },
                        { label: 'Trades', value: r.totalTrades, color: 'main' },
                      ].map((m, i) => (
                        <div key={i} className="p-2 rounded-lg border border-[var(--border)] text-center">
                          <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-0.5">{m.label}</p>
                          <p className={`text-xs font-black ${
                            m.color === 'emerald' ? 'text-emerald-500' : m.color === 'rose' ? 'text-rose-500' : m.color === 'primary' ? 'text-primary' : 'text-[var(--text-primary)]'
                          }`}>{m.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); deployStrategy(strategy); }}
                      disabled={isDeployed}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg ${
                        isDeployed
                          ? 'bg-primary/10 text-primary border border-primary/20 cursor-default'
                          : 'bg-primary text-black hover:brightness-110 shadow-primary/25'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">{isDeployed ? 'check' : 'rocket_launch'}</span>
                      {isDeployed ? 'Deployed' : 'Deploy to Live Trading'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteStrategy(strategy.id); }}
                      className="px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StrategyManager;
