import React, { useState, useEffect, useRef } from 'react';

// Common crypto icons/logos (using standard SVG or text as fallbacks)
const getIcon = (symbol) => {
    if (symbol.includes('BTC')) return <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-[10px] shadow-sm">₿</div>;
    if (symbol.includes('ETH')) return <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-[10px] shadow-sm">Ξ</div>;
    if (symbol.includes('SOL')) return <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center font-bold text-[10px] shadow-sm">S</div>;
    return <div className="w-6 h-6 rounded-full bg-[var(--bg-surface)] text-[var(--text-secondary)] flex items-center justify-center font-bold text-[10px] border border-[var(--border)] shadow-sm">♦</div>;
};

// Initial state mapping for our highlighted tickers so they render immediately before WS connects
const tabsConfig = {
    'Favorites': { url: 'wss://stream.bybit.com/v5/public/spot', tickers: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'AVAXUSDT', 'LINKUSDT', 'SUIUSDT', 'OPUSDT'] },
    'Spot': { url: 'wss://stream.bybit.com/v5/public/spot', tickers: ['APTUSDT', 'ARBUSDT', 'NEARUSDT', 'ADAUSDT', 'MATICUSDT', 'LTCUSDT', 'BCHUSDT', 'UNIUSDT', 'ATOMUSDT'] },
    'Derivatives': { url: 'wss://stream.bybit.com/v5/public/linear', tickers: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', '1000PEPEUSDT', '1000FLOKIUSDT', 'WIFUSDT', 'ONDOUSDT', 'TONUSDT'] },
    'TradFi': { url: 'wss://stream.bybit.com/v5/public/spot', tickers: ['PAXGUSDT', 'EURUSDT'] },
    'Newly Listed': { url: 'wss://stream.bybit.com/v5/public/spot', tickers: ['STRKUSDT', 'PORTALUSDT', 'AEVOUSDT', 'ETHFIUSDT', 'ENAUSDT', 'WUSDT', 'TNSRUSDT', 'OMNIUSDT', 'REZUSDT'] }
};

const Feed = () => {
    const [activeTab, setActiveTab] = useState('Favorites');
    const [tickerData, setTickerData] = useState({});
    const wsRef = useRef(null);

    // Track previous prices to determine flash color (red/green blink on update)
    const prevPricesRef = useRef({});

    useEffect(() => {
        // 1. Get configuration for current tab
        const config = tabsConfig[activeTab];
        if (!config) return;

        // 2. Initialize empty state for our target tickers
        const initial = {};
        config.tickers.forEach(t => {
            initial[t] = {
                symbol: t,
                lastPrice: '0.00',
                priceChangePercent: '0.00',
                highPrice24h: '0.00',
                lowPrice24h: '0.00',
                turnover24h: '0.00',
                _flash: null
            };
        });
        setTickerData(initial);

        // 3. Connect to Bybit Public WebSocket (Spot or Linear V5)
        const connectWs = () => {
            if (wsRef.current) wsRef.current.close();

            wsRef.current = new WebSocket(config.url);

            wsRef.current.onopen = () => {
                console.log(`Connected to Bybit WebSockets (${activeTab})`);
                // Subscribe to our target tickers individually so one invalid symbol doesn't fail the rest
                config.tickers.forEach(t => {
                    wsRef.current.send(JSON.stringify({
                        op: "subscribe",
                        args: [`tickers.${t}`]
                    }));
                });
            };

            wsRef.current.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.topic && msg.topic.startsWith('tickers.') && msg.data) {
                    const t = msg.data;
                    // Bybit sends delta updates, so we merge with existing state
                    setTickerData(current => {
                        const sym = t.symbol;
                        const existing = current[sym] || {};

                        // Record previous price for flashing effect
                        if (existing.lastPrice && t.lastPrice && existing.lastPrice !== t.lastPrice) {
                            prevPricesRef.current[sym] = existing.lastPrice;
                        }

                        return {
                            ...current,
                            [sym]: {
                                ...existing,
                                symbol: sym,
                                lastPrice: t.lastPrice || existing.lastPrice,
                                priceChangePercent: t.price24hPcnt ? (Number(t.price24hPcnt) * 100).toFixed(2) : existing.priceChangePercent,
                                highPrice24h: t.highPrice24h || existing.highPrice24h,
                                lowPrice24h: t.lowPrice24h || existing.lowPrice24h,
                                turnover24h: t.turnover24h || existing.turnover24h,
                                _flash: t.lastPrice ? (Number(t.lastPrice) > Number(existing.lastPrice) ? 'up' : 'down') : existing._flash
                            }
                        };
                    });
                }
            };

            wsRef.current.onclose = () => {
                console.log(`WS Connection closed for ${activeTab}, attempting reconnect...`);
                // Only reconnect if this tab is still active and the component is mounted
                // but since activeTab change triggers cleanup, this is generally safe to just ignore or try once.
            };
        };

        connectWs();

        // Cleanup on unmount or tab change
        return () => {
            if (wsRef.current) {
                // Remove onclose handler so it doesn't try to reconnect when we intentionally close it
                wsRef.current.onclose = null;
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [activeTab]);

    // Helper to safely format numbers (K, M, B)
    const formatCompact = (numStr) => {
        const num = Number(numStr);
        if (isNaN(num) || num === 0) return '0.00';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return num.toFixed(2);
    };

    const tickersArr = Object.values(tickerData);

    // Mock sorting for the top 3 highlights
    const topGainers = [...tickersArr].sort((a, b) => Number(b.priceChangePercent) - Number(a.priceChangePercent)).slice(0, 3);
    const newListed = [...tickersArr].reverse().slice(0, 3); // Just grabbing last 3 arbitrarily
    const trending = [...tickersArr].slice(0, 3); // Just grabbing first 3

    return (
        <div className="w-full space-y-6">

            {/* 🚀 Top Section 3 Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Panel 1: Mock Market Sentiment */}
                <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-[var(--text-primary)]">Market Sentiment</h3>
                        <button className="text-xs text-primary font-bold flex items-center gap-1 hover:brightness-110">
                            View More <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center relative py-6">
                        {/* Simple CSS Half-Circle Gauge */}
                        <div className="relative w-48 h-24 overflow-hidden">
                            <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[18px] border-red-500/80 border-b-transparent border-r-transparent transform -rotate-45"></div>
                            <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[18px] border-amber-500/80 border-b-transparent border-t-transparent border-l-transparent transform -rotate-45"></div>
                        </div>
                        <div className="absolute bottom-8 flex flex-col items-center">
                            <span className="text-4xl font-black text-red-500">13</span>
                            <span className="text-sm font-bold text-red-500 uppercase tracking-wide">Extreme Fear</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <div className="flex flex-col"><span className="text-emerald-500">65</span><span className="opacity-70">Long</span></div>
                        <div className="flex flex-col text-right"><span className="text-red-500">35</span><span className="opacity-70">Short</span></div>
                    </div>
                </div>

                {/* Panel 2: Mock Market Data */}
                <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-2xl p-6 shadow-sm flex flex-col transition-all duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-[var(--text-primary)]">Market Data</h3>
                        <button className="text-xs text-primary font-bold flex items-center gap-1 hover:brightness-110">
                            View More <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">Trading Vol.</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">858.48 B</span>
                            <span className="text-sm font-medium text-emerald-500 flex items-center"><span className="material-symbols-outlined text-[14px]">call_made</span> 78.13%</span>
                        </div>
                    </div>
                    {/* Decorative Sparkline Chart */}
                    <div className="mt-auto pt-8 h-20 w-full flex items-end opacity-60">
                        <div className="w-full h-full bg-gradient-to-t from-emerald-500/20 to-transparent border-t-2 border-emerald-500 rounded-t-lg" style={{ clipPath: 'polygon(0 80%, 20% 60%, 40% 70%, 60% 30%, 80% 40%, 100% 10%, 100% 100%, 0 100%)' }}></div>
                    </div>
                </div>

                {/* Panel 3: Trending Sectors */}
                <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-2xl p-6 shadow-sm flex flex-col transition-all duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-[var(--text-primary)]">Trending Sectors</h3>
                    </div>
                    <div className="space-y-4 flex-1">
                        {[
                            { name: 'DCG Portfolio', p1: '+5.99%', asset: 'FLOW', p2: '+35.89%', color: 'text-emerald-500' },
                            { name: 'Memes', p1: '+4.07%', asset: 'SHIB', p2: '+5.75%', color: 'text-emerald-500' },
                            { name: 'Twitter', p1: '+3.33%', asset: 'SHIB', p2: '+5.75%', color: 'text-emerald-500' },
                            { name: 'Layer 1 (L1)', p1: '+2.46%', asset: 'SUI', p2: '+3.96%', color: 'text-emerald-500' }
                        ].map((sector, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-[var(--text-primary)] w-1/3 text-xs md:text-sm">{sector.name}</span>
                                <span className={`font-bold ${sector.color} w-1/4 text-right`}>{sector.p1}</span>
                                <div className="flex items-center justify-end gap-2 w-1/3">
                                    <span className="font-bold text-[var(--text-secondary)] text-xs">{sector.asset}</span>
                                    <span className={`font-bold ${sector.color} text-xs`}>{sector.p2}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 🚀 Main Markets List Section */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-2xl shadow-sm overflow-hidden flex flex-col transition-all duration-300">

                {/* Header Search & Title */}
                <div className="p-4 md:p-6 pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Markets</h2>
                    <div className="relative w-full md:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-[18px]">search</span>
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full border border-[var(--border)] rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] group transition-all"
                        />
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="px-4 md:px-6">
                    <div className="flex gap-2 py-4">
                        {['Favorites', 'Spot', 'Derivatives', 'TradFi', 'Newly Listed'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-primary text-[#000] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:'} `}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quick Highlights 3-Column Banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-6 hidden lg:grid">
                    {[
                        { title: 'Top Gainers', data: topGainers },
                        { title: 'Newly Listed', data: newListed },
                        { title: 'Trending', data: trending }
                    ].map((col, idx) => (
                        <div key={idx}>
                            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">{col.title}</h4>
                            <div className="flex justify-between text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 px-1">
                                <span>Pairs</span>
                                <div className="flex gap-4 text-right">
                                    <span className="w-16">Price</span>
                                    <span className="w-16">24H Change</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                {col.data.map((t, i) => {
                                    const isUp = Number(t.priceChangePercent) >= 0;
                                    return (
                                        <div key={i} className="flex justify-between items-center text-sm px-1 py-1.5 hover: rounded-xl transition-all cursor-pointer">
                                            <div className="flex items-center gap-2 font-bold max-w-[100px] truncate">
                                                {getIcon(t.symbol)}
                                                <span className="text-[var(--text-primary)]">{t.symbol.replace('USDT', '')}</span><span className="text-[var(--text-secondary)] text-xs font-normal">/USDT</span>
                                            </div>
                                            <div className="flex gap-4 text-right font-mono">
                                                <span className="w-16 text-[var(--text-primary)] font-semibold">{Number(t.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                                                <span className={`w-16 font-bold ${isUp ? 'text-emerald-500' : 'text-red-500'} `}>
                                                    {isUp ? '+' : ''}{t.priceChangePercent}%
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Data Table */}
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-[var(--border)] text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                <th className="p-4 pl-6 w-1/4">Trading Pairs</th>
                                <th className="p-4 text-right cursor-pointer hover:text-[var(--text-primary)]">Last Traded Price <span className="text-[10px]">↕</span></th>
                                <th className="p-4 text-right cursor-pointer hover:text-[var(--text-primary)]">24H Change % <span className="text-[10px]">↕</span></th>
                                <th className="p-4 text-right">24H High</th>
                                <th className="p-4 text-right">24H Low</th>
                                <th className="p-4 text-right cursor-pointer hover:text-[var(--text-primary)]">24H Volume <span className="text-[10px]">↕</span></th>
                                <th className="p-4 text-right pr-6">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass/30">
                            {tickersArr.map(t => {
                                const isUp = Number(t.priceChangePercent) >= 0;
                                // Determine row flash class based on live WS updates
                                const flashClass = t._flash === 'up' ? 'text-emerald-500 transition-colors duration-200' :
                                    t._flash === 'down' ? 'text-red-500 transition-colors duration-200' :
                                        'text-slate-800 dark:text-slate-100 transition-colors duration-1000'; // fade back slowly

                                return (
                                    <tr key={t.symbol} className="hover: transition-all group">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <button className="text-secondary/40 hover:text-amber-400 transition-colors">
                                                    <span className="material-symbols-outlined text-[16px]">star</span>
                                                </button>
                                                {getIcon(t.symbol)}
                                                <div className="flex items-center gap-1 font-bold">
                                                    <span className="text-[var(--text-primary)]">{t.symbol.replace('USDT', '')}</span>
                                                    <span className="text-[var(--text-secondary)] font-normal text-xs">/USDT</span>
                                                    <span className="px-1.5 py-0.5 rounded text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black ml-1">10X</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={`p-4 text-right font-mono font-bold ${flashClass} `}>
                                            {Number(t.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                        </td>
                                        <td className={`p-4 text-right font-mono font-bold ${isUp ? 'text-emerald-500' : 'text-red-500'} `}>
                                            {isUp ? '+' : ''}{t.priceChangePercent}%
                                        </td>
                                        <td className="p-4 text-right font-mono text-sm text-[var(--text-secondary)]">
                                            {Number(t.highPrice24h).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                        </td>
                                        <td className="p-4 text-right font-mono text-sm text-[var(--text-secondary)]">
                                            {Number(t.lowPrice24h).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                        </td>
                                        <td className="p-4 text-right font-mono text-sm text-[var(--text-primary)] font-medium">
                                            {formatCompact(t.turnover24h)}
                                        </td>
                                        <td className="p-4 text-right pr-6">
                                            <div className="flex items-center justify-end gap-3">
                                                <button className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">Details</button>
                                                <button className="bg-primary hover:brightness-110 text-black font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-sm">
                                                    Trade
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

export default Feed;
