import React, { useState, useEffect, useMemo } from 'react';
import { useTrading } from '../../context/TradingContext';
import { getSymbols } from '../../services/exchangeService';
import BacktestTradeChart from './BacktestTradeChart';
import GlassSelect from '../ui/GlassSelect';
import DeployBotModal from './DeployBotModal';

const TIMEFRAMES = [
  { value: '1', label: '1m' },
  { value: '3', label: '3m' },
  { value: '5', label: '5m' },
  { value: '15', label: '15m' },
  { value: '30', label: '30m' },
  { value: '60', label: '1h' },
  { value: '120', label: '2h' },
  { value: '240', label: '4h' },
  { value: 'D', label: '1D' },
  { value: 'W', label: '1W' },
];

const BacktestResults = ({ onClear, strategyData }) => {
  const { activeSymbol, activeTimeframe, activeExchange, networkMode, saveStrategy } = useTrading();

  // Local symbol/timeframe state — defaults from context or strategyData
  const [selectedSymbol, setSelectedSymbol] = useState(strategyData?.symbol || activeSymbol);
  const [selectedTimeframe, setSelectedTimeframe] = useState(strategyData?.timeframe || activeTimeframe);
  const [availableSymbols, setAvailableSymbols] = useState([]);
  const [symbolSearch, setSymbolSearch] = useState('');
  const [showSymbolDropdown, setShowSymbolDropdown] = useState(false);
  const [chartKey, setChartKey] = useState(0); // force re-render
  const [showDeployModal, setShowDeployModal] = useState(false);

  // Fetch available symbols from exchange API
  useEffect(() => {
    let cancelled = false;
    const fetchSymbols = async () => {
      const symbols = await getSymbols(activeExchange, networkMode);
      if (!cancelled && symbols.length > 0) {
        setAvailableSymbols(symbols);
      }
    };
    fetchSymbols();
    return () => { cancelled = true; };
  }, [activeExchange, networkMode]);

  // Filter symbols by search
  const filteredSymbols = useMemo(() => {
    if (!symbolSearch) return availableSymbols;
    const q = symbolSearch.toUpperCase();
    return availableSymbols.filter(s =>
      s.symbol.includes(q) || s.baseCoin.includes(q)
    );
  }, [availableSymbols, symbolSearch]);

  // When symbol or timeframe changes, bump chart key to force re-render
  const handleSymbolChange = (sym) => {
    setSelectedSymbol(sym);
    setShowSymbolDropdown(false);
    setSymbolSearch('');
    setChartKey(prev => prev + 1);
  };

  const handleTimeframeChange = (tf) => {
    setSelectedTimeframe(tf);
    setChartKey(prev => prev + 1);
  };

  const timeframeLabel = TIMEFRAMES.find(t => t.value === selectedTimeframe)?.label || selectedTimeframe;

  // Generate dynamic mock results that vary by symbol+timeframe
  const results = useMemo(() => {
    // Use a seed based on symbol+timeframe so results are consistent per pair
    const seed = (selectedSymbol + selectedTimeframe).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const rng = (n) => ((seed * 9301 + 49297 + n * 233) % 233280) / 233280;

    const winRate = 55 + rng(1) * 25; // 55-80%
    const totalTrades = Math.floor(200 + rng(2) * 1800); // 200-2000
    const profitableTrades = Math.floor(totalTrades * winRate / 100);
    const lossTrades = totalTrades - profitableTrades;
    const profitFactor = (1.2 + rng(3) * 2.5).toFixed(2);
    const totalPnlPct = (10 + rng(4) * 80).toFixed(1);
    const totalPnlAbs = (5000 + rng(5) * 80000).toFixed(2);
    const maxDD = (5 + rng(6) * 20).toFixed(1);
    const maxDDval = (2000 + rng(7) * 20000).toFixed(2);
    const sharpe = (0.8 + rng(8) * 3).toFixed(2);
    const sortino = (1.0 + rng(9) * 4).toFixed(2);
    const recovery = (1.5 + rng(10) * 5).toFixed(2);
    const avgWin = (50 + rng(11) * 200).toFixed(2);
    const avgLoss = (20 + rng(12) * 100).toFixed(2);
    const expectancy = ((profitableTrades * avgWin - lossTrades * avgLoss) / totalTrades).toFixed(2);
    const largestWin = (500 + rng(13) * 8000).toFixed(2);
    const largestLoss = (200 + rng(14) * 4000).toFixed(2);
    const holdHours = Math.floor(1 + rng(15) * 24);
    const holdMins = Math.floor(rng(16) * 59);
    const consWins = Math.floor(5 + rng(17) * 20);
    const consLoss = Math.floor(2 + rng(18) * 8);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyReturns = months.map((m, i) => {
      const pnl = ((rng(20 + i) - 0.3) * 10000).toFixed(0);
      const pct = ((rng(20 + i) - 0.3) * 10).toFixed(1);
      const positive = parseFloat(pnl) >= 0;
      return {
        month: `${m} 2024`,
        pnl: positive ? `+$${Math.abs(pnl).toLocaleString()}` : `-$${Math.abs(pnl).toLocaleString()}`,
        pct: positive ? `+${Math.abs(pct)}%` : `-${Math.abs(pct)}%`,
        color: positive ? 'emerald' : 'rose',
      };
    });

    return {
      strategyName: strategyData?.name || `Strategy — ${selectedSymbol}`,
      symbol: selectedSymbol,
      timeframe: timeframeLabel,
      period: strategyData?.dateFrom && strategyData?.dateTo
        ? `${strategyData.dateFrom} – ${strategyData.dateTo}`
        : 'Jan 2024 – Mar 2025',
      language: strategyData?.language || 'pine',
      totalPnL: `+$${Number(totalPnlAbs).toLocaleString()}`,
      totalPnLPercent: `+${totalPnlPct}%`,
      maxEquityDrawdown: `-${maxDD}%`,
      maxEquityDrawdownValue: `-$${Number(maxDDval).toLocaleString()}`,
      totalTrades,
      profitableTrades,
      profitablePercent: `${winRate.toFixed(1)}%`,
      lossTrades,
      profitFactor: parseFloat(profitFactor),
      sharpeRatio: parseFloat(sharpe),
      sortinoRatio: parseFloat(sortino),
      recoveryFactor: parseFloat(recovery),
      expectancy: `$${expectancy}`,
      avgWin: `$${avgWin}`,
      avgLoss: `-$${avgLoss}`,
      largestWin: `$${Number(largestWin).toLocaleString()}`,
      largestLoss: `-$${Number(largestLoss).toLocaleString()}`,
      avgHoldingTime: `${holdHours}h ${holdMins}m`,
      consecutiveWins: consWins,
      consecutiveLosses: consLoss,
      monthlyReturns,
    };
  }, [selectedSymbol, selectedTimeframe, strategyData, timeframeLabel]);

  const d = results;

  const handleSaveStrategy = () => {
    saveStrategy({
      id: `strategy_${Date.now()}`,
      name: d.strategyName,
      symbol: d.symbol,
      timeframe: d.timeframe,
      script: strategyData?.script || '',
      language: d.language,
      results: {
        totalPnL: d.totalPnL,
        winRate: d.profitablePercent,
        profitFactor: d.profitFactor,
        sharpeRatio: d.sharpeRatio,
        maxDrawdown: d.maxEquityDrawdown,
        totalTrades: d.totalTrades,
      },
    });
  };

  const handleDeploy = async (config) => {
    try {
      const res = await fetch('/api/bots/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyName: config.name,
          strategyScript: config.script,
          symbol: config.symbol,
          exchange: activeExchange,
          networkMode: config.networkMode,
          signalInterval: config.signalInterval,
          riskInterval: config.riskInterval,
          leverage: config.leverage,
          maxDailyLossPct: config.maxDailyLossPct,
          maxPositions: config.maxPositions,
          maxTradesPerDay: config.maxTradesPerDay,
          trailingStopActivationPct: config.trailingStopActivationPct,
          trailingStopCallbackPct: config.trailingStopCallbackPct,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to deploy bot');
      
      // Navigate to Bot Status Matrix or show success toast
      alert('Bot Deployed Successfully!');
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {showDeployModal && (
        <DeployBotModal
          strategy={{ ...d, script: strategyData?.script || '' }}
          onClose={() => setShowDeployModal(false)}
          onDeploy={handleDeploy}
        />
      )}
      {/* Result Header with Symbol/Timeframe Selectors */}
      <div className="glass-card border border-glass rounded-[2rem] p-8 relative z-[100] !overflow-visible">
        <div className="flex flex-col gap-5">
          {/* Top row: badges + actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${d.language === 'pine' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-blue-500/10 border-blue-500/30 text-blue-500'}`}>
                  {d.language === 'pine' ? 'Pine Script' : 'Python'}
                </span>
              </div>
              <h2 className="text-main text-2xl font-black tracking-tight leading-none bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{d.strategyName}</h2>
              <p className="text-secondary text-[11px] font-bold mt-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                {d.period}
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => setShowDeployModal(true)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 text-black text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] hover:bg-orange-400 hover:scale-105 transition-all">
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                Deploy to Live
              </button>
              <button onClick={handleSaveStrategy} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 hover:border-primary/40 transition-all group shadow-sm">
                <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">save</span>
                Save Strategy
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-glass text-secondary text-[10px] font-black uppercase tracking-widest hover:text-main hover:bg-white/10 transition-all">
                <span className="material-symbols-outlined text-sm">download</span>
                Export
              </button>
              <button onClick={onClear} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-500/70 text-[10px] font-black uppercase tracking-widest hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all">
                <span className="material-symbols-outlined text-sm">close</span>
                Clear Test
              </button>
            </div>
          </div>

          {/* Symbol & Timeframe Selector Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-glass">
            {/* Symbol Selector */}
            <GlassSelect
              value={selectedSymbol}
              onChange={handleSymbolChange}
              options={availableSymbols.map(s => ({ value: s.symbol, label: s.symbol }))}
              placeholder="Pair"
              icon="currency_bitcoin"
              className="w-48"
              searchable={true}
            />

            {/* Timeframe Selector */}
            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-xl border border-glass p-1">
              {TIMEFRAMES.map(tf => (
                <button
                  key={tf.value}
                  onClick={() => handleTimeframeChange(tf.value)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedTimeframe === tf.value
                      ? 'bg-primary text-black shadow-sm'
                      : 'text-secondary hover:text-main hover:bg-white/5'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Exchange Badge */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20 ml-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest">{activeExchange} · {networkMode}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Chart with Markers — key forces re-render on change */}
      <BacktestTradeChart
        key={chartKey}
        layout={{
          background: { color: 'transparent' },
          textColor: 'var(--text-secondary)',
          fontSize: 10,
          fontFamily: "'Inter', sans-serif",
        }}
        strategyData={{ ...strategyData, symbol: selectedSymbol, timeframe: selectedTimeframe }}
        height={500}
      />

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Total P&L', value: d.totalPnL, sub: d.totalPnLPercent, color: 'emerald' },
          { label: 'Max Drawdown', value: d.maxEquityDrawdown, sub: d.maxEquityDrawdownValue, color: 'rose' },
          { label: 'Total Trades', value: d.totalTrades.toLocaleString(), sub: `${d.profitablePercent} Win Rate`, color: 'blue' },
          { label: 'Profit Factor', value: d.profitFactor.toFixed(2), sub: 'Risk-Adjusted PnL', color: 'primary' },
          { label: 'Sharpe Ratio', value: d.sharpeRatio, sub: 'Return Efficiency', color: 'amber' },
        ].map((m, i) => (
          <div key={i} className="glass-card border border-glass rounded-[1.5rem] p-6 hover:translate-y-[-4px]">
            <p className="text-[10px] text-secondary font-black uppercase tracking-[0.1em] mb-4 opacity-70">{m.label}</p>
            <p className={`text-2xl font-black tracking-tight mb-1 ${
              m.color === 'emerald' ? 'text-emerald-400' : 
              m.color === 'rose' ? 'text-rose-400' : 
              m.color === 'blue' ? 'text-blue-400' : 
              m.color === 'amber' ? 'text-amber-400' :
              'text-primary'
            }`}>{m.value}</p>
            <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card border border-glass rounded-3xl p-6">
          <h3 className="text-main text-sm font-black uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">shield</span>
            Risk & Performance
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Sharpe Ratio', value: d.sharpeRatio },
              { label: 'Sortino Ratio', value: d.sortinoRatio },
              { label: 'Recovery Factor', value: d.recoveryFactor },
              { label: 'Expectancy', value: d.expectancy },
              { label: 'Avg Win', value: d.avgWin },
              { label: 'Avg Loss', value: d.avgLoss },
              { label: 'Largest Win', value: d.largestWin },
              { label: 'Largest Loss', value: d.largestLoss },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-glass">
                <p className="text-[10px] text-secondary font-black uppercase tracking-widest mb-1">{item.label}</p>
                <p className={`text-lg font-black ${
                  String(item.value).startsWith('-') ? 'text-rose-500' :
                  String(item.value).startsWith('+') || String(item.value).startsWith('$') ? 'text-emerald-500' : 'text-main'
                }`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card border border-glass rounded-3xl p-6">
          <h3 className="text-main text-sm font-black uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">bar_chart</span>
            Trade Statistics
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                <span className="text-emerald-500">Wins {d.profitableTrades}</span>
                <span className="text-rose-500">Losses {d.lossTrades}</span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-black/5 dark:bg-white/5 border border-glass">
                <div className="bg-emerald-500 h-full rounded-l-full" style={{ width: d.profitablePercent }}></div>
                <div className="bg-rose-500 h-full rounded-r-full" style={{ width: `${100 - parseFloat(d.profitablePercent)}%` }}></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[
                { label: 'Avg Holding Time', value: d.avgHoldingTime, color: 'main' },
                { label: 'Consecutive Wins', value: d.consecutiveWins, color: 'emerald' },
                { label: 'Consecutive Losses', value: d.consecutiveLosses, color: 'rose' },
                { label: 'Win Rate', value: d.profitablePercent, color: 'primary' },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-glass">
                  <p className="text-[10px] text-secondary font-black uppercase tracking-widest mb-1">{item.label}</p>
                  <p className={`text-lg font-black ${
                    item.color === 'emerald' ? 'text-emerald-500' : item.color === 'rose' ? 'text-rose-500' : item.color === 'primary' ? 'text-primary' : 'text-main'
                  }`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Returns */}
      <div className="glass-card border border-glass rounded-3xl p-6">
        <h3 className="text-main text-sm font-black uppercase tracking-widest mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">calendar_month</span>
          Monthly Returns
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {d.monthlyReturns.map((m, i) => (
            <div key={i} className={`p-3 rounded-xl border transition-all hover:scale-105 ${
              m.color === 'emerald' ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40' : 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40'
            }`}>
              <p className="text-[10px] text-secondary font-black uppercase tracking-widest mb-1">{m.month}</p>
              <p className={`text-sm font-black ${m.color === 'emerald' ? 'text-emerald-500' : 'text-rose-500'}`}>{m.pnl}</p>
              <p className={`text-[10px] font-bold ${m.color === 'emerald' ? 'text-emerald-500/60' : 'text-rose-500/60'}`}>{m.pct}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BacktestResults;
