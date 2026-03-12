import React from 'react';

const LogsTable = () => {
  return (
    <div className="flex-1 glass-card border border-glass rounded-2xl overflow-hidden flex flex-col mt-6 shadow-sm">
      <div className="overflow-x-auto custom-scrollbar flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-black/5 dark:bg-white/5 border-b border-glass z-10">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary w-48">Timestamp</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary w-32">Level</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary w-48">Event</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary">Message</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary w-24">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass">
            {/* Row 1 */}
            <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
              <td className="px-6 py-4 font-mono text-[11px] text-secondary font-bold">14:22:01.442</td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-widest">Info</span>
              </td>
              <td className="px-6 py-4 text-xs font-black text-main uppercase tracking-wider">API Call</td>
              <td className="px-6 py-4 text-xs text-secondary font-bold">GET /api/v3/account — 200 OK (45ms)</td>
              <td className="px-6 py-4 text-right">
                <button className="p-1.5 opacity-0 group-hover:opacity-100 text-secondary hover:text-primary transition-all rounded-lg hover:bg-black/5 dark:hover:bg-white/5"><span className="material-symbols-outlined text-lg">info</span></button>
              </td>
            </tr>
            {/* Row 2 */}
            <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
              <td className="px-6 py-4 font-mono text-[11px] text-secondary font-bold">14:21:58.109</td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-widest">Warn</span>
              </td>
              <td className="px-6 py-4 text-xs font-black text-main uppercase tracking-wider">Market Data</td>
              <td className="px-6 py-4 text-xs text-secondary font-bold">Latency spike: Binance WS feed (120ms)</td>
              <td className="px-6 py-4 text-right">
                <button className="p-1.5 opacity-0 group-hover:opacity-100 text-secondary hover:text-primary transition-all rounded-lg hover:bg-black/5 dark:hover:bg-white/5"><span className="material-symbols-outlined text-lg">info</span></button>
              </td>
            </tr>
            {/* Row 3 */}
            <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
              <td className="px-6 py-4 font-mono text-[11px] text-secondary font-bold">14:21:45.002</td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">Signal</span>
              </td>
              <td className="px-6 py-4 text-xs font-black text-main uppercase tracking-wider">Signal Trigger</td>
              <td className="px-6 py-4 text-xs text-secondary font-bold">[TrendFollower_v2] BUY BTC/USDT @ 34,201.50</td>
              <td className="px-6 py-4 text-right">
                <button className="p-1.5 opacity-0 group-hover:opacity-100 text-secondary hover:text-primary transition-all rounded-lg hover:bg-black/5 dark:hover:bg-white/5"><span className="material-symbols-outlined text-lg">info</span></button>
              </td>
            </tr>
            {/* Row 4 */}
            <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
              <td className="px-6 py-4 font-mono text-[11px] text-secondary font-bold">14:21:44.981</td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-black/5 dark:bg-white/5 text-secondary border border-glass uppercase tracking-widest">Info</span>
              </td>
              <td className="px-6 py-4 text-xs font-black text-main uppercase tracking-wider">Param Change</td>
              <td className="px-6 py-4 text-xs text-secondary font-bold">Max Drawdown: 2.5% → 3.0% (admin)</td>
              <td className="px-6 py-4 text-right">
                <button className="p-1.5 opacity-0 group-hover:opacity-100 text-secondary hover:text-primary transition-all rounded-lg hover:bg-black/5 dark:hover:bg-white/5"><span className="material-symbols-outlined text-lg">info</span></button>
              </td>
            </tr>
            {/* Row 5 */}
            <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group bg-rose-500/[0.02]">
              <td className="px-6 py-4 font-mono text-[11px] text-secondary font-bold">14:21:12.330</td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-widest">Error</span>
              </td>
              <td className="px-6 py-4 text-xs font-black text-rose-500 uppercase tracking-wider">Execution</td>
              <td className="px-6 py-4 text-xs text-main font-black">LIMIT_BUY failed: Insufficient margin</td>
              <td className="px-6 py-4 text-right">
                <button className="p-1.5 opacity-0 group-hover:opacity-100 text-secondary hover:text-rose-500 transition-all rounded-lg hover:bg-rose-500/5"><span className="material-symbols-outlined text-lg">info</span></button>
              </td>
            </tr>
            {/* Row 6 */}
            <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
              <td className="px-6 py-4 font-mono text-[11px] text-secondary font-bold">14:20:55.121</td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-widest">Info</span>
              </td>
              <td className="px-6 py-4 text-xs font-black text-main uppercase tracking-wider">System</td>
              <td className="px-6 py-4 text-xs text-secondary font-bold">GC executed: freed 242MB heap</td>
              <td className="px-6 py-4 text-right">
                <button className="p-1.5 opacity-0 group-hover:opacity-100 text-secondary hover:text-primary transition-all rounded-lg hover:bg-black/5 dark:hover:bg-white/5"><span className="material-symbols-outlined text-lg">info</span></button>
              </td>
            </tr>
            {/* Row 7 */}
            <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
              <td className="px-6 py-4 font-mono text-[11px] text-secondary font-bold">14:20:30.000</td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">Info</span>
              </td>
              <td className="px-6 py-4 text-xs font-black text-main uppercase tracking-wider">Market Data</td>
              <td className="px-6 py-4 text-xs text-secondary font-bold">Coinbase Pro WS connected (USDT/USD)</td>
              <td className="px-6 py-4 text-right">
                <button className="p-1.5 opacity-0 group-hover:opacity-100 text-secondary hover:text-primary transition-all rounded-lg hover:bg-black/5 dark:hover:bg-white/5"><span className="material-symbols-outlined text-lg">info</span></button>
              </td>
            </tr>
            {/* Row 8 */}
            <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
              <td className="px-6 py-4 font-mono text-[11px] text-secondary font-bold">14:19:42.115</td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-widest">Warn</span>
              </td>
              <td className="px-6 py-4 text-xs font-black text-main uppercase tracking-wider">Connectivity</td>
              <td className="px-6 py-4 text-xs text-secondary font-bold">DB replication lag exceeded threshold (2.4s)</td>
              <td className="px-6 py-4 text-right">
                <button className="p-1.5 opacity-0 group-hover:opacity-100 text-secondary hover:text-primary transition-all rounded-lg hover:bg-black/5 dark:hover:bg-white/5"><span className="material-symbols-outlined text-lg">info</span></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="px-6 py-4 border-t border-glass flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
        <p className="text-[10px] text-secondary font-black uppercase tracking-widest opacity-60">1–50 of 124,802</p>
        <div className="flex gap-2">
          <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border border-glass rounded-lg hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 transition-all text-secondary" disabled>Prev</button>
          <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-primary text-black rounded-lg shadow-sm">1</button>
          <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border border-glass rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-secondary transition-all">2</button>
          <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border border-glass rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-secondary transition-all">3</button>
          <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border border-glass rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-secondary transition-all">Next</button>
        </div>
      </div>
    </div>
  );
};

export default LogsTable;
