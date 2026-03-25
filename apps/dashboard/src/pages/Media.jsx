import React, { useState } from 'react';
import MediaMetricsRow from '../components/media/MediaMetricsRow';
import FollowersGrowthChart from '../components/media/FollowersGrowthChart';
import EngagementBars from '../components/media/EngagementBars';
import ContentPipeline from '../components/media/ContentPipeline';
import AffiliateFunnel from '../components/media/AffiliateFunnel';
import AffiliateNetworkManager from '../components/media/AffiliateNetworkManager';
import RevenueDashboard from '../components/media/RevenueDashboard';
import MediaGrowthAnalytics from '../components/media/MediaGrowthAnalytics';

const tabs = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'pipeline', label: 'Content Pipeline', icon: 'view_kanban' },
  { id: 'analytics', label: 'Growth Analytics', icon: 'trending_up' },
  { id: 'affiliates', label: 'Affiliates', icon: 'handshake' },
  { id: 'revenue', label: 'Revenue Streams', icon: 'payments' },
];

const Media = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6 w-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 pb-2 mb-2">
        <div>
          <h1 className="text-3xl font-bold">Media & Branding Panel</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time performance and ecosystem management</p>
        </div>
      </div>

      {/* Sub-Navigation (Matching Trading Page) */}
      <nav className="flex items-center gap-2 p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-glass overflow-x-auto w-fit mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-secondary hover:text-main hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ─── Overview (Default) ──────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="w-full space-y-8 animate-fade-in">
          {/* Quick Stats Row */}
          <MediaMetricsRow />

          {/* Charts Row: Followers Growth + Engagement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FollowersGrowthChart />
            <EngagementBars />
          </div>

          {/* Pipeline Status (Full Width) */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Pipeline Status</h3>
              <button onClick={() => setActiveTab('pipeline')} className="text-xs text-primary font-semibold hover:underline">View Board →</button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Backlog', count: 2, icon: 'inbox', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
                { label: 'In Progress', count: 1, icon: 'pending', color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Review', count: 2, icon: 'rate_review', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                { label: 'Go Live', count: 1, icon: 'rocket_launch', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              ].map(item => (
                <div key={item.label} className={`flex items-center justify-between p-3 rounded-lg ${item.bg}`}>
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[18px] ${item.color}`}>{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className={`text-xl font-bold ${item.color}`}>{item.count}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setActiveTab('pipeline')} className="flex items-center justify-center gap-1.5 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">add</span> New Post
                </button>
                <button onClick={() => setActiveTab('analytics')} className="flex items-center justify-center gap-1.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">analytics</span> Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Content Pipeline ────────────────────────────── */}
      {activeTab === 'pipeline' && (
        <div className="w-full">
          <ContentPipeline />
        </div>
      )}

      {/* ─── Growth Analytics ────────────────────────────── */}
      {activeTab === 'analytics' && (
        <MediaGrowthAnalytics />
      )}

      {/* ─── Affiliates ──────────────────────────────────── */}
      {activeTab === 'affiliates' && (
        <div className="w-full animate-fade-in space-y-8">
          <AffiliateFunnel />
          <AffiliateNetworkManager />
        </div>
      )}

      {/* ─── Revenue ─────────────────────────────────────── */}
      {activeTab === 'revenue' && (
        <div className="w-full animate-fade-in">
          <RevenueDashboard />
        </div>
      )}
    </div>
  );
};

export default Media;
