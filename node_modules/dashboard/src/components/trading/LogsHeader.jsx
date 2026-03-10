import React from 'react';

const LogsHeader = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Logs</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time monitoring of engine events and trading signals</p>
      </div>
      <div className="flex gap-4">
        <div className="px-4 py-2 bg-slate-100 dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-lg">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total Events (24h)</p>
          <p className="text-lg font-bold text-primary">124,802</p>
        </div>
        <div className="px-4 py-2 bg-slate-100 dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-lg">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Error Rate</p>
          <p className="text-lg font-bold text-red-500">0.02%</p>
        </div>
      </div>
    </div>
  );
};

export default LogsHeader;
