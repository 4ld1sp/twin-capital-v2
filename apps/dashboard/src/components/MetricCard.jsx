import React from 'react';

const MetricCard = ({ title, icon, iconColor, value, change, changeColor, visual }) => {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-5 transition-colors hover:border-[var(--border-hover)]">
      <div className="flex justify-between items-start mb-1.5">
        <p className="text-xs font-medium text-[var(--text-secondary)]">{title}</p>
        {icon && <span className={`material-symbols-outlined text-lg ${iconColor || 'text-[var(--text-tertiary)]'}`}>{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <h3 className="text-2xl font-semibold text-[var(--text-primary)] font-mono tracking-tight">{value}</h3>
        {change && <span className={`text-xs font-medium ${changeColor || 'text-[var(--text-secondary)]'}`}>{change}</span>}
      </div>
      {visual && <div>{visual}</div>}
    </div>
  );
};

export default MetricCard;
