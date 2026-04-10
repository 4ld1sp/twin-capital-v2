import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { useApp } from '../context/AppContext';
import { useTradingData } from '../hooks/useTradingData';
import MetricCard from '../components/MetricCard';
import PerformanceAnalytics from '../components/PerformanceAnalytics';
import GlassSelect from '../components/ui/GlassSelect';
import DrawdownTracker from '../components/DrawdownTracker';
import BotStatusMatrix from '../components/BotStatusMatrix';

// Backtests Components
import BacktestsHeader from '../components/trading/BacktestsHeader';
import BacktestsEquityCurve from '../components/trading/BacktestsEquityCurve';
import BacktestResults from '../components/trading/BacktestResults';
import RunNewTestModal from '../components/trading/RunNewTestModal';

// Modal Component
import NewStrategyModal from '../components/trading/NewStrategyModal';
import ExportReportModal from '../components/trading/ExportReportModal';
// Hybrid Bot Engine UI
import BotEngineDashboard from '../components/trading/bot-engine/BotEngineDashboard';
import AgentWorkspace from '../components/trading/bot-engine/AgentWorkspace';

// Live Trading Terminal
import TradingTerminal from '../components/trading/TradingTerminal';

// Strategy Manager
import StrategyManager from '../components/trading/StrategyManager';

const Trading = () => {
  const { activeExchange, setActiveExchange, activeSymbol, livePrice, isConnected, liveTicker } = useTrading();
  const { userConnections } = useApp();
  const tradingConnections = userConnections?.trading || [];
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            <div className="w-full bg-[var(--bg-subtle)] h-1.5 rounded-full overflow-hidden border border-[var(--border)]">
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
          changeColor="text-[var(--text-secondary)]"
          visual={
            <div className="flex gap-1.5 items-end h-6">
              <div className="bg-primary/10 w-full h-2 rounded-md border border-[var(--border)]"></div>
              <div className="bg-primary/30 w-full h-4 rounded-md border border-[var(--border)]"></div>
              <div className="bg-primary/50 w-full h-3 rounded-md border border-[var(--border)]"></div>
              <div className="bg-primary/70 w-full h-5 rounded-md border border-[var(--border)]"></div>
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
        <nav className="flex items-center gap-1 border-b border-[var(--border)] overflow-x-auto w-full sm:w-auto">
          {['overview', 'bot-engine', 'quant-agent', 'backtests', 'terminal'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap flex items-center gap-1.5 ${activeTab === tab ? 'text-primary border-primary' : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'}`}
            >
              {tab === 'quant-agent' && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />}
              {tab === 'overview' ? 'Overview' : tab === 'bot-engine' ? 'Bot Engine' : tab === 'quant-agent' ? 'Quant Agent' : tab === 'backtests' ? 'Backtests' : 'Live Trading'}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-start flex-wrap">
          <div className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${isConnected ? 'text-[var(--success)] border-[var(--success)]/20 bg-[var(--success)]/5' : 'text-[var(--warning)] border-[var(--warning)]/20 bg-[var(--warning)]/5'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[var(--success)] animate-pulse-dot' : 'bg-[var(--warning)]'}`}></span>
            {isConnected ? 'Live' : 'Connecting'}
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
        </div>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'bot-engine' && <BotEngineDashboard />}
      {activeTab === 'quant-agent' && <AgentWorkspace />}
      {activeTab === 'backtests' && renderBacktests()}
      {activeTab === 'terminal' && renderTerminal()}

      <NewStrategyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <RunNewTestModal 
        isOpen={isRunTestOpen} 
        onClose={() => setIsRunTestOpen(false)} 
        onTestComplete={(data) => { setLastTestData(data); setHasTestResults(true); }}
      />
    </div>
  );
};

export default Trading;
