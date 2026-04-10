import React, { useMemo } from 'react';

const DrawdownTracker = ({ currentDrawdown = 0, maxDrawdown = 0, pnlTimeseries = [] }) => {
  // Build SVG path from cumulative P&L timeseries
  const svgPath = useMemo(() => {
    if (pnlTimeseries.length < 2) {
      return { fill: 'M0,0 L100,0 L100,0 Z', line: '0,0 100,0' };
    }

    const values = pnlTimeseries.map(d => d.cumulative || 0);
    const max = Math.max(...values.map(Math.abs), 1);

    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      // Map -max..+max to 0..100 (inverted for SVG where 0 is top)
      const y = 100 - ((v + max) / (max * 2)) * 100;
      return `${x},${y}`;
    });

    const lineStr = points.join(' ');
    const fillStr = `M0,${points[0].split(',')[1]} ${lineStr} L100,100 L0,100 Z`;

    return { fill: fillStr, line: lineStr };
  }, [pnlTimeseries]);

  const hasData = pnlTimeseries.length > 0;

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-2xl p-6 shadow-sm flex flex-col h-full transition-all duration-300">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Drawdown Tracker</h3>
          {hasData && (
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest">Live</span>
          )}
        </div>
        <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest opacity-70">Risk exposure from closed trades</p>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-6">
        <div className="relative h-44 w-full bg-rose-500/5 rounded-2xl border border-rose-500/20 overflow-hidden shadow-inner">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={svgPath.fill} fill="url(#drawdownGradient)" stroke="none"></path>
            <polyline fill="none" points={svgPath.line} stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"></polyline>
          </svg>
          <div className="absolute inset-x-0 bottom-4 text-center">
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              {maxDrawdown > 0 ? 'Active Drawdown Zone' : 'No Drawdown Detected'}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-[var(--border)] transition-all hover: ">
            <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1">Current</p>
            <p className="text-2xl font-black text-rose-500">-{currentDrawdown.toFixed(1)}%</p>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border)] transition-all hover: ">
            <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1">Worst Case</p>
            <p className="text-2xl font-black text-[var(--text-primary)]">-{maxDrawdown.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawdownTracker;
