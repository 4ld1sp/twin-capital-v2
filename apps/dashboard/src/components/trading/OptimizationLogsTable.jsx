import React from 'react';

const OptimizationLogsTable = () => {
  return (
    <div className="glass-card rounded-2xl border border-glass overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-glass flex justify-between items-center">
        <h3 className="font-black text-[10px] uppercase tracking-widest text-secondary">Optimization Logs</h3>
        <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:brightness-110 px-3 py-1 bg-primary/10 rounded-lg transition-all">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/5 dark:bg-white/5 text-secondary uppercase text-[10px] font-black tracking-widest border-b border-glass">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Iteration</th>
              <th className="px-6 py-4">Parameter Set</th>
              <th className="px-6 py-4">Score</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass">
            <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 text-secondary font-bold text-xs uppercase tracking-wider">14:22:05</td>
              <td className="px-6 py-4 font-mono text-xs text-main font-black">#0842</td>
              <td className="px-6 py-4 font-mono text-[11px] text-secondary font-bold">MA_Fast:12, MA_Slow:26</td>
              <td className="px-6 py-4 font-black text-main">0.892</td>
              <td className="px-6 py-4 text-right">
                <span className="px-3 py-1 rounded-lg bg-primary/20 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/30 shadow-sm">BEST</span>
              </td>
            </tr>
            <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 text-secondary font-bold text-xs uppercase tracking-wider">14:21:48</td>
              <td className="px-6 py-4 font-mono text-xs text-main font-black">#0841</td>
              <td className="px-6 py-4 font-mono text-[11px] text-secondary font-bold">MA_Fast:10, MA_Slow:21</td>
              <td className="px-6 py-4 font-black text-main">0.745</td>
              <td className="px-6 py-4 text-right">
                <span className="px-3 py-1 rounded-lg bg-black/10 dark:bg-white/10 text-secondary text-[9px] font-black uppercase tracking-widest border border-glass shadow-sm">PASS</span>
              </td>
            </tr>
            <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 text-secondary font-bold text-xs uppercase tracking-wider">14:21:30</td>
              <td className="px-6 py-4 font-mono text-xs text-main font-black">#0840</td>
              <td className="px-6 py-4 font-mono text-[11px] text-secondary font-bold">MA_Fast:08, MA_Slow:20</td>
              <td className="px-6 py-4 font-black text-rose-500">0.412</td>
              <td className="px-6 py-4 text-right">
                <span className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-widest border border-rose-500/30 shadow-sm">REJ</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OptimizationLogsTable;
