import React from 'react';

const CurrentParametersList = () => {
  return (
    <div className="bg-background-light dark:bg-primary/5 rounded-xl border border-primary/10 p-6">
      <h3 className="text-sm font-bold uppercase tracking-widest text-primary/60 mb-4">Current Parameters</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center py-2 border-b border-primary/5">
          <span className="text-sm">Risk Per Trade</span>
          <span className="text-sm font-mono font-bold text-primary">1.5%</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-primary/5">
          <span className="text-sm">Max Exposure</span>
          <span className="text-sm font-mono font-bold text-primary">400k USD</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-primary/5">
          <span className="text-sm">Stop Loss Buffer</span>
          <span className="text-sm font-mono font-bold text-primary">2.4 ATR</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-primary/5">
          <span className="text-sm">Entry Filter</span>
          <span className="text-sm font-mono font-bold text-primary">RSI &lt; 30</span>
        </div>
      </div>
      <button className="w-full mt-6 flex items-center justify-center gap-2 rounded-lg h-10 border border-primary/20 text-primary/80 text-xs font-bold hover:bg-primary/5 transition-colors">
        <span className="material-symbols-outlined text-sm">settings</span>
        <span>Adjust Real-time Parameters</span>
      </button>
    </div>
  );
};

export default CurrentParametersList;
