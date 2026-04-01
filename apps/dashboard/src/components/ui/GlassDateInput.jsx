import React from 'react';

const GlassDateInput = ({ 
  label, 
  value, 
  onChange, 
  className = '',
  icon = 'calendar_today'
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-[10px] text-secondary font-black uppercase tracking-widest pl-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-primary text-lg group-focus-within:scale-110 transition-transform">
            {icon}
          </span>
        </div>
        <input 
          type="date" 
          value={value} 
          onChange={onChange}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-glass text-main text-xs font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all hover:bg-white/10"
          style={{ colorScheme: 'dark' }} // Force dark theme for native date picker dropdown in chrome
        />
      </div>
    </div>
  );
};

export default GlassDateInput;
