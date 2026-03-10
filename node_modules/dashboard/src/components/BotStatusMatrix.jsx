import React, { useState, useEffect, useRef } from 'react';

// Generates dummy runtime string
const getBaseRuntime = (id) => {
  const days = Math.floor(Math.random() * 30);
  const hours = Math.floor(Math.random() * 24);
  return `${days}d ${hours}h`;
};

const initialStrategies = [
  { id: 1, name: 'BTC Momentum', status: 'Active', statusBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500', statusDot: 'bg-emerald-500', pairInitial: 'B', pairBg: 'bg-orange-500/20 text-orange-500', pairName: 'BTC/USDT', pnlValue: 1240.00, runtime: getBaseRuntime(1) },
  { id: 2, name: 'ETH Pullback', status: 'Active', statusBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500', statusDot: 'bg-emerald-500', pairInitial: 'E', pairBg: 'bg-blue-500/20 text-blue-500', pairName: 'ETH/USDT', pnlValue: -450.20, runtime: getBaseRuntime(2) },
  { id: 3, name: 'SOL Breakout', status: 'Paused', statusBg: 'bg-amber-500/10 border-amber-500/20 text-amber-500', statusDot: 'bg-amber-500', pairInitial: 'S', pairBg: 'bg-purple-500/20 text-purple-500', pairName: 'SOL/USDC', pnlValue: 890.15, runtime: getBaseRuntime(3) },
  { id: 4, name: 'Macro Hedge', status: 'Active', statusBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500', statusDot: 'bg-emerald-500', pairInitial: 'M', pairBg: 'bg-slate-500/20 text-slate-400', pairName: 'XAU/USD', pnlValue: 3410.00, runtime: getBaseRuntime(4) },
  { id: 5, name: 'DOGE Scalper', status: 'Active', statusBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500', statusDot: 'bg-emerald-500', pairInitial: 'D', pairBg: 'bg-yellow-500/20 text-yellow-500', pairName: 'DOGE/USDT', pnlValue: 120.50, runtime: getBaseRuntime(5) },
  { id: 6, name: 'LINK Oracle Arbitrage', status: 'Paused', statusBg: 'bg-amber-500/10 border-amber-500/20 text-amber-500', statusDot: 'bg-amber-500', pairInitial: 'L', pairBg: 'bg-indigo-500/20 text-indigo-500', pairName: 'LINK/USDT', pnlValue: -80.20, runtime: getBaseRuntime(6) },
  { id: 7, name: 'AVAX Avalanche', status: 'Active', statusBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500', statusDot: 'bg-emerald-500', pairInitial: 'A', pairBg: 'bg-red-500/20 text-red-500', pairName: 'AVAX/USDT', pnlValue: 450.80, runtime: getBaseRuntime(7) },
  { id: 8, name: 'XRP Swing', status: 'Stopped', statusBg: 'bg-rose-500/10 border-rose-500/20 text-rose-500', statusDot: 'bg-rose-500', pairInitial: 'X', pairBg: 'bg-slate-800 text-white', pairName: 'XRP/USDT', pnlValue: -1200.00, runtime: getBaseRuntime(8) },
  { id: 9, name: 'ADA Staking Hedge', status: 'Active', statusBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500', statusDot: 'bg-emerald-500', pairInitial: 'A', pairBg: 'bg-blue-400/20 text-blue-400', pairName: 'ADA/USDT', pnlValue: 55.40, runtime: getBaseRuntime(9) },
  { id: 10, name: 'DOT Polka Trend', status: 'Active', statusBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500', statusDot: 'bg-emerald-500', pairInitial: 'D', pairBg: 'bg-pink-500/20 text-pink-500', pairName: 'DOT/USDT', pnlValue: 210.00, runtime: getBaseRuntime(10) },
  { id: 11, name: 'UNI Dex Arb', status: 'Paused', statusBg: 'bg-amber-500/10 border-amber-500/20 text-amber-500', statusDot: 'bg-amber-500', pairInitial: 'U', pairBg: 'bg-pink-400/20 text-pink-400', pairName: 'UNI/USDT', pnlValue: 0.00, runtime: getBaseRuntime(11) },
  { id: 12, name: 'MATIC L2 Scalp', status: 'Active', statusBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500', statusDot: 'bg-emerald-500', pairInitial: 'M', pairBg: 'bg-purple-600/20 text-purple-600', pairName: 'MATIC/USDT', pnlValue: 340.20, runtime: getBaseRuntime(12) },
];

const BotStatusMatrix = () => {
  const [bots, setBots] = useState(initialStrategies);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);
  const ITEMS_PER_PAGE = 4;

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time PnL Simulation (only updates Active bots)
  useEffect(() => {
    const interval = setInterval(() => {
      setBots(currentBots => currentBots.map(bot => {
        if (bot.status === 'Active') {
          // Simulate a small market tick (-$5 to +$5)
          const volatility = (Math.random() * 10) - 5;
          return { ...bot, pnlValue: bot.pnlValue + volatility };
        }
        return bot;
      }));
    }, 5000); // 5 seconds match the UI label
    return () => clearInterval(interval);
  }, []);

  // Format PnL consistently
  const formatPnl = (value) => {
    const isNegative = value < 0;
    const formattedVal = Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return {
      text: `${isNegative ? '-' : '+'}$${formattedVal}`,
      colorClass: isNegative ? 'text-rose-500' : 'text-emerald-500' // Using rose-500 for reds
    };
  };

  // Bot Actions
  const toggleBotStatus = (id) => {
    setBots(current => current.map(bot => {
      if (bot.id === id) {
        const isCurrentlyActive = bot.status === 'Active';
        return {
          ...bot,
          status: isCurrentlyActive ? 'Paused' : 'Active',
          statusBg: isCurrentlyActive ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
          statusDot: isCurrentlyActive ? 'bg-amber-500' : 'bg-emerald-500'
        };
      }
      return bot;
    }));
    setOpenMenuId(null);
  };

  const removeBot = (id) => {
    // Only allow removing paused/stopped bots for safety simulation
    setBots(current => current.filter(bot => bot.id !== id));
    setOpenMenuId(null);

    // Adjust pagination if we delete the last item on a page
    const remainingItems = bots.length - 1;
    const maxPages = Math.ceil(remainingItems / ITEMS_PER_PAGE);
    if (currentPage > maxPages && maxPages > 0) {
      setCurrentPage(maxPages);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(bots.length / ITEMS_PER_PAGE);
  const paginatedBots = viewAll ? bots : bots.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-primary/10 rounded-xl shadow-sm overflow-hidden mt-6 flex flex-col h-full min-h-[400px]">

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-primary/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-transparent">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">robot_2</span>
          Bot Status Matrix
        </h3>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => {
              setViewAll(!viewAll);
              setCurrentPage(1); // Reset page when toggling
            }}
            className={`text-sm font-semibold transition-colors px-3 py-1.5 rounded-lg border ${viewAll ? 'bg-primary/10 text-primary border-primary/20' : 'text-slate-500 border-transparent hover:bg-slate-100 dark:hover:bg-primary/5 hover:text-slate-700 dark:hover:text-primary'}`}
          >
            {viewAll ? 'View Paginated' : 'View All Algorithms'}
          </button>
          <div className="flex items-center gap-2 bg-background-dark/50 dark:bg-black/20 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-primary/10">
            <span className="text-[10px] sm:text-xs font-mono font-semibold text-slate-500 tracking-wider uppercase">Auto-refresh 5s</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_5s_cubic-bezier(0.4,0,0.6,1)_infinite] shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
          </div>
        </div>
      </div>

      {/* Table Area (Flex-1 allows it to grow if View All is clicked) */}
      <div className="overflow-x-auto flex-1 relative">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-primary/5 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3">Strategy Name</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Asset Pair</th>
              <th className="px-6 py-3">Current PnL</th>
              <th className="px-6 py-3">Runtime</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-primary/10">
            {paginatedBots.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium h-[256px]">
                  No active strategies found. Click + New Strategy to deploy a bot.
                </td>
              </tr>
            ) : (
              paginatedBots.map((bot) => {
                const formattedPnl = formatPnl(bot.pnlValue);

                return (
                  <tr key={bot.id} className="hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors group relative">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{bot.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border transition-colors duration-300 ${bot.statusBg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${bot.statusDot} ${bot.status === 'Active' ? 'animate-pulse' : ''}`}></span> {bot.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${bot.pairBg}`}>
                          {bot.pairInitial}
                        </div>
                        <span className="font-mono text-xs font-semibold">{bot.pairName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {/* PnL Value with transition effect for live updates */}
                      <span className={`font-mono font-bold text-sm transition-colors duration-500 ${formattedPnl.colorClass}`}>
                        {formattedPnl.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{bot.runtime}</td>
                    <td className="px-6 py-4 text-right relative">

                      {/* Action Menu Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === bot.id ? null : bot.id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${openMenuId === bot.id ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:text-primary hover:bg-primary/10'}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === bot.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-8 top-10 w-48 bg-background-dark/95 backdrop-blur-md border border-primary/20 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col py-1 animate-fade-in origin-top-right text-left"
                        >
                          <div className="px-3 py-2 border-b border-primary/10 mb-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{bot.name}</p>
                          </div>

                          <button
                            onClick={() => toggleBotStatus(bot.id)}
                            className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-primary/20 flex items-center gap-2 text-left transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">{bot.status === 'Active' ? 'pause_circle' : 'play_circle'}</span>
                            {bot.status === 'Active' ? 'Pause Strategy' : 'Resume Strategy'}
                          </button>

                          <button
                            onClick={() => { setOpenMenuId(null); alert('Routing to detailed logs for ' + bot.name); }}
                            className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 flex items-center gap-2 text-left transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                            View Detailed Logs
                          </button>

                          <div className="h-px bg-primary/10 my-1 mx-2"></div>

                          <button
                            onClick={() => removeBot(bot.id)}
                            disabled={bot.status === 'Active'} // Prevent closing active bots
                            className="px-4 py-2 text-sm text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 text-left transition-colors disabled:opacity-30 disabled:cursor-not-allowed group/btn"
                            title={bot.status === 'Active' ? "You must pause the strategy before liquidating." : "Liquidate positions and close bot"}
                          >
                            <span className="material-symbols-outlined text-[16px]">cancel</span>
                            Force Close Bot
                            {bot.status === 'Active' && <span className="absolute right-2 opacity-0 group-hover/btn:opacity-100 text-[10px] bg-background-dark px-1 rounded">Pause First</span>}
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

      {/* Pagination Footer */}
      {!viewAll && bots.length > 0 && (
        <div className="px-6 py-4 bg-slate-50 dark:bg-primary/5 border-t border-slate-200 dark:border-primary/10 flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto">
          <p className="text-xs text-slate-500 font-semibold">
            Showing <span className="text-slate-800 dark:text-slate-300">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-slate-800 dark:text-slate-300">{Math.min(currentPage * ITEMS_PER_PAGE, bots.length)}</span> of <span className="text-primary">{bots.length}</span> strategies
          </p>
          <div className="flex gap-2 items-center">

            <span className="text-[10px] font-mono text-slate-500 mr-2 hidden sm:inline-block">PAGE {currentPage} / {totalPages}</span>

            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 px-3 border border-slate-200 dark:border-primary/20 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-primary/20 hover:text-primary dark:disabled:hover:bg-transparent"
            >
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">chevron_left</span> Prev</span>
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 px-3 border border-slate-200 dark:border-primary/20 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white dark:bg-primary/10 text-slate-800 dark:text-primary hover:bg-slate-100 dark:hover:bg-primary/20 dark:disabled:bg-transparent dark:disabled:border-primary/20"
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
