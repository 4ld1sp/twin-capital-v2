import { useState, useEffect, useRef } from 'react';
import { useTrading } from '../context/TradingContext';
import {
  getAccountBalance,
  getPositions,
  getActiveOrders,
  getOrderHistory,
  getClosedPnl,
} from '../services/exchangeService';

/**
 * Shared hook that fetches and caches all exchange data.
 * Prevents duplicate API calls when multiple components need the same data.
 * Auto-refreshes every `interval` ms (default 10s).
 */
export function useTradingData(interval = 10000) {
  const { activeExchange } = useTrading();

  const [balance, setBalance] = useState(null);
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [closedPnl, setClosedPnl] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const consecutiveFailures = useRef(0);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [balRes, posRes, ordRes, histRes, pnlRes] = await Promise.all([
          getAccountBalance(activeExchange),
          getPositions(activeExchange),
          getActiveOrders(activeExchange),
          getOrderHistory(activeExchange),
          getClosedPnl(activeExchange),
        ]);

        if (!mounted) return;

        // Balance
        if (balRes.data) {
          setBalance(balRes.data);
          setError(null);
          consecutiveFailures.current = 0;
        } else if (balRes.error) {
          consecutiveFailures.current += 1;
          if (consecutiveFailures.current >= 3) {
            setError(balRes.error);
          }
        }

        // Other data — persist old data on error
        if (!posRes.error) setPositions(posRes.list);
        if (!ordRes.error) setOrders(ordRes.list);
        if (!histRes.error) setOrderHistory(histRes.list);
        if (!pnlRes.error) setClosedPnl(pnlRes.list);

        setIsLoading(false);
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setIsLoading(false);
        }
      }
    };

    loadData();
    const timer = setInterval(loadData, interval);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [activeExchange, interval]);

  // ─── Derived Metrics ─────────────────────────────────────
  const totalEquity = balance ? parseFloat(balance.totalEquity || 0) : 0;
  const unrealizedPnl = balance ? parseFloat(balance.unrealizedPnL || 0) : 0;

  // Total realized P&L from all closed positions
  const totalRealizedPnl = closedPnl.reduce(
    (sum, p) => sum + parseFloat(p.closedPnl || 0),
    0
  );

  // Winrate from ALL historical closed P&L
  const totalTrades = closedPnl.length;
  const winningTrades = closedPnl.filter(
    (p) => parseFloat(p.closedPnl || 0) > 0
  ).length;
  const winrate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  // Max Drawdown — computed from the cumulative P&L curve
  let maxDrawdown = 0;
  let peak = 0;
  let runningPnl = 0;
  // Sort by time ascending for correct curve
  const sortedPnl = [...closedPnl].sort(
    (a, b) => (a.updatedTime || 0) - (b.updatedTime || 0)
  );
  for (const trade of sortedPnl) {
    runningPnl += parseFloat(trade.closedPnl || 0);
    if (runningPnl > peak) peak = runningPnl;
    const drawdown = peak > 0 ? ((peak - runningPnl) / peak) * 100 : 0;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  // P&L timeseries for charts (grouped by day)
  const pnlTimeseries = (() => {
    const byDay = {};
    let cumulative = 0;
    for (const trade of sortedPnl) {
      const d = trade.updatedTime
        ? new Date(trade.updatedTime).toISOString().split('T')[0]
        : 'unknown';
      cumulative += parseFloat(trade.closedPnl || 0);
      if (!byDay[d]) byDay[d] = { date: d, pnl: 0, cumulative: 0 };
      byDay[d].pnl += parseFloat(trade.closedPnl || 0);
      byDay[d].cumulative = cumulative;
    }
    return Object.values(byDay);
  })();

  return {
    // Raw data
    balance,
    positions,
    orders,
    orderHistory,
    closedPnl,
    isLoading,
    error,

    // Derived metrics
    totalEquity,
    unrealizedPnl,
    totalRealizedPnl,
    winrate,
    totalTrades,
    winningTrades,
    maxDrawdown,
    pnlTimeseries,
  };
}
