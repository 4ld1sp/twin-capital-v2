import React, { useState, useMemo } from 'react';
import { useApp, availablePlatforms } from '../../context/AppContext';

const FollowersGrowthChart = () => {
  const { userConnections } = useApp();
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  
  const connectedSocials = useMemo(() => 
    userConnections.social.filter(conn => conn.connected),
    [userConnections.social]
  );

  const getPlatformMeta = (platformId) => {
    return availablePlatforms.social.find(p => p.id === platformId) || {};
  };

  // Calculate Metrics
  const metrics = useMemo(() => {
    if (connectedSocials.length === 0) return { topPerformer: null, totalGrowth: 0 };
    
    const sorted = [...connectedSocials].sort((a, b) => 
      parseFloat(b.stats?.change || 0) - parseFloat(a.stats?.change || 0)
    );
    
    const totalGrowth = connectedSocials.reduce((acc, c) => acc + parseFloat(c.stats?.change || 0), 0) / connectedSocials.length;
    
    return {
      topPerformer: sorted[0],
      totalGrowth: totalGrowth.toFixed(1)
    };
  }, [connectedSocials]);

  const filteredSocials = selectedPlatform === 'all' 
    ? connectedSocials 
    : connectedSocials.filter(c => c.platformId === selectedPlatform);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Trend line points (Total normalized growth across all days)
  const trendPoints = useMemo(() => {
    return [30, 45, 40, 60, 55, 75, 70]; // Mock total growth trend
  }, []);

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6 rounded-3xl border border-[var(--border)] h-full flex flex-col shadow-sm relative overflow-hidden group/card">
      {/* Background Decorative Gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 rounded-full group-hover/card:bg-primary/10 transition-all duration-700"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 relative z-10">
        <div className="space-y-1">
          <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">insights</span>
            Growth Performance
          </h3>
          <div className="flex items-center gap-3">
            {metrics.topPerformer && (
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">trending_up</span>
                {getPlatformMeta(metrics.topPerformer.platformId).name} +{metrics.topPerformer.stats?.change}%
              </span>
            )}
            <span className="text-[10px] text-secondary/60 font-black uppercase tracking-widest">
              Avg {metrics.totalGrowth}% Growth
            </span>
          </div>
        </div>

        {/* Platform Filters */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setSelectedPlatform('all')}
            className={`text-[9px] font-black uppercase tracking-tighter px-3 py-1.5 rounded-full border transition-all ${selectedPlatform === 'all' ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20' : 'text-[var(--text-secondary)] border-[var(--border)] hover: '}`}
          >
            All
          </button>
          {connectedSocials.map(conn => {
            const meta = getPlatformMeta(conn.platformId);
            const isSelected = selectedPlatform === conn.platformId;
            return (
              <button 
                key={conn.id}
                onClick={() => setSelectedPlatform(conn.platformId)}
                className={`text-[9px] font-black uppercase tracking-tighter px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all
                  ${isSelected ? 'bg-[var(--bg-main)] text-black dark:text-inverse border-main shadow-lg shadow-main/10' : 'text-[var(--text-secondary)] border-[var(--border)] hover: '}
                `}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${meta.color?.split(' ')[0] || 'bg-slate-400'}`}></span>
                {meta.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex items-end justify-between gap-2 px-2 relative min-h-[220px]">
        {/* Backdrop Grid Lines */}
        <div className="absolute inset-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none opacity-5">
          {[1,2,3,4].map(i => <div key={i} className="w-full border-t border-main"></div>)}
        </div>

        {/* Total Trend Line (Polyline) */}
        {selectedPlatform === 'all' && (
          <svg className="absolute inset-x-0 top-0 bottom-8 w-full h-[calc(100%-2rem)] z-0 pointer-events-none opacity-20 transition-opacity duration-1000 overflow-visible">
            <polyline
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={trendPoints.map((val, i) => `${(i / (days.length - 1)) * 100}%,${100 - val}%`).join(' ')}
              className="[stroke-dasharray:400] [stroke-dashoffset:400] animate-[draw_2s_ease-out_forwards]"
              style={{
                stroke: 'currentColor',
                color: 'rgb(var(--primary-rgb, 12, 169, 149))'
              }}
            />
          </svg>
        )}

        {/* Dynamic Bars */}
        {days.map((day, dayIndex) => (
          <div key={day} className="flex-1 flex flex-col justify-end gap-1 group relative h-full z-10">
            {filteredSocials.map((conn, sIndex) => {
              const meta = getPlatformMeta(conn.platformId);
              // Simple variance for demo
              const baseVal = conn.stats?.history?.[dayIndex] || 20;
              const displayVal = selectedPlatform === 'all' ? baseVal : Math.min(95, baseVal * 1.5);
              
              return (
                <div 
                  key={conn.id}
                  className={`w-full rounded-sm transition-all duration-700 hover:scale-x-105 hover:brightness-125 cursor-pointer shadow-sm relative ${meta.color?.split(' ')[0] || 'bg-slate-400'} opacity-30 hover:opacity-100`}
                  style={{ 
                    height: `${displayVal}%`,
                    transitionDelay: `${dayIndex * 50 + sIndex * 20}ms`
                  }}
                >
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--bg-main)] text-[8px] font-black uppercase text-black dark:text-inverse px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl">
                    {conn.name}: {displayVal}%
                  </div>
                </div>
              );
            })}
            <span className="text-[9px] font-black uppercase tracking-wider text-secondary/40 text-center mt-3">
              {day}
            </span>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

export default FollowersGrowthChart;
