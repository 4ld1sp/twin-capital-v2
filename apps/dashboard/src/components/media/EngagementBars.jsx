import React from 'react';

const EngagementBars = () => {
  return (
    <div className="glass-card p-6 rounded-2xl shadow-sm h-full flex flex-col transition-all duration-300">
      <h3 className="text-lg font-bold mb-6 text-main">Engagement Rate</h3>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
            <span className="text-secondary">Video Content</span>
            <span className="text-primary">8.2%</span>
          </div>
          <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden border border-glass">
            <div className="h-full bg-primary rounded-full w-[82%] shadow-[0_0_8px_rgba(0,214,171,0.4)]"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
            <span className="text-secondary">Articles</span>
            <span className="text-primary">4.1%</span>
          </div>
          <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden border border-glass">
            <div className="h-full bg-primary/60 rounded-full w-[41%] shadow-[0_0_8px_rgba(0,214,171,0.2)]"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
            <span className="text-secondary">Infographics</span>
            <span className="text-primary">6.5%</span>
          </div>
          <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden border border-glass">
            <div className="h-full bg-primary/80 rounded-full w-[65%] shadow-[0_0_8px_rgba(0,214,171,0.3)]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementBars;
