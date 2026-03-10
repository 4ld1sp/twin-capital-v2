import React from 'react';

const BacktestsSubNav = () => {
  return (
    <div className="border-b border-slate-200 dark:border-slate-800 flex gap-8 mb-6">
      <button className="border-b-2 border-primary text-primary pb-4 font-bold text-sm">Performance Analysis</button>
      <button className="border-b-2 border-transparent text-slate-500 dark:text-slate-400 pb-4 font-bold text-sm hover:text-slate-300">Trade History</button>
      <button className="border-b-2 border-transparent text-slate-500 dark:text-slate-400 pb-4 font-bold text-sm hover:text-slate-300">Parameters</button>
      <button className="border-b-2 border-transparent text-slate-500 dark:text-slate-400 pb-4 font-bold text-sm hover:text-slate-300">Signals</button>
    </div>
  );
};

export default BacktestsSubNav;
