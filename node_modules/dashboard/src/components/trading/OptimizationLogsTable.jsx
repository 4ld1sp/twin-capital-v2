import React from 'react';

const OptimizationLogsTable = () => {
  return (
    <div className="bg-background-light dark:bg-primary/5 rounded-xl border border-primary/10 overflow-hidden">
      <div className="p-4 border-b border-primary/10 flex justify-between items-center">
        <h3 className="font-bold text-sm uppercase tracking-wider text-primary/80">Optimization Logs</h3>
        <button className="text-xs text-primary hover:underline">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-primary/5 text-primary/60 uppercase text-[10px] font-bold">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Iteration</th>
              <th className="px-4 py-3">Parameter Set</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            <tr>
              <td className="px-4 py-3 text-primary/60">14:22:05</td>
              <td className="px-4 py-3 font-mono">#0842</td>
              <td className="px-4 py-3 font-mono text-xs">MA_Fast:12, MA_Slow:26</td>
              <td className="px-4 py-3 font-bold">0.892</td>
              <td className="px-4 py-3 text-right"><span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">BEST</span></td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-primary/60">14:21:48</td>
              <td className="px-4 py-3 font-mono">#0841</td>
              <td className="px-4 py-3 font-mono text-xs">MA_Fast:10, MA_Slow:21</td>
              <td className="px-4 py-3 font-bold">0.745</td>
              <td className="px-4 py-3 text-right"><span className="px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-500 text-[10px] font-bold">PASS</span></td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-primary/60">14:21:30</td>
              <td className="px-4 py-3 font-mono">#0840</td>
              <td className="px-4 py-3 font-mono text-xs">MA_Fast:08, MA_Slow:20</td>
              <td className="px-4 py-3 font-bold text-rose-400">0.412</td>
              <td className="px-4 py-3 text-right"><span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-500 text-[10px] font-bold">REJ</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OptimizationLogsTable;
