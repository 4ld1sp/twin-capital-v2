import React from 'react';
import MetricCard from '../components/MetricCard';
import PerformanceAnalytics from '../components/PerformanceAnalytics';
import EngagementBars from '../components/media/EngagementBars';
import BotStatusMatrix from '../components/BotStatusMatrix';
import ContentPipeline from '../components/media/ContentPipeline';
import { useTradingData } from '../hooks/useTradingData';

const Dashboard = () => {
  const {
    totalEquity,
    unrealizedPnl,
    totalRealizedPnl,
    winrate,
    positions,
    isLoading,
    pnlTimeseries,
  } = useTradingData();

  const formatCurrency = (val) => {
    const abs = Math.abs(val);
    return `$${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6 flex flex-col w-full">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-main">Executive Overview</h1>
        <p className="text-sm text-secondary">Combined insights across trading and media operations</p>
      </div>
      
      {/* Top Metrics Row - Live Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <MetricCard
          title="Total Equity"
          icon="account_balance_wallet"
          iconColor="text-primary"
          value={isLoading ? '...' : formatCurrency(totalEquity)}
          change={isLoading ? '' : `${positions.length} positions`}
          changeColor="text-secondary"
          visual={
            <div className="w-full bg-black/5 dark:bg-white/5 h-2 rounded-full overflow-hidden border border-glass">
              <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totalEquity / Math.max(totalEquity * 1.2, 1)) * 100)}%` }}></div>
            </div>
          }
        />
        
        <MetricCard
          title="Total Realized P&L"
          icon="payments"
          iconColor={totalRealizedPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}
          value={isLoading ? '...' : `${totalRealizedPnl >= 0 ? '+' : '-'}${formatCurrency(totalRealizedPnl)}`}
          change={isLoading ? '' : `${winrate.toFixed(1)}% winrate`}
          changeColor={winrate >= 50 ? 'text-emerald-500' : 'text-rose-500'}
          visual={
            <div className="w-full h-6 relative bg-emerald-500/5 rounded-sm overflow-hidden border border-emerald-500/10">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polyline className={totalRealizedPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'} fill="none" points="0,80 20,70 40,75 60,40 80,45 100,10" stroke="currentColor" strokeWidth="4"></polyline>
              </svg>
            </div>
          }
        />

        <MetricCard
          title="Unrealized P&L"
          icon="trending_up"
          iconColor={unrealizedPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}
          value={isLoading ? '...' : `${unrealizedPnl >= 0 ? '+' : '-'}${formatCurrency(unrealizedPnl)}`}
          change={isLoading ? '' : `${positions.length} active`}
          changeColor="text-secondary"
          visual={
            <div className="w-full h-6 relative bg-blue-500/5 rounded-sm overflow-hidden border border-blue-500/10">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,80 L20,75 L40,65 L60,40 L80,20 L100,5" fill="none" stroke={unrealizedPnl >= 0 ? '#10b981' : '#f43f5e'} strokeWidth="3"></path>
              </svg>
            </div>
          }
        />

        <MetricCard
          title="Winrate"
          icon="target"
          iconColor="text-primary"
          value={isLoading ? '...' : `${winrate.toFixed(1)}%`}
          change={isLoading ? '' : `from ${pnlTimeseries.length || 0} trades`}
          changeColor="text-secondary"
          visual={
            <div className="w-full bg-black/5 dark:bg-white/5 h-2 rounded-full overflow-hidden border border-glass">
              <div className={`h-full rounded-full transition-all duration-500 ${winrate >= 50 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${winrate}%` }}></div>
            </div>
          }
        />
      </div>

      {/* Middle Row - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceAnalytics pnlTimeseries={pnlTimeseries} />
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
