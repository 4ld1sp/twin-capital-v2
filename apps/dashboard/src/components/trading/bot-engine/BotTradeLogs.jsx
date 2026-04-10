import React, { useState } from 'react';
import { FileText, ShieldAlert, Brain, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const SOURCE_STYLES = {
  signal_engine: {
    icon: <Brain className="w-3 h-3" />,
    label: 'Signal Engine',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
  },
  risk_engine: {
    icon: <ShieldAlert className="w-3 h-3" />,
    label: 'Risk Engine',
    bg: 'bg-rose-500/10',
    text: 'text-rose-500',
    border: 'border-rose-500/20',
  },
};

const ACTION_STYLES = {
  BUY:           { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  SELL:          { bg: 'bg-rose-500/10',    text: 'text-rose-500' },
  HOLD:          { bg: 'bg-amber-500/10',   text: 'text-amber-500' },
  CLOSE:         { bg: 'bg-blue-500/10',    text: 'text-blue-400' },
  KILL_SWITCH:   { bg: 'bg-red-600/20',     text: 'text-red-500' },
  TRAILING_STOP: { bg: 'bg-cyan-500/10',    text: 'text-cyan-400' },
  BOT_START:     { bg: 'bg-primary/10',     text: 'text-primary' },
  ERROR:         { bg: 'bg-rose-600/20',    text: 'text-rose-600' },
};

const LOGS_PER_PAGE = 8;

const BotTradeLogs = ({ logs = [], isLoading, onRefetch }) => {
  const [page, setPage] = useState(1);
  
  // Reset to first page when logs are cleared or bot changes
  React.useEffect(() => {
    setPage(1);
  }, [logs.length === 0, logs[0]?.id]);

  const totalPages = Math.ceil(logs.length / LOGS_PER_PAGE);
  const paged = logs.slice((page - 1) * LOGS_PER_PAGE, page * LOGS_PER_PAGE);

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] rounded-3xl p-6 flex flex-col bg-bg-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[var(--text-primary)] text-sm font-black uppercase tracking-widest flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Engine Execution Logs
          {logs.length > 0 && (
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-black border border-primary/20">
              {logs.length}
            </span>
          )}
        </h3>
        <button
          onClick={onRefetch}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-[10px]  border border-[var(--border)] px-3 py-1.5 rounded-lg text-[var(--text-secondary)] font-black uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        {isLoading && logs.length === 0 ? (
          <div className="flex items-center justify-center py-12 gap-3">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-[var(--text-secondary)] font-bold">Loading logs...</span>
          </div>
        ) : paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
            <FileText className="w-8 h-8 text-secondary/20" />
            <p className="text-xs text-[var(--text-secondary)] font-bold">No execution logs yet</p>
            <p className="text-[10px] text-secondary/50 font-bold">Logs will appear once the bot executes its first cycle</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]/30">
                <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest pl-2 min-w-[100px]">Time</th>
                <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest min-w-[80px]">Action</th>
                <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest min-w-[100px]">Symbol</th>
                <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest min-w-[130px]">Trigger</th>
                <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest pr-2">Reasoning / Context</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((log) => {
                const actionStyle = ACTION_STYLES[log.action] || { bg: 'bg-[var(--bg-surface)]', text: 'text-[var(--text-secondary)]' };
                const sourceStyle = SOURCE_STYLES[log.source] || SOURCE_STYLES.signal_engine;
                const time = log.createdAt
                  ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                  : '—';

                return (
                  <tr
                    key={log.id}
                    className="border-b border-[var(--border)]/10 hover: transition-colors group"
                  >
                    <td className="py-3.5 text-[10px] font-mono text-secondary/70 pl-2 whitespace-nowrap">
                      {time}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${actionStyle.bg} ${actionStyle.text}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="text-xs font-mono font-bold text-main/90">{log.symbol ?? '—'}</span>
                      {log.price && (
                        <p className="text-[9px] text-secondary/50 font-mono">${parseFloat(log.price).toLocaleString()}</p>
                      )}
                    </td>
                    <td className="py-3.5">
                      <div className={`flex items-center gap-1.5 w-fit px-2 py-1 rounded-md text-[9px] font-black uppercase ${sourceStyle.bg} ${sourceStyle.text} border ${sourceStyle.border}`}>
                        {sourceStyle.icon}
                        <span className="hidden sm:inline">{sourceStyle.label}</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-2 max-w-[280px]">
                      {log.aiReasoning ? (
                        <p className="text-[10px] font-bold text-secondary/80 line-clamp-2 leading-relaxed" title={log.aiReasoning}>
                          {log.aiReasoning}
                        </p>
                      ) : log.errorDetails ? (
                        <p className="text-[10px] font-bold text-rose-500/70 line-clamp-2" title={log.errorDetails}>
                          ⚠ {log.errorDetails}
                        </p>
                      ) : (
                        <span className="text-[10px] text-secondary/30 font-bold">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--border)]/30">
          <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotTradeLogs;
