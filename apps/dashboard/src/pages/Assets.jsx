import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { useApp } from '../context/AppContext';
import { useTradingData } from '../hooks/useTradingData';
import GlassSelect from '../components/ui/GlassSelect';
import MetricCard from '../components/MetricCard';
import PerformanceAnalytics from '../components/PerformanceAnalytics';
import DrawdownTracker from '../components/DrawdownTracker';
import BotStatusMatrix from '../components/BotStatusMatrix';

const Assets = () => {
  const { activeExchange, setActiveExchange, networkMode, setNetworkMode, isConnected } = useTrading();
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
  const [manualAssets, setManualAssets] = useState([
    { id: 1, ticker: 'BBCA', name: 'Bank Central Asia', lots: 100, entryPrice: 9800, color: 'indigo' },
    { id: 2, ticker: 'BMRI', name: 'Bank Mandiri', lots: 50, entryPrice: 6500, color: 'amber' }
  ]);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAsset, setCurrentAsset] = useState({ ticker: '', lots: '', entryPrice: '' });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);

  const IDX_MOCK_PRICES = {
    BBCA: 6450, BMRI: 4720, ASII: 6250, TLKM: 3060, GOTO: 51, ANTM: 3500,
    UNVR: 2800, BBRI: 3330, BBNI: 3760, ADRO: 2580, ICBP: 7350, INDF: 6350
  };

  const handleSaveAsset = () => {
    if (!currentAsset.ticker || !currentAsset.lots || !currentAsset.entryPrice) return;
    
    if (isEditMode) {
      setManualAssets(manualAssets.map(a => a.id === currentAsset.id ? { ...currentAsset, lots: Number(currentAsset.lots), entryPrice: Number(currentAsset.entryPrice) } : a));
    } else {
      const newAsset = {
        ...currentAsset,
        id: Date.now(),
        lots: Number(currentAsset.lots),
        entryPrice: Number(currentAsset.entryPrice),
        name: currentAsset.ticker, // Simplification
        color: ['indigo', 'amber', 'emerald', 'rose', 'blue', 'orange'][Math.floor(Math.random() * 6)]
      };
      setManualAssets([...manualAssets, newAsset]);
    }
    setIsAssetModalOpen(false);
    setIsEditMode(false);
    setCurrentAsset({ ticker: '', lots: '', entryPrice: '' });
  };

  const handleDeleteAsset = (asset) => {
    setAssetToDelete(asset);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (assetToDelete) {
      setManualAssets(manualAssets.filter(a => a.id !== assetToDelete.id));
      setIsDeleteConfirmOpen(false);
      setAssetToDelete(null);
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
            <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden border border-glass">
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
          changeColor="text-secondary"
          visual={
            <div className="flex gap-1.5 items-end h-6">
              <div className="bg-primary/10 w-full h-2 rounded-md border border-glass"></div>
              <div className="bg-primary/30 w-full h-4 rounded-md border border-glass"></div>
              <div className="bg-primary/50 w-full h-3 rounded-md border border-glass"></div>
              <div className="bg-primary/70 w-full h-5 rounded-md border border-glass"></div>
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
    // Get coin balances from the normalized exchange data
    const coinBalances = td.balance?.assets || [];
    const totalValue = td.totalEquity;

    return (
      <div className="w-full flex flex-col gap-6 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-card rounded-2xl border border-glass relative z-20">
          <div>
            <h2 className="text-xl font-black text-main uppercase italic">Crypto Assets</h2>
            <p className="text-secondary text-xs font-bold uppercase tracking-widest opacity-60">Real-time balances from connected exchanges</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 shadow-sm ${isConnected ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              {isConnected ? 'Live Market' : 'Connecting'}
            </div>
            <GlassSelect
              value={activeExchange}
              onChange={setActiveExchange}
              options={(() => {
                const allOptions = [
                  ...tradingConnections.filter(c => c.connected).map(c => ({ value: c.platformId, label: c.name })),
                  { value: 'bybit', label: 'Bybit' },
                  { value: 'binance', label: 'Binance' }
                ];
                return allOptions.filter((opt, index, self) => 
                  index === self.findIndex((t) => t.value === opt.value)
                );
              })()}
              placeholder="Platform"
              className="w-32"
              searchable={false}
            />
            <button
              onClick={() => setNetworkMode(prev => prev === 'testnet' ? 'mainnet' : 'testnet')}
              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${networkMode === 'testnet' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}
            >
              {networkMode}
            </button>
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-glass overflow-hidden w-full">
          <div className="p-4 border-b border-glass flex justify-between items-center bg-black/5 dark:bg-white/5">
            <h3 className="text-sm font-black text-main uppercase italic">Exchange Balances: {activeExchange.toUpperCase()}</h3>
            <span className="text-xs font-bold text-secondary uppercase tracking-widest px-3 py-1.5 bg-black/10 dark:bg-white/10 rounded-lg border border-glass">
              Total Value: {td.isLoading ? '...' : fmtCurrency(totalValue)}
            </span>
          </div>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-glass bg-black/10 dark:bg-white/5 text-xs font-black text-secondary uppercase tracking-widest sticky top-0 z-10">
                  <th className="p-4">Asset</th>
                  <th className="p-4">Wallet Balance</th>
                  <th className="p-4">Available</th>
                  <th className="p-4 text-right">Equity (USD)</th>
                  <th className="p-4 text-right">Unrealized P&L</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-main">
                {td.isLoading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-secondary">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        Loading balances...
                      </div>
                    </td>
                  </tr>
                ) : coinBalances.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-secondary">
                      No assets found. Connect an exchange in Settings to see your balances.
                    </td>
                  </tr>
                ) : coinBalances.map((coin, idx) => {
                  const walletBalance = parseFloat(coin.balance || 0);
                  const availableBalance = parseFloat(coin.available || 0);
                  const equity = parseFloat(coin.equity || 0);
                  const uPnl = parseFloat(coin.unrealizedPnL || 0);
                  const coinName = coin.coin || 'Unknown';

                  // Color mapping for common coins
                  const colorMap = {
                    BTC: 'bg-orange-500/10 border-orange-500/20 text-orange-500',
                    ETH: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
                    USDT: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
                    USDC: 'bg-blue-400/10 border-blue-400/20 text-blue-400',
                    SOL: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
                    XRP: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
                  };
                  const coinColor = colorMap[coinName] || 'bg-glass text-secondary border-glass';

                  return (
                    <tr key={idx} className="border-b border-glass hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-black text-[10px] ${coinColor}`}>
                          {coinName.substring(0, 3)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold">{coinName}</span>
                          <span className="text-[10px] text-secondary uppercase tracking-widest">{activeExchange}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono">{walletBalance.toFixed(walletBalance < 1 ? 6 : 2)}</td>
                      <td className="p-4 font-mono text-secondary">{availableBalance.toFixed(availableBalance < 1 ? 6 : 2)}</td>
                      <td className="p-4 text-right font-mono font-bold">{fmtCurrency(equity)}</td>
                      <td className="p-4 text-right">
                        <span className={`font-mono font-bold ${uPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {uPnl >= 0 ? '+' : ''}{fmtCurrency(uPnl)}
                        </span>
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

  const renderSaham = () => {
    const signals = [
      { 
        ticker: 'GOTO', 
        name: 'GoTo Gojek Tokopedia', 
        trigger: 'Volume Surge', 
        confidence: 92, 
        last: 'Rp 68.00', 
        target: 'Rp 74.00', 
        analysis: 'MA20 Support + High Liquid Flow',
        financials: { marketCap: '82T', pe: '-', revenue: '+28%', profit: '-4.2%' },
        technical: { rsi: 42, macd: 'Bullish Crossover', foreign: 'Accumulation' },
        scalping: { entry: 'Rp 68.00', tp: 'Rp 74.00', sl: 'Rp 65.00' }
      },
      { 
        ticker: 'ANTM', 
        name: 'Aneka Tambang Tbk', 
        trigger: 'Trend Breakout', 
        confidence: 87, 
        last: 'Rp 1,580.00', 
        target: 'Rp 1,650.00', 
        analysis: 'Commodity Surge + Box Breakout',
        financials: { marketCap: '38T', pe: '12.5x', revenue: '+15%', profit: '+14%' },
        technical: { rsi: 64, macd: 'Strong Trend', foreign: 'Net Buy' },
        scalping: { entry: 'Rp 1,580.00', tp: 'Rp 1,650.00', sl: 'Rp 1,510.00' }
      },
      { 
        ticker: 'TLKM', 
        name: 'Telkom Indonesia', 
        trigger: 'Whale Activity', 
        confidence: 78, 
        last: 'Rp 3,740.00', 
        target: 'Rp 3,850.00', 
        analysis: 'Net Foreign Buy + Accumulation Phase',
        financials: { marketCap: '372T', pe: '15.2x', revenue: '+5.4%', profit: '+18.5%' },
        technical: { rsi: 55, macd: 'Neutral/Up', foreign: 'Massive Buy' },
        scalping: { entry: 'Rp 3,740.00', tp: 'Rp 3,850.00', sl: 'Rp 3,650.00' }
      }
    ];

    const toggleRow = (ticker) => setExpandedTicker(expandedTicker === ticker ? null : ticker);

    return (
      <div className="w-full flex flex-col gap-6 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* AI Sniper Engine Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-card rounded-2xl border border-glass relative z-30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center relative overflow-hidden group">
              <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">insights</span>
              <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-xl font-black text-main uppercase italic flex items-center gap-2">
                AI Sniper Engine
                <span className="px-2 py-0.5 rounded text-[8px] bg-primary text-black font-black uppercase tracking-tighter">Pro</span>
              </h2>
              <p className="text-secondary text-xs font-bold uppercase tracking-widest opacity-60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Scanning Real-time IDX Data...
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-glass flex items-center gap-2 bg-black/10">
              Precision: <span className="text-primary italic">94.2%</span>
            </div>
            <button 
              onClick={() => setIsEngineSettingsOpen(true)}
              className="px-5 py-2 rounded-xl bg-white/5 border border-glass text-main text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">settings</span>
              Engine Settings
            </button>
          </div>
        </div>

        {/* AI Sniper Signals */}
        <div className="glass-card rounded-2xl border border-glass overflow-hidden w-full">
          <div className="p-4 border-b border-glass flex justify-between items-center bg-black/5 dark:bg-white/5">
            <h3 className="text-sm font-black text-main uppercase italic flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">radar</span>
              AI Detected Entry Points
            </h3>
            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">IDX: Open (16:31:00)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-glass bg-black/10 dark:bg-white/5 text-xs font-black text-secondary uppercase tracking-widest">
                  <th className="p-4 w-10"></th>
                  <th className="p-4">Ticker</th>
                  <th className="p-4">Signal Trigger</th>
                  <th className="p-4">Confidence</th>
                  <th className="p-4">Last Price</th>
                  <th className="p-4">Target Price</th>
                  <th className="p-4 text-right">AI Reasoning</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-main">
                {signals.map((sig) => (
                  <React.Fragment key={sig.ticker}>
                    <tr className="border-b border-glass hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => toggleRow(sig.ticker)}>
                      <td className="p-4">
                        <span className={`material-symbols-outlined text-primary text-lg transition-transform ${expandedTicker === sig.ticker ? 'rotate-180' : ''}`}>
                          expand_more
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-black text-primary italic">{sig.ticker}</span>
                          <span className="text-[10px] text-secondary uppercase font-bold tracking-widest leading-tight">{sig.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">{sig.trigger}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 w-24">
                          <span className="text-[10px] font-black text-main uppercase italic">{sig.confidence}%</span>
                          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: `${sig.confidence}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-secondary">{sig.last}</td>
                      <td className="p-4 font-mono text-emerald-500">{sig.target}</td>
                      <td className="p-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-primary uppercase italic">Analysis</span>
                          <span className="text-[10px] text-secondary font-bold">{sig.analysis}</span>
                        </div>
                      </td>
                    </tr>
                    {expandedTicker === sig.ticker && (
                      <tr className="bg-black/20 dark:bg-white/[0.02] border-b border-glass animate-in slide-in-from-top-2 duration-300">
                        <td colSpan={7} className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Scalping Targets */}
                            <div className="space-y-3 p-4 rounded-2xl bg-primary/5 border border-primary/20 shadow-lg shadow-primary/5">
                              <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">target</span>
                                Scalping Strategy
                              </p>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-[8px] text-secondary uppercase font-bold tracking-widest">Entry Price</p>
                                  <p className="text-md font-black text-main">{sig.scalping.entry}</p>
                                </div>
                                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                  <p className="text-[8px] text-emerald-500 uppercase font-bold tracking-widest">Take Profit</p>
                                  <p className="text-md font-black text-emerald-500">{sig.scalping.tp}</p>
                                </div>
                                <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                                  <p className="text-[8px] text-red-500 uppercase font-bold tracking-widest">Stop Loss</p>
                                  <p className="text-md font-black text-red-500">{sig.scalping.sl}</p>
                                </div>
                              </div>
                            </div>

                            {/* Financials Deep Dive */}
                            <div className="space-y-3">
                              <p className="text-[10px] font-black text-secondary uppercase tracking-widest border-b border-glass pb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-sm">account_balance</span>
                                Financial Highlights
                              </p>
                              <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                  <p className="text-[9px] text-secondary uppercase font-bold tracking-widest">Market Cap</p>
                                  <p className="text-xs font-black text-main">{sig.financials.marketCap}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-secondary uppercase font-bold tracking-widest">P/E Ratio</p>
                                  <p className="text-xs font-black text-main">{sig.financials.pe}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-secondary uppercase font-bold tracking-widest">Rev. Growth</p>
                                  <p className="text-xs font-black text-emerald-500">{sig.financials.revenue}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-secondary uppercase font-bold tracking-widest">Profit Margin</p>
                                  <p className="text-xs font-black text-main">{sig.financials.profit}</p>
                                </div>
                              </div>
                            </div>

                            {/* Technical Deep Dive */}
                            <div className="space-y-3 px-0 md:px-2 md:border-x border-glass">
                              <p className="text-[10px] font-black text-secondary uppercase tracking-widest border-b border-glass pb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-sm">monitoring</span>
                                Technical Validation
                              </p>
                              <div className="space-y-2 pt-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] text-secondary uppercase font-bold tracking-widest">RSI (14)</span>
                                  <span className="text-xs font-black text-main">{sig.technical.rsi}</span>
                                </div>
                                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                  <div className={`h-full ${sig.technical.rsi > 70 ? 'bg-red-500' : sig.technical.rsi < 30 ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${sig.technical.rsi}%` }}></div>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                  <span className="text-[9px] text-secondary uppercase font-bold tracking-widest">MACD Status</span>
                                  <span className="text-[10px] font-black text-emerald-500 uppercase italic leading-tight">{sig.technical.macd}</span>
                                </div>
                              </div>
                            </div>

                            {/* Sentiment & Flow */}
                            <div className="space-y-3">
                              <p className="text-[10px] font-black text-secondary uppercase tracking-widest border-b border-glass pb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-sm">hub</span>
                                AI Sentiment & Flow
                              </p>
                              <div className="p-3 rounded-xl bg-white/5 border border-glass space-y-2 mt-2 flex flex-col justify-between min-h-[140px] overflow-hidden">
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] font-black text-secondary uppercase tracking-tighter">Foreign Flow</span>
                                  <span className="text-[9px] font-black text-primary uppercase italic bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{sig.technical.foreign}</span>
                                </div>
                                <p className="text-[9px] text-main font-medium leading-relaxed italic opacity-90 border-l-2 border-primary/30 pl-3">
                                  "AI Engine mendeteksi akumulasi besar dari institusi asing dalam 3 sesi terakhir, selaras dengan pola bull-flag yang menunjukkan kelanjutan tren positif."
                                </p>
                                <div className="pt-1 flex items-center gap-1.5 opacity-60">
                                  <span className="w-1 h-1 rounded-full bg-primary animate-pulse"></span>
                                  <span className="text-[8px] font-black uppercase tracking-widest">Model: {engineConfig.model}</span>
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
        </div>

        {/* Manual Stock Portfolio */}
        <div className="glass-card rounded-2xl border border-glass overflow-hidden w-full group/portfolio">
          <div className="p-4 border-b border-glass flex justify-between items-center bg-black/5 dark:bg-white/5">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-black text-main uppercase italic flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">inventory_2</span>
                Manual Stock Portfolio
              </h3>
              <button 
                onClick={() => openModal()}
                className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all flex items-center gap-1.5 opacity-0 group-hover/portfolio:opacity-100"
              >
                <span className="material-symbols-outlined text-[12px]">add_circle</span>
                Add Asset
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-secondary uppercase tracking-widest opacity-60 italic">Offline tracking mode</span>
              <span className="text-xs font-bold text-secondary uppercase tracking-widest px-3 py-1.5 bg-black/10 dark:bg-white/10 rounded-lg border border-glass">
                Portfolio Value: Rp {manualAssets.reduce((total, asset) => {
                  const lastPrice = IDX_MOCK_PRICES[asset.ticker] || 0;
                  return total + (asset.lots * 100 * lastPrice);
                }, 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-glass bg-black/10 dark:bg-white/5 text-xs font-black text-secondary uppercase tracking-widest">
                  <th className="p-4">Asset</th>
                  <th className="p-4">Amount (Lots)</th>
                  <th className="p-4">Entry Price</th>
                  <th className="p-4">Last Price</th>
                  <th className="p-4 text-right">Market Value</th>
                  <th className="p-4 text-right">PnL</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-main">
                {manualAssets.map((asset) => {
                  const lastPrice = IDX_MOCK_PRICES[asset.ticker] || 0;
                  const marketValue = asset.lots * 100 * lastPrice;
                  const unrealizedPnL = (lastPrice - asset.entryPrice) * asset.lots * 100;
                  const pnlPercent = ((lastPrice - asset.entryPrice) / asset.entryPrice) * 100;

                  return (
                    <tr key={asset.id} className="border-b border-glass hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                      <td className="p-4 flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-full bg-${asset.color}-500/10 border border-${asset.color}-500/20 flex items-center justify-center text-${asset.color}-500 font-black text-[10px]`}>
                           {asset.ticker.substring(0, 3)}
                         </div>
                         <div className="flex flex-col">
                           <span className="font-bold">{asset.ticker}</span>
                           <span className="text-[10px] text-secondary uppercase tracking-widest">{asset.name}</span>
                         </div>
                      </td>
                      <td className="p-4 font-mono">{asset.lots}</td>
                      <td className="p-4 font-mono text-secondary">Rp {asset.entryPrice.toLocaleString('id-ID')}</td>
                      <td className="p-4 font-mono">Rp {lastPrice.toLocaleString('id-ID')}</td>
                      <td className="p-4 text-right font-mono font-bold">Rp {marketValue.toLocaleString('id-ID')}</td>
                      <td className="p-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`font-mono ${unrealizedPnL >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {unrealizedPnL >= 0 ? '+' : ''}Rp {unrealizedPnL.toLocaleString('id-ID')}
                          </span>
                          <span className={`text-[10px] font-bold ${pnlPercent >= 0 ? 'text-emerald-500/80' : 'text-red-500/80'}`}>
                            {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openModal(asset)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-primary/10 text-secondary hover:text-primary transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteAsset(asset)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-secondary hover:text-red-500 transition-all"
                          >
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
          <div className="glass-card w-full max-w-md border border-glass rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-main uppercase italic flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">settings_suggest</span>
                Engine Config
              </h2>
              <button 
                onClick={() => setIsEngineSettingsOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-secondary hover:text-main transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] text-secondary font-black uppercase tracking-widest mb-2.5 block">AI Model Architecture</label>
                <div className="grid grid-cols-1 gap-2">
                  {['TwinProphet V2', 'GPT-4o (Standard)', 'Claude 3.5 Sonnet'].map(m => (
                    <button 
                      key={m}
                      onClick={() => setEngineConfig({...engineConfig, model: m})}
                      className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all group ${engineConfig.model === m ? 'bg-primary/10 border-primary shadow-sm' : 'bg-black/20 border-glass hover:border-primary/40'}`}
                    >
                      <div>
                        <span className={`text-xs font-black block ${engineConfig.model === m ? 'text-primary' : 'text-main'}`}>{m}</span>
                        <span className="text-[8px] text-secondary font-bold uppercase">{m === 'TwinProphet V2' ? 'Optimized for IDX Stocks' : 'General Intelligence'}</span>
                      </div>
                      {engineConfig.model === m && (
                        <span className="material-symbols-outlined text-primary text-sm animate-in zoom-in">check_circle</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-secondary font-black uppercase tracking-widest mb-2.5 block italic">Scanning Schedule (Token-Saver)</label>
                <div className="p-4 rounded-3xl bg-black/20 border border-glass space-y-4">
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
                          className="w-5 h-5 rounded-lg border-2 border-glass bg-transparent appearance-none checked:bg-primary checked:border-primary transition-all cursor-pointer"
                        />
                        {engineConfig.schedule.includes(time) && (
                          <span className="material-symbols-outlined absolute text-black text-[14px] font-black pointer-events-none left-0.5">check</span>
                        )}
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-widest group-hover:text-primary transition-colors ${engineConfig.schedule.includes(time) ? 'text-main' : 'text-secondary opacity-60'}`}>
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
          <div className="glass-card w-full max-w-sm border border-glass rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-main uppercase italic flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">{isEditMode ? 'edit_note' : 'add_business'}</span>
                {isEditMode ? 'Edit Asset' : 'Add New Asset'}
              </h2>
              <button 
                onClick={() => setIsAssetModalOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-secondary hover:text-main transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] text-secondary font-black uppercase tracking-widest mb-1.5 block">Stock Ticker (e.g. BBRI)</label>
                <input 
                  type="text" 
                  value={currentAsset.ticker}
                  onChange={(e) => setCurrentAsset({...currentAsset, ticker: e.target.value.toUpperCase()})}
                  placeholder="EX: ASII"
                  className="w-full px-4 py-3 rounded-xl bg-black/20 border border-glass text-main font-bold outline-none focus:border-primary transition-all"
                />
                {currentAsset.ticker && !IDX_MOCK_PRICES[currentAsset.ticker] && (
                  <p className="text-[9px] text-amber-500 font-bold uppercase mt-1 italic">⚠ Unknown ticker - using mock price Rp 1.000</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-secondary font-black uppercase tracking-widest mb-1.5 block">Amount (Lots)</label>
                  <input 
                    type="number" 
                    value={currentAsset.lots}
                    onChange={(e) => setCurrentAsset({...currentAsset, lots: e.target.value})}
                    placeholder="10"
                    className="w-full px-4 py-3 rounded-xl bg-black/20 border border-glass text-main font-mono font-bold outline-none focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-secondary font-black uppercase tracking-widest mb-1.5 block">Avg Entry Price</label>
                  <input 
                    type="number" 
                    value={currentAsset.entryPrice}
                    onChange={(e) => setCurrentAsset({...currentAsset, entryPrice: e.target.value})}
                    placeholder="5000"
                    className="w-full px-4 py-3 rounded-xl bg-black/20 border border-glass text-main font-mono font-bold outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-[9px] font-black text-secondary uppercase">Estimated Value</span>
                  <span className="text-[9px] font-black text-main">
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
          <div className="glass-card w-full max-w-sm border border-glass rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-red-500 text-3xl">delete_forever</span>
            </div>
            
            <h2 className="text-xl font-black text-main uppercase italic mb-2">Remove Asset?</h2>
            <p className="text-xs text-secondary font-bold leading-relaxed mb-8">
              Are you sure you want to remove <span className="text-main">{assetToDelete.ticker}</span> from your manual portfolio? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setAssetToDelete(null);
                }}
                className="flex-1 py-4 rounded-2xl bg-white/5 border border-glass text-main text-[12px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
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

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center w-full gap-6 pb-6 border-b border-glass">
        <nav className="flex items-center gap-2 p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-glass overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('crypto')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'crypto' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-secondary hover:text-main hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            Crypto
          </button>
          <button
            onClick={() => setActiveTab('saham')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'saham' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-secondary hover:text-main hover:bg-black/5 dark:hover:bg-white/5'}`}
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

