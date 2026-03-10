import React, { useState, useMemo } from 'react';

const PerformanceAnalytics = () => {
  const [timeframe, setTimeframe] = useState('1M');
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'line'
  const [hoverIndex, setHoverIndex] = useState(null);

  // Generate dynamic dummy data based on timeframe
  const data = useMemo(() => {
    let points = 7;
    let labelPrefix = '';

    switch (timeframe) {
      case '1W': points = 7; labelPrefix = 'Day'; break;
      case '1M': points = 10; labelPrefix = 'Oct'; break;
      case '3M': points = 12; labelPrefix = 'Wk'; break;
      case '1Y': points = 12; labelPrefix = 'Mo'; break;
      default: points = 10;
    }

    const arr = [];
    let currentPnl = 0;

    for (let i = 0; i < points; i++) {
      // Simulate some volatility, upward trend
      const change = (Math.random() * 400) - 100;
      currentPnl += change;

      // Determine label
      let label = '';
      if (timeframe === '1W') label = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i];
      else if (timeframe === '1M') label = `Oct ${i * 3 + 1}`;
      else if (timeframe === '3M') label = `Wk ${i + 1}`;
      else if (timeframe === '1Y') label = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i];

      arr.push({
        label,
        pnl: Math.round(currentPnl),
        isLoss: currentPnl < 0
      });
    }

    return arr;
  }, [timeframe]);

  const maxPnl = Math.max(...data.map(d => Math.abs(d.pnl)), 100);

  // SVG Line Chart Generation
  const renderLineChart = () => {
    const width = 1000;
    const height = 240; // leaving room for labels

    // Create points
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      // Map PnL to Y coordinate (invert because SVG Y goes down)
      // Normalize between 10% and 90% of height to prevent clipping
      const normalizedPnl = (d.pnl + maxPnl) / (maxPnl * 2);
      const y = height - (normalizedPnl * height * 0.8 + height * 0.1);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="absolute inset-0 pt-4 pb-8 pl-4 pr-4 z-10 w-full h-full flex items-end">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-3d overflow-visible" preserveAspectRatio="none">
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d6ab" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00d6ab" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Fill Area */}
          <polygon
            points={`0,${height} ${points} ${width},${height}`}
            fill="url(#lineGradient)"
            className="transition-all duration-500 ease-in-out"
          />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#00d6ab"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-500 ease-in-out filter drop-shadow-[0_4px_6px_rgba(0,214,171,0.3)]"
          />

          {/* Interactive Data Points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * width;
            const normalizedPnl = (d.pnl + maxPnl) / (maxPnl * 2);
            const y = height - (normalizedPnl * height * 0.8 + height * 0.1);

            return (
              <g
                key={i}
                className="cursor-pointer group outline-none"
                tabIndex="0"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                {hoverIndex === i && (
                  <line x1={x} y1={0} x2={x} y2={height} stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-slate-300 dark:text-primary/20" />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={hoverIndex === i ? 6 : 4}
                  fill={d.isLoss ? "#ef4444" : "#00d6ab"}
                  stroke="#0f231f"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />

                {/* Tooltip implementation via SVG foreignObject for perfect alignment */}
                {hoverIndex === i && (
                  <foreignObject x={x - 60} y={Math.max(0, y - 50)} width="120" height="40" className="overflow-visible z-50">
                    <div className="bg-background-dark border border-primary/20 shadow-xl rounded-lg px-3 py-1.5 flex flex-col items-center justify-center animate-fade-in pointer-events-none">
                      <span className={`font-bold text-xs ${d.isLoss ? 'text-rose-400' : 'text-primary'}`}>
                        {d.pnl > 0 ? '+' : ''}${Math.abs(d.pnl).toLocaleString()}
                      </span>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-primary/10 rounded-xl p-6 shadow-sm h-full flex flex-col relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-lg font-bold">Performance Analytics</h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-slate-500">PnL over</p>
            <div className="flex bg-slate-100 dark:bg-primary/5 rounded-md p-0.5 border border-slate-200 dark:border-primary/10">
              {['1W', '1M', '3M', '1Y'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-sm transition-colors ${timeframe === tf ? 'bg-white dark:bg-primary text-background-dark shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-primary/70'}`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex bg-slate-100 dark:bg-primary/5 p-1 rounded-lg border border-slate-200 dark:border-primary/10">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1 transition-all ${chartType === 'line' ? 'bg-white dark:bg-primary text-background-dark shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-primary/70'}`}
          >
            <span className="material-symbols-outlined text-[14px]">show_chart</span>
            Line
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1 transition-all ${chartType === 'bar' ? 'bg-white dark:bg-primary text-background-dark shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-primary/70'}`}
          >
            <span className="material-symbols-outlined text-[14px]">bar_chart</span>
            Bar
          </button>
        </div>
      </div>

      <div className="h-[300px] w-full relative flex items-end justify-between gap-1 group pb-6 flex-1">

        {/* Render appropriate chart type */}
        {chartType === 'line' && renderLineChart()}

        {/* Render bar chart base elements (always render X-axis labels regardless of type) */}
        {data.map((d, i) => {
          // Map to 10% to 90% height to match line chart vertical scaling loosely
          const heightPercent = Math.max(10, (Math.abs(d.pnl) / maxPnl) * 80);

          return (
            <div key={i} className="flex flex-col flex-1 gap-2 items-center group/bar relative h-full justify-end z-20">

              {chartType === 'bar' && (
                <div
                  className={`w-full rounded-t-sm transition-all duration-500 ease-out cursor-pointer ${d.isLoss
                      ? 'bg-rose-500/30 group-hover/bar:bg-rose-500 hover:!bg-rose-400'
                      : 'bg-primary/30 group-hover/bar:bg-primary hover:!bg-primary/80'
                    }`}
                  style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  {/* Tooltip for Bar Chart */}
                  <div className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-background-dark border border-primary/20 shadow-xl text-white text-[10px] py-1.5 px-2 rounded-lg opacity-0 transition-opacity pointer-events-none whitespace-nowrap z-50 flex flex-col items-center ${hoverIndex === i ? 'opacity-100' : ''}`}>
                    <span className={`font-bold text-xs ${d.isLoss ? 'text-rose-400' : 'text-primary'}`}>
                      {d.pnl > 0 ? '+' : ''}${Math.abs(d.pnl).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* X-Axis Labels (Shared) */}
              <span className={`absolute bottom-0 text-[10px] font-bold uppercase transition-colors ${hoverIndex === i ? (d.isLoss ? 'text-rose-400' : 'text-primary') : 'text-slate-500'}`}>
                {d.label}
              </span>
            </div>
          );
        })}

        {/* Baseline (0 value marker) */}
        <div className="absolute bottom-6 left-0 right-0 h-px bg-slate-200 dark:bg-primary/20 z-0 border-b border-dashed border-primary/10"></div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
