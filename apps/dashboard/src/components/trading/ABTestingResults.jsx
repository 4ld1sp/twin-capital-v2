import React from 'react';

const ABTestingResults = () => {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-3xl border border-[var(--border)] p-8 shadow-sm">
      <h3 className="text-sm font-black mb-8 flex items-center gap-3 text-[var(--text-primary)] uppercase tracking-widest">
        <span className="material-symbols-outlined text-primary text-2xl">compare_arrows</span>
        Alpha A/B Analysis
      </h3>
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">Variant A (Control)</p>
              <p className="text-[10px] text-secondary/60 font-bold uppercase tracking-widest mt-0.5">Mean Reversion Strategy</p>
            </div>
            <p className="text-xs font-black text-[var(--text-secondary)] tracking-widest">WR: 52%</p>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden border border-[var(--border)]">
            <div className="bg-secondary/40 h-full w-[52%] rounded-full shadow-inner"></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-xs font-black text-primary uppercase tracking-widest">Variant B (Challenger)</p>
              <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mt-0.5">Optimized Alpha-v3</p>
            </div>
            <p className="text-xs font-black text-primary tracking-widest">WR: 68%</p>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden border border-[var(--border)]">
            <div className="bg-primary h-full w-[68%] rounded-full shadow-[0_0_8px_rgba(202,255,0,0.4)]"></div>
          </div>
        </div>
        <div className="pt-6 border-t border-[var(--border)]">
          <div className="p-5 bg-primary/5 rounded-2xl border border-primary/20 shadow-sm">
            <p className="text-[10px] font-black text-primary flex items-center gap-2 uppercase tracking-widest">
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
              Significance: 99.4%
            </p>
            <p className="text-[10px] mt-2 text-[var(--text-primary)] font-bold uppercase tracking-wider leading-relaxed">Variant B shows clear dominance. Recommendation: Phase in 20% of capital.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ABTestingResults;
