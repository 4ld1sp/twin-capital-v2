import React from 'react';

const BacktestEquityChart = () => {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-sm flex flex-col transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-black text-main uppercase tracking-widest">Backtest Equity Curve</h3>
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_5px_rgba(202,255,0,0.5)]"></span> Optimized
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-black text-secondary uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-secondary opacity-40"></span> Baseline
          </span>
        </div>
      </div>
      <div className="h-64 w-full relative">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 200">
          <defs>
            <linearGradient id="chartFillOptTrading" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25"></stop>
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0"></stop>
            </linearGradient>
          </defs>
          <path d="M0,180 L50,175 L100,160 L150,165 L200,140 L250,145 L300,110 L350,120 L400,90 L450,100 L500,70 L550,60 L600,45 L650,55 L700,30 L750,40 L800,10" fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M0,180 L50,175 L100,160 L150,165 L200,140 L250,145 L300,110 L350,120 L400,90 L450,100 L500,70 L550,60 L600,45 L650,55 L700,30 L750,40 L800,10 L800,200 L0,200 Z" fill="url(#chartFillOptTrading)"></path>
          <path d="M0,180 L100,178 L200,175 L300,165 L400,160 L500,158 L600,150 L700,145 L800,140" fill="none" stroke="var(--text-secondary)" strokeDasharray="6" strokeWidth="2" strokeOpacity="0.3"></path>
        </svg>
        <div className="absolute bottom-0 left-0 w-full flex justify-between text-[9px] text-secondary font-black uppercase tracking-widest pt-3 border-t border-glass">
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
