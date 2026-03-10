import React from 'react';

const BacktestsPerformanceMetrics = () => {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 overflow-hidden backdrop-blur-sm">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h4 className="text-lg font-bold">Performance Metrics</h4>
        <button className="text-primary text-sm font-bold flex items-center">
          <span className="material-symbols-outlined text-lg mr-1">download</span> Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Metric</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Optimized Strategy</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Baseline</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Difference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <tr>
              <td className="px-6 py-4 font-medium text-sm">Total Return</td>
              <td className="px-6 py-4 text-sm font-bold text-primary">+42.84%</td>
              <td className="px-6 py-4 text-sm font-bold text-slate-400">+14.20%</td>
              <td className="px-6 py-4 text-sm"><span className="bg-primary/20 text-primary px-2 py-1 rounded font-bold text-xs">+201.7%</span></td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium text-sm">Sharpe Ratio</td>
              <td className="px-6 py-4 text-sm font-bold text-primary">2.41</td>
              <td className="px-6 py-4 text-sm font-bold text-slate-400">1.05</td>
              <td className="px-6 py-4 text-sm font-bold text-slate-100">+1.36</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium text-sm">Max Drawdown</td>
              <td className="px-6 py-4 text-sm font-bold text-primary">8.42%</td>
              <td className="px-6 py-4 text-sm font-bold text-slate-400">18.50%</td>
              <td className="px-6 py-4 text-sm"><span className="bg-primary/20 text-primary px-2 py-1 rounded font-bold text-xs">-54.5%</span></td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium text-sm">Win Rate</td>
              <td className="px-6 py-4 text-sm font-bold text-primary">68.2%</td>
              <td className="px-6 py-4 text-sm font-bold text-slate-400">51.0%</td>
              <td className="px-6 py-4 text-sm font-bold text-slate-100">+17.2%</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium text-sm">Expectancy</td>
              <td className="px-6 py-4 text-sm font-bold text-primary">$182.40</td>
              <td className="px-6 py-4 text-sm font-bold text-slate-400">$24.12</td>
              <td className="px-6 py-4 text-sm font-bold text-slate-100">+$158.28</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium text-sm">Recovery Factor</td>
              <td className="px-6 py-4 text-sm font-bold text-primary">5.08</td>
              <td className="px-6 py-4 text-sm font-bold text-slate-400">0.76</td>
              <td className="px-6 py-4 text-sm font-bold text-slate-100">+4.32</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BacktestsPerformanceMetrics;
