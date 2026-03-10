import React from 'react';

const ABTestingResults = () => {
  return (
    <div className="bg-background-light dark:bg-primary/5 rounded-xl border border-primary/10 p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">compare_arrows</span>
        A/B Testing Results
      </h3>
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm font-bold">Variant A (Control)</p>
              <p className="text-[10px] text-primary/60">Mean Reversion Strategy</p>
            </div>
            <p className="text-sm font-bold">Win Rate: 52%</p>
          </div>
          <div className="w-full bg-slate-200 dark:bg-primary/10 h-3 rounded-full overflow-hidden">
            <div className="bg-slate-400 h-full w-[52%]"></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm font-bold text-primary">Variant B (Challenger)</p>
              <p className="text-[10px] text-primary/60">Optimized Alpha-v3</p>
            </div>
            <p className="text-sm font-bold text-primary">Win Rate: 68%</p>
          </div>
          <div className="w-full bg-slate-200 dark:bg-primary/10 h-3 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[68%]"></div>
          </div>
        </div>
        <div className="pt-4 border-t border-primary/10">
          <div className="p-3 bg-primary/10 rounded-lg">
            <p className="text-xs font-semibold text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              Statistical Significance: 99.4%
            </p>
            <p className="text-[11px] mt-1 text-primary/70">Variant B shows clear dominance in current market regime. Recommendation: Gradual rollout.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ABTestingResults;
