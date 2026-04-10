import React from 'react';
import { Brain, Clock, ChevronRight, Wifi, AlertCircle } from 'lucide-react';
import { useSignalCountdown } from './useBotEngine';

const DECISION_STYLES = {
  BUY:   { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', label: 'BUY' },
  SELL:  { bg: 'bg-rose-500/10',    text: 'text-rose-500',    border: 'border-rose-500/20',    label: 'SELL' },
  HOLD:  { bg: 'bg-amber-500/10',   text: 'text-amber-500',   border: 'border-amber-500/20',   label: 'HOLD' },
  CLOSE: { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/20',    label: 'CLOSE' },
};

const SignalEngineCard = ({ bot, logs, isLoading, onUpdateSettings }) => {
  const countdown = useSignalCountdown(bot?.lastSignalAt, bot?.signalInterval, bot?.status);

  // Get last signal reasoning from trade logs (most recent signal_engine entry with aiReasoning)
  const lastSignalLog = logs?.find(l =>
    l.source === 'signal_engine' && l.action !== 'BOT_START' && l.aiReasoning
  );

  const decisionKey = (bot?.lastSignalAction || 'HOLD').toUpperCase();
  const decisionStyle = DECISION_STYLES[decisionKey] || DECISION_STYLES.HOLD;

  const aiModel = 'Minimax-M2.5'; // Surface the model used in botEngine.js

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] rounded-3xl p-6 flex flex-col h-full relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-[var(--text-primary)] text-sm font-black uppercase tracking-widest flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Signal Engine
        </h3>
        <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-black uppercase tracking-widest">
          AI Driven
        </span>
      </div>

      {isLoading && !bot ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !bot ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
          <AlertCircle className="w-8 h-8 text-secondary/40" />
          <p className="text-xs text-[var(--text-secondary)] font-bold">No active bot selected</p>
        </div>
      ) : (
        <div className="flex-1 space-y-4 relative z-10">

          {/* Countdown + Interval Selector */}
          <div className="flex flex-col gap-3  border border-[var(--border)] p-3.5 rounded-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--text-secondary)]" />
                <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-widest">Next Assessment</p>
              </div>
              <span className="text-[var(--text-primary)] font-mono font-black text-xl tracking-widest tabular-nums">
                {countdown}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <p className="text-[8px] text-secondary/60 font-black uppercase tracking-widest mr-auto">Frequency</p>
              <div className="flex items-center bg-black/20 rounded-lg p-0.5 border border-[var(--border)]/30">
                {['5m', '10m', '30m'].map((interval) => {
                  const isActive = bot.signalInterval === interval;
                  return (
                    <button
                      key={interval}
                      onClick={() => onUpdateSettings(bot.id, { signalInterval: interval })}
                      className={`
                        px-3 py-1 rounded-md text-[10px] font-black tracking-widest transition-all duration-300
                        ${isActive 
                          ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                        }
                      `}
                    >
                      {interval.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Key Signal Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className=" border border-[var(--border)] p-3 rounded-xl">
              <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1 opacity-60">AI Model</p>
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">{aiModel}</p>
            </div>
            <div className=" border border-[var(--border)] p-3 rounded-xl">
              <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1 opacity-60">Last Decision</p>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${decisionStyle.bg} ${decisionStyle.text} border ${decisionStyle.border}`}>
                {decisionStyle.label}
              </span>
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Wifi className="w-3 h-3 text-purple-400" />
              <span className="text-[9px] text-purple-400 font-black uppercase tracking-widest">Last Reasoning</span>
            </div>
            {lastSignalLog?.aiReasoning ? (
              <p className="text-xs font-bold text-main/80 leading-relaxed italic line-clamp-3">
                "{lastSignalLog.aiReasoning}"
              </p>
            ) : (
              <p className="text-xs text-[var(--text-secondary)] font-bold italic">
                Awaiting first signal cycle...
              </p>
            )}
          </div>

          {/* Signal stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Daily Trades', value: `${bot.dailyTradeCount ?? 0}/${bot.maxTradesPerDay}` },
              { label: 'Total Trades', value: bot.totalTrades ?? 0 },
              { label: 'Win Rate',     value: bot.totalTrades > 0 ? `${((bot.winCount / bot.totalTrades) * 100).toFixed(0)}%` : 'N/A' },
            ].map((m, i) => (
              <div key={i} className="border border-[var(--border)] rounded-lg p-2 text-center">
                <p className="text-[8px] text-[var(--text-secondary)] font-black uppercase tracking-widest opacity-60 mb-0.5">{m.label}</p>
                <p className="text-xs font-black text-[var(--text-primary)]">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {bot && (
        <div className="mt-4 pt-4 border-t border-[var(--border)]/50 flex justify-between items-center relative z-10">
          <p className="text-[9px] text-[var(--text-secondary)] font-bold">
            Last signal: {bot.lastSignalAt ? new Date(bot.lastSignalAt).toLocaleTimeString() : 'None'}
          </p>
          <button className="text-[10px] text-purple-400 font-black uppercase tracking-widest hover:text-purple-300 transition-colors flex items-center gap-1">
            View Logs <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SignalEngineCard;
