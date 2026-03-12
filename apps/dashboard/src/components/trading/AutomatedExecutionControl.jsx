import React from 'react';

const AutomatedExecutionControl = () => {
  return (
    <div className="bg-primary rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
      <h3 className="text-xl font-black leading-tight mb-3 text-black uppercase tracking-widest">Live Sync</h3>
      <p className="text-[10px] font-black uppercase tracking-widest text-black/60 mb-8 leading-relaxed">Instantly deploy optimized weights to the production trading engine.</p>
      <button className="w-full flex items-center justify-center gap-3 rounded-2xl h-14 bg-black text-primary text-[11px] font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all">
        <span className="material-symbols-outlined text-xl">bolt</span>
        <span>Sync to Production</span>
      </button>
    </div>
  );
};

export default AutomatedExecutionControl;
