import React from 'react';

const AffiliateFunnel = () => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-bold mb-6">Affiliate Funnel</h3>
      <div className="flex flex-col items-center gap-2">
        <div className="w-full bg-primary h-12 rounded-lg flex items-center justify-center text-background-dark font-bold text-sm relative overflow-hidden">
          <span className="z-10">Impressions: 480k</span>
          <div className="absolute inset-0 bg-white/10 skew-x-12 transform translate-x-1/2"></div>
        </div>
        <div className="material-symbols-outlined text-slate-400">arrow_drop_down</div>
        
        <div className="w-[85%] bg-primary/80 h-12 rounded-lg flex items-center justify-center text-background-dark font-bold text-sm relative overflow-hidden">
          <span className="z-10">Clicks: 32k</span>
          <div className="absolute inset-0 bg-white/10 skew-x-12 transform translate-x-1/2"></div>
        </div>
        <div className="material-symbols-outlined text-slate-400">arrow_drop_down</div>
        
        <div className="w-[60%] bg-primary/60 h-12 rounded-lg flex items-center justify-center text-background-dark font-bold text-sm relative overflow-hidden">
          <span className="z-10">Conversions: 2.1k</span>
          <div className="absolute inset-0 bg-white/10 skew-x-12 transform translate-x-1/2"></div>
        </div>
        <div className="material-symbols-outlined text-slate-400">arrow_drop_down</div>
        
        <div className="w-[40%] bg-primary/40 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm">
          Net: $42.9k
        </div>
      </div>
    </div>
  );
};

export default AffiliateFunnel;
