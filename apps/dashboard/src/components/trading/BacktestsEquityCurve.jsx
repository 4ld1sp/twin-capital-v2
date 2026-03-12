import React from 'react';

const BacktestsEquityCurve = () => {
  return (
    <div className="lg:col-span-3 flex flex-col gap-8 glass-card border border-glass rounded-3xl p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <p className="text-secondary text-[10px] font-black uppercase tracking-widest pl-1 mb-2">Portfolio Value</p>
          <div className="flex items-baseline gap-4 mt-1">
            <h3 className="text-main text-4xl font-black tracking-tight">$284,912.42</h3>
            <span className="text-primary font-black text-xl shadow-sm">+42.8%</span>
          </div>
        </div>
        <div className="flex items-center gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-glass">
          <button className="px-5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-primary text-black shadow-lg shadow-primary/20">1Y</button>
          <button className="px-5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-secondary hover:text-main">3Y</button>
          <button className="px-5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-secondary hover:text-main">5Y</button>
          <button className="px-5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-secondary hover:text-main">ALL</button>
        </div>
      </div>
      
      <div className="relative h-[300px] w-full mt-6">
        {/* Legend */}
        <div className="absolute top-0 right-0 flex gap-6 text-[10px] font-black uppercase tracking-widest z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(202,255,0,0.5)]"></span>
            <span className="text-main">Alpha v2.1</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full border border-glass bg-secondary/30"></span>
            <span className="text-secondary">SPY Benchmark</span>
          </div>
        </div>
        
        {/* SVG Chart Simulation */}
        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 350">
          {/* Grid Lines */}
          <line className="text-glass" stroke="currentColor" strokeWidth="1" x1="0" x2="1000" y1="50" y2="50"></line>
          <line className="text-glass" stroke="currentColor" strokeWidth="1" x1="0" x2="1000" y1="150" y2="150"></line>
          <line className="text-glass" stroke="currentColor" strokeWidth="1" x1="0" x2="1000" y1="250" y2="250"></line>
          
          {/* Baseline Line (Gray) */}
          <path d="M0 320 L100 280 L200 300 L300 250 L400 260 L500 200 L600 220 L700 180 L800 190 L900 160 L1000 140" fill="none" stroke="var(--text-secondary)" strokeOpacity="0.2" strokeWidth="3" strokeDasharray="8"></path>
          
          {/* Optimized Line (Primary) */}
          <defs>
            <linearGradient id="chartGradientBTCurve" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3"></stop>
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0"></stop>
            </linearGradient>
          </defs>
          <path d="M0 320 C 100 280, 150 200, 200 180 C 250 160, 300 210, 350 180 C 400 150, 450 80, 500 70 C 550 60, 600 120, 650 100 C 700 80, 750 40, 800 30 C 850 20, 950 40, 1000 20" fill="none" stroke="var(--primary)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"></path>
          <path d="M0 320 C 100 280, 150 200, 200 180 C 250 160, 300 210, 350 180 C 400 150, 450 80, 500 70 C 550 60, 600 120, 650 100 C 700 80, 750 40, 800 30 C 850 20, 950 40, 1000 20 V 350 H 0 Z" fill="url(#chartGradientBTCurve)"></path>
        </svg>
      </div>
      
      <div className="flex justify-between px-1 text-[10px] font-black text-secondary uppercase tracking-widest opacity-60">
        <span>Jan 2023</span>
        <span>Jul 2023</span>
        <span>Jan 2024</span>
      </div>
    </div>
  );
};

export default BacktestsEquityCurve;
