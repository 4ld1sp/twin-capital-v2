import React, { useState, useEffect } from 'react';

const TradeLogViewer = ({ botId, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`/api/bots/${botId}/logs`);
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (err) {
        console.error('Failed to fetch logs', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [botId]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col p-4 sm:p-8 bg-black/60 backdrop-blur-sm shadow-2xl overflow-hidden">
      <div className="glass-card border border-glass rounded-[2rem] w-full max-w-5xl mx-auto bg-black/80 flex flex-col h-full shadow-[0_0_100px_rgba(0,184,217,0.1)] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-glass flex items-center justify-between shrink-0 bg-black/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-glass">
              <span className="material-symbols-outlined text-main text-2xl">receipt_long</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-main tracking-tight">AI Trade Logs</h2>
              <p className="text-secondary text-xs font-bold font-mono mt-1 flex items-center gap-2">
                ID: {botId}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-rose-500/10 text-secondary hover:text-rose-500 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 relative">
          {loading && logs.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined animate-spin text-primary text-4xl">cycle</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-secondary opacity-50 space-y-4">
              <span className="material-symbols-outlined text-6xl">hourglass_empty</span>
              <p className="font-bold text-sm">No trade logs yet</p>
            </div>
          ) : (
            logs.map((log) => {
              const isSignal = log.source === 'signal_engine';
              const isRisk = log.source === 'risk_engine';
              const isError = log.action === 'ERROR' || log.errorDetails;
              const isKillSwitch = log.action === 'KILL_SWITCH';

              const cardColor = isKillSwitch
                ? 'bg-rose-500/5 border-rose-500/30'
                : isError
                ? 'bg-rose-500/5 border-rose-500/20'
                : isSignal
                ? 'bg-primary/5 border-primary/20'
                : 'bg-amber-500/5 border-amber-500/20';

              const icon = isKillSwitch
                ? 'health_and_safety'
                : isError
                ? 'error'
                : log.action === 'BUY'
                ? 'trending_up'
                : log.action === 'SELL'
                ? 'trending_down'
                : log.action === 'HOLD'
                ? 'pause_circle'
                : log.action === 'TRAILING_STOP'
                ? 'moving'
                : 'info';

              const iconColor = isKillSwitch
                ? 'text-rose-500'
                : isError
                ? 'text-rose-500'
                : log.action === 'BUY'
                ? 'text-emerald-500'
                : log.action === 'SELL'
                ? 'text-rose-500'
                : log.action === 'HOLD'
                ? 'text-secondary'
                : log.source === 'risk_engine'
                ? 'text-amber-500'
                : 'text-primary';

              return (
                <div key={log.id} className={`p-4 rounded-2xl border ${cardColor} transition-all hover:scale-[1.01] flex flex-col md:flex-row gap-4 items-start`}>
                  
                  {/* Left Column: Icon & Time */}
                  <div className="flex sm:flex-col items-center sm:items-start gap-3 w-full sm:w-48 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-black/20 flex items-center justify-center border border-current shadow-sm ${iconColor}`}>
                        <span className="material-symbols-outlined text-sm">{icon}</span>
                      </div>
                      <span className={`text-sm font-black tracking-widest uppercase ${iconColor}`}>{log.action}</span>
                    </div>
                    <div className="text-secondary text-[10px] font-mono font-bold ml-auto sm:ml-0">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                    {/* Source Badge */}
                    <div className="hidden sm:inline-flex px-2 py-0.5 mt-2 rounded bg-black/20 border border-glass text-[9px] font-black uppercase tracking-widest text-secondary/70">
                      {isSignal ? 'Signal (AI)' : 'Risk (Hardcoded)'}
                    </div>
                  </div>

                  {/* Right Column: Reasoning & Specs */}
                  <div className="flex-1 space-y-3 min-w-0">
                    
                    {log.errorDetails && (
                      <div className="text-rose-500 text-xs font-mono bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                        Error: {log.errorDetails}
                      </div>
                    )}

                    {log.aiReasoning && (
                      <p className="text-main/90 text-[13px] leading-relaxed font-medium italic">
                        "{log.aiReasoning}"
                      </p>
                    )}

                    {/* Order Metrics row */}
                    {(log.qty || log.price || log.pnl) && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {log.qty && (
                          <div className="px-3 py-1.5 rounded-lg bg-black/20 border border-glass flex items-center gap-2">
                            <span className="text-[9px] text-secondary font-black uppercase tracking-widest">Qty</span>
                            <span className="text-xs text-main font-mono font-bold">{log.qty}</span>
                          </div>
                        )}
                        {log.price && (
                          <div className="px-3 py-1.5 rounded-lg bg-black/20 border border-glass flex items-center gap-2">
                            <span className="text-[9px] text-secondary font-black uppercase tracking-widest">Price</span>
                            <span className="text-xs text-main font-mono font-bold">{log.price}</span>
                          </div>
                        )}
                        {log.pnl && (
                          <div className="px-3 py-1.5 rounded-lg bg-black/20 border border-glass flex items-center gap-2">
                            <span className="text-[9px] text-secondary font-black uppercase tracking-widest">Realized PnL</span>
                            <span className={`text-xs font-mono font-bold ${log.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{log.pnl >= 0 ? '+' : ''}{parseFloat(log.pnl).toFixed(2)}</span>
                          </div>
                        )}
                        {log.trailingStop && (
                          <div className="px-3 py-1.5 rounded-lg bg-black/20 border border-glass flex items-center gap-2">
                            <span className="text-[9px] text-secondary font-black uppercase tracking-widest">Trailing Trigger</span>
                            <span className="text-xs text-amber-500 font-mono font-bold">{log.trailingStop}</span>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                  
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeLogViewer;
