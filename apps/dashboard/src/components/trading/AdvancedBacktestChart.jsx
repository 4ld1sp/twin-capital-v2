import React, { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';

// --- Mock Data Generator ---
// Simulates OHLCV data + SMA/EMA for realistic backtest rendering
function generateData() {
  const candles = [];
  const volumes = [];
  let time = Math.floor(Date.now() / 1000) - 200 * 86400;
  let close = 65000;

  for (let i = 0; i < 200; i++) {
    const open = close + (Math.random() - 0.5) * 1000;
    const high = Math.max(open, close) + Math.random() * 500;
    const low = Math.min(open, close) - Math.random() * 500;
    close = open + (Math.random() - 0.5) * 1000;
    time += 86400; // Increment by 1 day

    candles.push({ time, open, high, low, close });

    const isBull = close >= open;
    volumes.push({
      time,
      value: Math.random() * 5000 + 1000,
      color: isBull ? 'rgba(38, 166, 154, 0.4)' : 'rgba(239, 83, 80, 0.4)',
    });
  }
  return { candles, volumes };
}

function calculateSMA(data, period) {
  const sma = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) continue;
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    sma.push({ time: data[i].time, value: sum / period });
  }
  return sma;
}

function calculateEMA(data, period) {
  const ema = [];
  const k = 2 / (period + 1);
  let prevEma = data[0].close;

  for (let i = 0; i < data.length; i++) {
    if (i === 0) continue;
    const currentEma = (data[i].close - prevEma) * k + prevEma;
    ema.push({ time: data[i].time, value: currentEma });
    prevEma = currentEma;
  }
  return ema;
}

const AdvancedBacktestChart = () => {
  const chartContainerRef = useRef(null);
  const tooltipRef = useRef(null);
  const [timeframe, setTimeframe] = useState('1D');
  const [chartData, setChartData] = useState({ candles: [], volumes: [] });

  // 1. Fetch/Generate Data
  useEffect(() => {
    // Re-generate mock data when timeframe changes to simulate loading different resolutions
    setChartData(generateData());
  }, [timeframe]);

  // 2. Initialize and configure Lightweight Charts
  useEffect(() => {
    if (!chartContainerRef.current || chartData.candles.length === 0) return;

    // --- Chart Core Initialization ---
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: '#131722' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
        timeVisible: true,
      },
      watermark: {
        color: 'rgba(255, 255, 255, 0.04)',
        visible: true,
        text: 'BTC/USDT - AlphaNode Backtest',
        fontSize: 48,
        horzAlign: 'center',
        vertAlign: 'center',
      },
    });

    // --- Candlestick Series ---
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    candleSeries.setData(chartData.candles);

    // --- Volume Sub-pane (Histogram Overlay) ---
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: '', // setting as a separate scale overlay
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8, // 80% space for candlesticks, 20% for volume
        bottom: 0,
      },
    });
    volumeSeries.setData(chartData.volumes);

    // --- Moving Averages (EMA 20 & SMA 50) ---
    const emaSeries = chart.addLineSeries({
      color: 'rgba(255, 152, 0, 0.7)',
      lineWidth: 2,
      crosshairMarkerVisible: false,
    });
    emaSeries.setData(calculateEMA(chartData.candles, 20));

    const smaSeries = chart.addLineSeries({
      color: 'rgba(41, 98, 255, 0.7)',
      lineWidth: 2,
      crosshairMarkerVisible: false,
    });
    smaSeries.setData(calculateSMA(chartData.candles, 50));

    // --- Trade Execution Markers ---
    if (chartData.candles.length > 50) {
      const markers = [
        {
          time: chartData.candles[chartData.candles.length - 15].time,
          position: 'belowBar',
          color: '#26a69a',
          shape: 'arrowUp',
          text: 'Entry (Long)',
        },
        {
          time: chartData.candles[chartData.candles.length - 10].time,
          position: 'aboveBar',
          color: '#ef5350',
          shape: 'arrowDown',
          text: 'Exit',
        },
        {
          time: chartData.candles[chartData.candles.length - 5].time,
          position: 'belowBar',
          color: '#26a69a',
          shape: 'arrowUp',
          text: 'Open Long',
        },
      ];
      candleSeries.setMarkers(markers);

      // --- Price Lines (SL/TP) on latest trade ---
      const activeTradePrice = chartData.candles[chartData.candles.length - 5].close;
      candleSeries.createPriceLine({
        price: activeTradePrice * 1.05,
        color: '#26a69a',
        lineWidth: 2,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: 'Take Profit',
      });
      candleSeries.createPriceLine({
        price: activeTradePrice * 0.95,
        color: '#ef5350',
        lineWidth: 2,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: 'Stop Loss',
      });
    }

    // --- Floating Custom Tooltip (Legend) ---
    chart.subscribeCrosshairMove((param) => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;

      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef.current.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainerRef.current.clientHeight
      ) {
        // Hide tooltip outside chart area
        tooltip.style.display = 'none';
      } else {
        tooltip.style.display = 'block';
        const dateStr = new Date(param.time * 1000).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric'
        });
        const candleData = param.seriesData.get(candleSeries);
        const volumeData = param.seriesData.get(volumeSeries);

        if (candleData) {
          const color = candleData.close >= candleData.open ? '#26a69a' : '#ef5350';
          tooltip.innerHTML = `
            <div style="font-size: 14px; font-weight: 800; color: #fff; margin-bottom: 6px;">AlphaNode AI: BTC/USDT <span style="font-weight: 500;">(${timeframe})</span></div>
            <div style="display: flex; gap: 12px; font-size: 13px; font-family: monospace;">
              <div><span style="color: #787b86;">O</span> <span style="color: ${color}">${candleData.open.toFixed(2)}</span></div>
              <div><span style="color: #787b86;">H</span> <span style="color: ${color}">${candleData.high.toFixed(2)}</span></div>
              <div><span style="color: #787b86;">L</span> <span style="color: ${color}">${candleData.low.toFixed(2)}</span></div>
              <div><span style="color: #787b86;">C</span> <span style="color: ${color}">${candleData.close.toFixed(2)}</span></div>
            </div>
            ${volumeData ? `<div style="font-size: 12px; margin-top: 6px; color: #787b86;">Vol <span style="color: #d1d4dc">${volumeData.value.toFixed(2)}</span></div>` : ''}
            <div style="font-size: 11px; margin-top: 4px; color: #787b86;">${dateStr}</div>
          `;
        }
      }
    });

    // --- Responsive Resize Handling ---
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    // --- Cleanup -> Crucial for React Strict Mode/HMR ---
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [chartData]); // Re-initialize chart when data changes

  // --- UI Structure ---
  return (
    <div className="flex flex-col w-full h-[800px] bg-[#131722] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl font-sans">
      
      {/* Top Bar (Timeframes & Controls) */}
      <div className="flex justify-between items-center px-6 py-4 bg-[#1e222d] border-b border-gray-800">
        <div className="flex items-center gap-1">
          {['1m', '15m', '1H', '1D'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
                timeframe === tf
                  ? 'bg-blue-600/20 text-blue-500'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-400 bg-white/5 rounded-xl hover:bg-white/10 hover:text-white transition-all uppercase tracking-wider">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Indicators
          </button>
          <button className="flex items-center gap-2 px-6 py-2 text-xs font-black text-black bg-[#26a69a] rounded-xl shadow-lg shadow-[#26a69a]/20 hover:brightness-110 transition-all uppercase tracking-wider">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Run Backtest
          </button>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="relative flex-grow min-h-0 bg-[#131722]" ref={chartContainerRef}>
        
        {/* Floating Custom Legend / Tooltip */}
        <div
          ref={tooltipRef}
          className="absolute top-4 left-4 z-10 pointer-events-none p-3 bg-[#1e222d]/80 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl hidden transition-opacity"
        />
      </div>

      {/* Bottom Panel (Backtest Results) */}
      <div className="h-[280px] bg-[#1e222d] border-t border-gray-800 p-6 flex flex-col gap-6">
        
        {/* Metric Cards Row */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#131722] p-4 rounded-2xl border border-gray-800/50 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Return</p>
              <p className="text-xl font-black text-[#26a69a]">+314.5%</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#26a69a]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#26a69a]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
          </div>
          <div className="bg-[#131722] p-4 rounded-2xl border border-gray-800/50 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Win Rate</p>
              <p className="text-xl font-black text-white">68.2%</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="bg-[#131722] p-4 rounded-2xl border border-gray-800/50 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Max Drawdown</p>
              <p className="text-xl font-black text-[#ef5350]">-18.4%</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#ef5350]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#ef5350]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
          </div>
          <div className="bg-[#131722] p-4 rounded-2xl border border-gray-800/50 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Trades</p>
              <p className="text-xl font-black text-white">1,048</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            </div>
          </div>
        </div>

        {/* Trade History Table */}
        <div className="bg-[#131722] rounded-2xl border border-gray-800/50 overflow-hidden flex-grow overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1e222d] sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">Time</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">Symbol</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">Side</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">Price</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 text-right">PnL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-3 text-gray-300">2026-03-24 14:30</td>
                <td className="px-6 py-3 font-semibold text-white">BTC/USDT</td>
                <td className="px-6 py-3 text-[#26a69a] font-bold">LONG</td>
                <td className="px-6 py-3 text-gray-300">64,210.50</td>
                <td className="px-6 py-3 text-right text-[#26a69a] font-black">+$1,450.00</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-3 text-gray-300">2026-03-22 09:15</td>
                <td className="px-6 py-3 font-semibold text-white">BTC/USDT</td>
                <td className="px-6 py-3 text-[#ef5350] font-bold">SHORT</td>
                <td className="px-6 py-3 text-gray-300">65,100.00</td>
                <td className="px-6 py-3 text-right text-[#ef5350] font-black">-$210.00</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-3 text-gray-300">2026-03-20 18:00</td>
                <td className="px-6 py-3 font-semibold text-white">BTC/USDT</td>
                <td className="px-6 py-3 text-[#26a69a] font-bold">LONG</td>
                <td className="px-6 py-3 text-gray-300">62,800.25</td>
                <td className="px-6 py-3 text-right text-[#26a69a] font-black">+$2,100.50</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdvancedBacktestChart;
