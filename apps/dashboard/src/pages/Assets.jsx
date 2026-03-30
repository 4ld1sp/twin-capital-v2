import React, { useState } from 'react';
import MetricCard from '../components/MetricCard';
import PerformanceAnalytics from '../components/PerformanceAnalytics';
import DrawdownTracker from '../components/DrawdownTracker';
import BotStatusMatrix from '../components/BotStatusMatrix';

const Assets = () => {
  const [activeTab, setActiveTab] = useState('spot');

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-4">
        <MetricCard
          title="Winrate"
          icon="target"
          iconColor="text-primary"
          value="68.5%"
          change="+2.1%"
          changeColor="text-emerald-500"
          visual={
            <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden border border-glass">
              <div className="bg-primary h-full rounded-full shadow-[0_0_8px_rgba(202,255,0,0.4)]" style={{ width: '68.5%' }}></div>
            </div>
          }
        />

        <MetricCard
          title="Sharpe Ratio"
          icon="trending_up"
          iconColor="text-primary"
          value="2.41"
          change="+0.12"
          changeColor="text-emerald-500"
          visual={
            <div className="flex gap-1.5 items-end h-6">
              <div className="bg-primary/10 w-full h-2 rounded-md border border-glass"></div>
              <div className="bg-primary/30 w-full h-4 rounded-md border border-glass"></div>
              <div className="bg-primary/50 w-full h-3 rounded-md border border-glass"></div>
              <div className="bg-primary/70 w-full h-5 rounded-md border border-glass"></div>
              <div className="bg-primary w-full h-6 rounded-md shadow-[0_0_10px_rgba(202,255,0,0.3)]"></div>
            </div>
          }
        />

        <MetricCard
          title="Max Drawdown"
          icon="warning"
          iconColor="text-red-500"
          value="12.4%"
          change="-1.5%"
          changeColor="text-red-500"
          visual={
            <div className="w-full h-6 relative bg-rose-500/5 rounded-xl overflow-hidden border border-rose-500/20 shadow-inner">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,0 L20,30 L40,15 L60,50 L80,25 L100,60 L100,0 Z" fill="rgba(244, 63, 94, 0.2)"></path>
              </svg>
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
            <div className="w-full h-6 relative bg-emerald-500/5 rounded-xl overflow-hidden border border-emerald-500/20 shadow-inner">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polyline className="text-emerald-500" fill="none" points="0,80 20,70 40,75 60,40 80,45 100,10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"></polyline>
              </svg>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceAnalytics />
        </div>
        <div>
          <DrawdownTracker />
        </div>
      </div>

      <BotStatusMatrix />
    </>
  );

  const renderSpot = () => (
    <div className="w-full flex flex-col gap-4 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between p-6 glass-card rounded-2xl border border-glass">
        <div>
          <h2 className="text-xl font-black text-main uppercase italic">Spot Market</h2>
          <p className="text-secondary text-xs font-bold uppercase tracking-widest opacity-60">Real-time asset holdings and spot trading performance</p>
        </div>
        <div className="px-5 py-2 rounded-xl bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
          Binance Spot Active
        </div>
      </div>
      {renderOverview()}
    </div>
  );

  const renderSaham = () => (
    <div className="w-full flex flex-col gap-4 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between p-6 glass-card rounded-2xl border border-glass">
        <div>
          <h2 className="text-xl font-black text-main uppercase italic">Indo Equities (Saham)</h2>
          <p className="text-secondary text-xs font-bold uppercase tracking-widest opacity-60">Regional stock market monitoring and IDX execution engine</p>
        </div>
        <div className="px-5 py-2 rounded-xl bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
          IDX Gateway Ready
        </div>
      </div>
      {renderOverview()}
    </div>
  );

  return (
    <div className="space-y-8 flex flex-col w-full">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center w-full gap-6 pb-6 border-b border-glass">
        <nav className="flex items-center gap-2 p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-glass overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('spot')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'spot' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-secondary hover:text-main hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            Spot
          </button>
          <button
            onClick={() => setActiveTab('saham')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'saham' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-secondary hover:text-main hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            Saham
          </button>
        </nav>
      </div>

      <div className="w-full">
        {activeTab === 'spot' && renderSpot()}
        {activeTab === 'saham' && renderSaham()}
      </div>
    </div>
  );
};

export default Assets;
