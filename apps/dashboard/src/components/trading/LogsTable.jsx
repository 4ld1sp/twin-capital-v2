import React from 'react';

const LogsTable = () => {
  return (
    <div className="flex-1 bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-xl overflow-hidden flex flex-col mt-6">
      <div className="overflow-x-auto custom-scrollbar flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-50 dark:bg-background-dark border-b border-slate-200 dark:border-primary/20 z-10">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-48">Timestamp</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-32">Severity</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-48">Event Type</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Message</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-24">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-primary/10">
            {/* Row 1 */}
            <tr className="hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors group">
              <td className="px-6 py-3 font-mono text-xs text-slate-500">2023-10-27 14:22:01.442</td>
              <td className="px-6 py-3">
                <span className="px-2 py-1 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 uppercase">Info</span>
              </td>
              <td className="px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">API Call</td>
              <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">GET /api/v3/account - Response: 200 OK (45ms)</td>
              <td className="px-6 py-3 text-right">
                <button className="p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-base">info</span></button>
              </td>
            </tr>
            {/* Row 2 */}
            <tr className="hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors group">
              <td className="px-6 py-3 font-mono text-xs text-slate-500">2023-10-27 14:21:58.109</td>
              <td className="px-6 py-3">
                <span className="px-2 py-1 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 uppercase">Warning</span>
              </td>
              <td className="px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">Market Data</td>
              <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">Latency spike detected in Binance WebSocket feed (120ms)</td>
              <td className="px-6 py-3 text-right">
                <button className="p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-base">info</span></button>
              </td>
            </tr>
            {/* Row 3 */}
            <tr className="hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors group">
              <td className="px-6 py-3 font-mono text-xs text-slate-500">2023-10-27 14:21:45.002</td>
              <td className="px-6 py-3">
                <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-primary/20 dark:text-primary uppercase">Info</span>
              </td>
              <td className="px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">Signal Trigger</td>
              <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">Strategy [TrendFollower_v2] generated BUY signal for BTC/USDT at 34,201.50</td>
              <td className="px-6 py-3 text-right">
                <button className="p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-base">info</span></button>
              </td>
            </tr>
            {/* Row 4 */}
            <tr className="hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors group">
              <td className="px-6 py-3 font-mono text-xs text-slate-500">2023-10-27 14:21:44.981</td>
              <td className="px-6 py-3">
                <span className="px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 uppercase">Info</span>
              </td>
              <td className="px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">Parameter Change</td>
              <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">Risk Limit updated: Max Drawdown from 2.5% to 3.0% by user: admin</td>
              <td className="px-6 py-3 text-right">
                <button className="p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-base">info</span></button>
              </td>
            </tr>
            {/* Row 5 */}
            <tr className="hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors group">
              <td className="px-6 py-3 font-mono text-xs text-slate-500">2023-10-27 14:21:12.330</td>
              <td className="px-6 py-3">
                <span className="px-2 py-1 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 uppercase">Error</span>
              </td>
              <td className="px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">Execution</td>
              <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-400 font-bold">Failed to place LIMIT_BUY order: Insufficient margin balance</td>
              <td className="px-6 py-3 text-right">
                <button className="p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-base">info</span></button>
              </td>
            </tr>
            {/* Row 6 */}
            <tr className="hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors group">
              <td className="px-6 py-3 font-mono text-xs text-slate-500">2023-10-27 14:20:55.121</td>
              <td className="px-6 py-3">
                <span className="px-2 py-1 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 uppercase">Info</span>
              </td>
              <td className="px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">System</td>
              <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">Garbage collector executed: freed 242MB heap memory</td>
              <td className="px-6 py-3 text-right">
                <button className="p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-base">info</span></button>
              </td>
            </tr>
            {/* Row 7 */}
            <tr className="hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors group">
              <td className="px-6 py-3 font-mono text-xs text-slate-500">2023-10-27 14:20:30.000</td>
              <td className="px-6 py-3">
                <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-primary/20 dark:text-primary uppercase">Info</span>
              </td>
              <td className="px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">Market Data</td>
              <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">Connected to Coinbase Pro WebSocket Feed (USDT/USD)</td>
              <td className="px-6 py-3 text-right">
                <button className="p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-base">info</span></button>
              </td>
            </tr>
            {/* Row 8 */}
            <tr className="hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors group">
              <td className="px-6 py-3 font-mono text-xs text-slate-500">2023-10-27 14:19:42.115</td>
              <td className="px-6 py-3">
                <span className="px-2 py-1 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 uppercase">Warning</span>
              </td>
              <td className="px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">Connectivity</td>
              <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">Primary database replication lag exceeded threshold (2.4s)</td>
              <td className="px-6 py-3 text-right">
                <button className="p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-base">info</span></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="px-6 py-4 border-t border-slate-200 dark:border-primary/20 flex items-center justify-between bg-slate-50/50 dark:bg-background-dark/50">
        <p className="text-xs text-slate-500 font-medium">Showing 1 to 50 of 124,802 results</p>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-xs font-bold border border-slate-200 dark:border-primary/20 rounded hover:bg-slate-100 dark:hover:bg-primary/10 disabled:opacity-50" disabled>Previous</button>
          <button className="px-3 py-1 text-xs font-bold bg-primary text-background-dark rounded">1</button>
          <button className="px-3 py-1 text-xs font-bold border border-slate-200 dark:border-primary/20 rounded hover:bg-slate-100 dark:hover:bg-primary/10">2</button>
          <button className="px-3 py-1 text-xs font-bold border border-slate-200 dark:border-primary/20 rounded hover:bg-slate-100 dark:hover:bg-primary/10">3</button>
          <button className="px-3 py-1 text-xs font-bold border border-slate-200 dark:border-primary/20 rounded hover:bg-slate-100 dark:hover:bg-primary/10">Next</button>
        </div>
      </div>
    </div>
  );
};

export default LogsTable;
