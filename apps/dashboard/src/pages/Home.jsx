import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrans } from '../context/LanguageContext';
import { useTradingData } from '../hooks/useTradingData';
import { useApp } from '../context/AppContext';
import {
  TrendingUp, TrendingDown, Bot, Users, Zap, ArrowRight,
  DollarSign, Activity, BarChart3, Send, Workflow, Rocket,
  MessageSquare, BrainCircuit, AppWindow, CheckCircle2, Clock
} from 'lucide-react';

export default function Home() {
  const t = useTrans();
  const navigate = useNavigate();
  const { totalEquity, unrealizedPnl, totalRealizedPnl, winrate, positions, isLoading, pnlTimeseries } = useTradingData();
  const { userConnections } = useApp();

  const activeBots = 0;
  const socialAccounts = userConnections?.social?.length || 0;

  const fmt = (val) => `$${Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">{t('home.title')}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t('home.subtitle')}</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={<DollarSign className="w-4 h-4" />} label={t('home.totalRevenue')} value={isLoading ? '...' : fmt(totalEquity)} sub={`${positions.length} positions`} />
        <KpiCard icon={<Bot className="w-4 h-4" />} label={t('home.activeBots')} value={String(activeBots)} sub={totalRealizedPnl >= 0 ? `+${fmt(totalRealizedPnl)}` : `-${fmt(totalRealizedPnl)}`} />
        <KpiCard icon={<Users className="w-4 h-4" />} label={t('home.socialReach')} value={String(socialAccounts)} sub={`${socialAccounts} platforms`} />
        <KpiCard icon={<Zap className="w-4 h-4" />} label={t('home.aiAgents')} value="3" sub="2 active, 1 standby" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Trading Summary */}
        <Card>
          <CardHeader icon={<Activity className="w-4 h-4 text-[var(--success)]" />} title={t('home.tradingSummary')} action={{ label: t('home.viewAll'), onClick: () => navigate('/trading') }} />
          <div className="space-y-0 mt-3">
            <MetricRow label={t('home.pnlToday')} value={isLoading ? '...' : fmt(unrealizedPnl)} positive={unrealizedPnl >= 0} />
            <MetricRow label="Total Equity" value={isLoading ? '...' : fmt(totalEquity)} positive={true} />
            <MetricRow label={t('home.winrate')} value={isLoading ? '...' : `${(winrate * 100).toFixed(1)}%`} positive={winrate > 0.5} />
          </div>
          <MiniPnlBar data={pnlTimeseries} />
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader icon={<Send className="w-4 h-4 text-[var(--info)]" />} title={t('home.socialSummary')} action={{ label: t('home.viewAll'), onClick: () => navigate('/media') }} />
          <div className="space-y-0 mt-3">
            <MetricRow label={t('home.postsScheduled')} value="0" />
            <MetricRow label={t('home.engagementRate')} value="--" />
            <MetricRow label={t('home.followersGrowth')} value={`${socialAccounts} connected`} />
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">Connect social platforms in Settings to see analytics</p>
        </Card>

        {/* AI Agents */}
        <Card>
          <CardHeader icon={<Bot className="w-4 h-4 text-[var(--warning)]" />} title={t('home.agentStatus')} />
          <div className="mt-3 space-y-0">
            <AgentRow name="QuantAgent" status="active" label={t('home.online')} />
            <AgentRow name="CS Agent" status="soon" label={t('home.comingSoon')} />
            <AgentRow name="IT Consultant" status="soon" label={t('home.comingSoon')} />
            <AgentRow name="WebApp Builder" status="soon" label={t('home.comingSoon')} />
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader icon={<Rocket className="w-4 h-4 text-primary" />} title={t('home.quickActions')} />
          <div className="mt-3 space-y-1.5">
            <QuickAction icon={<Bot className="w-4 h-4" />} label={t('home.deployBot')} onClick={() => navigate('/trading')} />
            <QuickAction icon={<Send className="w-4 h-4" />} label={t('home.createPost')} onClick={() => navigate('/media')} />
            <QuickAction icon={<Workflow className="w-4 h-4" />} label={t('home.newWorkflow')} disabled />
            <QuickAction icon={<BarChart3 className="w-4 h-4" />} label="View Analytics" onClick={() => navigate('/dashboard')} />
          </div>
        </Card>
      </div>

      {/* Activity */}
      <Card>
        <CardHeader icon={<Clock className="w-4 h-4 text-[var(--text-tertiary)]" />} title={t('home.activityFeed')} />
        <p className="text-sm text-[var(--text-tertiary)] text-center py-8">{t('home.noActivity')}</p>
      </Card>
    </div>
  );
}

function Card({ children }) {
  return <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-5 transition-colors hover:border-[var(--border-hover)]">{children}</div>;
}

function CardHeader({ icon, title, action }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">{title}</h3>
      </div>
      {action && (
        <button onClick={action.onClick} className="text-xs text-primary hover:text-primary-hover flex items-center gap-1 transition-colors">
          {action.label} <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

function KpiCard({ icon, label, value, sub }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4 transition-colors hover:border-[var(--border-hover)]">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[var(--text-tertiary)]">{icon}</span>
        <span className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-xl font-semibold text-[var(--text-primary)] font-mono">{value}</div>
      <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{sub}</div>
    </div>
  );
}

function MetricRow({ label, value, positive }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0">
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <span className={`text-sm font-medium font-mono ${positive === undefined ? 'text-[var(--text-primary)]' : positive ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
        {value}
      </span>
    </div>
  );
}

function AgentRow({ name, status, label }) {
  const dot = status === 'active' ? 'bg-[var(--success)]' : 'bg-[var(--text-tertiary)]';
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0">
      <span className="text-sm text-[var(--text-primary)]">{name}</span>
      <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
        <span className={`w-1.5 h-1.5 rounded-full ${dot} ${status === 'active' ? 'animate-pulse-dot' : ''}`} />
        {label}
      </span>
    </div>
  );
}

function QuickAction({ icon, label, onClick, disabled }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors ${
        disabled ? 'text-[var(--text-tertiary)] cursor-not-allowed' : 'text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
      }`}
    >
      <span className={disabled ? 'text-[var(--text-tertiary)]' : 'text-primary'}>{icon}</span>
      <span className="text-sm">{label}</span>
      {disabled && <span className="ml-auto text-[10px] text-[var(--text-tertiary)]">Soon</span>}
      {!disabled && <ArrowRight className="w-3 h-3 ml-auto text-[var(--text-tertiary)]" />}
    </button>
  );
}

function MiniPnlBar({ data }) {
  if (!data || data.length === 0) return <p className="text-xs text-[var(--text-tertiary)] mt-3">No P&L data yet</p>;
  const max = Math.max(...data.map(d => Math.abs(d.pnl || 0)), 1);
  return (
    <div className="flex items-end gap-px h-8 w-full mt-3">
      {data.slice(-14).map((d, i) => {
        const h = Math.max(4, (Math.abs(d.pnl || 0) / max) * 100);
        return (
          <div
            key={i}
            className={`flex-1 rounded-sm ${(d.pnl || 0) >= 0 ? 'bg-[var(--success)]/40' : 'bg-[var(--danger)]/40'}`}
            style={{ height: `${h}%` }}
            title={`${d.date}: ${d.pnl >= 0 ? '+' : ''}$${(d.pnl || 0).toFixed(2)}`}
          />
        );
      })}
    </div>
  );
}
