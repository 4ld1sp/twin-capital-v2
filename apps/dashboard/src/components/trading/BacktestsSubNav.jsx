import React from 'react';

const BacktestsSubNav = ({ activeTab = 'performance', onChange }) => {
  const tabs = [
    { id: 'performance', label: 'Performance Analysis' },
    { id: 'live', label: 'Live Backtest' },
    { id: 'history', label: 'Trade History' },
    { id: 'parameters', label: 'Parameters' },
    { id: 'signals', label: 'Signals' },
  ];

  return (
    <div className="flex gap-2 p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-glass mb-8 overflow-x-auto w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === tab.id
              ? 'bg-primary text-black shadow-lg shadow-primary/20'
              : 'text-secondary hover:text-main'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default BacktestsSubNav;
