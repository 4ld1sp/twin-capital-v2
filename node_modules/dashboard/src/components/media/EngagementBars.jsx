import React from 'react';

const EngagementBars = () => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-bold mb-6">Engagement Rate</h3>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span>Video Content</span>
            <span className="text-primary">8.2%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full w-[82%]"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span>Articles</span>
            <span className="text-primary">4.1%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary/60 rounded-full w-[41%]"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span>Infographics</span>
            <span className="text-primary">6.5%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary/80 rounded-full w-[65%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementBars;
