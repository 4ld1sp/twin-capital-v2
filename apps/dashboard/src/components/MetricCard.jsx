import React from 'react';

const MetricCard = ({ title, icon, iconColor, value, change, changeColor, visual }) => {
  return (
    <div className="glass-card p-6 rounded-2xl shadow-sm transition-all duration-300">
      <div className="flex justify-between items-start mb-2">
        <p className="text-secondary text-sm font-bold uppercase tracking-wider">{title}</p>
        <span className={`material-symbols-outlined text-xl ${iconColor}`}>{icon}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-main">{value}</h3>
        <span className={`text-xs font-black ${changeColor}`}>{change}</span>
      </div>
      <div className="mt-4">
        {visual}
      </div>
    </div>
  );
};

export default MetricCard;
