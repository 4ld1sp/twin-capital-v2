import React, { useState, useRef } from 'react';

const mockResults = {
  strategyName: 'Alpha v2.1 — BTC Momentum',
  symbol: 'BTCUSDT',
  timeframe: '15m',
  period: 'Jan 2024 – Mar 2025',
  totalPnL: '+$42,891.33',
  totalPnLPercent: '+42.8%',
  maxEquityDrawdown: '-12.4%',
  maxEquityDrawdownValue: '-$15,230.00',
  totalTrades: 1247,
  profitableTrades: 854,
  profitablePercent: '68.5%',
  lossTrades: 393,
  profitFactor: 2.41,
  sharpeRatio: 1.87,
  sortinoRatio: 2.93,
  recoveryFactor: 3.46,
  expectancy: '$34.39',
  avgWin: '$128.77',
  avgLoss: '-$62.22',
  largestWin: '$4,210.50',
  largestLoss: '-$1,890.00',
  avgHoldingTime: '4h 22m',
  consecutiveWins: 14,
  consecutiveLosses: 6,
  monthlyReturns: [
    { month: 'Jan 2024', pnl: '+$2,100', pct: '+2.1%', color: 'emerald' },
    { month: 'Feb 2024', pnl: '-$890', pct: '-0.9%', color: 'rose' },
    { month: 'Mar 2024', pnl: '+$4,520', pct: '+4.5%', color: 'emerald' },
    { month: 'Apr 2024', pnl: '+$1,340', pct: '+1.3%', color: 'emerald' },
    { month: 'May 2024', pnl: '+$6,780', pct: '+6.8%', color: 'emerald' },
    { month: 'Jun 2024', pnl: '-$2,110', pct: '-2.1%', color: 'rose' },
    { month: 'Jul 2024', pnl: '+$3,890', pct: '+3.9%', color: 'emerald' },
    { month: 'Aug 2024', pnl: '+$5,210', pct: '+5.2%', color: 'emerald' },
    { month: 'Sep 2024', pnl: '+$1,560', pct: '+1.6%', color: 'emerald' },
    { month: 'Oct 2024', pnl: '+$7,340', pct: '+7.3%', color: 'emerald' },
    { month: 'Nov 2024', pnl: '+$8,920', pct: '+8.9%', color: 'emerald' },
    { month: 'Dec 2024', pnl: '+$4,231', pct: '+4.2%', color: 'emerald' },
  ],
};

const BacktestHub = () => {
  const [hasData, setHasData] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = () => {
    setIsLoading(true);
    setTimeout(() => {
      setHasData(true);
      setIsLoading(false);
    }, 2000);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleUpload();
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-32 gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <span className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-primary text-3xl">analytics</span>
        </div>
        <div className="text-center">
          <p className="text-[var(--text-primary)] text-lg font-black uppercase tracking-widest">Analyzing Strategy</p>
          <p className="text-[var(--text-secondary)] text-xs font-bold mt-1">Parsing Pine Script export data...</p>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-16 gap-8">
        <div
          className={`w-full max-w-2xl border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-300 cursor-pointer ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.02] shadow-2xl shadow-primary/10'
              : 'border-[var(--border)] hover:border-primary/50 hover:'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept=".csv,.json,.txt" className="hidden" onChange={handleUpload} />
          <div className="flex flex-col items-center gap-5">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isDragging ? 'bg-primary/20 shadow-xl shadow-primary/20' : ''
            }`}>
              <span className={`material-symbols-outlined text-4xl transition-colors ${isDragging ? 'text-primary' : 'text-[var(--text-secondary)]'}`}>
                upload_file
              </span>
            </div>
            <div>
              <p className="text-[var(--text-primary)] text-lg font-black uppercase tracking-widest">
                {isDragging ? 'Drop to Analyze' : 'Upload Pine Script Export'}
              </p>
              <p className="text-[var(--text-secondary)] text-xs font-bold mt-2">
                Drag & drop your TradingView Strategy Tester CSV, or click to browse
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-1 rounded-lg border border-[var(--border)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">.CSV</span>
              <span className="px-3 py-1 rounded-lg border border-[var(--border)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">.JSON</span>
              <span className="px-3 py-1 rounded-lg border border-[var(--border)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">.TXT</span>
            </div>
          </div>
        </div>

        {/* Quick Demo Button */}
        <button
          onClick={handleUpload}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
        >
          <span className="material-symbols-outlined text-lg">play_circle</span>
          Load Demo Strategy Data
        </button>
      </div>
    );
  }

  // Results View
  const d = mockResults;
  return (
    <div className="w-full flex flex-col gap-6 pt-4">
      {/* Strategy Header */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] rounded-3xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">Pine Script</span>
              <span className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest">{d.symbol}</span>
              <span className="px-3 py-1 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest">{d.timeframe}</span>
            </div>
            <h2 className="text-[var(--text-primary)] text-2xl font-black tracking-tight">{d.strategyName}</h2>
            <p className="text-[var(--text-secondary)] text-xs font-bold mt-1">{d.period}</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest hover:text-[var(--text-primary)] hover:  transition-all">
              <span className="material-symbols-outlined text-lg">download</span>
              Export Report
            </button>
            <button onClick={() => setHasData(false)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
              <span className="material-symbols-outlined text-lg">upload_file</span>
              New Upload
            </button>
          </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total P&L', value: d.totalPnL, sub: d.totalPnLPercent, color: 'emerald' },
          { label: 'Max Equity Drawdown', value: d.maxEquityDrawdown, sub: d.maxEquityDrawdownValue, color: 'rose' },
          { label: 'Total Trades', value: d.totalTrades.toLocaleString(), sub: `${d.profitablePercent} Profitable`, color: 'blue' },
          { label: 'Profitable Trades', value: d.profitableTrades.toLocaleString(), sub: `${d.lossTrades} Losses`, color: 'emerald' },
          { label: 'Profit Factor', value: d.profitFactor.toFixed(2), sub: 'Risk-Adjusted', color: 'primary' },
        ].map((m, i) => (
          <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] rounded-2xl p-5 hover:border-primary/30 transition-all group">
            <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-3">{m.label}</p>
            <p className={`text-2xl font-black tracking-tight ${
              m.color === 'emerald' ? 'text-emerald-500' : 
              m.color === 'rose' ? 'text-rose-500' : 
              m.color === 'blue' ? 'text-blue-500' : 
              'text-primary'
            }`}>{m.value}</p>
            <p className="text-[10px] text-[var(--text-secondary)] font-bold mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk & Performance */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] rounded-3xl p-6">
          <h3 className="text-[var(--text-primary)] text-sm font-black uppercase tracking-widest mb-5 flex items-center gap-2">
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
              <div key={i} className="p-3 rounded-xl border border-[var(--border)]">
                <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1">{item.label}</p>
                <p className={`text-lg font-black ${
                  String(item.value).startsWith('-') ? 'text-rose-500' : 
                  String(item.value).startsWith('+') || String(item.value).startsWith('$') ? 'text-emerald-500' : 
                  'text-[var(--text-primary)]'
                }`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trade Statistics */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] rounded-3xl p-6">
          <h3 className="text-[var(--text-primary)] text-sm font-black uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">bar_chart</span>
            Trade Statistics
          </h3>
          <div className="space-y-4">
            {/* Win/Loss Bar */}
            <div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                <span className="text-emerald-500">Wins {d.profitableTrades}</span>
                <span className="text-rose-500">Losses {d.lossTrades}</span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden flex border border-[var(--border)]">
                <div className="bg-emerald-500 h-full rounded-l-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" style={{ width: d.profitablePercent }}></div>
                <div className="bg-rose-500 h-full rounded-r-full shadow-[0_0_8px_rgba(244,63,94,0.4)]" style={{ width: `${100 - parseFloat(d.profitablePercent)}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 rounded-xl border border-[var(--border)]">
                <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1">Avg Holding Time</p>
                <p className="text-lg font-black text-[var(--text-primary)]">{d.avgHoldingTime}</p>
              </div>
              <div className="p-3 rounded-xl border border-[var(--border)]">
                <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1">Consecutive Wins</p>
                <p className="text-lg font-black text-emerald-500">{d.consecutiveWins}</p>
              </div>
              <div className="p-3 rounded-xl border border-[var(--border)]">
                <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1">Consecutive Losses</p>
                <p className="text-lg font-black text-rose-500">{d.consecutiveLosses}</p>
              </div>
              <div className="p-3 rounded-xl border border-[var(--border)]">
                <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1">Win Rate</p>
                <p className="text-lg font-black text-primary">{d.profitablePercent}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Returns */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] rounded-3xl p-6">
        <h3 className="text-[var(--text-primary)] text-sm font-black uppercase tracking-widest mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">calendar_month</span>
          Monthly Returns
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {d.monthlyReturns.map((m, i) => (
            <div key={i} className={`p-3 rounded-xl border transition-all hover:scale-105 ${
              m.color === 'emerald' 
                ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40' 
                : 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40'
            }`}>
              <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1">{m.month}</p>
              <p className={`text-sm font-black ${m.color === 'emerald' ? 'text-emerald-500' : 'text-rose-500'}`}>{m.pnl}</p>
              <p className={`text-[10px] font-bold ${m.color === 'emerald' ? 'text-emerald-500/60' : 'text-rose-500/60'}`}>{m.pct}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BacktestHub;
