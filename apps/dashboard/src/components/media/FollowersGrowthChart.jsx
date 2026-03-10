import React from 'react';

const FollowersGrowthChart = () => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Followers Growth</h3>
        <div className="flex gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary"></span> YouTube</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Twitter</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400"></span> LinkedIn</div>
        </div>
      </div>
      <div className="h-64 flex items-end justify-between gap-2 px-2 relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none px-6 py-10">
          <div className="w-full h-full border-b border-l border-slate-300 dark:border-slate-700"></div>
        </div>
        <div className="flex-1 flex flex-col justify-end gap-1 group relative">
          <div className="w-full bg-primary/30 h-1/2 rounded-t-sm group-hover:bg-primary/50 transition-colors"></div>
          <div className="w-full bg-blue-400/30 h-1/3 rounded-t-sm group-hover:bg-blue-400/50 transition-colors"></div>
          <div className="w-full bg-purple-400/30 h-1/4 rounded-t-sm group-hover:bg-purple-400/50 transition-colors"></div>
          <span className="text-[10px] text-slate-500 text-center mt-2">Mon</span>
        </div>
        <div className="flex-1 flex flex-col justify-end gap-1 group">
          <div className="w-full bg-primary/30 h-3/5 rounded-t-sm"></div>
          <div className="w-full bg-blue-400/30 h-2/5 rounded-t-sm"></div>
          <div className="w-full bg-purple-400/30 h-1/5 rounded-t-sm"></div>
          <span className="text-[10px] text-slate-500 text-center mt-2">Tue</span>
        </div>
        <div className="flex-1 flex flex-col justify-end gap-1 group">
          <div className="w-full bg-primary/30 h-4/5 rounded-t-sm"></div>
          <div className="w-full bg-blue-400/30 h-3/5 rounded-t-sm"></div>
          <div className="w-full bg-purple-400/30 h-2/5 rounded-t-sm"></div>
          <span className="text-[10px] text-slate-500 text-center mt-2">Wed</span>
        </div>
        <div className="flex-1 flex flex-col justify-end gap-1 group">
          <div className="w-full bg-primary/30 h-3/4 rounded-t-sm"></div>
          <div className="w-full bg-blue-400/30 h-1/2 rounded-t-sm"></div>
          <div className="w-full bg-purple-400/30 h-1/4 rounded-t-sm"></div>
          <span className="text-[10px] text-slate-500 text-center mt-2">Thu</span>
        </div>
        <div className="flex-1 flex flex-col justify-end gap-1 group">
          <div className="w-full bg-primary/30 h-full rounded-t-sm"></div>
          <div className="w-full bg-blue-400/30 h-4/5 rounded-t-sm"></div>
          <div className="w-full bg-purple-400/30 h-3/5 rounded-t-sm"></div>
          <span className="text-[10px] text-slate-500 text-center mt-2">Fri</span>
        </div>
      </div>
    </div>
  );
};

export default FollowersGrowthChart;
