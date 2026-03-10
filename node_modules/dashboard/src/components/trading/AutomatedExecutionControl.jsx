import React from 'react';

const AutomatedExecutionControl = () => {
  return (
    <div className="bg-primary rounded-xl p-6 text-background-dark">
      <h3 className="text-lg font-black leading-tight mb-2">Automated Execution</h3>
      <p className="text-xs font-medium opacity-80 mb-4">Sync optimized parameters directly to the live trading engine.</p>
      <button className="w-full flex items-center justify-center gap-2 rounded-lg h-12 bg-background-dark text-primary text-sm font-bold shadow-xl">
        <span className="material-symbols-outlined">sync_alt</span>
        <span>Sync to Production</span>
      </button>
    </div>
  );
};

export default AutomatedExecutionControl;
