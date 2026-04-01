import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { useApp } from '../context/AppContext';
import { useTradingData } from '../hooks/useTradingData';
import MetricCard from '../components/MetricCard';
import PerformanceAnalytics from '../components/PerformanceAnalytics';
import GlassSelect from '../components/ui/GlassSelect';
import DrawdownTracker from '../components/DrawdownTracker';
import BotStatusMatrix from '../components/BotStatusMatrix';

// Optimization Components
import OptimizationHeader from '../components/trading/OptimizationHeader';
import BacktestEquityChart from '../components/trading/BacktestEquityChart';
import OptimizationMetricsRow from '../components/trading/OptimizationMetricsRow';
import OptimizationLogsTable from '../components/trading/OptimizationLogsTable';
import ABTestingResults from '../components/trading/ABTestingResults';
import CurrentParametersList from '../components/trading/CurrentParametersList';
import AutomatedExecutionControl from '../components/trading/AutomatedExecutionControl';

// Backtests Components
import BacktestsHeader from '../components/trading/BacktestsHeader';
import BacktestsEquityCurve from '../components/trading/BacktestsEquityCurve';
import BacktestResults from '../components/trading/BacktestResults';
import RunNewTestModal from '../components/trading/RunNewTestModal';

// Modal Component
import NewStrategyModal from '../components/trading/NewStrategyModal';
import ExportReportModal from '../components/trading/ExportReportModal';
import RunOptimizationModal from '../components/trading/RunOptimizationModal';

// Phase 9 Optimization Components
import OptimizationCorrelations from '../components/trading/OptimizationCorrelations';

// Live Trading Terminal
import TradingTerminal from '../components/trading/TradingTerminal';

// Strategy Manager
import StrategyManager from '../components/trading/StrategyManager';

const Trading = () => {
  const { activeExchange, setActiveExchange, networkMode, setNetworkMode, activeSymbol, livePrice, isConnected, liveTicker } = useTrading();
  const { userConnections } = useApp();
  const tradingConnections = userConnections?.trading || [];
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Optimization UI State
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRunOptOpen, setIsRunOptOpen] = useState(false);

  // Backtest State
  const [isRunTestOpen, setIsRunTestOpen] = useState(false);
  const [hasTestResults, setHasTestResults] = useState(false);
  const [lastTestData, setLastTestData] = useState(null);

  const td = useTradingData();
  const fmtCurrency = (v) => `$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-4">
        <MetricCard
          title="Winrate"
          icon="target"
          iconColor="text-primary"
          value={td.isLoading ? '...' : `${td.winrate.toFixed(1)}%`}
          change={td.isLoading ? '' : `from ${td.totalTrades} trades`}
          changeColor={td.winrate >= 50 ? 'text-emerald-500' : 'text-rose-500'}
          visual={
            <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden border border-glass">
              <div className={`h-full rounded-full transition-all duration-500 ${td.winrate >= 50 ? 'bg-primary' : 'bg-rose-500'}`} style={{ width: `${td.winrate}%` }}></div>
            </div>
          }
        />

        <MetricCard
          title="Total Equity"
          icon="account_balance_wallet"
          iconColor="text-primary"
          value={td.isLoading ? '...' : fmtCurrency(td.totalEquity)}
          change={td.isLoading ? '' : `${td.positions.length} positions`}
          changeColor="text-secondary"
          visual={
            <div className="flex gap-1.5 items-end h-6">
              <div className="bg-primary/10 w-full h-2 rounded-md border border-glass"></div>
              <div className="bg-primary/30 w-full h-4 rounded-md border border-glass"></div>
              <div className="bg-primary/50 w-full h-3 rounded-md border border-glass"></div>
              <div className="bg-primary/70 w-full h-5 rounded-md border border-glass"></div>
              <div className="bg-primary w-full h-6 rounded-md"></div>
            </div>
          }
        />

        <MetricCard
          title="Max Drawdown"
          icon="warning"
          iconColor="text-red-500"
          value={td.isLoading ? '...' : `${td.maxDrawdown.toFixed(1)}%`}
          change={td.maxDrawdown > 10 ? 'High risk' : 'Under control'}
          changeColor={td.maxDrawdown > 10 ? 'text-red-500' : 'text-emerald-500'}
          visual={
            <div className="w-full h-6 relative bg-rose-500/5 rounded-xl overflow-hidden border border-rose-500/20 shadow-inner">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,0 L20,30 L40,15 L60,50 L80,25 L100,60 L100,0 Z" fill="rgba(244, 63, 94, 0.2)"></path>
              </svg>
            </div>
          }
        />

        <MetricCard
          title="Total Realized P&L"
          icon="payments"
          iconColor={td.totalRealizedPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}
          value={td.isLoading ? '...' : `${td.totalRealizedPnl >= 0 ? '+' : '-'}${fmtCurrency(td.totalRealizedPnl)}`}
          change={td.isLoading ? '' : `${td.unrealizedPnl >= 0 ? '+' : ''}${fmtCurrency(td.unrealizedPnl)} unrealized`}
          changeColor={td.unrealizedPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}
          visual={
            <div className="w-full h-6 relative bg-emerald-500/5 rounded-xl overflow-hidden border border-emerald-500/20 shadow-inner">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polyline className={td.totalRealizedPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'} fill="none" points="0,80 20,70 40,75 60,40 80,45 100,10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"></polyline>
              </svg>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceAnalytics pnlTimeseries={td.pnlTimeseries} />
        </div>
        <div>
          <DrawdownTracker currentDrawdown={td.maxDrawdown} maxDrawdown={td.maxDrawdown} pnlTimeseries={td.pnlTimeseries} />
        </div>
      </div>

      <BotStatusMatrix />
    </>
  );

  const renderOptimization = () => (
    <div className="w-full flex flex-col pt-4">
      <OptimizationHeader
        onExportClick={() => setIsExportOpen(true)}
        onRunClick={() => setIsRunOptOpen(true)}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <BacktestEquityChart />
          <OptimizationMetricsRow />
          <OptimizationLogsTable />
          <OptimizationCorrelations />
        </div>
        <div className="flex flex-col gap-6">
          <ABTestingResults />
          <CurrentParametersList />
          <AutomatedExecutionControl />
        </div>
      </div>
    </div>
  );

  const renderBacktests = () => (
    <div className="w-full flex flex-col">
      <BacktestsHeader onRunTestClick={() => setIsRunTestOpen(true)} />
      
      <div className="mb-6 mt-6">
        <BacktestsEquityCurve />
      </div>
      <div className="space-y-6">
        {hasTestResults && (
          <BacktestResults onClear={() => { setHasTestResults(false); setLastTestData(null); }} strategyData={lastTestData} />
        )}
        <StrategyManager />
      </div>
    </div>
  );

  const renderTerminal = () => (
    <TradingTerminal />
  );

  return (
    <div className="space-y-8 flex flex-col w-full">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center w-full gap-6 pb-6">
        <nav className="flex items-center gap-2 p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-glass overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-primary text-black' : 'text-secondary hover:text-main hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('optimization')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'optimization' ? 'bg-primary text-black' : 'text-secondary hover:text-main hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            Optimization
          </button>
          <button
            onClick={() => setActiveTab('backtests')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'backtests' ? 'bg-primary text-black' : 'text-secondary hover:text-main hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            Backtests
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'terminal' ? 'bg-primary text-black' : 'text-secondary hover:text-main hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            Live Trading
          </button>
        </nav>
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-start flex-wrap">
          <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 shadow-sm ${isConnected ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            {isConnected ? 'Live Market' : 'Connecting'}
          </div>
          {/* Exchange Selector */}
          <GlassSelect
            value={activeExchange}
            onChange={setActiveExchange}
            options={(() => {
              const allOptions = [
                ...tradingConnections.filter(c => c.connected).map(c => ({ value: c.platformId, label: c.name })),
                { value: 'bybit', label: 'Bybit' },
                { value: 'binance', label: 'Binance' }
              ];
              // Deduplicate by value (platformId)
              return allOptions.filter((opt, index, self) => 
                index === self.findIndex((t) => t.value === opt.value)
              );
            })()}
            placeholder="Platform"
            className="w-32"
            searchable={false}
          />
          {/* Network Mode */}
          <button
            onClick={() => setNetworkMode(prev => prev === 'testnet' ? 'mainnet' : 'testnet')}
            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${networkMode === 'testnet' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}
          >
            {networkMode}
          </button>
        </div>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'optimization' && renderOptimization()}
      {activeTab === 'backtests' && renderBacktests()}
      {activeTab === 'terminal' && renderTerminal()}

      <NewStrategyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ExportReportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <RunOptimizationModal isOpen={isRunOptOpen} onClose={() => setIsRunOptOpen(false)} />
      <RunNewTestModal 
        isOpen={isRunTestOpen} 
        onClose={() => setIsRunTestOpen(false)} 
        onTestComplete={(data) => { setLastTestData(data); setHasTestResults(true); }}
      />
    </div>
  );
};

export default Trading;
