import React from 'react';
import { useApp, availablePlatforms } from '../../context/AppContext';
import FollowersGrowthChart from './FollowersGrowthChart';
import EngagementBars from './EngagementBars';

const MediaGrowthAnalytics = () => {
  const { userConnections } = useApp();
  
  const connectedSocials = userConnections.social.filter(conn => conn.connected);

  const getPlatformMeta = (platformId) => {
    return availablePlatforms.social.find(p => p.id === platformId) || {};
  };

  const getMetricLabel = (platformId) => {
    if (platformId === 'youtube') return 'Subscribers';
    return 'Followers';
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* ─── Platform Breakdown Grid ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {connectedSocials.map(conn => {
          const meta = getPlatformMeta(conn.platformId);
          const metric = getMetricLabel(conn.platformId);
          const count = conn.stats?.followers || conn.stats?.subscribers || 0;
          
          return (
            <div key={conn.id} className="glass-card p-6 rounded-2xl border border-glass group hover:border-primary/30 transition-all shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.color} shadow-lg shadow-black/5`}>
                  <span className="material-symbols-outlined text-2xl">{meta.icon}</span>
                </div>
                <div className={`flex items-center gap-1 text-xs font-black ${conn.stats?.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                   <span className="material-symbols-outlined text-sm">{conn.stats?.change.startsWith('+') ? 'trending_up' : 'trending_down'}</span>
                   {conn.stats?.change}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60">{conn.name}</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-3xl font-black text-main">{count.toLocaleString()}</h4>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-80">{metric}</span>
                </div>
              </div>
              
              {/* Subtle mini-progress bar */}
              <div className="mt-6 w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                 <div 
                   className={`h-full rounded-full ${meta.color?.split(' ')[0] || 'bg-primary'}`} 
                   style={{ width: `${Math.min(100, (count / 5000) * 100)}%` }}
                 ></div>
              </div>
            </div>
          );
        })}

        {connectedSocials.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center glass-card rounded-2xl border-dashed border-2 border-glass">
            <span className="material-symbols-outlined text-4xl text-secondary mb-4 opacity-20">cloud_off</span>
            <p className="text-secondary text-sm font-bold">No API connections active</p>
            <p className="text-[10px] text-secondary opacity-60 uppercase tracking-widest mt-1">Connect social accounts in Settings to see growth metrics</p>
          </div>
        )}
      </div>

      {/* ─── Detailed Charts ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        <div className="lg:col-span-8">
           <FollowersGrowthChart />
        </div>
        <div className="lg:col-span-4">
           <EngagementBars />
        </div>
      </div>

      {/* ─── Growth Insights Table ──────────────────────── */}
      <div className="glass-card rounded-3xl border border-glass overflow-hidden shadow-sm">
        <div className="p-6 border-b border-glass flex justify-between items-center">
          <h3 className="text-sm font-black text-main uppercase tracking-widest flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-xl">list_alt</span>
            Platform Performance Summary
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-secondary uppercase tracking-widest">Platform</th>
                <th className="px-6 py-4 text-[10px] font-black text-secondary uppercase tracking-widest">Audience</th>
                <th className="px-6 py-4 text-[10px] font-black text-secondary uppercase tracking-widest">30D Growth</th>
                <th className="px-6 py-4 text-[10px] font-black text-secondary uppercase tracking-widest">Efficiency</th>
                <th className="px-6 py-4 text-[10px] font-black text-secondary uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass">
              {connectedSocials.map(conn => {
                const count = conn.stats?.followers || conn.stats?.subscribers || 0;
                return (
                  <tr key={conn.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold">{conn.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono font-bold text-main">{count.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-black ${conn.stats?.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {conn.stats?.change}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <div className="flex-1 h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden max-w-[60px]">
                            <div className="h-full bg-primary rounded-full" style={{ width: '85%' }}></div>
                         </div>
                         <span className="text-[10px] font-bold">8.5/10</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">Active</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MediaGrowthAnalytics;
