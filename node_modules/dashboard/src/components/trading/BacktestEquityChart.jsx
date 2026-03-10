import React from 'react';

const BacktestEquityChart = () => {
  return (
    <div className="bg-background-light dark:bg-primary/5 rounded-xl border border-primary/10 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Backtest Equity Curve</h3>
        <div className="flex gap-2">
          <span className="flex items-center gap-1 text-xs font-semibold text-primary">
            <span className="size-2 rounded-full bg-primary"></span> Optimized
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
            <span className="size-2 rounded-full bg-slate-400"></span> Baseline
          </span>
        </div>
      </div>
      <div className="h-64 w-full relative">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 200">
          <defs>
            <linearGradient id="chartFillOpt" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#00d6ab" stopOpacity="0.2"></stop>
              <stop offset="100%" stopColor="#00d6ab" stopOpacity="0"></stop>
            </linearGradient>
          </defs>
          <path d="M0,180 L50,175 L100,160 L150,165 L200,140 L250,145 L300,110 L350,120 L400,90 L450,100 L500,70 L550,60 L600,45 L650,55 L700,30 L750,40 L800,10" fill="none" stroke="#00d6ab" strokeWidth="3"></path>
          <path d="M0,180 L50,175 L100,160 L150,165 L200,140 L250,145 L300,110 L350,120 L400,90 L450,100 L500,70 L550,60 L600,45 L650,55 L700,30 L750,40 L800,10 L800,200 L0,200 Z" fill="url(#chartFillOpt)"></path>
          <path d="M0,180 L100,178 L200,175 L300,165 L400,160 L500,158 L600,150 L700,145 L800,140" fill="none" stroke="#64748b" strokeDasharray="4" strokeWidth="2"></path>
        </svg>
        <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] text-primary/40 pt-2 border-t border-primary/10">
          <span>Jan 01</span>
          <span>Feb 01</span>
          <span>Mar 01</span>
          <span>Apr 01</span>
          <span>May 01</span>
          <span>Jun 01</span>
        </div>
      </div>
    </div>
  );
};

export default BacktestEquityChart;
