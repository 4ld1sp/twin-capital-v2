import React from 'react';
import { useApp } from '../../context/AppContext';

const MediaMetricsRow = () => {
  const { userConnections } = useApp();
  
  const totalFollowers = userConnections.social.reduce((acc, conn) => {
    return acc + (conn.stats?.followers || conn.stats?.subscribers || 0);
  }, 0);

  const avgGrowth = (userConnections.social.reduce((acc, conn) => {
    const growth = parseFloat(conn.stats?.change || 0);
    return acc + growth;
  }, 0) / (userConnections.social.length || 1)).toFixed(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="glass-card p-6 rounded-xl shadow-sm border border-glass">
        <div className="flex justify-between items-start mb-4">
          <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">group</span>
          <span className={`text-xs font-bold ${avgGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {avgGrowth >= 0 ? '+' : ''}{avgGrowth}%
          </span>
        </div>
        <p className="text-secondary text-[10px] font-black uppercase tracking-widest opacity-60">Total Audience</p>
        <h3 className="text-2xl font-bold text-main">{totalFollowers.toLocaleString()}</h3>
      </div>
      <div className="glass-card p-6 rounded-xl shadow-sm border border-glass">
        <div className="flex justify-between items-start mb-4">
          <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">ads_click</span>
          <span className="text-emerald-500 text-xs font-bold">+5.2%</span>
        </div>
        <p className="text-secondary text-[10px] font-black uppercase tracking-widest opacity-60">Engagement Rate</p>
        <h3 className="text-2xl font-bold text-main">4.82%</h3>
      </div>
      <div className="glass-card p-6 rounded-xl shadow-sm border border-glass">
        <div className="flex justify-between items-start mb-4">
          <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">shopping_cart</span>
          <span className="text-emerald-500 text-xs font-bold">+18.1%</span>
        </div>
        <p className="text-secondary text-[10px] font-black uppercase tracking-widest opacity-60">Affiliate Revenue</p>
        <h3 className="text-2xl font-bold text-main">$42,910</h3>
      </div>
      <div className="glass-card p-6 rounded-xl shadow-sm border border-glass">
        <div className="flex justify-between items-start mb-4">
          <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">post_add</span>
          <span className="text-slate-400 text-xs font-bold">Steady</span>
        </div>
        <p className="text-secondary text-[10px] font-black uppercase tracking-widest opacity-60">Monthly Posts</p>
        <h3 className="text-2xl font-bold text-main">124</h3>
      </div>
    </div>
  );
};

export default MediaMetricsRow;
