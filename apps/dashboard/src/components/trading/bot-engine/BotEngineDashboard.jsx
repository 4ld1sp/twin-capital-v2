import React, { useState, useRef, useEffect } from 'react';
import { Settings2, Zap, AlertCircle, Play, Pause, ChevronDown, Check } from 'lucide-react';
import SignalEngineCard from './SignalEngineCard';
import RiskEngineCard from './RiskEngineCard';
import BotTradeLogs from './BotTradeLogs';
import { useBotEngine } from './useBotEngine';
import { useTrading } from '../../../context/TradingContext';

const STATUS_CONFIG = {
  running: { dot: 'bg-emerald-500 animate-pulse', text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Running' },
  paused:  { dot: 'bg-amber-500',                 text: 'text-amber-500',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   label: 'Paused' },
  error:   { dot: 'bg-rose-500',                  text: 'text-rose-500',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    label: 'Error' },
  killed:  { dot: 'bg-rose-700',                  text: 'text-rose-700',    bg: 'bg-rose-700/10',    border: 'border-rose-700/20',    label: 'Killed' },
  stopped: { dot: 'bg-secondary/40',              text: 'text-[var(--text-secondary)]',   bg: 'bg-[var(--bg-surface)]',          border: 'border-[var(--border)]',          label: 'Stopped' },
};

const BotEngineDashboard = () => {
  const {
    bots,
    selectedBotId,
    setSelectedBotId,
    bot,
    logs,
    isLoadingBots,
    isLoadingDetail,
    actionLoading,
    error,
    stopBot,
    pauseBot,
    resumeBot,
    resetDrawdown,
    updateBotSettings,
    refetch,
  } = useBotEngine();

  const { activeSymbol, setActiveSymbol } = useTrading();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync: When activeSymbol externally changes (e.g. from TradingTerminal), select its bot
  useEffect(() => {
    if (bots.length === 0) return;
    const symbolBot = bots.find(b => b.symbol === activeSymbol && ['running', 'paused', 'error'].includes(b.status));
    if (symbolBot && symbolBot.id !== selectedBotId) {
      setSelectedBotId(symbolBot.id);
    }
  }, [activeSymbol, bots, selectedBotId, setSelectedBotId]);

  // Sync: When user manually selects a bot here, change the global activeSymbol to match
  const handleSelect = (newBotId) => {
    setSelectedBotId(newBotId);
    setIsDropdownOpen(false);
    const selected = bots.find(b => b.id === newBotId);
    if (selected && selected.symbol !== 'ALL_MARKETS') {
      setActiveSymbol(selected.symbol);
    }
  };

  const statusCfg = STATUS_CONFIG[bot?.status] || STATUS_CONFIG.stopped;

  return (
    <div className="w-full flex flex-col pt-4 space-y-6">

      {/* ── Header + Bot Selector ──────────────────────────── */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl relative z-50 border border-[var(--border)] rounded-3xl p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight uppercase">Hybrid Bot Engine</h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-bold max-w-md">
            Dual-loop architecture: AI Signal Engine (slow) + Hardcoded Risk Engine (fast), running fully independently.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* Bot instance selector */}
          <div className="flex flex-col flex-1 lg:flex-none min-w-[200px]">
            <label className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1 pl-1">
              Active Instance
            </label>
            {isLoadingBots ? (
              <div className="h-10  border border-[var(--border)] rounded-xl animate-pulse" />
            ) : bots.length === 0 ? (
              <div className="flex items-center gap-2 h-10 px-4  border border-[var(--border)] rounded-xl">
                <AlertCircle className="w-4 h-4 text-secondary/40" />
                <span className="text-xs text-[var(--text-secondary)] font-bold">No bots deployed</span>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`
                    flex items-center justify-between w-full h-10 px-4  border rounded-xl transition-all duration-300
                    ${isDropdownOpen ? 'border-primary ring-2 ring-primary/20 bg-black/20' : 'border-[var(--border)] hover:border-primary/50'}
                  `}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-sm font-black text-white truncate">
                      {bot ? `${bot.strategyName} · ${bot.symbol}` : 'Select Bot Instance'}
                    </span>
                    {bot && (
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[bot.status]?.dot}`} />
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[var(--text-secondary)] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-[100] bg-[#0f1118]/90 backdrop-blur-xl border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                      {bots.map((b) => {
                        const isSelected = b.id === selectedBotId;
                        const bStatus = STATUS_CONFIG[b.status] || STATUS_CONFIG.stopped;
                        return (
                          <button
                            key={b.id}
                            onClick={() => handleSelect(b.id)}
                            className={`
                              w-full flex items-center justify-between px-4 py-3 text-left transition-colors
                              ${isSelected ? 'bg-primary/10' : 'hover:bg-white/5'}
                            `}
                          >
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className={`text-xs font-black tracking-tight truncate ${isSelected ? 'text-primary' : 'text-white'}`}>
                                {b.strategyName}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">{b.symbol}</span>
                                <span className={`text-[8px] font-black uppercase tracking-[0.1em] ${bStatus.text}`}>
                                  {bStatus.label}
                                </span>
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={refetch}
            className="mt-[18px] h-10 aspect-square flex items-center justify-center rounded-xl  border border-[var(--border)] hover:bg-black/20  text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Bot Status Bar (if a bot is selected) ──────────── */}
      {bot && (
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 py-4 rounded-2xl border ${statusCfg.bg} ${statusCfg.border}`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${statusCfg.dot}`} />
              <span className={`text-sm font-black uppercase tracking-widest ${statusCfg.text}`}>{statusCfg.label}</span>
            </div>
            <span className="text-secondary/40 text-sm">|</span>
            <span className="text-xs text-[var(--text-secondary)] font-bold">{bot.strategyName}</span>
            <span className="text-secondary/40 text-xs">·</span>
            <span className="text-xs text-[var(--text-secondary)] font-bold">{bot.symbol === 'ALL_MARKETS' ? 'GLOBAL SCANNER' : bot.symbol}</span>
            <span className="text-secondary/40 text-xs">·</span>
            <span className="text-[10px] text-secondary/60 font-bold uppercase">{bot.exchange} {bot.networkMode === 'testnet' ? '· Testnet' : ''}</span>
          </div>

          {/* Quick controls */}
          <div className="flex items-center gap-2 shrink-0">
            {bot.status === 'running' && (
              <button
                onClick={() => pauseBot(bot.id)}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all disabled:opacity-50"
              >
                <Pause className="w-3 h-3" />
                Pause
              </button>
            )}
            {['paused', 'error', 'killed', 'stopped'].includes(bot.status) && (
              <button
                onClick={() => resumeBot(bot.id)}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all disabled:opacity-50"
              >
                <Play className="w-3 h-3" />
                {bot.status === 'paused' ? 'Resume' : 'Restart'}
              </button>
            )}
            {bot.status === 'error' && bot.errorMessage && (
              <span className="text-[10px] text-rose-500 font-bold truncate max-w-[200px]" title={bot.errorMessage}>
                ⚠ {bot.errorMessage}
              </span>
            )}
            {bot.status === 'killed' && bot.errorMessage && (
              <span className="text-[10px] text-rose-500 font-bold truncate max-w-[200px]" title={bot.errorMessage}>
                ⚠ {bot.errorMessage}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Error Banner ──────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <p className="text-xs text-rose-400 font-bold">
            Failed to load bot data: {error}. Make sure the API server is running.
          </p>
        </div>
      )}

      {/* ── Dual Engine Cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SignalEngineCard
          bot={bot}
          logs={logs}
          isLoading={isLoadingDetail}
          onUpdateSettings={updateBotSettings}
        />
        <RiskEngineCard
          bot={bot}
          isLoading={isLoadingDetail}
          actionLoading={actionLoading}
          onEmergencyStop={stopBot}
          onResetDrawdown={resetDrawdown}
        />
      </div>

      {/* ── Execution Logs ───────────────────────────────── */}
      <BotTradeLogs
        logs={logs}
        isLoading={isLoadingDetail}
        onRefetch={refetch}
      />
    </div>
  );
};

export default BotEngineDashboard;
