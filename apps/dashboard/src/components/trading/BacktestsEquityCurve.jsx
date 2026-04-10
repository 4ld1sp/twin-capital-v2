import LiveBacktestChart from './LiveBacktestChart';

const BacktestsEquityCurve = () => {
  return (
    <div className="lg:col-span-3 flex flex-col gap-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] rounded-3xl p-5 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 px-2">
        <div>
          <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest pl-1 mb-2">TradingView Chart</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Connected to Bybit</span>
          </div>
        </div>
      </div>
      
      {/* Full TradingView Chart */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--border)] shadow-inner" style={{ height: '500px' }}>
        <LiveBacktestChart height="100%" symbol="BYBIT:BTCUSDT" interval="15" />
      </div>
      
      {/* Footer */}
      <div className="flex justify-between px-3 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>Live TradingView Feed</span>
          </div>
          <span>•</span>
          <span>BYBIT:BTCUSDT</span>
        </div>
        <span>Powered by TradingView</span>
      </div>
    </div>
  );
};

export default BacktestsEquityCurve;
