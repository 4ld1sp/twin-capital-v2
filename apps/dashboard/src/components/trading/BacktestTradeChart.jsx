import React, { useEffect, useRef, useState, memo } from 'react';
import { createChart, CrosshairMode, LineStyle } from 'lightweight-charts';
import { useTrading } from '../../context/TradingContext';
import { getKlines } from '../../services/exchangeService';

/**
 * Generate simulated trade signals on real kline data.
 * Uses a simple EMA crossover + RSI-like logic to place realistic entries.
 */
function generateTradeSignals(klines) {
  if (!klines || klines.length < 30) return [];

  const trades = [];
  const ema9 = computeEMA(klines.map(k => k.close), 9);
  const ema21 = computeEMA(klines.map(k => k.close), 21);

  let inPosition = false;
  let positionSide = null;
  let entryIndex = null;
  let entryPrice = null;

  for (let i = 22; i < klines.length - 1; i++) {
    if (!inPosition) {
      // Long signal: fast EMA crosses above slow EMA
      if (ema9[i] > ema21[i] && ema9[i - 1] <= ema21[i - 1]) {
        const ep = klines[i].close;
        const tp = ep * (1 + 0.02 + Math.random() * 0.03); // +2-5% TP
        const sl = ep * (1 - 0.01 - Math.random() * 0.015); // -1-2.5% SL

        inPosition = true;
        positionSide = 'long';
        entryIndex = i;
        entryPrice = ep;

        trades.push({
          type: 'entry',
          side: 'long',
          time: klines[i].time / 1000,
          price: ep,
          tp,
          sl,
          index: i,
        });
      }
      // Short signal: fast EMA crosses below slow EMA
      else if (ema9[i] < ema21[i] && ema9[i - 1] >= ema21[i - 1]) {
        const ep = klines[i].close;
        const tp = ep * (1 - 0.02 - Math.random() * 0.03); // -2-5% TP
        const sl = ep * (1 + 0.01 + Math.random() * 0.015); // +1-2.5% SL

        inPosition = true;
        positionSide = 'short';
        entryIndex = i;
        entryPrice = ep;

        trades.push({
          type: 'entry',
          side: 'short',
          time: klines[i].time / 1000,
          price: ep,
          tp,
          sl,
          index: i,
        });
      }
    } else {
      // Check exit conditions
      const lastTrade = trades[trades.length - 1];
      const currentHigh = klines[i].high;
      const currentLow = klines[i].low;

      let exitPrice = null;
      let exitReason = null;

      if (positionSide === 'long') {
        if (currentHigh >= lastTrade.tp) {
          exitPrice = lastTrade.tp;
          exitReason = 'tp';
        } else if (currentLow <= lastTrade.sl) {
          exitPrice = lastTrade.sl;
          exitReason = 'sl';
        } else if (i - entryIndex > 15 + Math.floor(Math.random() * 10)) {
          exitPrice = klines[i].close;
          exitReason = 'timeout';
        }
      } else {
        if (currentLow <= lastTrade.tp) {
          exitPrice = lastTrade.tp;
          exitReason = 'tp';
        } else if (currentHigh >= lastTrade.sl) {
          exitPrice = lastTrade.sl;
          exitReason = 'sl';
        } else if (i - entryIndex > 15 + Math.floor(Math.random() * 10)) {
          exitPrice = klines[i].close;
          exitReason = 'timeout';
        }
      }

      if (exitPrice) {
        trades.push({
          type: 'exit',
          side: positionSide,
          time: klines[i].time / 1000,
          price: exitPrice,
          reason: exitReason,
          entryPrice,
          pnl: positionSide === 'long'
            ? ((exitPrice - entryPrice) / entryPrice * 100).toFixed(2)
            : ((entryPrice - exitPrice) / entryPrice * 100).toFixed(2),
          index: i,
        });
        inPosition = false;
        positionSide = null;
      }
    }
  }

  return trades;
}

function computeEMA(data, period) {
  const k = 2 / (period + 1);
  const ema = [data[0]];
  for (let i = 1; i < data.length; i++) {
    ema.push(data[i] * k + ema[i - 1] * (1 - k));
  }
  return ema;
}

const BacktestTradeChart = ({ strategyData, height = 500 }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const { activeExchange, networkMode, activeSymbol, activeTimeframe } = useTrading();
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const symbol = strategyData?.symbol || activeSymbol;
  const timeframe = strategyData?.timeframe || activeTimeframe;

  useEffect(() => {
    let cancelled = false;

    const loadChart = async () => {
      setIsLoading(true);

      // Fetch real kline data
      const klines = await getKlines(symbol, timeframe, 200, activeExchange, networkMode);
      if (cancelled || !klines.length || !containerRef.current) return;

      // Generate trade signals
      const signals = generateTradeSignals(klines);
      setTrades(signals);

      // Calculate stats
      const exits = signals.filter(s => s.type === 'exit');
      const tpHits = exits.filter(e => e.reason === 'tp').length;
      const slHits = exits.filter(e => e.reason === 'sl').length;
      const totalPnl = exits.reduce((sum, e) => sum + parseFloat(e.pnl), 0);
      setStats({
        totalTrades: exits.length,
        tpHits,
        slHits,
        winRate: exits.length > 0 ? ((tpHits / exits.length) * 100).toFixed(1) : '0',
        totalPnl: totalPnl.toFixed(2),
      });

      // Clear previous chart
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }

      // Create chart
      const chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: height,
        layout: {
          background: { color: '#0a0a0f' },
          textColor: '#888',
          fontSize: 11,
          fontFamily: "'Inter', sans-serif",
        },
        grid: {
          vertLines: { color: 'rgba(255,255,255,0.03)' },
          horzLines: { color: 'rgba(255,255,255,0.03)' },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: { color: 'rgba(202,255,0,0.3)', width: 1, style: LineStyle.Dashed },
          horzLine: { color: 'rgba(202,255,0,0.3)', width: 1, style: LineStyle.Dashed },
        },
        rightPriceScale: {
          borderColor: 'rgba(255,255,255,0.05)',
          scaleMargins: { top: 0.1, bottom: 0.15 },
        },
        timeScale: {
          borderColor: 'rgba(255,255,255,0.05)',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      chartRef.current = chart;

      // Candlestick series
      const candleSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderUpColor: '#26a69a',
        borderDownColor: '#ef5350',
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      const candleData = klines.map(k => ({
        time: k.time / 1000,
        open: k.open,
        high: k.high,
        low: k.low,
        close: k.close,
      }));
      candleSeries.setData(candleData);

      // Trade markers on candlestick series
      const markers = [];

      signals.forEach(signal => {
        if (signal.type === 'entry') {
          markers.push({
            time: signal.time,
            position: signal.side === 'long' ? 'belowBar' : 'aboveBar',
            color: signal.side === 'long' ? '#26a69a' : '#ef5350',
            shape: signal.side === 'long' ? 'arrowUp' : 'arrowDown',
            text: signal.side === 'long' ? 'BUY' : 'SELL',
            size: 1.5,
          });
        } else if (signal.type === 'exit') {
          const isProfit = parseFloat(signal.pnl) > 0;
          markers.push({
            time: signal.time,
            position: signal.side === 'long' ? 'aboveBar' : 'belowBar',
            color: isProfit ? '#26a69a' : '#ef5350',
            shape: 'circle',
            text: signal.reason === 'tp' ? 'TP' : signal.reason === 'sl' ? 'SL' : 'EXIT',
            size: 1,
          });
        }
      });

      // Sort markers by time (required by lightweight-charts)
      markers.sort((a, b) => a.time - b.time);
      candleSeries.setMarkers(markers);

      // Draw TP/SL lines for each trade pair
      signals.forEach((signal) => {
        if (signal.type === 'entry') {
          // Find matching exit
          const exit = signals.find(s =>
            s.type === 'exit' &&
            s.side === signal.side &&
            s.index > signal.index
          );

          const endTime = exit ? exit.time : candleData[candleData.length - 1].time;

          // TP line
          const tpLine = chart.addLineSeries({
            color: 'rgba(38, 166, 154, 0.5)',
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          });
          tpLine.setData([
            { time: signal.time, value: signal.tp },
            { time: endTime, value: signal.tp },
          ]);

          // SL line
          const slLine = chart.addLineSeries({
            color: 'rgba(239, 83, 80, 0.5)',
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          });
          slLine.setData([
            { time: signal.time, value: signal.sl },
            { time: endTime, value: signal.sl },
          ]);

          // Entry price line
          const entryLine = chart.addLineSeries({
            color: signal.side === 'long' ? 'rgba(38, 166, 154, 0.3)' : 'rgba(239, 83, 80, 0.3)',
            lineWidth: 1,
            lineStyle: LineStyle.Dotted,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          });
          entryLine.setData([
            { time: signal.time, value: signal.price },
            { time: endTime, value: signal.price },
          ]);
        }
      });

      // Fit content
      chart.timeScale().fitContent();

      // Resize handler
      const handleResize = () => {
        if (containerRef.current && chart) {
          chart.applyOptions({ width: containerRef.current.clientWidth });
        }
      };
      window.addEventListener('resize', handleResize);

      setIsLoading(false);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    };

    loadChart();

    return () => {
      cancelled = true;
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [symbol, timeframe, activeExchange, networkMode]);

  const timeframeLabel = {
    '1': '1m', '3': '3m', '5': '5m', '15': '15m', '30': '30m',
    '60': '1h', '120': '2h', '240': '4h', 'D': '1D', 'W': '1W',
  };

  return (
    <div className="glass-card border border-glass rounded-[2rem] p-8 overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
              <span className="material-symbols-outlined text-primary text-2xl">candlestick_chart</span>
            </div>
            <div>
              <h3 className="text-main text-lg font-black tracking-tight leading-none mb-1">Backtest Trade Chart</h3>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">{symbol}</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-glass text-secondary text-[10px] font-black uppercase tracking-widest">{timeframeLabel[timeframe] || timeframe}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-glass">
              <span className="text-[10px] text-secondary font-black uppercase tracking-widest">Trades</span>
              <span className="text-main text-xs font-black">{stats.totalTrades}</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">TP</span>
              <span className="text-emerald-400 text-xs font-black">{stats.tpHits}</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/5 border border-rose-500/20">
              <span className="text-[10px] text-rose-400 font-black uppercase tracking-widest">SL</span>
              <span className="text-rose-400 text-xs font-black">{stats.slHits}</span>
            </div>
            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border ${parseFloat(stats.totalPnl) >= 0 ? 'bg-primary/5 border-primary/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
              <span className={`text-[10px] font-black uppercase tracking-widest ${parseFloat(stats.totalPnl) >= 0 ? 'text-primary' : 'text-rose-400'}`}>P&L</span>
              <span className={`text-xs font-black ${parseFloat(stats.totalPnl) >= 0 ? 'text-primary' : 'text-rose-400'}`}>{parseFloat(stats.totalPnl) >= 0 ? '+' : ''}{stats.totalPnl}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-glass bg-[#050508]" style={{ height: `${height}px` }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#050508]/80 backdrop-blur-sm z-10 transition-all duration-500">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-primary/10"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin shadow-[0_0_15px_rgba(0,214,171,0.2)]"></div>
              </div>
              <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Synchronizing Data</p>
            </div>
          </div>
        )}
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Trade Legend */}
      <div className="flex items-center gap-8 mt-6 px-4 py-3 rounded-2xl bg-white/[0.02] border border-glass">
        <div className="flex items-center gap-3 group">
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]"></div>
          <span className="text-[10px] text-secondary font-black uppercase tracking-widest group-hover:text-emerald-400 transition-colors">Long Entry</span>
        </div>
        <div className="flex items-center gap-3 group">
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-rose-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]"></div>
          <span className="text-[10px] text-secondary font-black uppercase tracking-widest group-hover:text-rose-400 transition-colors">Short Entry</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-0 border-t-2 border-dashed border-emerald-400/50"></div>
          <span className="text-[10px] text-emerald-400/60 font-black uppercase tracking-widest">Take Profit</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-0 border-t-2 border-dashed border-rose-400/50"></div>
          <span className="text-[10px] text-rose-400/60 font-black uppercase tracking-widest">Stop Loss</span>
        </div>
        <div className="flex items-center gap-2.5 ml-auto">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,214,171,0.6)]"></span>
          <span className="text-[10px] text-secondary font-bold uppercase tracking-widest opacity-60">Real-time {activeExchange} Bridge</span>
        </div>
      </div>

      {/* Trade List Table */}
      {trades.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-glass bg-black/20">
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-20">
                <tr className="bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-glass">
                  {['Type', 'Side', 'Price', 'TP', 'SL', 'Exit', 'P&L', 'Reason'].map(h => (
                    <th key={h} className="px-5 py-4 text-[10px] text-secondary font-black uppercase tracking-[0.15em] opacity-60">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {trades.filter(t => t.type === 'entry').map((entry, i) => {
                  const exit = trades.find(t => t.type === 'exit' && t.side === entry.side && t.index > entry.index);
                  return (
                    <tr key={i} className="group hover:bg-white/[0.03] transition-all duration-300">
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${entry.side === 'long' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                          Entry
                        </span>
                      </td>
                      <td className={`px-5 py-4 text-[11px] font-black uppercase tracking-wider ${entry.side === 'long' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {entry.side === 'long' ? '↑ LONG' : '↓ SHORT'}
                      </td>
                      <td className="px-5 py-4 text-[11px] font-bold text-main">
                        <span className="opacity-30 text-[10px] mr-0.5">$</span>
                        {entry.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4 text-[11px] font-bold text-emerald-400/80">
                        <span className="opacity-30 text-[10px] mr-0.5">$</span>
                        {entry.tp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4 text-[11px] font-bold text-rose-400/80">
                        <span className="opacity-30 text-[10px] mr-1">$</span>
                        {entry.sl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4 text-[11px] font-bold text-secondary">
                        {exit ? (
                          <>
                            <span className="opacity-30 text-[10px] mr-0.5">$</span>
                            {exit.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </>
                        ) : '—'}
                      </td>
                      <td className={`px-5 py-4 text-[11px] font-black ${exit && parseFloat(exit.pnl) >= 0 ? 'text-emerald-400 text-glow' : 'text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)]'}`}>
                        {exit ? `${parseFloat(exit.pnl) >= 0 ? '+' : ''}${exit.pnl}%` : '—'}
                      </td>
                      <td className="px-5 py-4">
                        {exit && (
                          <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${
                            exit.reason === 'tp' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            exit.reason === 'sl' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                            'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          }`}>{exit.reason}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(BacktestTradeChart);
