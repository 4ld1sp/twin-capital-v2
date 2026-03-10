import React, { useState } from 'react';
import MetricCard from '../components/MetricCard';
import PerformanceAnalytics from '../components/PerformanceAnalytics';
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
import BacktestsSubNav from '../components/trading/BacktestsSubNav';
import BacktestsEquityCurve from '../components/trading/BacktestsEquityCurve';
import BacktestsRiskProfile from '../components/trading/BacktestsRiskProfile';
import BacktestsTradeDistribution from '../components/trading/BacktestsTradeDistribution';
import BacktestsPerformanceMetrics from '../components/trading/BacktestsPerformanceMetrics';
import BacktestsQuickActions from '../components/trading/BacktestsQuickActions';

// Logs Components
import LogsHeader from '../components/trading/LogsHeader';
import LogsFilterBar from '../components/trading/LogsFilterBar';
import LogsTable from '../components/trading/LogsTable';
import LogsSystemStatus from '../components/trading/LogsSystemStatus';

// Modal Component
import NewStrategyModal from '../components/trading/NewStrategyModal';
import ExportReportModal from '../components/trading/ExportReportModal';
import RunOptimizationModal from '../components/trading/RunOptimizationModal';

// Phase 9 Optimization Components
import OptimizationCorrelations from '../components/trading/OptimizationCorrelations';

const Trading = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Optimization UI State
  const [optTab, setOptTab] = useState('equity'); // 'logs', 'equity', 'ab_testing', 'correlations'
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRunOptOpen, setIsRunOptOpen] = useState(false);

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
            <div className="w-full bg-slate-100 dark:bg-primary/5 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '68.5%' }}></div>
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
            <div className="flex gap-1 items-end h-6">
              <div className="bg-primary/20 w-full h-2 rounded-sm"></div>
              <div className="bg-primary/40 w-full h-4 rounded-sm"></div>
              <div className="bg-primary/60 w-full h-3 rounded-sm"></div>
              <div className="bg-primary/80 w-full h-5 rounded-sm"></div>
              <div className="bg-primary w-full h-6 rounded-sm"></div>
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
            <div className="w-full h-6 relative bg-red-500/5 rounded-sm overflow-hidden border border-red-500/10">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,0 L20,30 L40,15 L60,50 L80,25 L100,60 L100,0 Z" fill="rgba(239, 68, 68, 0.2)"></path>
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
            <div className="w-full h-6 relative bg-emerald-500/5 rounded-sm overflow-hidden border border-emerald-500/10">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polyline className="text-emerald-500" fill="none" points="0,80 20,70 40,75 60,40 80,45 100,10" stroke="currentColor" strokeWidth="4"></polyline>
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

  const renderOptimization = () => (
    <div className="w-full flex flex-col pt-4">
      <OptimizationHeader
        activeOptTab={optTab}
        onTabChange={setOptTab}
        onExportClick={() => setIsExportOpen(true)}
        onRunClick={() => setIsRunOptOpen(true)}
      />

      {/* Equity Curve Tab (Default) */}
      {optTab === 'equity' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column (2/3 width) */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            <BacktestEquityChart />
            <OptimizationMetricsRow />
            <OptimizationLogsTable />
            <OptimizationCorrelations />
          </div>

          {/* Right Column (1/3 width) */}
          <div className="flex flex-col gap-6">
            <ABTestingResults />
            <CurrentParametersList />
            <AutomatedExecutionControl />
          </div>
        </div>
      )}

      {/* Parameter Logs Tab */}
      {optTab === 'logs' && (
        <div className="w-full">
          <OptimizationLogsTable />
        </div>
      )}

      {/* A/B Testing Tab */}
      {optTab === 'ab_testing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ABTestingResults />
          <OptimizationMetricsRow />
        </div>
      )}

      {/* Correlations Tab */}
      {optTab === 'correlations' && (
        <div className="w-full">
          <OptimizationCorrelations />
        </div>
      )}
    </div>
  );

  const renderBacktests = () => (
    <div className="w-full flex flex-col">
      <BacktestsHeader />
      <BacktestsSubNav />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <BacktestsEquityCurve />
        <div className="flex flex-col gap-6">
          <BacktestsRiskProfile />
          <BacktestsTradeDistribution />
        </div>
      </div>
      <div className="space-y-6">
        <BacktestsPerformanceMetrics />
        <BacktestsQuickActions />
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="w-full flex flex-col mt-4">
      <LogsHeader />
      <LogsFilterBar />
      <LogsTable />
      <LogsSystemStatus />
    </div>
  );

  return (
    <div className="space-y-6 flex flex-col w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 border-b border-slate-200 dark:border-primary/10 pb-4">
        <nav className="flex items-center gap-6 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`text-sm pb-2 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'overview' ? 'font-bold text-primary border-primary' : 'font-medium text-slate-500 dark:text-slate-400 hover:text-primary border-transparent hover:border-primary/50'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('optimization')}
            className={`text-sm pb-2 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'optimization' ? 'font-bold text-primary border-primary' : 'font-medium text-slate-500 dark:text-slate-400 hover:text-primary border-transparent hover:border-primary/50'}`}
          >
            Optimization
          </button>
          <button
            onClick={() => setActiveTab('backtests')}
            className={`text-sm pb-2 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'backtests' ? 'font-bold text-primary border-primary' : 'font-medium text-slate-500 dark:text-slate-400 hover:text-primary border-transparent hover:border-primary/50'}`}
          >
            Backtests
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`text-sm pb-2 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'logs' ? 'font-bold text-primary border-primary' : 'font-medium text-slate-500 dark:text-slate-400 hover:text-primary border-transparent hover:border-primary/50'}`}
          >
            Logs
          </button>
        </nav>
        <div className="flex items-center gap-4 shrink-0">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider border border-emerald-500/20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Market
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-background-dark px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Strategy
          </button>
        </div>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'optimization' && renderOptimization()}
      {activeTab === 'backtests' && renderBacktests()}
      {activeTab === 'logs' && renderLogs()}

      <NewStrategyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ExportReportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <RunOptimizationModal isOpen={isRunOptOpen} onClose={() => setIsRunOptOpen(false)} />
    </div>
  );
};

export default Trading;
