import React from 'react';

const BacktestsEquityCurve = () => {
  return (
    <div className="lg:col-span-3 flex flex-col gap-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-6 backdrop-blur-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Equity Curve</p>
          <div className="flex items-baseline gap-3 mt-1">
            <h3 className="text-slate-900 dark:text-slate-100 text-4xl font-black">$284,912.42</h3>
            <span className="text-primary font-bold text-lg">+42.8%</span>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button className="px-3 py-1 rounded-md text-xs font-bold bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100">1Y</button>
          <button className="px-3 py-1 rounded-md text-xs font-bold text-slate-500 dark:text-slate-400">3Y</button>
          <button className="px-3 py-1 rounded-md text-xs font-bold text-slate-500 dark:text-slate-400">5Y</button>
          <button className="px-3 py-1 rounded-md text-xs font-bold text-slate-500 dark:text-slate-400">ALL</button>
        </div>
      </div>
      
      <div className="relative h-[350px] w-full mt-4">
        {/* Legend */}
        <div className="absolute top-0 right-0 flex gap-4 text-xs font-bold z-10">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary"></span>
            <span className="text-slate-900 dark:text-slate-100">Optimized V2.1</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-400"></span>
            <span className="text-slate-500">Baseline (Buy &amp; Hold)</span>
          </div>
        </div>
        
        {/* SVG Chart Simulation */}
        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 350">
          {/* Grid Lines */}
          <line className="text-slate-200 dark:text-slate-800" stroke="currentColor" strokeDasharray="4" x1="0" x2="1000" y1="50" y2="50"></line>
          <line className="text-slate-200 dark:text-slate-800" stroke="currentColor" strokeDasharray="4" x1="0" x2="1000" y1="150" y2="150"></line>
          <line className="text-slate-200 dark:text-slate-800" stroke="currentColor" strokeDasharray="4" x1="0" x2="1000" y1="250" y2="250"></line>
          
          {/* Baseline Line (Gray) */}
          <path d="M0 320 L100 280 L200 300 L300 250 L400 260 L500 200 L600 220 L700 180 L800 190 L900 160 L1000 140" fill="none" stroke="#64748b" strokeOpacity="0.5" strokeWidth="2"></path>
          
          {/* Optimized Line (Primary) */}
          <defs>
            <linearGradient id="chartGradientBT" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#00d6ab" stopOpacity="0.2"></stop>
              <stop offset="100%" stopColor="#00d6ab" stopOpacity="0"></stop>
            </linearGradient>
          </defs>
          <path d="M0 320 C 100 280, 150 200, 200 180 C 250 160, 300 210, 350 180 C 400 150, 450 80, 500 70 C 550 60, 600 120, 650 100 C 700 80, 750 40, 800 30 C 850 20, 950 40, 1000 20" fill="none" stroke="#00d6ab" strokeLinecap="round" strokeWidth="4"></path>
          <path d="M0 320 C 100 280, 150 200, 200 180 C 250 160, 300 210, 350 180 C 400 150, 450 80, 500 70 C 550 60, 600 120, 650 100 C 700 80, 750 40, 800 30 C 850 20, 950 40, 1000 20 V 350 H 0 Z" fill="url(#chartGradientBT)"></path>
        </svg>
      </div>
      
      <div className="flex justify-between px-2 text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
        <span>Jan 2023</span>
        <span>Mar</span>
        <span>May</span>
        <span>Jul</span>
        <span>Sep</span>
        <span>Nov</span>
        <span>Jan 2024</span>
      </div>
    </div>
  );
};

export default BacktestsEquityCurve;
