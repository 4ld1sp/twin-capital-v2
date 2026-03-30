import React from 'react';

const BacktestsPerformanceMetrics = () => {
  return (
    <div className="glass-card rounded-3xl border border-glass overflow-hidden shadow-sm">
      <div className="px-8 py-6 border-b border-glass flex justify-between items-center">
        <h4 className="text-sm font-black text-main uppercase tracking-widest pl-1">Performance Matrix</h4>
        <button className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 hover:brightness-110 transition-all">
          <span className="material-symbols-outlined text-[18px] mr-2">download</span> Export PDF
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-black/5 dark:bg-white/5 border-b border-glass">
              <th className="px-8 py-4 text-[10px] font-black text-secondary uppercase tracking-widest">Dimension</th>
              <th className="px-8 py-4 text-[10px] font-black text-secondary uppercase tracking-widest">Alpha v2.1</th>
              <th className="px-8 py-4 text-[10px] font-black text-secondary uppercase tracking-widest">Baseline</th>
              <th className="px-8 py-4 text-[10px] font-black text-secondary uppercase tracking-widest">Delta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass">
            <tr className="hover:bg-primary/[0.03] transition-colors border-b border-glass last:border-0">
              <td className="px-8 py-5 font-bold text-xs text-secondary uppercase tracking-wider">Total Return</td>
              <td className="px-8 py-5 text-sm font-black text-primary">+42.84%</td>
              <td className="px-8 py-5 text-sm font-black text-secondary opacity-40">+14.20%</td>
              <td className="px-8 py-5"><span className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest border border-primary/20">+201.7%</span></td>
            </tr>
            <tr className="hover:bg-primary/[0.03] transition-colors border-b border-glass last:border-0">
              <td className="px-8 py-5 font-bold text-xs text-secondary uppercase tracking-wider">Sharpe Ratio</td>
              <td className="px-8 py-5 text-sm font-black text-primary">2.41</td>
              <td className="px-8 py-5 text-sm font-black text-secondary opacity-40">1.05</td>
              <td className="px-8 py-5 font-black text-main text-sm">+1.36</td>
            </tr>
            <tr className="hover:bg-primary/[0.03] transition-colors border-b border-glass last:border-0">
              <td className="px-8 py-5 font-bold text-xs text-secondary uppercase tracking-wider">Max Drawdown</td>
              <td className="px-8 py-5 text-sm font-black text-primary">8.42%</td>
              <td className="px-8 py-5 text-sm font-black text-secondary opacity-40">18.50%</td>
              <td className="px-8 py-5"><span className="bg-rose-500/5 text-rose-500 px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest border border-rose-500/10">-54.5%</span></td>
            </tr>
            <tr className="hover:bg-primary/[0.03] transition-colors border-b border-glass last:border-0">
              <td className="px-8 py-5 font-bold text-xs text-secondary uppercase tracking-wider">Win Rate</td>
              <td className="px-8 py-5 text-sm font-black text-primary">68.2%</td>
              <td className="px-8 py-5 text-sm font-black text-secondary opacity-40">51.0%</td>
              <td className="px-8 py-5 font-black text-main text-sm">+17.2%</td>
            </tr>
            <tr className="hover:bg-primary/[0.03] transition-colors border-b border-glass last:border-0">
              <td className="px-8 py-5 font-bold text-xs text-secondary uppercase tracking-wider">Expectancy</td>
              <td className="px-8 py-5 text-sm font-black text-primary">$182.40</td>
              <td className="px-8 py-5 text-sm font-black text-secondary opacity-40">$24.12</td>
              <td className="px-8 py-5 font-black text-main text-sm">+$158.28</td>
            </tr>
            <tr className="hover:bg-primary/[0.03] transition-colors border-b border-glass last:border-0">
              <td className="px-8 py-5 font-bold text-xs text-secondary uppercase tracking-wider">Recovery Factor</td>
              <td className="px-8 py-5 text-sm font-black text-primary">5.08</td>
              <td className="px-8 py-5 text-sm font-black text-secondary opacity-40">0.76</td>
              <td className="px-8 py-5 font-black text-main text-sm">+4.32</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BacktestsPerformanceMetrics;
