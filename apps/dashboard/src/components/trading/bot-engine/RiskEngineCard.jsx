import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, XCircle, Activity, TrendingDown, Target, RefreshCw } from 'lucide-react';
import { useTradingData } from '../../../hooks/useTradingData';

const RiskEngineCard = ({ bot, isLoading, actionLoading, onEmergencyStop, onResetDrawdown }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const td = useTradingData();

  // ── Derived metrics from real bot data
  const dailyPnl = parseFloat(bot?.dailyPnl ?? 0);
  const maxDailyLossPct = parseFloat(bot?.maxDailyLossPct ?? 5);
  const riskInterval = bot?.riskInterval ?? '10s';
  const isActive = bot?.status === 'running';

  // Daily drawdown as % of limit consumed
  const equity = td.totalEquity || 1; // Prevent division by zero
  const currentDrawdownPct = dailyPnl < 0 ? (Math.abs(dailyPnl) / equity) * 100 : 0;
  
  // Calculate limit consumed: if the threshold is 5%, and we are at 3.6%, we consumed (3.6 / 5) * 100 = 72%
  const limitConsumedPct = maxDailyLossPct > 0 ? (currentDrawdownPct / maxDailyLossPct) * 100 : 0;
  const clampedPct = Math.min(limitConsumedPct, 100);

  // Color thresholds by consumed drawdown %
  const riskLevel = clampedPct >= 75 ? 'critical' : clampedPct >= 40 ? 'warning' : 'safe';
  const riskColors = {
    safe:     { bar: 'bg-emerald-500', text: 'text-emerald-500', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.2)]' },
    warning:  { bar: 'bg-amber-500',   text: 'text-amber-500',   glow: 'shadow-[0_0_10px_rgba(245,158,11,0.2)]' },
    critical: { bar: 'bg-rose-500',    text: 'text-rose-500',    glow: 'shadow-[0_0_10px_rgba(244,63,94,0.3)]' },
  };
  const rc = riskColors[riskLevel];

  // Last risk check time
  const lastCheck = bot?.lastRiskCheckAt
    ? new Date(bot.lastRiskCheckAt).toLocaleTimeString()
    : 'Never';

  const handleConfirmStop = async () => {
    setIsModalOpen(false);
    if (onEmergencyStop && bot?.id) {
      await onEmergencyStop(bot.id);
    }
  };

  return (
    <>
      <div className="glass-card border border-glass rounded-3xl p-6 flex flex-col h-full relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-rose-500/10 blur-[50px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <h3 className="text-main text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            Risk Engine
          </h3>
          {isLoading && !bot ? (
            <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${
              isActive
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-secondary/10 border-glass'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-secondary/40'}`} />
              <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-emerald-500' : 'text-secondary'}`}>
                {isActive ? `Polling (${riskInterval})` : bot?.status ?? 'Offline'}
              </span>
            </div>
          )}
        </div>

        {!bot ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
            <Activity className="w-8 h-8 text-secondary/40" />
            <p className="text-xs text-secondary font-bold">No active bot selected</p>
          </div>
        ) : (
          <div className="flex-1 space-y-4 relative z-10">

            {/* Daily Drawdown Bar */}
            <div className={`bg-black/10 dark:bg-white/5 border border-glass p-4 rounded-xl ${rc.glow}`}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5 text-secondary" />
                    <span className="text-[9px] text-secondary font-black uppercase tracking-widest">Daily Drawdown</span>
                  </div>
                  <button
                    onClick={() => onResetDrawdown?.(bot.id)}
                    disabled={actionLoading}
                    title="Manual PnL Reset: Ignore previous losses/gains since today's 00:00 UTC and reset counter to zero."
                    className="p-1 px-1.5 rounded-md hover:bg-white/5 text-[8px] text-secondary/60 hover:text-primary border border-transparent hover:border-glass transition-all flex items-center gap-1 font-black uppercase tracking-[0.1em]"
                  >
                    <RefreshCw className={`w-2.5 h-2.5 ${actionLoading ? 'animate-spin' : ''}`} />
                    Reset
                  </button>
                </div>
                <span className={`text-sm font-black font-mono tabular-nums ${rc.text}`}>
                  {dailyPnl < 0 ? `-${currentDrawdownPct.toFixed(2)}%` : `+${currentDrawdownPct.toFixed(2)}%`}
                  <span className="text-secondary/50 text-[10px] font-bold"> / {maxDailyLossPct}%</span>
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${rc.bar}`}
                  style={{ width: `${clampedPct}%` }}
                />
              </div>
              <p className="text-[9px] text-secondary/50 font-bold mt-1.5 text-right">
                {clampedPct.toFixed(1)}% of limit consumed
              </p>
            </div>

            {/* Trailing Stop Config */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/10 dark:bg-white/5 border border-glass p-3 rounded-xl">
                <div className="flex items-center gap-1 mb-1">
                  <Target className="w-3 h-3 text-secondary/60" />
                  <p className="text-[8px] text-secondary font-black uppercase tracking-widest opacity-60">Trail Activation</p>
                </div>
                <p className="text-sm font-black text-amber-500 font-mono">
                  +{bot.trailingStopActivationPct ?? 1.0}%
                </p>
              </div>
              <div className="bg-black/10 dark:bg-white/5 border border-glass p-3 rounded-xl">
                <div className="flex items-center gap-1 mb-1">
                  <Target className="w-3 h-3 text-secondary/60" />
                  <p className="text-[8px] text-secondary font-black uppercase tracking-widest opacity-60">Callback Rate</p>
                </div>
                <p className="text-sm font-black text-amber-500 font-mono">
                  {bot.trailingStopCallbackPct ?? 0.5}%
                </p>
              </div>
            </div>

            {/* Risk Engine Status Block */}
            <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-3.5 flex items-start gap-3">
              <Activity className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-main/90 leading-relaxed">
                  Monitoring <span className="font-black text-main">3 kill-switches</span> independently of AI.
                  Max positions: <span className="font-black text-main">{bot.maxPositions ?? 1}</span>.
                  Risk per trade: <span className="font-black text-main">{bot.riskPerTradePct ?? 1}%</span>.
                </p>
                <p className="text-[9px] text-secondary/50 font-bold mt-1">
                  Last check: {lastCheck}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Stop Button */}
        <div className="mt-5 pt-4 border-t border-glass/50 flex justify-end relative z-10">
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={!bot || actionLoading}
            className="w-full py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {actionLoading ? (
              <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Emergency Stop
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Emergency Stop Confirmation Modal ────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Dialog */}
          <div className="relative bg-[var(--bg-card,#0f1118)] border border-rose-500/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_60px_rgba(244,63,94,0.2)]">
            {/* Warning icon */}
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>

            {/* Title */}
            <h2 className="text-center text-xl font-black text-white tracking-tight uppercase mb-1">
              Emergency Stop
            </h2>
            <p className="text-center text-rose-400 text-[10px] font-black uppercase tracking-widest mb-5">
              Irreversible Action — Risk Engine Triggered
            </p>

            {/* Bot name */}
            {bot && (
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl px-4 py-3 mb-5 text-center">
                <p className="text-xs text-secondary font-bold">Target Bot</p>
                <p className="text-sm font-black text-white">{bot.strategyName}</p>
                <p className="text-[10px] text-rose-400 font-bold">{bot.symbol} · {bot.exchange?.toUpperCase()}</p>
              </div>
            )}

            {/* Description */}
            <p className="text-center text-secondary text-sm font-bold leading-relaxed mb-7">
              This will immediately <span className="text-white font-black">cancel all open orders</span> and place market orders to{' '}
              <span className="text-rose-400 font-black">force close all active positions</span>. The bot will be stopped.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3.5 rounded-xl border border-glass text-secondary hover:text-white text-xs font-black uppercase tracking-widest transition-colors hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStop}
                className="flex-1 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-rose-500/20"
              >
                <span className="flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Confirm Stop
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RiskEngineCard;
