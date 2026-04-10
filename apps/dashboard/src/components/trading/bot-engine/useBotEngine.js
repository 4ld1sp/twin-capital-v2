import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useBotEngine — Centralized data hook for the Hybrid Bot Engine UI.
 *
 * Responsibilities:
 * - Fetch and poll the list of bots every 10s.
 * - Fetch and poll the selected bot's detail + logs every 15s.
 * - Expose controls: selectBot, stopBot, pauseBot, resumeBot.
 */
export function useBotEngine() {
  const [bots, setBots] = useState([]);
  const [selectedBotId, setSelectedBotId] = useState(null);
  const [botDetail, setBotDetail] = useState(null); // { bot, logs }
  const [isLoadingBots, setIsLoadingBots] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const detailIntervalRef = useRef(null);

  // ── Fetch all bots ──────────────────────────────────────────
  const fetchBots = useCallback(async () => {
    try {
      const res = await fetch('/api/bots');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBots(data);
      // Auto-select logic: ensure we follow bot replacements
      setSelectedBotId(prev => {
        const activeMatches = data.filter(b => ['running', 'paused', 'error'].includes(b.status));
        
        if (prev) {
          const currentBotInList = data.find(b => b.id === prev);
          // 🛡️ If the previously selected bot was replaced, auto-switch to the new active one for same symbol
          if (currentBotInList && currentBotInList.status === 'replaced') {
            const nextBot = activeMatches.find(b => b.symbol === currentBotInList.symbol);
            if (nextBot) {
               console.log(`[useBotEngine] Auto-switching from replaced bot ${prev} to new instance ${nextBot.id}`);
               return nextBot.id;
            }
          }
          return prev;
        }
        
        // Initial fallbacks
        return activeMatches[0]?.id || data[0]?.id || null;
      });
      setError(null);
    } catch (err) {
      console.error('[useBotEngine] Failed to fetch bots:', err.message);
      setError(err.message);
    } finally {
      setIsLoadingBots(false);
    }
  }, []);

  // ── Fetch selected bot detail + logs ─────────────────────────
  const fetchBotDetail = useCallback(async (botId) => {
    if (!botId) return;
    setIsLoadingDetail(true);
    // Clear old detail immediately if switching to a different bot
    setBotDetail(prev => (prev?.bot?.id === botId ? prev : null));

    try {
      const res = await fetch(`/api/bots/${botId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBotDetail(data);
    } catch (err) {
      console.error('[useBotEngine] Failed to fetch bot detail:', err.message);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  // ── Poll bots list every 10s ──────────────────────────────────
  useEffect(() => {
    fetchBots();
    const interval = setInterval(fetchBots, 10000);
    return () => clearInterval(interval);
  }, [fetchBots]);

  // ── Poll selected bot detail every 15s ────────────────────────
  useEffect(() => {
    if (detailIntervalRef.current) clearInterval(detailIntervalRef.current);
    if (!selectedBotId) { setBotDetail(null); return; }

    fetchBotDetail(selectedBotId);
    detailIntervalRef.current = setInterval(() => fetchBotDetail(selectedBotId), 15000);
    return () => clearInterval(detailIntervalRef.current);
  }, [selectedBotId, fetchBotDetail]);

  // ── Bot control actions ───────────────────────────────────────
  const callBotAction = useCallback(async (botId, action) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bots/${botId}/${action}`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Immediately refresh data
      await fetchBots();
      await fetchBotDetail(botId);
    } catch (err) {
      console.error(`[useBotEngine] Action "${action}" failed:`, err.message);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }, [fetchBots, fetchBotDetail]);

  const stopBot = useCallback((botId) => callBotAction(botId, 'stop'), [callBotAction]);
  const pauseBot = useCallback((botId) => callBotAction(botId, 'pause'), [callBotAction]);
  const resumeBot = useCallback((botId) => callBotAction(botId, 'resume'), [callBotAction]);
  const resetDrawdown = useCallback((botId) => callBotAction(botId, 'reset-drawdown'), [callBotAction]);

  const updateBotSettings = useCallback(async (botId, settings) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bots/${botId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Immediately refresh data
      await fetchBots();
      await fetchBotDetail(botId);
    } catch (err) {
      console.error(`[useBotEngine] Settings update failed:`, err.message);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }, [fetchBots, fetchBotDetail]);

  return {
    bots,
    selectedBotId,
    setSelectedBotId,
    bot: botDetail?.bot || null,
    logs: botDetail?.logs || [],
    isLoadingBots,
    isLoadingDetail,
    error,
    actionLoading,
    stopBot,
    pauseBot,
    resumeBot,
    resetDrawdown,
    updateBotSettings,
    refetch: () => {
      fetchBots();
      if (selectedBotId) fetchBotDetail(selectedBotId);
    },
  };
}

/**
 * Given a lastSignalAt timestamp (ISO string) and a signalInterval string (e.g. "30m"),
 * compute a compact countdown string to the next signal cycle.
 */
export function useSignalCountdown(lastSignalAt, signalInterval, status) {
  const [countdown, setCountdown] = useState('--:--');

  useEffect(() => {
    if (!lastSignalAt || !signalInterval) { setCountdown('--:--'); return; }
    
    // If bot is not running, don't show a live countdown
    if (status !== 'running') {
      if (status === 'paused') { setCountdown('PAUSED'); return; }
      if (status === 'stopped') { setCountdown('STOPPED'); return; }
      if (status === 'killed') { setCountdown('KILLED'); return; }
      setCountdown('--:--');
      return;
    }

    const parseIntervalMs = (interval) => {
      const match = interval?.match(/^(\d+)(s|m|h)$/);
      if (!match) return 1800000; // default 30m
      const [, num, unit] = match;
      const multiplier = { s: 1000, m: 60000, h: 3600000 };
      return parseInt(num) * (multiplier[unit] || 60000);
    };

    const intervalMs = parseIntervalMs(signalInterval);
    const nextAt = new Date(lastSignalAt).getTime() + intervalMs;

    const update = () => {
      const remaining = nextAt - Date.now();
      if (remaining <= 0) { setCountdown('Now'); return; }
      const totalSec = Math.floor(remaining / 1000);
      const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
      const s = (totalSec % 60).toString().padStart(2, '0');
      setCountdown(`${m}:${s}`);
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [lastSignalAt, signalInterval, status]);

  return countdown;
}
