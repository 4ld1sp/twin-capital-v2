import React from 'react';

const LogsFilterBar = () => {
  return (
    <div className="bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-xl p-4 flex flex-wrap items-center gap-4 mt-6">
      <div className="flex-1 min-w-[300px] relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary" placeholder="Filter by message or event type..."/>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 uppercase px-2">Severity</span>
        <div className="flex p-1 bg-slate-100 dark:bg-background-dark rounded-lg border border-slate-200 dark:border-primary/20">
          <button className="px-3 py-1 text-xs font-medium rounded bg-white dark:bg-primary text-slate-900 dark:text-background-dark shadow-sm">All</button>
          <button className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-primary">Info</button>
          <button className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-primary">Warning</button>
          <button className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-primary">Error</button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 uppercase px-2">Category</span>
        <select className="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg text-sm py-2 px-3 focus:ring-1 focus:ring-primary">
          <option>All Categories</option>
          <option>Order Execution</option>
          <option>Market Data</option>
          <option>Strategy Engine</option>
          <option>Authentication</option>
        </select>
      </div>
      <button className="ml-auto flex items-center gap-2 bg-primary text-background-dark px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90">
        <span className="material-symbols-outlined text-sm">download</span>
        Export CSV
      </button>
    </div>
  );
};

export default LogsFilterBar;
