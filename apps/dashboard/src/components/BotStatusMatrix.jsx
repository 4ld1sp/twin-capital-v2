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
    <div className="glass-card rounded-2xl shadow-sm overflow-hidden mt-6 flex flex-col h-full min-h-[400px] transition-all duration-300">

      {/* Header */}
      <div className="px-6 py-4 border-b border-glass flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/5 dark:bg-white/5">
        <h3 className="text-lg font-bold flex items-center gap-2 text-main">
          <span className="material-symbols-outlined text-primary">robot_2</span>
          Bot Status Matrix
        </h3>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => {
              setViewAll(!viewAll);
              setCurrentPage(1); // Reset page when toggling
            }}
            className={`text-xs font-black transition-all px-4 py-2 rounded-xl border ${viewAll ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20' : 'text-secondary border-glass hover:text-main hover:bg-black/5 dark:hover:bg-white/5 uppercase tracking-widest'}`}
          >
            {viewAll ? 'PAGINATED VIEW' : 'VIEW ALL ALGORITHMS'}
          </button>
          <div className="flex items-center gap-2 bg-black/10 dark:bg-white/5 px-4 py-2 rounded-xl border border-glass">
            <span className="text-[10px] sm:text-[11px] font-black text-secondary tracking-widest uppercase">AUTO-REFRESH 5S</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_5s_cubic-bezier(0.4,0,0.6,1)_infinite] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          </div>
        </div>
      </div>

      {/* Table Area (Flex-1 allows it to grow if View All is clicked) */}
      <div className="overflow-x-auto flex-1 relative">
        <table className="w-full min-w-[700px] text-sm text-left">
          <thead className="bg-glass text-secondary font-black uppercase text-[10px] tracking-widest sticky top-0 z-10 border-b border-glass">
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
                  No active strategies found. Click + New Strategy to deploy a bot.
                </td>
              </tr>
            ) : (
              paginatedBots.map((bot) => {
                const formattedPnl = formatPnl(bot.pnlValue);

                return (
                  <tr key={bot.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-all group relative">
                    <td className="px-6 py-4 font-bold text-main">{bot.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${bot.statusBg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${bot.statusDot} ${bot.status === 'Active' ? 'animate-pulse shadow-[0_0_8px_currentColor]' : ''}`}></span> {bot.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border border-glass shadow-sm ${bot.pairBg}`}>
                          {bot.pairInitial}
                        </div>
                        <span className="font-mono text-xs font-bold text-main">{bot.pairName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {/* PnL Value with transition effect for live updates */}
                      <span className={`font-mono font-bold text-sm transition-colors duration-500 ${formattedPnl.colorClass}`}>
                        {formattedPnl.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-secondary font-mono text-[11px] font-bold uppercase">{bot.runtime}</td>
                    <td className="px-6 py-4 text-right relative">

                      {/* Action Menu Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === bot.id ? null : bot.id);
                        }}
                        className={`p-2 rounded-xl transition-all border ${openMenuId === bot.id ? 'bg-primary text-black border-primary' : 'text-secondary border-glass hover:text-main hover:bg-black/5 dark:hover:bg-white/5'}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === bot.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-8 top-12 w-56 bg-glass/95 backdrop-blur-3xl border border-glass rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col py-1.5 animate-fade-in origin-top-right text-left"
                        >
                          <div className="px-4 py-3 border-b border-glass mb-1 bg-black/5 dark:bg-white/5">
                            <p className="text-[10px] text-secondary font-black uppercase tracking-widest truncate">{bot.name}</p>
                          </div>

                          <button
                            onClick={() => toggleBotStatus(bot.id)}
                            className="px-4 py-2.5 text-sm text-main font-semibold hover:bg-primary hover:text-black flex items-center gap-2 transition-all"
                          >
                            <span className="material-symbols-outlined text-[18px]">{bot.status === 'Active' ? 'pause_circle' : 'play_circle'}</span>
                            {bot.status === 'Active' ? 'Pause Strategy' : 'Resume Strategy'}
                          </button>

                          <button
                            onClick={() => { setOpenMenuId(null); alert('Routing to detailed logs for ' + bot.name); }}
                            className="px-4 py-2.5 text-sm text-main font-semibold hover:bg-black/10 dark:hover:bg-white/10 flex items-center gap-2 transition-all"
                          >
                            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                            View Detailed Logs
                          </button>

                          <div className="h-px bg-glass my-1 mx-2"></div>

                          <button
                            onClick={() => removeBot(bot.id)}
                            disabled={bot.status === 'Active'}
                            className="px-4 py-2.5 text-sm text-rose-500 font-bold hover:bg-rose-500 hover:text-white flex items-center gap-2 transition-all disabled:opacity-20 disabled:cursor-not-allowed group/btn"
                          >
                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                            Force Close Bot
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
        <div className="px-6 py-4 bg-black/5 dark:bg-white/5 border-t border-glass flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto transition-all">
          <p className="text-xs text-secondary font-black uppercase tracking-widest">
            Showing <span className="text-main">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>-
            <span className="text-main">{Math.min(currentPage * ITEMS_PER_PAGE, bots.length)}</span> of 
            <span className="text-primary ml-1">{bots.length}</span> strategies
          </p>
          <div className="flex gap-3 items-center">

            <span className="text-[10px] font-black text-secondary tracking-widest uppercase mr-2 hidden sm:inline-block">PAGE {currentPage} / {totalPages}</span>

            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-5 py-2 glass-card rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed text-main hover:bg-primary hover:text-black border border-glass"
            >
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">chevron_left</span> Previous</span>
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-5 py-2 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:brightness-110"
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
