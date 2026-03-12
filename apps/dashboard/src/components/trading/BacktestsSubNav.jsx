import React from 'react';

const BacktestsSubNav = () => {
  return (
    <div className="flex gap-2 p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-glass mb-8 overflow-x-auto w-fit">
      <button className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-primary text-black shadow-lg shadow-primary/20">Performance Analysis</button>
      <button className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-secondary hover:text-main">Trade History</button>
      <button className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-secondary hover:text-main">Parameters</button>
      <button className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-secondary hover:text-main">Signals</button>
    </div>
  );
};

export default BacktestsSubNav;
