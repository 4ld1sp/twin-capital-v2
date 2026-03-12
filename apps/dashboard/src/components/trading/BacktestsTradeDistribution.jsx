import React from 'react';

const BacktestsTradeDistribution = () => {
  return (
    <div className="glass-card border border-glass rounded-3xl p-8 shadow-sm flex-1">
      <p className="text-secondary text-[10px] font-black uppercase tracking-widest mb-6 pl-1">Trade Distribution</p>
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center text-xs font-bold text-secondary uppercase tracking-wider">
          <span>Long Positions</span>
          <span className="text-main font-black">142</span>
        </div>
        <div className="flex justify-between items-center text-xs font-bold text-secondary uppercase tracking-wider">
          <span>Short Positions</span>
          <span className="text-main font-black">89</span>
        </div>
        <div className="flex justify-between items-center text-xs font-bold text-secondary uppercase tracking-wider">
          <span>Avg. Duration</span>
          <span className="text-main font-black">4.2 Days</span>
        </div>
        <div className="pt-6 border-t border-glass mt-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-main uppercase tracking-widest">Profit Factor</span>
            <span className="text-primary font-black text-lg">1.84</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacktestsTradeDistribution;
