import React from 'react';

const LogsSystemStatus = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <div className="bg-white dark:bg-primary/5 p-4 rounded-xl border border-slate-200 dark:border-primary/10 flex items-center gap-4">
        <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
          <span className="material-symbols-outlined">database</span>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-500">DB Persistence</p>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Connected <span className="text-[10px] text-emerald-500 ml-1">●</span></p>
        </div>
      </div>
      <div className="bg-white dark:bg-primary/5 p-4 rounded-xl border border-slate-200 dark:border-primary/10 flex items-center gap-4">
        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">memory</span>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-500">Engine CPU</p>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-slate-200 dark:bg-primary/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[14%]"></div>
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">14%</p>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-primary/5 p-4 rounded-xl border border-slate-200 dark:border-primary/10 flex items-center gap-4">
        <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
          <span className="material-symbols-outlined">router</span>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-500">API Gateway</p>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">22ms avg latency</p>
        </div>
      </div>
      <div className="bg-white dark:bg-primary/5 p-4 rounded-xl border border-slate-200 dark:border-primary/10 flex items-center gap-4">
        <div className="size-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
          <span className="material-symbols-outlined">history_toggle_off</span>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-500">System Uptime</p>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">142d 08h 22m</p>
        </div>
      </div>
    </div>
  );
};

export default LogsSystemStatus;
