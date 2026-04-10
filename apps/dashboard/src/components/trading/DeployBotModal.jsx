import React, { useState } from 'react';

const DeployBotModal = ({ strategy, onClose, onDeploy }) => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    symbol: strategy?.symbol || 'BTCUSDT',
    networkMode: 'mainnet',
    signalInterval: '30m',
    riskInterval: '10s',
    leverage: 5,
    maxDailyLossPct: 5,
    maxPositions: 10,
    maxTradesPerDay: 10,
    riskPerTradePct: 1,
    trailingStopActivationPct: 1.0,
    trailingStopCallbackPct: 0.5,
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onDeploy({ ...strategy, ...config });
    setLoading(false);
    onClose();
  };

  if (!strategy) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl">
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] rounded-[2rem] w-full max-w-2xl bg-black/80 shadow-[0_0_100px_rgba(0,184,217,0.1)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,184,217,0.2)]">
              <span className="material-symbols-outlined text-primary text-2xl">rocket_launch</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Deploy Auto-Trading Bot</h2>
              <p className="text-[var(--text-secondary)] text-xs font-bold">{strategy.name || strategy.strategyName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="deploy-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Core Config */}
            <div>
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">settings</span>
                Core Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Symbol</label>
                  <select
                    name="symbol"
                    value={config.symbol}
                    onChange={handleChange}
                    className="w-full bg-black/20 border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-primary)] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all appearance-none"
                  >
                    <option value="ALL_MARKETS">ALL MARKETS (Auto Scanner)</option>
                    <option value="BTCUSDT">BTCUSDT (Targeted)</option>
                    <option value="ETHUSDT">ETHUSDT (Targeted)</option>
                    <option value="SOLUSDT">SOLUSDT (Targeted)</option>
                    <option value="XRPUSDT">XRPUSDT (Targeted)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Network</label>
                  <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm font-bold text-emerald-500 flex items-center justify-between">
                    <span>Mainnet (Live Funds)</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">AI Signal Cadence</label>
                  <select
                    name="signalInterval"
                    value={config.signalInterval}
                    onChange={handleChange}
                    className="w-full bg-black/20 border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-primary)] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all appearance-none"
                  >
                    <option value="1m">1 Minute (Ultra Fast)</option>
                    <option value="5m">5 Minutes (Fast)</option>
                    <option value="15m">15 Minutes</option>
                    <option value="30m">30 Minutes (Recommended)</option>
                    <option value="1h">1 Hour</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">Risk Check Cadence</label>
                  <select
                    name="riskInterval"
                    value={config.riskInterval}
                    onChange={handleChange}
                    className="w-full bg-black/20 border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-primary)] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all appearance-none"
                  >
                    <option value="10s">10 Seconds (Recommended)</option>
                    <option value="30s">30 Seconds</option>
                    <option value="60s">60 Seconds</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Risk Limits (Kill-Switch) */}
            <div>
              <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-500 text-lg">health_and_safety</span>
                Kill-Switch Limits
              </h3>
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-4">
                <p className="text-rose-500/80 text-xs font-medium leading-relaxed mb-2">
                  The Risk Engine will immediately close all positions and halt the bot if these limits are hit.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-rose-500/70 ml-1">Max Daily Loss (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="maxDailyLossPct"
                        value={config.maxDailyLossPct}
                        onChange={handleChange}
                        className="w-full bg-black/20 border border-rose-500/30 rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-primary)] focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all"
                        min="0" max="100" step="0.1"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-sm font-bold">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-rose-500/70 ml-1">Max Trades Per Day</label>
                    <input
                      type="number"
                      name="maxTradesPerDay"
                      value={config.maxTradesPerDay}
                      onChange={handleChange}
                      className="w-full bg-black/20 border border-rose-500/30 rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-primary)] focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all"
                      min="1" max="100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Trade Sizing & Stops */}
            <div>
              <h3 className="text-sm font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500 text-lg">moving</span>
                Execution & Trailing Stop
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500/70 ml-1">Leverage (x)</label>
                  <input
                    type="number"
                    name="leverage"
                    value={config.leverage}
                    onChange={handleChange}
                    className="w-full bg-black/20 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-primary)] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    min="1" max="100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500/70 ml-1">Trail Activates At</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="trailingStopActivationPct"
                      value={config.trailingStopActivationPct}
                      onChange={handleChange}
                      className="w-full bg-black/20 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-primary)] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                      min="0.1" max="50" step="0.1"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-sm font-bold">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500/70 ml-1">Trail Pullback</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="trailingStopCallbackPct"
                      value={config.trailingStopCallbackPct}
                      onChange={handleChange}
                      className="w-full bg-black/20 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-primary)] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                      min="0.1" max="20" step="0.1"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-sm font-bold">%</span>
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--border)] bg-black/50 shrink-0 flex items-center justify-between">
          <p className="text-[11px] text-[var(--text-secondary)] font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary">psychology</span>
            Bot consumes AI compute per signal cycle.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-xs font-black uppercase tracking-widest hover:text-[var(--text-primary)] hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="deploy-form"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,184,217,0.3)] hover:shadow-[0_0_30px_rgba(0,184,217,0.5)] hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">cycle</span>
                  Deploying...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
                  Deploy Bot
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DeployBotModal;
