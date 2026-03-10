import React from 'react';
import MetricCard from '../components/MetricCard';
import PerformanceAnalytics from '../components/PerformanceAnalytics';
import EngagementBars from '../components/media/EngagementBars';
import BotStatusMatrix from '../components/BotStatusMatrix';
import ContentPipeline from '../components/media/ContentPipeline';

const Dashboard = () => {
  return (
    <div className="space-y-6 flex flex-col w-full">
      <div className="mb-2">
        <h1 className="text-2xl font-bold">Executive Overview</h1>
        <p className="text-sm text-slate-500">Combined insights across trading and media operations</p>
      </div>
      
      {/* Top Metrics Row - Combined */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <MetricCard
          title="Winrate"
          icon="target"
          iconColor="text-primary"
          value="68.5%"
          change="+2.1%"
          changeColor="text-emerald-500"
          visual={
            <div className="w-full bg-slate-100 dark:bg-primary/5 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '68.5%' }}></div>
            </div>
          }
        />
        
        <MetricCard
          title="Total Profit (PnL)"
          icon="payments"
          iconColor="text-emerald-500"
          value="$12,450.22"
          change="+$320.50"
          changeColor="text-emerald-500"
          visual={
            <div className="w-full h-6 relative bg-emerald-500/5 rounded-sm overflow-hidden border border-emerald-500/10">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polyline className="text-emerald-500" fill="none" points="0,80 20,70 40,75 60,40 80,45 100,10" stroke="currentColor" strokeWidth="4"></polyline>
              </svg>
            </div>
          }
        />

        <MetricCard
          title="Total Followers"
          icon="group"
          iconColor="text-blue-500"
          value="1,284,042"
          change="+12.4%"
          changeColor="text-emerald-500"
          visual={
            <div className="w-full h-6 relative bg-blue-500/5 rounded-sm overflow-hidden border border-blue-500/10">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,80 L20,75 L40,65 L60,40 L80,20 L100,5" fill="none" stroke="#3b82f6" strokeWidth="3"></path>
              </svg>
            </div>
          }
        />

        <MetricCard
          title="Affiliate Revenue"
          icon="shopping_cart"
          iconColor="text-purple-500"
          value="$42,910"
          change="+18.1%"
          changeColor="text-emerald-500"
          visual={
             <div className="flex gap-1 items-end h-6 w-full max-w-[50px]">
              <div className="bg-purple-500/30 w-full h-3 rounded-sm"></div>
              <div className="bg-purple-500/50 w-full h-4 rounded-sm"></div>
              <div className="bg-purple-500/70 w-full h-5 rounded-sm"></div>
              <div className="bg-purple-500 w-full h-6 rounded-sm"></div>
            </div>
          }
        />
      </div>

      {/* Middle Row - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceAnalytics />
        </div>
        <div>
          <EngagementBars />
        </div>
      </div>

      {/* Bottom Row - Data Tables / Pipelines */}
      <div className="space-y-6">
        <BotStatusMatrix />
        <div className="w-full">
           <ContentPipeline />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
