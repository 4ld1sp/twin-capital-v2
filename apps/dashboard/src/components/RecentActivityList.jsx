import React from 'react';

const activities = [
  {
    time: "2 hours ago",
    title: "Equity Purchase",
    description: "Tesla Inc. • $45,000"
  },
  {
    time: "Yesterday",
    title: "Dividend Received",
    description: "Monthly • $1,240"
  },
  {
    time: "3 days ago",
    title: "Portfolio Rebalance",
    description: "System Automated"
  }
];

const RecentActivityList = () => {
  return (
    <div className="bg-white dark:bg-primary/5 rounded-xl border border-slate-200 dark:border-primary/10 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">analytics</span>
          Recent Activity
        </h3>
        <button className="text-sm font-semibold text-primary hover:underline">View Full History</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activities.map((activity, index) => (
          <div key={index} className="p-4 rounded-lg bg-slate-50 dark:bg-primary/5 border border-slate-100 dark:border-primary/10">
            <p className="text-xs text-slate-500 mb-1">{activity.time}</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{activity.title}</p>
            <p className="text-xs text-primary font-medium">{activity.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivityList;
