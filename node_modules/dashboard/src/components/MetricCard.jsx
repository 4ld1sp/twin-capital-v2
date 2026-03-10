import React from 'react';

const MetricCard = ({ title, icon, iconColor, value, change, changeColor, visual }) => {
  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-primary/10 p-5 rounded-xl shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
        <span className={`material-symbols-outlined text-xl ${iconColor}`}>{icon}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold">{value}</h3>
        <span className={`text-xs font-bold ${changeColor}`}>{change}</span>
      </div>
      <div className="mt-4">
        {visual}
      </div>
    </div>
  );
};

export default MetricCard;
