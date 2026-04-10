import React, { useState, useEffect, useRef } from 'react';
import TradeLogViewer from './trading/TradeLogViewer';

const colorPalette = [
  { pairBg: 'bg-orange-500/20 text-orange-500' },
  { pairBg: 'bg-blue-500/20 text-blue-500' },
  { pairBg: 'bg-purple-500/20 text-purple-500' },
  { pairBg: 'bg-emerald-500/20 text-emerald-500' },
  { pairBg: 'bg-amber-500/20 text-amber-500' },
  { pairBg: 'bg-red-500/20 text-red-500' },
  { pairBg: 'bg-pink-500/20 text-pink-500' },
  { pairBg: 'bg-indigo-500/20 text-indigo-500' },
];

const BotStatusMatrix = () => {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const fetchBots = async () => {
    try {
      const res = await fetch('/api/bots');
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((b, i) => {
          const colorIdx = i % colorPalette.length;
          const pair = b.symbol;
          const statusColors = {
            running: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
            stopped: 'bg-secondary/10 border-secondary/20 text-[var(--text-secondary)]',
            paused: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
            killed: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
            error: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
          };
          const statusDots = {
            running: 'bg-emerald-500 animate-pulse',
            stopped: 'bg-secondary',
            paused: 'bg-amber-500',
            killed: 'bg-rose-500',
            error: 'bg-rose-500',
          };
          
          return {
            id: b.id,
            name: b.strategyName,
            status: b.status,
            statusBg: statusColors[b.status] || statusColors.stopped,
            statusDot: statusDots[b.status] || statusDots.stopped,
            pairInitial: pair === 'ALL_MARKETS' ? 'G' : pair[0],
            pairBg: colorPalette[colorIdx].pairBg,
            pairName: pair === 'ALL_MARKETS' ? 'GLOBAL' : pair,
            pnlValue: b.dailyPnl || 0,
            winRate: `${b.winRate}%`,
            trades: b.totalTrades || 0,
            raw: b,
          };
        });
        setBots(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch bots', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
    const interval = setInterval(fetchBots, 10000); // Polling every 10s
    
    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);
  const ITEMS_PER_PAGE = 4;

  // Handle action function
  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`/api/bots/${id}/${action}`, { method: 'POST' });
      if (res.ok) {
        fetchBots(); // Refresh state
      } else {
        const error = await res.json();
        alert(`Failed to ${action} bot: ` + error.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [expandedLogsId, setExpandedLogsId] = useState(null);

  // Format PnL consistently
  const formatPnl = (value) => {
    const isNegative = value < 0;
    const formattedVal = Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return {
      text: `${isNegative ? '-' : '+'}$${formattedVal}`,
      colorClass: isNegative ? 'text-rose-500' : 'text-emerald-500'
    };
  };

  // Bot Actions — deploy/undeploy via TradingContext
  const toggleBotStatus = (id) => {
    const bot = bots.find(b => b.id === id);
    if (!bot) return;
    if (bot.status === 'Active') {
      // Undeploy
      deployStrategy(null);
    } else {
      // Deploy
      deployStrategy(bot.strategyRef);
    }
    setOpenMenuId(null);
  };

  const removeBot = (id) => {
    deleteStrategy(id);
    setOpenMenuId(null);
  };

  // Pagination Logic
  const totalPages = Math.ceil(bots.length / ITEMS_PER_PAGE);
  const paginatedBots = viewAll ? bots : bots.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-2xl shadow-sm overflow-hidden mt-6 flex flex-col h-full min-h-[400px] transition-all duration-300">

      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--border)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ">
        <h3 className="text-lg font-bold flex items-center gap-2 text-[var(--text-primary)]">
          <span className="material-symbols-outlined text-primary">robot_2</span>
          Bot Status Matrix
        </h3>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => {
              setViewAll(!viewAll);
              setCurrentPage(1); // Reset page when toggling
            }}
            className={`text-xs font-black transition-all px-4 py-2 rounded-xl border ${viewAll ? 'bg-primary text-black border-primary shadow-sm' : 'text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)] hover: uppercase tracking-widest'}`}
          >
            {viewAll ? 'PAGINATED VIEW' : 'VIEW ALL ALGORITHMS'}
          </button>
          <div className="flex items-center gap-2  px-4 py-2 rounded-xl border border-[var(--border)]">
            <span className="text-[10px] sm:text-[11px] font-black text-[var(--text-secondary)] tracking-widest uppercase">AUTO-REFRESH 5S</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_5s_cubic-bezier(0.4,0,0.6,1)_infinite] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          </div>
        </div>
      </div>

      {/* Table Area (Flex-1 allows it to grow if View All is clicked) */}
      <div className="overflow-x-auto flex-1 relative">
        <table className="w-full min-w-[700px] text-sm text-left">
          <thead className="bg-[var(--bg-surface)] text-[var(--text-secondary)] font-black uppercase text-[10px] tracking-widest sticky top-0 z-10 border-b border-[var(--border)]">
            <tr>
              <th className="px-6 py-4">Strategy Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Asset Pair</th>
              <th className="px-6 py-4">Current PnL</th>
              <th className="px-6 py-4">Runtime</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass/30">
            {paginatedBots.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium h-[256px]">
                  <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-secondary/30">robot_2</span>
                    <p className="text-sm text-[var(--text-secondary)] font-bold">No strategies deployed yet</p>
                    <p className="text-xs text-secondary/60">Create a strategy via Backtests → Save → Deploy to Live Trading</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedBots.map((bot) => {
                const formattedPnl = formatPnl(bot.pnlValue);

                return (
                  <tr key={bot.id} className="hover: transition-all group relative">
                    <td className="px-6 py-4 font-bold text-[var(--text-primary)]">{bot.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`w-fit inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${bot.statusBg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${bot.statusDot} ${bot.status === 'running' ? 'animate-pulse shadow-[0_0_8px_currentColor]' : ''}`}></span> {bot.status}
                        </span>
                        {(bot.status === 'error' || bot.status === 'killed') && bot.raw.errorMessage && (
                          <span className="text-rose-500/80 text-[10px] font-bold truncate max-w-[200px]" title={bot.raw.errorMessage}>
                            {bot.raw.errorMessage}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border border-[var(--border)] shadow-sm ${bot.pairBg}`}>
                          {bot.pairInitial}
                        </div>
                        <span className="font-mono text-xs font-bold text-[var(--text-primary)]">{bot.pairName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {/* PnL Value with transition effect for live updates */}
                      <span className={`font-mono font-bold text-sm transition-colors duration-500 ${formattedPnl.colorClass}`}>
                        {formattedPnl.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)] font-mono text-[11px] font-bold uppercase">{bot.runtime}</td>
                    <td className="px-6 py-4 text-right relative">

                      {/* Action Menu Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === bot.id ? null : bot.id);
                        }}
                        className={`p-2 rounded-xl transition-all border ${openMenuId === bot.id ? 'bg-primary text-black border-primary' : 'text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)] hover:'}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === bot.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-8 top-12 w-56 bg-[var(--bg-surface)] backdrop-blur-3xl border border-[var(--border)] rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col py-1.5 animate-fade-in origin-top-right text-left"
                        >
                          <div className="px-4 py-3 border-b border-[var(--border)] mb-1 ">
                            <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest truncate">{bot.name}</p>
                          </div>

                          {bot.status === 'running' ? (
                            <>
                              <button
                                onClick={() => { handleAction(bot.id, 'pause'); setOpenMenuId(null); }}
                                className="px-4 py-2.5 text-sm text-amber-500 font-semibold hover:bg-amber-500/10 flex items-center gap-2 transition-all"
                              >
                                <span className="material-symbols-outlined text-[18px]">pause_circle</span>
                                Pause Bot
                              </button>
                              <button
                                onClick={() => { handleAction(bot.id, 'stop'); setOpenMenuId(null); }}
                                className="px-4 py-2.5 text-sm text-rose-500 font-bold hover:bg-rose-500 hover:text-white flex items-center gap-2 transition-all"
                              >
                                <span className="material-symbols-outlined text-[18px]">cancel</span>
                                Terminate Bot
                              </button>
                            </>
                          ) : bot.status === 'paused' ? (
                            <button
                              onClick={() => { handleAction(bot.id, 'resume'); setOpenMenuId(null); }}
                              className="px-4 py-2.5 text-sm text-emerald-500 font-semibold hover:bg-emerald-500/10 flex items-center gap-2 transition-all"
                            >
                              <span className="material-symbols-outlined text-[18px]">play_circle</span>
                              Resume Bot
                            </button>
                          ) : null}

                          <button
                            onClick={() => { setOpenMenuId(null); setExpandedLogsId(expandedLogsId === bot.id ? null : bot.id); }}
                            className="px-4 py-2.5 text-sm text-[var(--text-primary)] font-semibold hover:  flex items-center gap-2 transition-all"
                          >
                            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                            View Detailed Logs
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {expandedLogsId && (
        <TradeLogViewer botId={expandedLogsId} onClose={() => setExpandedLogsId(null)} />
      )}

      {/* Pagination Footer */}
      {!viewAll && bots.length > 0 && (
        <div className="px-6 py-4 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto transition-all">
          <p className="text-xs text-[var(--text-secondary)] font-black uppercase tracking-widest">
            Showing <span className="text-[var(--text-primary)]">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>-
            <span className="text-[var(--text-primary)]">{Math.min(currentPage * ITEMS_PER_PAGE, bots.length)}</span> of 
            <span className="text-primary ml-1">{bots.length}</span> strategies
          </p>
          <div className="flex gap-3 items-center">

            <span className="text-[10px] font-black text-[var(--text-secondary)] tracking-widest uppercase mr-2 hidden sm:inline-block">PAGE {currentPage} / {totalPages}</span>

            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-5 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed text-[var(--text-primary)] hover:bg-primary hover:text-black border border-[var(--border)]"
            >
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">chevron_left</span> Previous</span>
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-5 py-2 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-sm hover:brightness-110"
            >
              <span className="flex items-center gap-1">Next <span className="material-symbols-outlined text-[14px]">chevron_right</span></span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotStatusMatrix;
