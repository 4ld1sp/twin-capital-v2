import React, { useState, useEffect, useCallback } from 'react';
import { useTrading } from '../context/TradingContext';
import { useApp } from '../context/AppContext';
import { useTradingData } from '../hooks/useTradingData';
import GlassSelect from '../components/ui/GlassSelect';
import MetricCard from '../components/MetricCard';
import PerformanceAnalytics from '../components/PerformanceAnalytics';
import DrawdownTracker from '../components/DrawdownTracker';
import BotStatusMatrix from '../components/BotStatusMatrix';

const Assets = () => {
  const { activeExchange, setActiveExchange, isConnected } = useTrading();
  const { userConnections } = useApp();
  const tradingConnections = userConnections?.trading || [];
  
  const [activeTab, setActiveTab] = useState('crypto');
  const [sahamExchange, setSahamExchange] = useState('idx');
  const [expandedTicker, setExpandedTicker] = useState(null);
  const [isEngineSettingsOpen, setIsEngineSettingsOpen] = useState(false);
  const [engineConfig, setEngineConfig] = useState({
    model: 'TwinProphet V2',
    schedule: ['Market Break', 'Market Close'],
  });

  const td = useTradingData();
  const fmtCurrency = (v) => `$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;


  // Manual Portfolio State
  // Manual Portfolio State (Synced with Database)
  const [manualAssets, setManualAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAsset, setCurrentAsset] = useState({ ticker: '', lots: '', entryPrice: '' });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);

  // ─── Live IDX Market Data ─────────────────────────────────
  const [idxQuotes, setIdxQuotes] = useState([]);
  const [idxLoading, setIdxLoading] = useState(true);
  const [idxError, setIdxError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [cryptoTrending, setCryptoTrending] = useState([]);
  const [cryptoTrendsLoading, setCryptoTrendsLoading] = useState(true);

  const fetchIdxQuotes = useCallback(async () => {
    try {
      const res = await fetch('/api/stocks/idx/quotes');
      if (!res.ok) throw new Error('Failed to fetch IDX data');
      const data = await res.json();
      setIdxQuotes(data.quotes || []);
      setLastUpdated(new Date());
      setIdxError(null);
    } catch (err) {
      console.error('[Assets] IDX fetch error:', err);
      setIdxError(err.message);
    } finally {
      setIdxLoading(false);
    }
  }, []);

  const fetchManualAssets = useCallback(async () => {
    try {
      setAssetsLoading(true);
      const res = await fetch('/api/assets-saham');
      if (!res.ok) throw new Error('Failed to fetch manual portfolio');
      const data = await res.json();
      setManualAssets(data.assets || []);
    } catch (err) {
      console.error('[Assets] Portfolio fetch error:', err);
    } finally {
      setAssetsLoading(false);
    }
  }, []);

  const fetchCryptoTrending = useCallback(async () => {
    try {
      setCryptoTrendsLoading(true);
      const res = await fetch('/api/stocks/crypto/trending');
      if (!res.ok) throw new Error('Failed to fetch crypto trends');
      const data = await res.json();
      setCryptoTrending(data.trending || []);
    } catch (err) {
      console.error('[Assets] Crypto trends fetch error:', err);
    } finally {
      setCryptoTrendsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIdxQuotes();
    fetchManualAssets();
    fetchCryptoTrending();
    const interval = setInterval(() => {
      fetchIdxQuotes();
      fetchCryptoTrending();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchIdxQuotes, fetchManualAssets, fetchCryptoTrending]);

  // Build a live price map for portfolio valuation
  const IDX_LIVE_PRICES = Object.fromEntries(idxQuotes.map(q => [q.ticker, q.price]));

  const handleQuickTrade = async (symbol, side) => {
    if (!activeExchange || activeExchange !== 'bybit') {
      alert('Quick trade is currently only supported for Bybit in this connected state.');
      return;
    }
    const isBuy = side.toLowerCase() === 'buy';
    const qtyStr = window.prompt(`[SPOT MARKET] ⚡ Quick Trade\n\nEnter amount in ${isBuy ? 'USDT to spend' : 'Tokens to sell'} for ${symbol}:`, isBuy ? "10" : "1");
    if (!qtyStr) return;
    const qty = parseFloat(qtyStr);
    if (isNaN(qty) || qty <= 0) return alert('Invalid amount');

    try {
      const res = await fetch('/api/proxy/bybit/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'spot',
          symbol: `${symbol}USDT`,
          side: isBuy ? 'Buy' : 'Sell',
          orderType: 'Market',
          qty: qty
        })
      });
      
      const data = await res.json();
      if (!res.ok || data.retCode !== 0) {
        throw new Error(data.retMsg || data.error || 'Trade failed');
      }
      
      alert(`Success: Placed ${isBuy ? 'Buy' : 'Sell'} Market Order for ${symbol}!\nOrder ID: ${data.result?.orderId || 'N/A'}`);
    } catch (err) {
      console.error('[Assets] Quick trade error:', err);
      alert(`Trade Failed: ${err.message}`);
    }
  };


  const handleSaveAsset = async () => {
    if (!currentAsset.ticker || !currentAsset.lots || !currentAsset.entryPrice) return;
    
    const liveData = idxQuotes.find(q => q.ticker === currentAsset.ticker);
    const assetData = {
      ticker: currentAsset.ticker.toUpperCase(),
      lots: Number(currentAsset.lots),
      entryPrice: Number(currentAsset.entryPrice),
      name: liveData?.name || currentAsset.ticker,
      color: currentAsset.color || ['indigo', 'amber', 'emerald', 'rose', 'blue', 'orange'][Math.floor(Math.random() * 6)]
    };

    try {
      if (isEditMode) {
        const res = await fetch(`/api/assets-saham/${currentAsset.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assetData)
        });
        if (!res.ok) throw new Error('Update failed');
        const data = await res.json();
        setManualAssets(manualAssets.map(a => a.id === currentAsset.id ? data.asset : a));
      } else {
        const res = await fetch('/api/assets-saham', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assetData)
        });
        if (!res.ok) throw new Error('Create failed');
        const data = await res.json();
        setManualAssets([...manualAssets, data.asset]);
      }
      
      setIsAssetModalOpen(false);
      setIsEditMode(false);
      setCurrentAsset({ ticker: '', lots: '', entryPrice: '' });
    } catch (err) {
      console.error('[Assets] Save error:', err);
      alert('Failed to save asset. Please try again.');
    }
  };

  const handleDeleteAsset = (asset) => {
    setAssetToDelete(asset);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (assetToDelete) {
      try {
        const res = await fetch(`/api/assets-saham/${assetToDelete.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
        
        setManualAssets(manualAssets.filter(a => a.id !== assetToDelete.id));
        setIsDeleteConfirmOpen(false);
        setAssetToDelete(null);
      } catch (err) {
        console.error('[Assets] Delete error:', err);
        alert('Failed to delete asset.');
      }
    }
  };

  const openModal = (asset = null) => {
    if (asset) {
      setCurrentAsset(asset);
      setIsEditMode(true);
    } else {
      setCurrentAsset({ ticker: '', lots: '', entryPrice: '' });
      setIsEditMode(false);
    }
    setIsAssetModalOpen(true);
  };

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
            <div className="w-full h-1.5 rounded-full overflow-hidden border border-[var(--border)]">
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

  const renderCrypto = () => {
    const coinBalances = td.balance?.assets || [];
    const totalValue = td.totalEquity;
    const fmtUSD = (v) => `$${parseFloat(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
      <div className="w-full flex flex-col gap-8 mt-4 animate-in fade-in duration-500 pb-20">
        
        {/* TOP: Market Pulse Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-[24px] border border-[var(--border)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-50"></div>
          <div className="relative flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
              <span className="material-symbols-outlined text-primary text-3xl animate-[spin_4s_linear_infinite]">radar</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-[var(--text-primary)] uppercase italic tracking-wider">AI Crypto Intelligence</h2>
              <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-[0.2em] mt-1"><span className="text-primary">{activeExchange}</span> Network Sync</p>
            </div>
          </div>
          <div className="relative flex items-center gap-4 flex-wrap">
            <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 shadow-sm bg-black/40 backdrop-blur-md ${isConnected ? 'text-emerald-500 border-emerald-500/20' : 'text-amber-500 border-amber-500/20'}`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-amber-500'}`}></span>
              {isConnected ? 'Market Streaming' : 'Connecting Engine'}
            </div>
            <GlassSelect
              value={activeExchange}
              onChange={setActiveExchange}
              options={[
                ...tradingConnections.filter(c => c.connected).map(c => ({ value: c.platformId, label: c.name })),
                { value: 'bybit', label: 'Bybit (Default)' }
              ].filter((v, i, a) => a.findIndex(t => t.value === v.value) === i)}
              className="w-40"
            />
          </div>
        </div>

        {/* MIDDLE: AI Sniper Engine (Full Width Grid) */}
        <div className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <div>
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1 italic">Intelligence Node</h3>
              <h2 className="text-lg font-black text-[var(--text-primary)] uppercase italic flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">target</span>
                Sniper Action Zone
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-widest block opacity-50">Precision Scan</span>
              <span className="text-[10px] text-primary font-black uppercase tracking-widest">Real-time</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {cryptoTrendsLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-[24px] p-5 border border-[var(--border)] animate-pulse min-h-[220px]">
                  <div className="h-10 w-10 bg-white/5 rounded-xl mb-4"></div>
                  <div className="h-3 w-32 bg-white/5 rounded-lg mb-2"></div>
                  <div className="h-2 w-48 bg-white/5 rounded-lg"></div>
                </div>
              ))
            ) : cryptoTrending.slice(0, 4).map((coin) => (
              <div key={coin.symbol} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-[24px] p-5 border border-[var(--border)] hover:border-primary/40 transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] group relative overflow-hidden bg-gradient-to-b from-transparent to-black/20">
                <div className="absolute top-0 right-0 p-4 flex flex-col items-end gap-1.5">
                  <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border ${coin.signal.includes('BULL') || coin.signal.includes('LONG') || coin.signal.includes('ACCUM') || coin.signal.includes('RECOVERY') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                    {coin.signal.replace('_', ' ')}
                  </span>
                  <span className="text-[9px] font-black text-[var(--text-primary)] opacity-80">{coin.confidence}% Conf.</span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-black/50 border border-[var(--border)] flex items-center justify-center font-black text-xs text-primary shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 group-hover:scale-150 transition-transform duration-500 rounded-full blur-md"></div>
                    <span className="relative z-10">{coin.symbol}</span>
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[var(--text-primary)] italic tracking-tight">{coin.symbol}<span className="text-[var(--text-secondary)] text-[10px] ml-1 opacity-50">/USDT</span></h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-mono font-bold text-[var(--text-primary)]">${coin.lastPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6})}</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${coin.change24h >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/30 border border-black/20 mb-4 min-h-[50px] flex items-center">
                  <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-relaxed italic line-clamp-2">
                    "{coin.reasoning}"
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/5 p-2 rounded-xl text-center">
                    <span className="block text-[8px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1">Entry</span>
                    <span className="text-[10px] font-mono font-bold text-[var(--text-primary)]">${coin.entry.toLocaleString(undefined, {maximumFractionDigits:4})}</span>
                  </div>
                  <div className="bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10 text-center">
                    <span className="block text-[8px] text-emerald-500 font-black uppercase tracking-widest mb-1">TP</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-500">${coin.tp.toLocaleString(undefined, {maximumFractionDigits:4})}</span>
                  </div>
                  <div className="bg-rose-500/5 p-2 rounded-xl border border-rose-500/10 text-center">
                    <span className="block text-[8px] text-rose-500 font-black uppercase tracking-widest mb-1">SL</span>
                    <span className="text-[10px] font-mono font-bold text-rose-500">${coin.sl.toLocaleString(undefined, {maximumFractionDigits:4})}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[var(--border)]">
                  <button onClick={() => handleQuickTrade(coin.symbol, 'Buy')} className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest transition-all">
                    Market Buy
                  </button>
                  <button onClick={() => handleQuickTrade(coin.symbol, 'Sell')} className="flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest transition-all">
                    Market Sell
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM: Exchange Balances (Left) + Innovation Heatmap (Right) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          <div className="xl:col-span-8 space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase italic flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">account_balance_wallet</span>
                Portfolio Holdings
              </h3>
              <span className="px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20 text-[10px] font-black text-primary tracking-widest shadow-inner">
                TOTAL: {td.isLoading ? '...' : fmtUSD(totalValue)}
              </span>
            </div>
            
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-[24px] border border-[var(--border)] overflow-hidden shadow-lg ">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-black/20 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em]">
                      <th className="p-5">Asset</th>
                      <th className="p-5">Available</th>
                      <th className="p-5">Locked</th>
                      <th className="p-5 text-right">Value (USD)</th>
                      <th className="p-5 text-right">Yield</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium text-[var(--text-primary)] divide-y divide-glass/50">
                    {td.isLoading ? (
                      <tr>
                        <td colSpan="5" className="p-10 text-center text-[var(--text-secondary)]">
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="font-black uppercase tracking-widest text-[10px]">Syncing Balances...</span>
                          </div>
                        </td>
                      </tr>
                    ) : coinBalances.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-10 text-center text-[var(--text-secondary)] font-bold text-xs italic">
                          No exchange assets detected.
                        </td>
                      </tr>
                    ) : coinBalances.map((coin, idx) => {
                      const walletBalance = parseFloat(coin.balance || 0);
                      const availableBalance = parseFloat(coin.available || 0);
                      const lockedBalance = walletBalance - availableBalance;
                      const equity = parseFloat(coin.equity || 0);
                      const uPnl = parseFloat(coin.unrealizedPnL || 0);
                      const coinName = coin.coin || 'Unknown';
                      
                      return (
                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                          <td className="p-5 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-black/40 border border-[var(--border)] flex items-center justify-center font-black text-[10px] text-[var(--text-secondary)] group-hover:text-primary group-hover:border-primary/40 transition-all">
                              {coinName.substring(0, 3)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-sm italic py-0.5">{coinName}</span>
                              <span className="text-[8px] text-[var(--text-secondary)] font-bold uppercase tracking-widest border border-[var(--border)] px-1 py-0.5 rounded max-w-max hidden sm:block">Spot</span>
                            </div>
                          </td>
                          <td className="p-5 font-mono text-sm">{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                          <td className="p-5 font-mono text-[var(--text-secondary)] text-xs">{lockedBalance > 0 ? lockedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) : '-'}</td>
                          <td className="p-5 text-right font-mono font-black text-sm text-[var(--text-primary)]">{fmtUSD(equity)}</td>
                          <td className="p-5 text-right">
                            <div className={`inline-flex flex-col items-end px-2.5 py-1 rounded-lg border ${uPnl >= 0 ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/5 border-rose-500/20 text-rose-500'}`}>
                              <span className="text-[11px] font-mono font-black">
                                {uPnl >= 0 ? '+' : ''}{fmtUSD(uPnl)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-4">
             <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase italic flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">local_fire_department</span>
                Hot Trackers
              </h3>
              <span className="text-[9px] font-black text-[var(--text-secondary)] px-2 py-1 bg-white/5 rounded-md border border-[var(--border)] uppercase tracking-widest">Innovation</span>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-[24px] border border-[var(--border)] shadow-lg relative overflow-hidden bg-gradient-to-b from-black/20 to-black/40 p-1">
              <div className="space-y-1 relative z-10 max-h-[400px] overflow-y-auto pr-1 stylish-scroll">
                {cryptoTrendsLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="h-16 w-full bg-white/5 rounded-2xl animate-pulse my-1"></div>
                  ))
                ) : cryptoTrending.map((coin) => (
                  <div key={coin.symbol} className="flex items-center justify-between p-3 rounded-2xl border border-transparent hover:border-[var(--border)] hover:bg-white/5 transition-all group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-black/60 border border-[var(--border)] flex items-center justify-center font-black text-[9px] text-[var(--text-secondary)]">
                        {coin.symbol}
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-xs font-black text-[var(--text-primary)] italic tracking-tight">{coin.symbol}</span>
                        <span className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Vol: ${(coin.turnover/1e6).toFixed(1)}M</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-center">
                      <span className={`text-xs font-mono font-black ${coin.change24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)] font-mono mt-0.5">${coin.lastPrice.toLocaleString(undefined, {maximumFractionDigits:4})}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-2xl border border-primary/20 p-4 bg-primary/5 flex gap-3 items-start">
              <span className="material-symbols-outlined text-primary text-base mt-0.5 animate-pulse">info</span>
              <p className="text-[10px] text-[var(--text-primary)] font-medium leading-relaxed opacity-80">
                <strong className="text-primary tracking-wider uppercase inline-block mb-1">Sniper Auto-refresh</strong><br/>
                Algorithm scans high-velocity pairs matching breakout criteria across the Bybit spot market. Data synchronized in real-time.
              </p>
            </div>
          </div>

        </div>
      </div>
    );
  };

  const renderSaham = () => {
    const fmtIDR = (n) => `Rp ${Math.round(n || 0).toLocaleString('id-ID')}`;
    const fmtVol = (n) => n >= 1e9 ? `${(n/1e9).toFixed(1)}B` : n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : `${(n/1e3).toFixed(0)}K`;

    // Generate AI signals dynamically from live IDX data
    const signals = idxQuotes
      .filter(q => q.volume > 500_000)
      .map(q => {
        let trigger, confidence;
        if (q.changePct >= 2)        { trigger = 'Strong Momentum'; confidence = Math.min(97, 85 + Math.round(q.changePct)); }
        else if (q.changePct >= 0.5) { trigger = 'Volume Surge';    confidence = Math.min(90, 72 + Math.round(q.changePct * 3)); }
        else if (q.changePct <= -2)  { trigger = 'Oversold Reversal'; confidence = Math.min(88, 68 + Math.round(Math.abs(q.changePct) * 2)); }
        else if (q.changePct <= -0.5){ trigger = 'Support Test';    confidence = 62; }
        else                         { trigger = 'Range Bound';     confidence = 55; }

        const tpPrice = q.price * (q.changePct >= 0 ? 1.04 : 1.03);
        const slPrice = q.price * (q.changePct >= 0 ? 0.97 : 0.98);
        const rsi = Math.max(20, Math.min(80, 50 + q.changePct * 5));
        return {
          ticker: q.ticker, name: q.name, sector: q.sector,
          trigger, confidence,
          last: fmtIDR(q.price), target: fmtIDR(tpPrice),
          change: q.change, changePct: q.changePct, volume: q.volume,
          financials: {
            marketCap: q.marketCap ? `Rp ${(q.marketCap/1e12).toFixed(1)}T` : '-',
            pe: q.pe ? `${q.pe}x` : '-',
            dayRange: `${fmtIDR(q.dayLow)} – ${fmtIDR(q.dayHigh)}`,
            week52: `${fmtIDR(q.week52Low)} – ${fmtIDR(q.week52High)}`,
          },
          technical: {
            rsi,
            macd: q.changePct >= 1 ? 'Bullish' : q.changePct <= -1 ? 'Bearish' : 'Neutral',
            flow: q.changePct >= 0.5 ? 'Net Buy' : q.changePct <= -0.5 ? 'Net Sell' : 'Mixed',
          },
          scalping: { entry: fmtIDR(q.price), tp: fmtIDR(tpPrice), sl: fmtIDR(slPrice) },
        };
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8);

    const toggleRow = (ticker) => setExpandedTicker(expandedTicker === ticker ? null : ticker);

    return (
      <div className="w-full flex flex-col gap-6 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-2xl border border-[var(--border)] relative z-30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center relative overflow-hidden">
              <span className="material-symbols-outlined text-primary text-2xl">insights</span>
              <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-xl font-black text-[var(--text-primary)] uppercase italic flex items-center gap-2">
                IDX Market Scanner
                <span className="px-2 py-0.5 rounded text-[8px] bg-emerald-500 text-black font-black uppercase tracking-tighter">Live</span>
              </h2>
              <p className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest opacity-60 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${idxLoading ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></span>
                {idxLoading ? 'Fetching market data...' : lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('id-ID')}` : 'Ready'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {!idxLoading && (
              <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-[var(--border)] flex items-center gap-2 ">
                Stocks Live: <span className="text-primary italic">{idxQuotes.length}</span>
              </div>
            )}
            <button
              onClick={() => { setIdxLoading(true); fetchIdxQuotes(); }}
              disabled={idxLoading}
              className="px-5 py-2 rounded-xl bg-white/5 border border-[var(--border)] text-[var(--text-primary)] text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-sm ${idxLoading ? 'animate-spin' : ''}`}>refresh</span>
              {idxLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Error banner */}
        {idxError && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-3">
            <span className="material-symbols-outlined text-sm">warning</span>
            {idxError} — IDX data may be delayed or unavailable outside market hours (09:00–16:00 WIB).
          </div>
        )}

        {/* Live Market Overview Table */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] flex justify-between items-center ">
            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase italic flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">bar_chart</span>
              Live Market Overview — IDX Top Stocks
            </h3>
            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-70">Source: Yahoo Finance • IDX</span>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]  text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest sticky top-0 z-10">
                  <th className="p-3">Stock</th>
                  <th className="p-3">Sector</th>
                  <th className="p-3 text-right">Price (IDR)</th>
                  <th className="p-3 text-right">Change</th>
                  <th className="p-3 text-right">Volume</th>
                  <th className="p-3 text-right">P/E</th>
                  <th className="p-3 text-right">Market Cap</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-[var(--text-primary)]">
                {idxLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-[var(--border)]">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="p-3">
                          <div className="h-3 bg-white/5 rounded animate-pulse w-full"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : idxQuotes.length === 0 ? (
                  <tr><td colSpan="7" className="p-10 text-center text-[var(--text-secondary)] text-xs">
                    No market data available. IDX is open Mon–Fri 09:00–16:30 WIB.
                  </td></tr>
                ) : idxQuotes.map((q) => (
                  <tr key={q.ticker} className="border-b border-[var(--border)] hover: transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[9px] border ${
                          q.trend === 'strong_up'   ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' :
                          q.trend === 'up'          ? 'bg-emerald-500/8 border-emerald-500/20 text-emerald-500' :
                          q.trend === 'strong_down' ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' :
                                                      'bg-rose-500/8 border-rose-500/20 text-rose-500'
                        }`}>{q.ticker.slice(0, 4)}</div>
                        <div>
                          <p className="font-bold text-xs">{q.ticker}</p>
                          <p className="text-[9px] text-[var(--text-secondary)] truncate max-w-[110px]">{q.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-[10px] text-[var(--text-secondary)]">{q.sector}</td>
                    <td className="p-3 text-right font-mono font-bold text-xs">{fmtIDR(q.price)}</td>
                    <td className="p-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`font-mono font-bold text-xs ${q.changePct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {q.changePct >= 0 ? '+' : ''}{q.changePct}%
                        </span>
                        <span className={`text-[9px] font-mono ${q.changePct >= 0 ? 'text-emerald-500/60' : 'text-rose-500/60'}`}>
                          {q.change >= 0 ? '+' : ''}{fmtIDR(q.change)}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono text-[var(--text-secondary)] text-xs">{fmtVol(q.volume)}</td>
                    <td className="p-3 text-right text-xs font-mono">{q.pe ? `${q.pe}x` : '—'}</td>
                    <td className="p-3 text-right text-xs font-mono">
                      {q.marketCap ? `Rp ${(q.marketCap/1e12).toFixed(1)}T` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Signal Detection Table */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-2xl border border-[var(--border)] overflow-hidden w-full">
          <div className="p-4 border-b border-[var(--border)] flex justify-between items-center ">
            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase italic flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">radar</span>
              AI Signal Detection — Top Entry Points
            </h3>
            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
              {signals.length > 0 ? `${signals.length} signals detected` : 'Scanning...'}
            </span>
          </div>
          {signals.length === 0 ? (
            <div className="p-10 text-center text-[var(--text-secondary)] text-xs">
              {idxLoading ? (
                <><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>Analyzing market conditions...</>
              ) : 'No significant signals. Market may be closed or data is unavailable.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)]  text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">
                    <th className="p-4 w-10"></th>
                    <th className="p-4">Ticker</th>
                    <th className="p-4">Signal</th>
                    <th className="p-4">Confidence</th>
                    <th className="p-4">Last Price</th>
                    <th className="p-4">Target (+4%)</th>
                    <th className="p-4 text-right">Change</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-[var(--text-primary)]">
                  {signals.map((sig) => (
                    <React.Fragment key={sig.ticker}>
                      <tr className="border-b border-[var(--border)] hover:bg-white/5 transition-colors cursor-pointer" onClick={() => toggleRow(sig.ticker)}>
                        <td className="p-4">
                          <span className={`material-symbols-outlined text-primary text-lg transition-transform duration-200 inline-block ${expandedTicker === sig.ticker ? 'rotate-180' : ''}`}>expand_more</span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-black text-primary italic">{sig.ticker}</span>
                            <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider leading-tight">{sig.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                            sig.trigger.includes('Momentum') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            sig.trigger.includes('Volume')   ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            sig.trigger.includes('Oversold') ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                            sig.trigger.includes('Support')  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                               'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border)]'
                          }`}>{sig.trigger}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-0.5 w-24">
                            <span className="text-[10px] font-black text-[var(--text-primary)] uppercase italic">{sig.confidence}%</span>
                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-700 ${
                                sig.confidence >= 80 ? 'bg-emerald-500' : sig.confidence >= 65 ? 'bg-primary' : 'bg-amber-500'
                              }`} style={{ width: `${sig.confidence}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-[var(--text-secondary)] text-xs">{sig.last}</td>
                        <td className="p-4 font-mono text-emerald-500 text-xs">{sig.target}</td>
                        <td className="p-4 text-right">
                          <span className={`font-mono font-bold text-sm ${sig.changePct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {sig.changePct >= 0 ? '+' : ''}{sig.changePct}%
                          </span>
                        </td>
                      </tr>
                      {expandedTicker === sig.ticker && (
                        <tr className="bg-black/20 dark:bg-white/[0.02] border-b border-[var(--border)] animate-in slide-in-from-top-2 duration-300">
                          <td colSpan={7} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                              {/* Scalping Strategy */}
                              <div className="space-y-3 p-4 rounded-2xl bg-primary/5 border border-primary/20 shadow-lg shadow-primary/5">
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                  <span className="material-symbols-outlined text-sm">target</span>Scalping Strategy
                                </p>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-[8px] text-[var(--text-secondary)] uppercase font-bold tracking-widest">Entry Price</p>
                                    <p className="text-md font-black text-[var(--text-primary)]">{sig.scalping.entry}</p>
                                  </div>
                                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                    <p className="text-[8px] text-emerald-500 uppercase font-bold tracking-widest">Take Profit (+4%)</p>
                                    <p className="text-md font-black text-emerald-500">{sig.scalping.tp}</p>
                                  </div>
                                  <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <p className="text-[8px] text-red-500 uppercase font-bold tracking-widest">Stop Loss (-3%)</p>
                                    <p className="text-md font-black text-red-500">{sig.scalping.sl}</p>
                                  </div>
                                </div>
                              </div>
                              {/* Market Data */}
                              <div className="space-y-3">
                                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border)] pb-2 flex items-center gap-2">
                                  <span className="material-symbols-outlined text-primary text-sm">account_balance</span>Market Data
                                </p>
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                  <div>
                                    <p className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-widest">Market Cap</p>
                                    <p className="text-xs font-black text-[var(--text-primary)]">{sig.financials.marketCap}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-widest">P/E Ratio</p>
                                    <p className="text-xs font-black text-[var(--text-primary)]">{sig.financials.pe}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-widest">Day Range</p>
                                    <p className="text-xs font-black text-[var(--text-primary)]">{sig.financials.dayRange}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-widest">52-Week Range</p>
                                    <p className="text-xs font-black text-[var(--text-primary)]">{sig.financials.week52}</p>
                                  </div>
                                </div>
                              </div>
                              {/* Technical */}
                              <div className="space-y-3 px-0 md:px-2 md:border-x border-[var(--border)]">
                                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border)] pb-2 flex items-center gap-2">
                                  <span className="material-symbols-outlined text-primary text-sm">monitoring</span>Technical
                                </p>
                                <div className="space-y-2 pt-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-widest">RSI (est.)</span>
                                    <span className="text-xs font-black text-[var(--text-primary)]">{Math.round(sig.technical.rsi)}</span>
                                  </div>
                                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${sig.technical.rsi > 70 ? 'bg-red-500' : sig.technical.rsi < 30 ? 'bg-emerald-500' : 'bg-primary'}`}
                                      style={{ width: `${sig.technical.rsi}%` }}></div>
                                  </div>
                                  <div className="flex justify-between items-center pt-2">
                                    <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-widest">Trend</span>
                                    <span className={`text-[10px] font-black uppercase italic ${
                                      sig.technical.macd === 'Bullish' ? 'text-emerald-500' :
                                      sig.technical.macd === 'Bearish' ? 'text-rose-500' : 'text-[var(--text-secondary)]'
                                    }`}>{sig.technical.macd}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-widest">Volume</span>
                                    <span className="text-[10px] font-black text-[var(--text-primary)]">{fmtVol(sig.volume)}</span>
                                  </div>
                                </div>
                              </div>
                              {/* AI Flow */}
                              <div className="space-y-3">
                                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border)] pb-2 flex items-center gap-2">
                                  <span className="material-symbols-outlined text-primary text-sm">hub</span>Market Flow
                                </p>
                                <div className="p-3 rounded-xl bg-white/5 border border-[var(--border)] space-y-3 mt-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-tighter">Flow Direction</span>
                                    <span className={`text-[9px] font-black uppercase italic px-2 py-0.5 rounded border ${
                                      sig.technical.flow === 'Net Buy'  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                      sig.technical.flow === 'Net Sell' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                                          'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border)]'
                                    }`}>{sig.technical.flow}</span>
                                  </div>
                                  <p className="text-[9px] text-[var(--text-primary)] font-medium leading-relaxed italic opacity-90 border-l-2 border-primary/30 pl-3">
                                    "{sig.ticker} menunjukkan {sig.trigger.toLowerCase()} dengan pergerakan {sig.changePct >= 0 ? 'positif' : 'negatif'} {Math.abs(sig.changePct)}% dan volume {fmtVol(sig.volume)} — {sig.technical.macd.toLowerCase()} momentum."
                                  </p>
                                  <div className="pt-1 flex items-center gap-1.5 opacity-60">
                                    <span className="w-1 h-1 rounded-full bg-primary animate-pulse"></span>
                                    <span className="text-[8px] font-black uppercase tracking-widest">Live from Yahoo Finance • IDX</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Manual Stock Portfolio */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-2xl border border-[var(--border)] overflow-hidden w-full group/portfolio">
          <div className="p-4 border-b border-[var(--border)] flex justify-between items-center ">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase italic flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">inventory_2</span>
                My IDX Portfolio
              </h3>
              <button
                onClick={() => openModal()}
                className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all flex items-center gap-1.5 opacity-0 group-hover/portfolio:opacity-100"
              >
                <span className="material-symbols-outlined text-[12px]">add_circle</span> Add Stock
              </button>
            </div>
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest px-3 py-1.5  rounded-lg border border-[var(--border)]">
              Portfolio Value: Rp {manualAssets.reduce((sum, a) => {
                const p = IDX_LIVE_PRICES[a.ticker] || a.entryPrice;
                return sum + a.lots * 100 * p;
              }, 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]  text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">
                  <th className="p-4">Asset</th>
                  <th className="p-4">Lots</th>
                  <th className="p-4">Entry Price</th>
                  <th className="p-4">Live Price</th>
                  <th className="p-4 text-right">Market Value</th>
                  <th className="p-4 text-right">PnL</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-[var(--text-primary)]">
                {assetsLoading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-[var(--text-secondary)]">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        Loading portfolio...
                      </div>
                    </td>
                  </tr>
                ) : manualAssets.length === 0 ? (
                  <tr><td colSpan="7" className="p-10 text-center text-[var(--text-secondary)] text-xs">
                    No stocks tracked. Hover this card and click "Add Stock" to start.
                  </td></tr>
                ) : manualAssets.map((asset) => {
                  const livePrice    = IDX_LIVE_PRICES[asset.ticker];
                  const lastPrice    = livePrice || asset.entryPrice;
                  const isLive       = !!livePrice;
                  const marketValue  = asset.lots * 100 * lastPrice;
                  const unrealPnL    = (lastPrice - asset.entryPrice) * asset.lots * 100;
                  const pnlPct       = ((lastPrice - asset.entryPrice) / asset.entryPrice) * 100;
                  const liveQ        = idxQuotes.find(q => q.ticker === asset.ticker);
                  return (
                    <tr key={asset.id} className="border-b border-[var(--border)] hover: transition-colors group">
                      <td className="p-4 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-${asset.color}-500/10 border border-${asset.color}-500/20 flex items-center justify-center text-${asset.color}-500 font-black text-[10px]`}>
                          {asset.ticker.slice(0, 3)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold">{asset.ticker}</span>
                          <span className="text-[10px] text-[var(--text-secondary)]">{asset.name}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono">{asset.lots}</td>
                      <td className="p-4 font-mono text-[var(--text-secondary)]">Rp {asset.entryPrice.toLocaleString('id-ID')}</td>
                      <td className="p-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          Rp {Math.round(lastPrice).toLocaleString('id-ID')}
                          {isLive && liveQ ? (
                            <span className={`text-[9px] font-black ${liveQ.changePct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {liveQ.changePct >= 0 ? '+' : ''}{liveQ.changePct}%
                            </span>
                          ) : (
                            <span className="text-[9px] text-secondary/50 italic">(entry)</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right font-mono font-bold">Rp {Math.round(marketValue).toLocaleString('id-ID')}</td>
                      <td className="p-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`font-mono ${unrealPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {unrealPnL >= 0 ? '+' : ''}Rp {Math.round(unrealPnL).toLocaleString('id-ID')}
                          </span>
                          <span className={`text-[10px] font-bold ${pnlPct >= 0 ? 'text-emerald-500/80' : 'text-red-500/80'}`}>
                            {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal(asset)} className="p-2 rounded-lg bg-white/5 hover:bg-primary/10 text-[var(--text-secondary)] hover:text-primary transition-all">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button onClick={() => handleDeleteAsset(asset)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-500 transition-all">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="space-y-8 flex flex-col w-full relative">
      {/* Engine Settings Modal */}
      {isEngineSettingsOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl w-full max-w-md border border-[var(--border)] rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-[var(--text-primary)] uppercase italic flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">settings_suggest</span>
                Engine Config
              </h2>
              <button 
                onClick={() => setIsEngineSettingsOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-2.5 block">AI Model Architecture</label>
                <div className="grid grid-cols-1 gap-2">
                  {['TwinProphet V2', 'GPT-4o (Standard)', 'Claude 3.5 Sonnet'].map(m => (
                    <button 
                      key={m}
                      onClick={() => setEngineConfig({...engineConfig, model: m})}
                      className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all group ${engineConfig.model === m ? 'bg-primary/10 border-primary shadow-sm' : 'bg-black/20 border-[var(--border)] hover:border-primary/40'}`}
                    >
                      <div>
                        <span className={`text-xs font-black block ${engineConfig.model === m ? 'text-primary' : 'text-[var(--text-primary)]'}`}>{m}</span>
                        <span className="text-[8px] text-[var(--text-secondary)] font-bold uppercase">{m === 'TwinProphet V2' ? 'Optimized for IDX Stocks' : 'General Intelligence'}</span>
                      </div>
                      {engineConfig.model === m && (
                        <span className="material-symbols-outlined text-primary text-sm animate-in zoom-in">check_circle</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-2.5 block italic">Scanning Schedule (Token-Saver)</label>
                <div className="p-4 rounded-3xl bg-black/20 border border-[var(--border)] space-y-4">
                  {['Market Open', 'Market Break', 'Market Close', '24/7 Monitoring'].map(time => (
                    <label key={time} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox"
                          checked={engineConfig.schedule.includes(time)}
                          onChange={(e) => {
                            const newSched = e.target.checked 
                              ? [...engineConfig.schedule, time] 
                              : engineConfig.schedule.filter(s => s !== time);
                            setEngineConfig({...engineConfig, schedule: newSched});
                          }}
                          className="w-5 h-5 rounded-lg border-2 border-[var(--border)] bg-transparent appearance-none checked:bg-primary checked:border-primary transition-all cursor-pointer"
                        />
                        {engineConfig.schedule.includes(time) && (
                          <span className="material-symbols-outlined absolute text-black text-[14px] font-black pointer-events-none left-0.5">check</span>
                        )}
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-widest group-hover:text-primary transition-colors ${engineConfig.schedule.includes(time) ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] opacity-60'}`}>
                        {time}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-[9px] text-primary font-bold uppercase italic mt-3 flex items-center gap-1.5 opacity-80">
                  <span className="material-symbols-outlined text-[10px]">info</span>
                  Scanning only at scheduled times reduces token usage by ~65%.
                </p>
              </div>

              <button 
                onClick={() => setIsEngineSettingsOpen(false)}
                className="w-full py-4 rounded-2xl bg-primary text-black text-[12px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Management Modal */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl w-full max-w-sm border border-[var(--border)] rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-[var(--text-primary)] uppercase italic flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">{isEditMode ? 'edit_note' : 'add_business'}</span>
                {isEditMode ? 'Edit Asset' : 'Add New Asset'}
              </h2>
              <button 
                onClick={() => setIsAssetModalOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1.5 block">Stock Ticker (e.g. BBRI)</label>
                <input 
                  type="text" 
                  value={currentAsset.ticker}
                  onChange={(e) => setCurrentAsset({...currentAsset, ticker: e.target.value.toUpperCase()})}
                  placeholder="EX: ASII"
                  className="w-full px-4 py-3 rounded-xl bg-black/20 border border-[var(--border)] text-[var(--text-primary)] font-bold outline-none focus:border-primary transition-all"
                />
                {currentAsset.ticker && !IDX_LIVE_PRICES[currentAsset.ticker] && (
                  <p className="text-[9px] text-amber-500 font-bold uppercase mt-1 italic">⚠ Ticker not in Top 30 list — Live price might be unavailable</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1.5 block">Amount (Lots)</label>
                  <input 
                    type="number" 
                    value={currentAsset.lots}
                    onChange={(e) => setCurrentAsset({...currentAsset, lots: e.target.value})}
                    placeholder="10"
                    className="w-full px-4 py-3 rounded-xl bg-black/20 border border-[var(--border)] text-[var(--text-primary)] font-mono font-bold outline-none focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1.5 block">Avg Entry Price</label>
                  <input 
                    type="number" 
                    value={currentAsset.entryPrice}
                    onChange={(e) => setCurrentAsset({...currentAsset, entryPrice: e.target.value})}
                    placeholder="5000"
                    className="w-full px-4 py-3 rounded-xl bg-black/20 border border-[var(--border)] text-[var(--text-primary)] font-mono font-bold outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase">Estimated Value</span>
                  <span className="text-[9px] font-black text-[var(--text-primary)]">
                    Rp {((Number(currentAsset.lots) || 0) * 100 * (Number(currentAsset.entryPrice) || 0)).toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-[8px] text-primary font-bold uppercase italic opacity-60">
                  Calculation: Lots × 100 Shares × Price
                </p>
              </div>

              <button 
                onClick={handleSaveAsset}
                className="w-full py-4 rounded-2xl bg-primary text-black text-[12px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-2"
              >
                {isEditMode ? 'Update Portfolio' : 'Add to Portfolio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && assetToDelete && (
        <div className="fixed inset-0 z-[1002] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl w-full max-w-sm border border-[var(--border)] rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-red-500 text-3xl">delete_forever</span>
            </div>
            
            <h2 className="text-xl font-black text-[var(--text-primary)] uppercase italic mb-2">Remove Asset?</h2>
            <p className="text-xs text-[var(--text-secondary)] font-bold leading-relaxed mb-8">
              Are you sure you want to remove <span className="text-[var(--text-primary)]">{assetToDelete.ticker}</span> from your manual portfolio? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setAssetToDelete(null);
                }}
                className="flex-1 py-4 rounded-2xl bg-white/5 border border-[var(--border)] text-[var(--text-primary)] text-[12px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-4 rounded-2xl bg-red-500 text-white text-[12px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
              >
                Delete Asset
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center w-full gap-6 pb-6 border-b border-[var(--border)]">
        <nav className="flex items-center gap-2 p-1.5 rounded-2xl border border-[var(--border)] overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('crypto')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'crypto' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:'}`}
          >
            Crypto
          </button>
          <button
            onClick={() => setActiveTab('saham')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'saham' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:'}`}
          >
            Saham
          </button>
        </nav>
      </div>

      <div className="w-full">
        {activeTab === 'crypto' && renderCrypto()}
        {activeTab === 'saham' && renderSaham()}
      </div>
    </div>
  );
};

export default Assets;

