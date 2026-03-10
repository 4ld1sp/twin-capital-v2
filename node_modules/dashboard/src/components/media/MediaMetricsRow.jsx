import React from 'react';

const MediaMetricsRow = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">group</span>
          <span className="text-emerald-500 text-xs font-bold">+12.4%</span>
        </div>
        <p className="text-slate-500 text-sm font-medium">Total Followers</p>
        <h3 className="text-2xl font-bold">1,284,042</h3>
      </div>
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">ads_click</span>
          <span className="text-emerald-500 text-xs font-bold">+5.2%</span>
        </div>
        <p className="text-slate-500 text-sm font-medium">Engagement Rate</p>
        <h3 className="text-2xl font-bold">4.82%</h3>
      </div>
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">shopping_cart</span>
          <span className="text-emerald-500 text-xs font-bold">+18.1%</span>
        </div>
        <p className="text-slate-500 text-sm font-medium">Affiliate Revenue</p>
        <h3 className="text-2xl font-bold">$42,910</h3>
      </div>
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">post_add</span>
          <span className="text-slate-400 text-xs font-bold">Steady</span>
        </div>
        <p className="text-slate-500 text-sm font-medium">Monthly Posts</p>
        <h3 className="text-2xl font-bold">124</h3>
      </div>
    </div>
  );
};

export default MediaMetricsRow;
