import React from 'react';

const LogsFilterBar = ({ className = "" }) => {
  return (
    <div className={`glass-card border border-glass rounded-2xl p-5 flex flex-wrap items-center gap-4 shadow-sm ${className}`}>
      <div className="flex-1 min-w-[280px] relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary opacity-50 text-xl">search</span>
        <input className="w-full bg-black/5 dark:bg-white/5 border border-glass rounded-xl pl-12 pr-4 py-3 text-xs font-bold text-main placeholder:text-secondary/40 placeholder:uppercase placeholder:tracking-widest focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" placeholder="Filter events..."/>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Level</span>
        <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-glass">
          <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg bg-primary text-black shadow-lg shadow-primary/20">All</button>
          <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg text-secondary hover:text-main">Info</button>
          <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg text-secondary hover:text-main">Warn</button>
          <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg text-secondary hover:text-main">Error</button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Scope</span>
        <select className="bg-black/5 dark:bg-white/5 border border-glass rounded-xl text-xs font-black text-main uppercase tracking-wider py-2.5 px-4 focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer">
          <option>All Categories</option>
          <option>Order Execution</option>
          <option>Market Data</option>
          <option>Strategy Engine</option>
          <option>Authentication</option>
        </select>
      </div>
      <button className="ml-auto flex items-center gap-2 bg-primary text-black px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/20">
        <span className="material-symbols-outlined text-[16px]">download</span>
        Export
      </button>
    </div>
  );
};

export default LogsFilterBar;
