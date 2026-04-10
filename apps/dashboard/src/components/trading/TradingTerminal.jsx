import React, { useState, useEffect } from 'react';
import { useTrading } from '../../context/TradingContext';
import { getAccountBalance, getPositions, getActiveOrders, getOrderHistory, getClosedPnl, placeOrder, cancelOrder, getSymbols } from '../../services/exchangeService';
import GlassSelect from '../ui/GlassSelect';
import DeployBotModal from './DeployBotModal';

const TradingTerminal = () => {
  const { activeExchange, networkMode, activeSymbol, setActiveSymbol, livePrice, liveTicker, isConnected, activeStrategy } = useTrading();

  const [orderType, setOrderType] = useState('limit');
  const [orderSide, setOrderSide] = useState('buy');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('0.10');
  const [leverage, setLeverage] = useState(10);
  const [tpPrice, setTpPrice] = useState('');
  const [slPrice, setSlPrice] = useState('');
  const [trailingStop, setTrailingStop] = useState(false);
  const [trailingDistance, setTrailingDistance] = useState('0.5');
  const [partialTp, setPartialTp] = useState(false);
  const [partialTpLevels, setPartialTpLevels] = useState([{ pct: '50', price: '' }, { pct: '50', price: '' }]);
  const [activeSection, setActiveSection] = useState('positions');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aiTradingMode, setAiTradingMode] = useState(false);

  // Exchange data state
  const [balance, setBalance] = useState(null);
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderHistoryList, setOrderHistoryList] = useState([]);
  const [closedPnlList, setClosedPnlList] = useState([]);
  const [availableSymbols, setAvailableSymbols] = useState([]);
  const [exchangeError, setExchangeError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pnlPage, setPnlPage] = useState(1);
  const historyPerPage = 10;
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderConfirm, setOrderConfirm] = useState(null);
  const [orderResult, setOrderResult] = useState(null);
  const consecutiveFailures = React.useRef(0);
  const [activeBot, setActiveBot] = useState(null);
  const [showDeployModal, setShowDeployModal] = useState(false);

  // Load exchange data and active bots
  useEffect(() => {
    const loadData = async () => {
      // 1. Load bots
      try {
        const botsRes = await fetch('/api/bots');
        if (botsRes.ok) {
          const botsData = await botsRes.json();
          // Select most relevant bot for the active symbol (exclude permanently terminal states)
          const symbolBots = botsData.filter(b => b.symbol === activeSymbol && ['running', 'paused', 'error', 'stopped'].includes(b.status));
          if (symbolBots.length > 0) {
            const priority = ['running', 'paused', 'error', 'stopped'];
            symbolBots.sort((a, b) => {
              const statusDiff = priority.indexOf(a.status) - priority.indexOf(b.status);
              if (statusDiff !== 0) return statusDiff;
              // If same status, newest first
              return new Date(b.createdAt) - new Date(a.createdAt);
            });
            setActiveBot(symbolBots[0]);
          } else {
            setActiveBot(null);
          }
        }
      } catch (err) {
        console.error('Failed to load bots:', err);
      }

      // 2. Load exchange data
      const [balRes, posRes, ordRes, histRes, pnlRes] = await Promise.all([
        getAccountBalance(activeExchange),
        getPositions(activeExchange),
        getActiveOrders(activeExchange),
        getOrderHistory(activeExchange),
        getClosedPnl(activeExchange),
      ]);

      // Handle Balance
      if (balRes.data) {
        setBalance(balRes.data);
        setExchangeError(null);
        consecutiveFailures.current = 0;
      } else if (balRes.error) {
        // Only show error if it persists for 3 attempts (graceful failure)
        consecutiveFailures.current += 1;
        if (consecutiveFailures.current >= 3) {
          setExchangeError(balRes.error);
        }
        console.warn(`[Trading] Balance fetch failed (Attempt ${consecutiveFailures.current}):`, balRes.error);
      }

      // Handle other sections (persist old data on error)
      if (!posRes.error) setPositions(posRes.list);
      if (!ordRes.error) setOrders(ordRes.list);
      if (!histRes.error) setOrderHistoryList(histRes.list);
      if (!pnlRes.error) setClosedPnlList(pnlRes.list);
    };

    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [activeExchange]);

  // Load available symbols
  useEffect(() => {
    getSymbols(activeExchange, networkMode).then(syms => {
      if (syms.length) setAvailableSymbols(syms);
    });
  }, [activeExchange, networkMode]);

  // Sync price to input
  useEffect(() => {
    if (livePrice && orderType !== 'market') {
      setPrice(Number(livePrice).toFixed(2));
    }
  }, [activeSymbol]);

  const formatPrice = (p) => {
    const num = parseFloat(p);
    if (isNaN(num)) return '$0.00';
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatBalance = (val, maxDecimals = 4) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '0';
    if (num === 0) return '0';
    // For smaller values, show more decimals. For larger values, show less.
    const decimals = num > 100 ? 2 : num > 1 ? 4 : maxDecimals;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: decimals });
  };

  const handlePlaceOrder = () => {
    // Show confirmation dialog before placing order on mainnet
    setOrderConfirm({
      symbol: activeSymbol,
      side: orderSide,
      type: orderType,
      price: orderType !== 'market' ? price : 'Market',
      qty: quantity,
      tp: tpPrice,
      sl: slPrice,
    });
  };

  const confirmAndPlaceOrder = async () => {
    if (!orderConfirm) return;
    setIsPlacingOrder(true);
    setOrderConfirm(null);
    
    const result = await placeOrder({
      symbol: activeSymbol,
      side: orderSide,
      type: orderType,
      price: orderType !== 'market' ? price : undefined,
      qty: quantity,
      tp: tpPrice || undefined,
      sl: slPrice || undefined,
    }, activeExchange);

    setIsPlacingOrder(false);
    setOrderResult(result);
    setTimeout(() => setOrderResult(null), 5000);

    // Refresh data if success
    if (result.success) {
      const [ord, hist] = await Promise.all([
        getActiveOrders(activeExchange),
        getOrderHistory(activeExchange),
      ]);
      setOrders(ord?.list || []);
      setOrderHistoryList(hist?.list || []);
    }
  };

  const handleCancelOrder = async (order) => {
    if (!confirm(`Cancel ${order.side} ${order.symbol} order for ${order.qty}?`)) return;
    const result = await cancelOrder(activeExchange, {
      symbol: order.symbol,
      orderId: order.id,
    });
    if (result.success) {
      setOrders(prev => prev.filter(o => o.id !== order.id));
    } else {
      alert(`Failed to cancel: ${result.message}`);
    }
  };

  const handleDeployAIStrategy = async (config) => {
    try {
      const res = await fetch('/api/bots/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyName: config.strategyName || config.name || "Custom Strategy",
          strategyScript: config.script || `// Auto-generated script for ${config.symbol}\nstrategy("Auto", overlay=true)\nif close > open\n    strategy.entry("Long", strategy.long)\n`,
          symbol: config.symbol,
          exchange: activeExchange,
          networkMode: config.networkMode,
          signalInterval: config.signalInterval,
          riskInterval: config.riskInterval,
          leverage: config.leverage,
          maxDailyLossPct: config.maxDailyLossPct,
          maxPositions: config.maxPositions,
          maxTradesPerDay: config.maxTradesPerDay,
          trailingStopActivationPct: config.trailingStopActivationPct,
          trailingStopCallbackPct: config.trailingStopCallbackPct,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to deploy bot');
      
      alert(data.message || 'Bot Deployed Successfully!');
      setShowDeployModal(false);
      
      // Auto reload bots list immediately to show the newly deployed bot
      const botsRes = await fetch('/api/bots');
      if (botsRes.ok) {
        const botsData = await botsRes.json();
        const symbolBots = botsData.filter(b => b.symbol === activeSymbol && ['running', 'paused', 'error'].includes(b.status));
        if (symbolBots.length > 0) setActiveBot(symbolBots[0]);
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const displayPrice = livePrice
    ? '$' + Number(livePrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—';

  const change24h = liveTicker?.price24hPcnt
    ? (parseFloat(liveTicker.price24hPcnt) * 100).toFixed(2) + '%'
    : null;

  return (
    <div className="w-full flex flex-col gap-6 pt-4">
      {/* Top Bar */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] rounded-3xl p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-[100] !overflow-visible">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">currency_bitcoin</span>
            <div>
              <h2 className="text-[var(--text-primary)] text-xl font-black tracking-tight">{activeSymbol}</h2>
              <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest">{activeExchange} {networkMode === 'testnet' ? '(Testnet)' : 'Unified Trading'}</p>
            </div>
          </div>
          <div className="h-10 w-px bg-[var(--bg-surface)] mx-2"></div>
          <div>
            <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest">Mark Price</p>
            <div className="flex items-center gap-2">
              <p className="text-[var(--text-primary)] text-xl font-black tracking-tight">{displayPrice}</p>
              {change24h && (
                <span className={`text-xs font-black ${parseFloat(change24h) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {parseFloat(change24h) >= 0 ? '+' : ''}{change24h}
                </span>
              )}
            </div>
          </div>
          {liveTicker?.highPrice24h && (
            <>
              <div className="h-10 w-px bg-[var(--bg-surface)] mx-2 hidden lg:block"></div>
              <div className="hidden lg:flex gap-4">
                <div>
                  <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-widest">24h High</p>
                  <p className="text-emerald-500 text-sm font-black">{formatPrice(liveTicker.highPrice24h)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-widest">24h Low</p>
                  <p className="text-rose-500 text-sm font-black">{formatPrice(liveTicker.lowPrice24h)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-widest">24h Vol</p>
                  <p className="text-[var(--text-primary)] text-sm font-black">{parseFloat(liveTicker.volume24h || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${isConnected ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isConnected ? 'text-emerald-500' : 'text-amber-500'}`}>
              {isConnected ? 'Live' : 'Connecting'}
            </span>
          </div>
          {activeStrategy && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <span className="material-symbols-outlined text-violet-400 text-sm">smart_toy</span>
              <span className="text-violet-400 text-[10px] font-black uppercase tracking-widest truncate max-w-[120px]">{activeStrategy.name}</span>
            </div>
          )}
          <GlassSelect
            value={activeSymbol}
            onChange={setActiveSymbol}
            options={availableSymbols.length > 0 ? availableSymbols.map(s => ({ value: s.symbol, label: s.symbol })) : ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'BNBUSDT']}
            placeholder="Select Symbol"
            className="w-40"
            searchable={true}
          />
        </div>
      </div>      {/* AI Trading Mode Banner */}
      {activeBot ? (
        <div className={`bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden ${
          activeBot.status === 'running' 
            ? 'border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
            : activeBot.status === 'paused'
            ? 'border-amber-500/30 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
            : activeBot.status === 'error' || activeBot.status === 'killed'
            ? 'border-rose-500/30 bg-rose-500/5 shadow-[0_0_20px_rgba(244,63,94,0.1)]'
            : 'border-[var(--border)] '
        }`}>
          <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] rounded-full pointer-events-none ${
             activeBot.status === 'running' ? 'bg-emerald-500/10' :
             activeBot.status === 'paused' ? 'bg-amber-500/10' :
             activeBot.status === 'error' || activeBot.status === 'killed' ? 'bg-rose-500/10' : 'bg-white/5'
          }`}></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm relative ${
               activeBot.status === 'running' ? 'bg-emerald-500/10 border-emerald-500/20' :
               activeBot.status === 'paused' ? 'bg-amber-500/10 border-amber-500/20' :
               activeBot.status === 'error' || activeBot.status === 'killed' ? 'bg-rose-500/10 border-rose-500/20' : ' border-[var(--border)]'
            }`}>
              <span className={`material-symbols-outlined text-xl ${
                 activeBot.status === 'running' ? 'text-emerald-500' :
                 activeBot.status === 'paused' ? 'text-amber-500' :
                 activeBot.status === 'error' || activeBot.status === 'killed' ? 'text-rose-500' : 'text-[var(--text-secondary)]'
              }`}>
                {activeBot.status === 'error' || activeBot.status === 'killed' ? 'warning' : 'smart_toy'}
              </span>
              {activeBot.status === 'running' && (
                <>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping"></span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black"></span>
                </>
              )}
            </div>
            <div>
              <p className="text-[var(--text-primary)] text-sm font-black tracking-tight">{activeBot.strategyName}</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded w-fit ${
                   activeBot.status === 'running' ? 'text-emerald-500 bg-emerald-500/10' :
                   activeBot.status === 'paused' ? 'text-amber-500 bg-amber-500/10' :
                   activeBot.status === 'error' ? 'text-rose-500 bg-rose-500/10' :
                   activeBot.status === 'killed' ? 'text-rose-500 bg-rose-500/10' :
                   'text-[var(--text-secondary)] '
                }`}>
                  {activeBot.status}
                </span>

                {(activeBot.status === 'error' || activeBot.status === 'killed') && activeBot.errorMessage && (
                  <span className="text-rose-500/80 text-[10px] font-bold truncate max-w-[200px]" title={activeBot.errorMessage}>
                    {activeBot.errorMessage}
                  </span>
                )}
                
                {activeBot.status !== 'error' && activeBot.status !== 'killed' && (
                  <>
                    <span className="text-secondary/60 text-[10px] hidden sm:block">•</span>
                    <span className="text-[var(--text-secondary)] text-[10px] font-bold font-mono">Max Loss: {activeBot.maxDailyLossPct}%</span>
                    <span className="text-secondary/60 text-[10px] hidden sm:block">•</span>
                    <span className="text-[var(--text-secondary)] text-[10px] font-bold font-mono">Trades: {activeBot.dailyTradeCount}/{activeBot.maxTradesPerDay}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 relative z-10 flex-wrap">
            <a href="/bots" className="flex-1 md:flex-none px-5 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest hover:text-[var(--text-primary)] hover:bg-white/5 transition-all text-center">
              View Logs
            </a>
            {activeBot.status === 'running' ? (
              <button
                onClick={async () => {
                  if (confirm('Are you sure you want to stop this bot?')) {
                    await fetch(`/api/bots/${activeBot.id}/stop`, { method: 'POST' });
                  }
                }}
                className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all flex justify-center items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">cancel</span>
                Stop
              </button>
            ) : activeBot.status === 'paused' ? (
              <button
                onClick={async () => {
                  await fetch(`/api/bots/${activeBot.id}/resume`, { method: 'POST' });
                }}
                className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex justify-center items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                Resume
              </button>
            ) : null}
          </div>
        </div>
      ) : activeStrategy ? (
         <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-primary/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between bg-primary/5 gap-4">
           <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary text-xl">model_training</span>
            </div>
            <div>
              <p className="text-[var(--text-primary)] text-sm font-black tracking-tight">{activeStrategy.name}</p>
              <p className="text-[var(--text-secondary)] text-[10px] font-bold">Ready to deploy on {activeSymbol}</p>
            </div>
           </div>
           <button onClick={() => setShowDeployModal(true)} className="px-5 py-2.5 rounded-xl bg-primary text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-primary/20 transition-all flex justify-center items-center gap-2">
              <span className="material-symbols-outlined text-sm">rocket_launch</span>
              Deploy Strategy
           </button>
         </div>
      ) : null}

      {/* Main Layout */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Order Entry Panel (Sticky Left) */}
        <div className="w-full xl:w-[380px] shrink-0 sticky top-24">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] rounded-3xl p-6">
          <h3 className="text-[var(--text-primary)] text-sm font-black uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">order_play</span>
            Order Entry
          </h3>

          <div className="flex items-center gap-1 p-1 rounded-xl border border-[var(--border)] mb-4">
            {['market', 'limit', 'conditional'].map(t => (
              <button key={t} onClick={() => setOrderType(t)}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${orderType === t ? 'bg-primary text-black shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >{t}</button>
            ))}
          </div>

          <div className="flex gap-2 mb-5">
            <button onClick={() => setOrderSide('buy')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${orderSide === 'buy' ? 'bg-emerald-500 text-white shadow-sm' : 'border border-[var(--border)] text-[var(--text-secondary)] hover:text-emerald-500'}`}>
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">arrow_upward</span>Buy / Long
              </span>
            </button>
            <button onClick={() => setOrderSide('sell')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${orderSide === 'sell' ? 'bg-rose-500 text-white shadow-sm' : 'border border-[var(--border)] text-[var(--text-secondary)] hover:text-rose-500'}`}>
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">arrow_downward</span>Sell / Short
              </span>
            </button>
          </div>

          <div className="space-y-4">
            {orderType !== 'market' && (
              <div>
                <label className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1.5 block">Price (USDT)</label>
                <input type="text" value={price} onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-[var(--text-primary)] text-sm font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all" />
              </div>
            )}
            <div>
              <label className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1.5 block">Quantity</label>
              <input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-[var(--text-primary)] text-sm font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all" />
              <div className="flex gap-2 mt-2">
                {['25%', '50%', '75%', '100%'].map(pct => (
                  <button key={pct} className="flex-1 py-1.5 rounded-lg border border-[var(--border)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest hover:text-primary hover:border-primary/30 transition-all">{pct}</button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest">Leverage</label>
                <span className="text-primary text-xs font-black">{leverage}x</span>
              </div>
              <input type="range" min="1" max="100" value={leverage} onChange={(e) => setLeverage(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none  accent-primary" />
              <div className="flex justify-between text-[9px] text-[var(--text-secondary)] font-bold mt-1">
                <span>1x</span><span>25x</span><span>50x</span><span>75x</span><span>100x</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1.5 block">Take Profit</label>
                <input type="text" value={tpPrice} onChange={(e) => setTpPrice(e.target.value)} placeholder="TP Price"
                  className="w-full px-3 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-[var(--text-primary)] text-xs font-bold outline-none focus:border-emerald-500 transition-all placeholder:text-secondary/40" />
              </div>
              <div>
                <label className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1.5 block">Stop Loss</label>
                <input type="text" value={slPrice} onChange={(e) => setSlPrice(e.target.value)} placeholder="SL Price"
                  className="w-full px-3 py-2.5 rounded-xl bg-rose-500/5 border border-rose-500/20 text-[var(--text-primary)] text-xs font-bold outline-none focus:border-rose-500 transition-all placeholder:text-secondary/40" />
              </div>
            </div>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest hover:text-[var(--text-primary)] transition-all"
            >
              <span>Advanced Trade Management</span>
              <span className={`material-symbols-outlined text-sm transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>expand_more</span>
            </button>

            {showAdvanced && (
              <div className="space-y-4 p-4 rounded-xl border border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-[var(--text-primary)]">Trailing Stop</p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-bold">Auto-adjust SL with price</p>
                  </div>
                  <button onClick={() => setTrailingStop(!trailingStop)}
                    className={`w-12 h-6 rounded-full transition-all relative ${trailingStop ? 'bg-primary' : ' dark:bg-white/10'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-all ${trailingStop ? 'left-6' : 'left-0.5'}`}></div>
                  </button>
                </div>
                {trailingStop && (
                  <div>
                    <label className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1.5 block">Trail Distance (%)</label>
                    <input type="text" value={trailingDistance} onChange={(e) => setTrailingDistance(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-primary)] text-xs font-bold outline-none" />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-[var(--text-primary)]">Partial Take Profit</p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-bold">Multi-level exit</p>
                  </div>
                  <button onClick={() => setPartialTp(!partialTp)}
                    className={`w-12 h-6 rounded-full transition-all relative ${partialTp ? 'bg-primary' : ' dark:bg-white/10'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-all ${partialTp ? 'left-6' : 'left-0.5'}`}></div>
                  </button>
                </div>
              </div>
            )}

            <button onClick={handlePlaceOrder} disabled={isPlacingOrder} className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-sm ${
              orderSide === 'buy' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-rose-500 text-white hover:bg-rose-600'
            } disabled:opacity-50`}>
              {isPlacingOrder ? 'Placing Order...' : orderSide === 'buy' ? 'Open Long Position' : 'Open Short Position'}
            </button>

            {orderResult && (
              <div className={`p-3 rounded-xl text-xs font-bold text-center ${
                orderResult.success ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
              }`}>
                {orderResult.message}
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Right Panel (Scrollable Content) */}
        <div className="flex-1 min-w-0 flex flex-col gap-6 w-full">
          {/* Account Balance */}
          {exchangeError && (
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-amber-500/20 rounded-3xl p-6 bg-amber-500/5">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-500 text-xl">warning</span>
                <div>
                  <p className="text-[var(--text-primary)] text-xs font-black">Exchange Not Connected</p>
                  <p className="text-[var(--text-secondary)] text-[10px] font-bold">{exchangeError}</p>
                </div>
              </div>
            </div>
          )}
          {balance && (
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] rounded-3xl p-6">
              <h3 className="text-[var(--text-primary)] text-sm font-black uppercase tracking-widest mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">account_balance_wallet</span>
                Account Balance
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                {[
                  { label: 'Total Equity', value: formatPrice(balance.totalEquity) },
                  { label: 'Available', value: formatPrice(balance.availableBalance), color: 'secondary' },
                  { label: 'Used Margin', value: formatPrice(balance.usedMargin), color: 'secondary' },
                  { label: 'Unrealized P&L', value: (parseFloat(balance.unrealizedPnL) >= 0 ? '+' : '') + formatPrice(balance.unrealizedPnL), color: parseFloat(balance.unrealizedPnL) >= 0 ? 'emerald' : 'rose' },
                  { label: 'Margin Ratio', value: balance.marginRatio + '%', color: 'blue' },
                ].map((m, i) => (
                  <div key={i} className={`p-4 rounded-2xl border border-[var(--border)] transition-all hover:  ${m.color === 'emerald' ? 'shadow-[0_0_20px_-10px_rgba(16,185,129,0.3)]' : m.color === 'rose' ? 'shadow-[0_0_20px_-10px_rgba(244,63,94,0.3)]' : ''}`}>
                    <p className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-[0.1em] mb-1.5 opacity-60">{m.label}</p>
                    <p className={`text-base font-black tracking-tight ${
                      m.color === 'emerald' ? 'text-emerald-500' : 
                      m.color === 'rose' ? 'text-rose-500' : 
                      m.color === 'blue' ? 'text-blue-400' : 
                      m.color === 'secondary' ? 'text-main/80' : 'text-[var(--text-primary)]'
                    }`}>{m.value}</p>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[var(--border)]/30">
                      <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-left">Coin</th>
                      <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-right">Balance</th>
                      <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-right">Equity</th>
                      <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-right">Unrealized P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balance.assets.map((a, i) => (
                      <tr key={i} className="border-b border-[var(--border)]/30 last:border-0 hover: transition-colors group">
                        <td className="py-4 text-xs font-black text-[var(--text-primary)]">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-all"></span>
                            {a.coin}
                          </div>
                        </td>
                        <td className="py-4 text-xs font-bold text-main/90 text-right font-mono">{formatBalance(a.balance)}</td>
                        <td className="py-4 text-xs font-bold text-main/90 text-right font-mono">{formatBalance(a.equity)}</td>
                        <td className={`py-4 text-xs font-black text-right font-mono ${parseFloat(a.unrealizedPnL || 0) > 0 ? 'text-emerald-500' : parseFloat(a.unrealizedPnL || 0) < 0 ? 'text-rose-500' : 'text-secondary/60'}`}>
                          {parseFloat(a.unrealizedPnL || 0) > 0 ? '+' : ''}{parseFloat(a.unrealizedPnL || 0).toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Positions / Orders */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] rounded-3xl p-6">
            <div className="flex items-center gap-2 p-1 rounded-xl border border-[var(--border)] mb-5 w-fit">
              <button onClick={() => setActiveSection('positions')}
                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === 'positions' ? 'bg-primary text-black shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                Positions ({positions.length})
              </button>
              <button onClick={() => setActiveSection('orders')}
                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === 'orders' ? 'bg-primary text-black shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                Orders ({orders.length})
              </button>
              <button onClick={() => setActiveSection('history')}
                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === 'history' ? 'bg-primary text-black shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                History ({orderHistoryList.length})
              </button>
              <button onClick={() => setActiveSection('pnl')}
                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === 'pnl' ? 'bg-primary text-black shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                Realized P&L
              </button>
            </div>

            <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {activeSection === 'positions' && (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[var(--border)]/30">
                      <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-left">Symbol</th>
                      <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-left">Side</th>
                      <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-right">Size</th>
                      <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-right">Entry</th>
                      <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-right">Mark</th>
                      <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-right">P&L</th>
                      <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-right">TP</th>
                      <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-right">SL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map(p => (
                      <tr key={p.id} className="border-b border-[var(--border)]/30 last:border-0 hover: transition-colors group">
                        <td className="py-4 text-xs font-black text-[var(--text-primary)]">{p.symbol}</td>
                        <td className="py-4 text-xs pr-4">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${p.side === 'Long' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {p.side}
                          </span>
                        </td>
                        <td className="py-4 text-xs font-bold text-main/90 text-right font-mono">{p.size}</td>
                        <td className="py-4 text-xs font-bold text-[var(--text-secondary)] text-right font-mono">{formatPrice(p.entryPrice)}</td>
                        <td className="py-4 text-xs font-bold text-main/90 text-right font-mono">{p.symbol === activeSymbol && livePrice ? formatPrice(livePrice) : formatPrice(p.markPrice) || '—'}</td>
                        <td className={`py-4 text-xs font-black text-right font-mono ${parseFloat(p.unrealizedPnl || 0) > 0 ? 'text-emerald-500' : parseFloat(p.unrealizedPnl || 0) < 0 ? 'text-rose-500' : 'text-[var(--text-primary)]'}`}>
                          {parseFloat(p.unrealizedPnl || 0) > 0 ? '+' : ''}{parseFloat(p.unrealizedPnl || 0).toFixed(2)}
                        </td>
                        <td className="py-4 text-xs font-bold text-emerald-500/80 text-right font-mono">{formatPrice(p.tp)}</td>
                        <td className="py-4 text-xs font-bold text-rose-500/80 text-right font-mono">{formatPrice(p.sl)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            {activeSection === 'orders' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      {['Symbol', 'Type', 'Side', 'Price', 'Qty', 'Status', ''].map(h => (
                        <th key={h} className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest whitespace-nowrap pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr><td colSpan="7" className="py-8 text-center text-xs text-[var(--text-secondary)]">No active orders</td></tr>
                    ) : orders.map(o => (
                      <tr key={o.id} className="border-b border-[var(--border)]/50 last:border-0 hover: transition-colors">
                        <td className="py-3 text-xs font-black text-[var(--text-primary)] pr-4">{o.symbol}</td>
                        <td className="py-3 text-xs font-bold text-[var(--text-secondary)] pr-4">{o.type}</td>
                        <td className={`py-3 text-xs font-black pr-4 ${o.side === 'Buy' ? 'text-emerald-500' : 'text-rose-500'}`}>{o.side}</td>
                        <td className="py-3 text-xs font-bold text-[var(--text-primary)] pr-4">{formatPrice(o.price)}</td>
                        <td className="py-3 text-xs font-bold text-[var(--text-primary)] pr-4">{o.qty}</td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            o.status === 'Filled' ? 'bg-emerald-500/10 text-emerald-500' :
                            o.status === 'Triggered' ? 'bg-blue-500/10 text-blue-500' :
                            'bg-primary/10 text-primary'
                          }`}>{o.status}</span>
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <button onClick={() => handleCancelOrder(o)} className="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase hover:bg-rose-500/20 transition-colors">Cancel</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeSection === 'history' && (
              <div className="flex flex-col gap-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[var(--border)]/30">
                        <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-left">Symbol</th>
                        <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-left">Type</th>
                        <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-left">Side</th>
                        <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-right">Price</th>
                        <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-right">Qty</th>
                        <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-left pl-4">Status</th>
                        <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderHistoryList.length === 0 ? (
                        <tr><td colSpan="7" className="py-8 text-center text-xs text-[var(--text-secondary)]">No order history yet</td></tr>
                      ) : orderHistoryList.slice((currentPage - 1) * historyPerPage, currentPage * historyPerPage).map(o => (
                        <tr key={o.id} className="border-b border-[var(--border)]/30 last:border-0 hover: transition-colors group">
                          <td className="py-4 text-xs font-black text-[var(--text-primary)]">{o.symbol}</td>
                          <td className="py-4 text-xs font-bold text-[var(--text-secondary)]">{o.type}</td>
                          <td className="py-4 text-xs pr-4">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${o.side === 'Buy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                              {o.side}
                            </span>
                          </td>
                          <td className="py-4 text-xs font-bold text-main/90 text-right font-mono">{formatPrice(o.price)}</td>
                          <td className="py-4 text-xs font-bold text-main/90 text-right font-mono">{o.cumExecQty || o.qty}</td>
                          <td className="py-4 pl-4 text-left">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              o.status === 'Filled' ? 'bg-emerald-500/10 text-emerald-500' :
                              o.status === 'Cancelled' ? 'bg-slate-500/10 text-slate-500' :
                              o.status === 'PartiallyFilled' ? 'bg-blue-500/10 text-blue-500' :
                              'bg-primary/10 text-primary'
                            }`}>{o.status}</span>
                          </td>
                          <td className="py-4 text-xs font-bold text-[var(--text-secondary)] text-right font-mono">{o.created ? new Date(o.created).toLocaleString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination UI */}
                {orderHistoryList.length > historyPerPage && (
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]/30">
                    <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest">
                      Page {currentPage} of {Math.ceil(orderHistoryList.length / historyPerPage)}
                    </p>
                    <div className="flex gap-2">
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                      </button>
                      <button 
                        disabled={currentPage >= Math.ceil(orderHistoryList.length / historyPerPage)}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'pnl' && (
              <div className="flex flex-col gap-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[var(--border)]/30">
                        <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-left">Symbol</th>
                        <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-left">Type</th>
                        <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-left">Side</th>
                        <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-right">Qty</th>
                        <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-right">Entry</th>
                        <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-right">Exit</th>
                        <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-right">Realized P&L</th>
                        <th className="pb-3 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {closedPnlList.length === 0 ? (
                        <tr><td colSpan="8" className="py-8 text-center text-xs text-[var(--text-secondary)]">No realized P&L data yet</td></tr>
                      ) : closedPnlList.slice((pnlPage - 1) * historyPerPage, pnlPage * historyPerPage).map(p => (
                        <tr key={p.id} className="border-b border-[var(--border)]/30 last:border-0 hover: transition-colors group">
                          <td className="py-4 text-xs font-black text-[var(--text-primary)]">{p.symbol}</td>
                          <td className="py-4 text-xs font-bold text-[var(--text-secondary)]">{p.orderType}</td>
                          <td className="py-4 text-xs pr-4">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${p.side === 'Long' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                              {p.side}
                            </span>
                          </td>
                          <td className="py-4 text-xs font-bold text-main/90 text-right font-mono">{p.qty}</td>
                          <td className="py-4 text-xs font-bold text-[var(--text-secondary)] text-right font-mono">{formatPrice(p.entryPrice)}</td>
                          <td className="py-4 text-xs font-bold text-[var(--text-secondary)] text-right font-mono">{formatPrice(p.exitPrice)}</td>
                          <td className={`py-4 text-xs font-black text-right font-mono ${parseFloat(p.closedPnl || 0) > 0 ? 'text-emerald-500' : parseFloat(p.closedPnl || 0) < 0 ? 'text-rose-500' : 'text-[var(--text-primary)]'}`}>
                            {parseFloat(p.closedPnl || 0) > 0 ? '+' : ''}{parseFloat(p.closedPnl || 0).toFixed(4)}
                          </td>
                          <td className="py-4 text-xs font-bold text-[var(--text-secondary)] text-right font-mono">{p.updatedTime ? new Date(p.updatedTime).toLocaleString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {closedPnlList.length > historyPerPage && (
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]/30">
                    <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest">
                      Page {pnlPage} of {Math.ceil(closedPnlList.length / historyPerPage)}
                    </p>
                    <div className="flex gap-2">
                      <button 
                        disabled={pnlPage === 1}
                        onClick={() => setPnlPage(p => Math.max(1, p - 1))}
                        className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                      </button>
                      <button 
                        disabled={pnlPage >= Math.ceil(closedPnlList.length / historyPerPage)}
                        onClick={() => setPnlPage(p => p + 1)}
                        className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Order Confirmation Modal */}
      {orderConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-[var(--text-primary)] text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">warning</span>
              Confirm Order (MAINNET)
            </h3>
            <div className="space-y-3 mb-6">
              {[
                { label: 'Symbol', value: orderConfirm.symbol },
                { label: 'Side', value: orderConfirm.side.toUpperCase(), color: orderConfirm.side === 'buy' ? 'text-emerald-500' : 'text-rose-500' },
                { label: 'Type', value: orderConfirm.type.toUpperCase() },
                { label: 'Price', value: orderConfirm.price },
                { label: 'Quantity', value: orderConfirm.qty },
                ...(orderConfirm.tp ? [{ label: 'Take Profit', value: orderConfirm.tp }] : []),
                ...(orderConfirm.sl ? [{ label: 'Stop Loss', value: orderConfirm.sl }] : []),
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest">{item.label}</span>
                  <span className={`text-xs font-black ${item.color || 'text-[var(--text-primary)]'}`}>{item.value}</span>
                </div>
              ))}
            </div>
            <p className="text-amber-500 text-[10px] font-bold mb-4 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">⚠ This will execute a REAL order on {activeExchange.toUpperCase()} Mainnet using your funds.</p>
            <div className="flex gap-3">
              <button onClick={() => setOrderConfirm(null)} className="flex-1 py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-xs font-black uppercase tracking-widest hover:text-[var(--text-primary)] transition-all">Cancel</button>
              <button onClick={confirmAndPlaceOrder} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all ${
                orderConfirm.side === 'buy' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'
              }`}>Confirm Order</button>
            </div>
          </div>
        </div>
      )}
      {showDeployModal && activeStrategy && (
        <DeployBotModal
          strategy={activeStrategy}
          onClose={() => setShowDeployModal(false)}
          onDeploy={handleDeployAIStrategy}
        />
      )}
    </div>
  );
};

export default TradingTerminal;
