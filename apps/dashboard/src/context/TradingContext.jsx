import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from './AppContext';
import { subscribeTickerWS, unsubscribeAll, getTickerREST } from '../services/exchangeService';

const TradingContext = createContext();

export function useTrading() {
  return useContext(TradingContext);
}

const STORAGE_KEY = 'twin_capital_strategies';
const EXCHANGE_KEY = 'twin_capital_active_exchange';

function loadStrategies() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveStrategiesToStorage(strategies) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(strategies));
}

export function TradingProvider({ children }) {
  const { userConnections } = useApp();

  // Derive available exchanges from configured trading connections
  const availableExchanges = (userConnections?.trading || [])
    .filter(c => c.connected)
    .map(c => ({
      id: c.platformId,
      name: c.name,
      isTestnet: c.fields?.testnet === true || c.fields?.testnet === 'true',
    }));

  // Core state
  const [activeExchange, setActiveExchange] = useState(() => {
    const saved = localStorage.getItem(EXCHANGE_KEY);
    return saved || 'bybit';
  });
  const [networkMode, setNetworkMode] = useState('testnet'); // 'testnet' | 'mainnet'
  const [activeSymbol, setActiveSymbol] = useState('BTCUSDT');
  const [activeTimeframe, setActiveTimeframe] = useState('15');
  const [livePrice, setLivePrice] = useState(null);
  const [liveTicker, setLiveTicker] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [savedStrategies, setSavedStrategies] = useState(loadStrategies);
  const [activeStrategy, setActiveStrategy] = useState(null);

  // Persist exchange selection
  useEffect(() => {
    localStorage.setItem(EXCHANGE_KEY, activeExchange);
  }, [activeExchange]);

  // Persist strategies
  useEffect(() => {
    saveStrategiesToStorage(savedStrategies);
  }, [savedStrategies]);

  // WebSocket subscription for live ticker
  const wsCleanupRef = useRef(null);

  useEffect(() => {
    // Cleanup previous subscription
    if (wsCleanupRef.current) {
      wsCleanupRef.current();
    }

    setIsConnected(false);
    setLivePrice(null);
    setLiveTicker(null);

    // Fetch initial price via REST
    getTickerREST(activeSymbol, activeExchange, networkMode)
      .then(ticker => {
        if (ticker) {
          setLivePrice(parseFloat(ticker.lastPrice));
          setLiveTicker(ticker);
          setIsConnected(true);
        }
      })
      .catch(() => {});

    // Subscribe to WebSocket
    const cleanup = subscribeTickerWS(activeSymbol, activeExchange, networkMode, (data) => {
      if (data.lastPrice) {
        const price = parseFloat(data.lastPrice);
        setLivePrice(price);
        setLiveTicker(prev => ({ ...prev, ...data }));
        setIsConnected(true);
        setPriceHistory(prev => {
          const next = [...prev, { time: Date.now(), price }];
          return next.slice(-120); // Keep last 120 ticks
        });
      }
    });

    wsCleanupRef.current = cleanup;

    return () => {
      if (cleanup) cleanup();
    };
  }, [activeSymbol, activeExchange, networkMode]);

  // Strategy management
  const saveStrategy = useCallback((strategy) => {
    setSavedStrategies(prev => {
      const exists = prev.findIndex(s => s.id === strategy.id);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = { ...updated[exists], ...strategy, updatedAt: Date.now() };
        return updated;
      }
      return [...prev, {
        ...strategy,
        id: strategy.id || `strategy_${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }];
    });
  }, []);

  const deleteStrategy = useCallback((id) => {
    setSavedStrategies(prev => prev.filter(s => s.id !== id));
    if (activeStrategy?.id === id) setActiveStrategy(null);
  }, [activeStrategy]);

  const deployStrategy = useCallback((strategy) => {
    setActiveStrategy(strategy);
  }, []);

  // Format symbol for TradingView widget
  const getTradingViewSymbol = useCallback(() => {
    const exchangeMap = {
      bybit: 'BYBIT',
      binance: 'BINANCE',
      okx: 'OKX',
    };
    const prefix = exchangeMap[activeExchange] || 'BYBIT';
    return `${prefix}:${activeSymbol}`;
  }, [activeExchange, activeSymbol]);

  const value = {
    // Exchange
    activeExchange,
    setActiveExchange,
    networkMode,
    setNetworkMode,
    availableExchanges,

    // Chart sync
    activeSymbol,
    setActiveSymbol,
    activeTimeframe,
    setActiveTimeframe,
    getTradingViewSymbol,

    // Live data
    livePrice,
    liveTicker,
    priceHistory,
    isConnected,

    // Strategy
    savedStrategies,
    saveStrategy,
    deleteStrategy,
    activeStrategy,
    deployStrategy,
    setActiveStrategy,
  };

  return (
    <TradingContext.Provider value={value}>
      {children}
    </TradingContext.Provider>
  );
}
