/**
 * ═══════════════════════════════════════════════════════════════
 * Bot Engine — Hybrid Auto-Trading (AI Signal + Hardcoded Risk)
 * ═══════════════════════════════════════════════════════════════
 *
 * Architecture:
 * ┌─────────────────────┐     ┌─────────────────────────────────┐
 * │  SIGNAL ENGINE (AI) │     │  RISK & EXECUTION ENGINE (Code) │
 * │  Every 30m / 1h     │     │  Every 10s / 60s                │
 * │                     │     │                                 │
 * │  1. Fetch 100 klines│     │  1. Check wallet balance        │
 * │  2. Build AI prompt │     │  2. Enforce kill-switch          │
 * │  3. Call Minimax    │     │  3. Update trailing stops        │
 * │  4. Parse BUY/SELL  │     │  4. Close on trailing trigger    │
 * │  5. Execute order   │     │  5. Log to trade_logs            │
 * │  6. Log decision    │     │                                 │
 * └─────────────────────┘     └─────────────────────────────────┘
 *
 * CRITICAL: These two loops are fully independent async intervals.
 * The Risk Engine NEVER calls AI. The Signal Engine NEVER manages stops.
 */

import crypto from 'crypto';
import { db } from '../db/index.js';
import { deployedBots, tradeLogs } from '../db/schema.js';
import { eq, and, gt, desc } from 'drizzle-orm';
import { getDecryptedKey } from './apiKeyService.js';
import * as bybit from './bybitService.js';

// ─── In-Memory Bot Registry ───────────────────────────────────
// Maps botId → { signalTimer, riskTimer, isRunning }
const activeBots = new Map();

// Mutex lock to prevent overlapping Risk Engine cycles for the same bot
const riskLocks = new Set();

// ─── Interval Parsing ─────────────────────────────────────────
function parseIntervalMs(interval) {
  const match = interval.match(/^(\d+)(s|m|h)$/);
  if (!match) return 60000; // fallback 1min
  const [, num, unit] = match;
  const multiplier = { s: 1000, m: 60000, h: 3600000 };
  return parseInt(num) * (multiplier[unit] || 60000);
}

function generateId() {
  return crypto.randomUUID();
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API — Start / Stop / Pause / Resume
// ═══════════════════════════════════════════════════════════════

/**
 * Start a deployed bot. Spins up both the Signal and Risk loops.
 */
export async function startBot(botId) {
  if (activeBots.has(botId)) {
    console.warn(`[BotEngine] Bot ${botId} already running, ignoring start.`);
    return;
  }

  const [bot] = await db.select().from(deployedBots).where(eq(deployedBots.id, botId));
  if (!bot) throw new Error(`Bot ${botId} not found`);

  // Get exchange credentials
  const keyData = await getDecryptedKey(bot.userId, bot.exchange);
  if (!keyData || !keyData.isConnected) {
    await updateBotStatus(botId, 'error', 'No connected exchange API key found');
    throw new Error('No connected exchange API key');
  }

  const creds = { apiKey: keyData.fields.key, apiSecret: keyData.fields.secret };

  // Update DB status
  await db.update(deployedBots).set({
    status: 'running',
    startedAt: new Date(),
    stoppedAt: null,
    errorMessage: null,
    updatedAt: new Date(),
  }).where(eq(deployedBots.id, botId));

  console.log(`[BotEngine] ▶ Starting bot "${bot.strategyName}" (${botId})`);
  console.log(`[BotEngine]   Signal: every ${bot.signalInterval} | Risk: every ${bot.riskInterval}`);
  console.log(`[BotEngine]   Symbol: ${bot.symbol} | Exchange: ${bot.exchange} (${bot.networkMode})`);

  // ─── Launch Dual Loops ───
  const signalMs = parseIntervalMs(bot.signalInterval);
  const riskMs = parseIntervalMs(bot.riskInterval);

  // Run signal immediately on first start, then at interval
  runSignalCycle(botId, bot, creds).catch(err =>
    console.error(`[BotEngine:Signal] Initial cycle error:`, err.message)
  );

  const signalTimer = setInterval(() => {
    runSignalCycle(botId, bot, creds).catch(err =>
      console.error(`[BotEngine:Signal] Cycle error:`, err.message)
    );
  }, signalMs);

  const riskTimer = setInterval(() => {
    runRiskCycle(botId, bot, creds).catch(err =>
      console.error(`[BotEngine:Risk] Cycle error:`, err.message)
    );
  }, riskMs);

  activeBots.set(botId, { signalTimer, riskTimer, isRunning: true });

  await logTrade(botId, bot.userId, {
    action: 'BOT_START',
    source: 'signal_engine',
    symbol: bot.symbol,
    aiReasoning: `Bot started. Signal interval: ${bot.signalInterval}, Risk interval: ${bot.riskInterval}`,
  });
}

/**
 * Stop a bot gracefully.
 */
export async function stopBot(botId) {
  const entry = activeBots.get(botId);
  if (entry) {
    clearInterval(entry.signalTimer);
    clearInterval(entry.riskTimer);
    activeBots.delete(botId);
  }

  await updateBotStatus(botId, 'stopped');
  await db.update(deployedBots).set({
    stoppedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(deployedBots.id, botId));

  console.log(`[BotEngine] ⏹ Bot ${botId} stopped.`);
}

/**
 * Stop a bot and mark it as errored due to terminal failure.
 */
export async function markBotError(botId, errorMessage) {
  const entry = activeBots.get(botId);
  if (entry) {
    clearInterval(entry.signalTimer);
    clearInterval(entry.riskTimer);
    activeBots.delete(botId);
  }

  await updateBotStatus(botId, 'error', errorMessage);
  await db.update(deployedBots).set({
    stoppedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(deployedBots.id, botId));

  console.log(`[BotEngine] ❌ Bot ${botId} errored: ${errorMessage}`);
}

/**
 * Pause a bot (keeps record, clears intervals).
 */
export async function pauseBot(botId) {
  const entry = activeBots.get(botId);
  if (entry) {
    clearInterval(entry.signalTimer);
    clearInterval(entry.riskTimer);
    activeBots.delete(botId);
  }
  await updateBotStatus(botId, 'paused');
  console.log(`[BotEngine] ⏸ Bot ${botId} paused.`);
}

/**
 * Resume a paused bot (re-runs startBot).
 */
export async function resumeBot(botId) {
  return startBot(botId);
}

/**
 * Get all actively running bot IDs.
 */
export function getActiveBotIds() {
  return Array.from(activeBots.keys());
}


// ═══════════════════════════════════════════════════════════════
// SIGNAL ENGINE — AI-Powered (Slow Cadence)
// ═══════════════════════════════════════════════════════════════

/**
 * One Signal Cycle:
 * 1. Re-fetch bot config from DB (status may have changed)
 * 2. Fetch 100 historical klines for the strategy's timeframe
 * 3. Fetch current wallet balance & positions
 * 4. Build AI prompt with strategy + market data
 * 5. Call AI for decision: BUY / SELL / HOLD
 * 6. If actionable, place order via Bybit API
 * 7. Log everything to trade_logs
 */
async function runSignalCycle(botId, botSnapshot, creds) {
  // Re-read DB for latest state (status, daily counts, etc.)
  const [bot] = await db.select().from(deployedBots).where(eq(deployedBots.id, botId));
  if (!bot || bot.status !== 'running') return;

  console.log(`[Signal:${botId.slice(0, 8)}] ── AI Signal Cycle ──`);

  try {
    // 0. Fetch recent memory and setup cooldown guard
    const cooldownMs = parseIntervalMs(bot.signalInterval);
    const recentLogs = await db.select().from(tradeLogs)
      .where(eq(tradeLogs.botId, botId))
      .orderBy(desc(tradeLogs.createdAt))
      .limit(6);
      
    const recentHistoryString = recentLogs.length > 0
      ? recentLogs.map(l => `[${l.symbol}] ${l.action} ${l.side||''} (PnL: ${l.pnl !== null ? '$'+parseFloat(l.pnl).toFixed(2) : 'N/A'}) at ${new Date(l.createdAt).toLocaleTimeString()}`).join('\n')
      : 'No recent trade history.';
      
    const now = Date.now();
    const isSymbolOnCooldown = (sym) => {
      const lastClose = recentLogs.find(l => l.symbol === sym && l.action === 'CLOSE');
      if (!lastClose) return false;
      return (now - new Date(lastClose.createdAt).getTime()) < cooldownMs;
    };

    // 1. Market Data Fetching (Single or Top 5 Scanner)
    const interval = mapSignalIntervalToKlineInterval(bot.signalInterval);
    let klinesFormatted = '';
    let latestKlines = []; // Fallback for logging and price checking
    let scannerKlinesMap = {}; // Maps symbol to its klines for exact price matching
    if (bot.symbol === 'ALL_MARKETS') {
      const tickersData = await bybit.getMarketTickers('linear');
      if (tickersData.retCode !== 0) {
        await logTrade(botId, bot.userId, { action: 'ERROR', source: 'signal_engine', symbol: 'ALL_MARKETS', aiReasoning: `Failed fetching tickers: ${tickersData.retMsg}` });
        return;
      }

      // Get Top 5 by turnover
      let top5 = (tickersData.result?.list || [])
        .filter(t => t.symbol.endsWith('USDT'))
        .sort((a, b) => parseFloat(b.turnover24h) - parseFloat(a.turnover24h))
        .map(t => t.symbol);

      // [GUARD] Apply adaptive cooldown filter
      const originalTop5 = top5.slice(0, 5);
      top5 = top5.filter(sym => !isSymbolOnCooldown(sym)).slice(0, 5);

      if (top5.length === 0) {
        console.log(`[Signal:${botId.slice(0, 8)}] 🛡️ All top markets are on cooldown. Skipping cycle.`);
        return;
      }
      if (top5.length < originalTop5.length) {
        console.log(`[Signal:${botId.slice(0, 8)}] 🛡️ Cooldown Guard active: Filtered out recently closed pairs.`);
      }

      console.log(`[Signal:${botId.slice(0, 8)}] ALL_MARKETS Top 5: ${top5.join(', ')}`);
      
      const klinePromises = top5.map(sym => 
        bybit.makeBybitRequest('GET', '/v5/market/kline', { category: 'linear', symbol: sym, interval, limit: '100' }, creds.apiKey, creds.apiSecret)
      );
      
      const results = await Promise.all(klinePromises);
      
      top5.forEach((sym, idx) => {
        const res = results[idx];
        if (res.retCode === 0 && res.result?.list?.length > 0) {
          const klines = res.result.list.reverse();
          klinesFormatted += `\n--- MARKET: ${sym} ---\n`;
          klinesFormatted += klines.map(k => `[${new Date(parseInt(k[0])).toISOString()}, O:${k[1]}, H:${k[2]}, L:${k[3]}, C:${k[4]}, V:${k[5]}]`).join('\n');
          latestKlines = klines; // Store the last one for fallback
          scannerKlinesMap[sym] = klines;
        }
      });
    } else {
      // [GUARD] Single market cooldown
      if (isSymbolOnCooldown(bot.symbol)) {
         console.log(`[Signal:${botId.slice(0, 8)}] 🛡️ Cooldown Guard active: ${bot.symbol} recently closed. Skipping cycle.`);
         return;
      }
      const klineData = await bybit.makeBybitRequest('GET', '/v5/market/kline', { category: 'linear', symbol: bot.symbol, interval: interval, limit: '100' }, creds.apiKey, creds.apiSecret);
      latestKlines = klineData.result?.list || [];
      if (klineData.retCode !== 0 || latestKlines.length === 0) {
        await logTrade(botId, bot.userId, { action: 'ERROR', source: 'signal_engine', symbol: bot.symbol, aiReasoning: `Bybit API Error: ${klineData.retMsg}` });
        return;
      }
      klinesFormatted = latestKlines.reverse().map(k => `[${new Date(parseInt(k[0])).toISOString()}, O:${k[1]}, H:${k[2]}, L:${k[3]}, C:${k[4]}, V:${k[5]}]`).join('\n');
    }

    // 2. Fetch wallet + positions
    // If ALL_MARKETS, positionQuerySymbol is undefined (fetches all open perp positions globally)
    const positionQuerySymbol = bot.symbol === 'ALL_MARKETS' ? undefined : bot.symbol;
    const [walletData, positionData] = await Promise.all([
      bybit.getWalletBalance(creds.apiKey, creds.apiSecret),
      bybit.getPositions(creds.apiKey, creds.apiSecret, 'linear', positionQuerySymbol),
    ]);

    const wallet = walletData.result?.list?.[0];
    const equity = parseFloat(wallet?.totalEquity || 0);
    const positions = (positionData.result?.list || []).filter(p => parseFloat(p.size) > 0);

    // 3. Check daily limits BEFORE calling AI
    if (bot.dailyTradeCount >= bot.maxTradesPerDay) {
      console.log(`[Signal:${botId.slice(0, 8)}] Daily trade limit reached (${bot.dailyTradeCount}/${bot.maxTradesPerDay}). Skipping.`);
      await logTrade(botId, bot.userId, {
        action: 'HOLD',
        source: 'signal_engine',
        symbol: bot.symbol,
        aiReasoning: `Daily trade limit reached: ${bot.dailyTradeCount}/${bot.maxTradesPerDay}`,
      });
      return;
    }

    // 4. Build AI prompt
    const positionsJson = positions.length > 0
      ? positions.map(p => `${p.symbol} ${p.side} qty=${p.size} entry=$${p.avgPrice} uPnL=$${p.unrealisedPnl}`).join('; ')
      : 'None';

    const prompt = buildSignalPrompt({
      strategyScript: bot.strategyScript,
      equity,
      positionsJson,
      recentHistory: recentHistoryString,
      dailyTrades: bot.dailyTradeCount,
      maxTradesPerDay: bot.maxTradesPerDay,
      dailyPnl: bot.dailyPnl,
      maxDailyLoss: equity * (bot.maxDailyLossPct / 100),
      symbol: bot.symbol,
      signalInterval: bot.signalInterval,
      klinesFormatted,
    });

    // 5. Call AI
    // [CRITICAL] Token Optimization: Check status again in case bot was paused/stopped during data fetching
    const [latestBot] = await db.select().from(deployedBots).where(eq(deployedBots.id, botId));
    if (!latestBot || latestBot.status !== 'running') {
      console.log(`[Signal:${botId.slice(0, 8)}] ⏸ Research aborted: Bot is no longer in 'running' status. Saving tokens.`);
      return;
    }

    console.log(`[Signal:${botId.slice(0, 8)}] Calling AI...`);
    const aiResponse = await callAI(bot.userId, prompt);
    console.log(`[Signal:${botId.slice(0, 8)}] AI responded: ${aiResponse.substring(0, 200)}...`);

    // 6. Parse AI response
    const decision = parseAIDecision(aiResponse);
    if (!decision) {
      console.warn(`[Signal:${botId.slice(0, 8)}] Failed to parse AI response`);
      await logTrade(botId, bot.userId, {
        action: 'ERROR',
        source: 'signal_engine',
        symbol: bot.symbol,
        errorDetails: `Failed to parse AI response: ${aiResponse.substring(0, 500)}`,
      });
      return;
    }

    console.log(`[Signal:${botId.slice(0, 8)}] Decision: ${decision.action} | Reasoning: ${decision.reasoning?.substring(0, 100)}`);

    // 7. Update last signal
    await db.update(deployedBots).set({
      lastSignalAt: new Date(),
      lastSignalAction: decision.action,
      updatedAt: new Date(),
    }).where(eq(deployedBots.id, botId));

    // 8. Execute if actionable
    if (decision.action === 'HOLD') {
      await logTrade(botId, bot.userId, {
        action: 'HOLD',
        source: 'signal_engine',
        symbol: bot.symbol,
        aiReasoning: decision.reasoning,
        marketSnapshot: { equity, positions: positionsJson, klineCount: latestKlines.length },
      });
      return;
    }

    if (decision.action === 'BUY' || decision.action === 'SELL') {
      // Check max positions
      if (positions.length >= bot.maxPositions && decision.action !== 'CLOSE') {
        console.log(`[Signal:${botId.slice(0, 8)}] Max positions reached (${positions.length}/${bot.maxPositions}). Skipping.`);
        await logTrade(botId, bot.userId, {
          action: 'HOLD',
          source: 'signal_engine',
          symbol: decision.symbol || bot.symbol,
          aiReasoning: `Blocked by Max Positions (${positions.length}/${bot.maxPositions}): AI intended to ${decision.action} ${decision.symbol || bot.symbol} because ${decision.reasoning || 'no reasoning provided'}.`,
        });
        return;
      }

      // 8.5 Calculate optimal and Bybit-compliant Quantity natively
      const targetKlines = bot.symbol === 'ALL_MARKETS' && scannerKlinesMap[decision.symbol]
        ? scannerKlinesMap[decision.symbol]
        : latestKlines;
        
      const currentPrice = parseFloat(targetKlines[targetKlines.length - 1]?.[4] || 0);
      const riskCalc = await calculateValidOrderQty(
        decision.symbol || bot.symbol,
        equity,
        bot.riskPerTradePct,
        bot.leverage,
        currentPrice,
        creds
      );

      if (!riskCalc) {
        await logTrade(botId, bot.userId, {
          action: 'ERROR',
          source: 'signal_engine',
          symbol: decision.symbol || bot.symbol,
          aiReasoning: `Failed to calculate a valid order quantity for ${decision.symbol || bot.symbol} (Price: ${currentPrice}). Order aborted to prevent API error.`,
        });
        return;
      }

      decision.qty = String(riskCalc.qty);

      // 8.6 Calculate Hardcoded Initial Stop Loss & Take Profit Exchange Overrides
      // Since position size makes margin EXACTLY equal to the dollar risk amount,
      // losing the margin means a 100% ROE loss (which is a 1/leverage price drop).
      // We set SL just before liquidation, e.g., 90% of the margin (0.90 / leverage).
      const maxPriceDrop = 0.90 / bot.leverage;
      const slDistance = Math.min(maxPriceDrop, 0.15); // Cap at 15% distance max
      
      // TP is widened significantly (e.g. 10%) so it acts only as a catastrophic safety net,
      // letting the dynamic Trailing Stop handle the actual profit-taking.
      const tpDistance = 0.10; 
      let rawSL, rawTP;

      if (decision.action === 'BUY') {
        rawSL = currentPrice * (1 - slDistance);
        rawTP = currentPrice * (1 + tpDistance);
      } else {
        rawSL = currentPrice * (1 + slDistance);
        rawTP = currentPrice * (1 - tpDistance);
      }

      // Round to Bybit's tickSize precision to avoid validation errors
      const tickSize = riskCalc.tickSize;
      const precisionMatch = tickSize.toString().match(/(?:\.(\d+))?$/);
      const precisionCount = precisionMatch && precisionMatch[1] ? precisionMatch[1].length : 0;
      
      const formatPrice = (price) => parseFloat((Math.round(price / tickSize) * tickSize).toFixed(precisionCount));

      decision.nativeSL = String(formatPrice(rawSL));
      decision.nativeTP = String(formatPrice(rawTP));

      // [FIX] Set leverage on Bybit before placing order to ensure correct position sizing
      try {
        await bybit.makeBybitRequest('POST', '/v5/position/set-leverage', {
          category: 'linear',
          symbol: decision.symbol || bot.symbol,
          buyLeverage: String(bot.leverage),
          sellLeverage: String(bot.leverage),
        }, creds.apiKey, creds.apiSecret);
      } catch (leverageErr) {
        console.warn(`[Signal:${botId.slice(0, 8)}] Could not set leverage: ${leverageErr.message}`);
      }

      // Place order
      const orderResult = await placeSignalOrder(creds, bot, decision);
      await logTrade(botId, bot.userId, {
        action: decision.action,
        source: 'signal_engine',
        symbol: decision.symbol || bot.symbol,
        side: decision.action === 'BUY' ? 'Buy' : 'Sell',
        orderType: 'Market',
        qty: decision.qty,
        price: decision.price || (() => {
          const priceKlines = (bot.symbol === 'ALL_MARKETS' && scannerKlinesMap[decision.symbol])
            ? scannerKlinesMap[decision.symbol]
            : latestKlines;
          return String(parseFloat(priceKlines[priceKlines.length - 1]?.[4] || 0));
        })(),
        takeProfit: decision.tp,
        stopLoss: decision.sl,
        orderId: orderResult?.result?.orderId,
        orderStatus: orderResult?.retCode === 0 ? 'filled' : 'rejected',
        aiReasoning: decision.reasoning,
        marketSnapshot: { equity, klineCount: latestKlines.length },
        errorDetails: orderResult?.retCode !== 0 ? orderResult?.retMsg : null,
      });

      // Update daily trade count
      if (orderResult?.retCode === 0) {
        await db.update(deployedBots).set({
          dailyTradeCount: bot.dailyTradeCount + 1,
          totalTrades: bot.totalTrades + 1,
          updatedAt: new Date(),
        }).where(eq(deployedBots.id, botId));
      } else {
        // Terminal error check
        const msg = (orderResult?.retMsg || '').toLowerCase();
        if (msg.includes('permission') || msg.includes('unauthorized') || msg.includes('invalid api key')) {
          await markBotError(botId, `API Error: ${orderResult?.retMsg}`);
          return;
        }
      }
    }

    if (decision.action === 'CLOSE') {
      // Only close the specific symbol mentioned by AI, NOT all positions
      const targetSymbol = decision.symbol || bot.symbol;
      const targetPositions = positions.filter(p => p.symbol === targetSymbol);
      
      if (targetPositions.length > 0) {
        console.log(`[Signal:${botId.slice(0, 8)}] AI ordered CLOSE on ${targetSymbol}. Closing ${targetPositions.length} position(s). Other positions untouched.`);
        await closeAllPositions(creds, bot, targetPositions, decision.reasoning, botId, 'signal_engine');
      } else {
        console.log(`[Signal:${botId.slice(0, 8)}] AI ordered CLOSE on ${targetSymbol}, but no matching open position found. Ignoring.`);
      }
    }

  } catch (err) {
    console.error(`[Signal:${botId.slice(0, 8)}] Error:`, err.message);
    await logTrade(botId, bot.userId, {
      action: 'ERROR',
      source: 'signal_engine',
      symbol: bot.symbol,
      errorDetails: err.message,
    });
    
    // Mark as error if it's a terminal exception
    if (err.message.toLowerCase().includes('permission') || err.message.toLowerCase().includes('auth') || err.message.toLowerCase().includes('api')) {
      await markBotError(botId, err.message);
    }
  }
}


// ═══════════════════════════════════════════════════════════════
// RISK & EXECUTION ENGINE — Hardcoded (Fast Cadence)
// ═══════════════════════════════════════════════════════════════

/**
 * One Risk Cycle:
 * 1. Re-fetch bot config from DB
 * 2. Fetch current wallet balance
 * 3. Enforce kill-switch (max daily loss)
 * 4. Fetch active positions
 * 5. For each position: compute dynamic trailing stop & update via Bybit API
 * 6. Log any stop adjustments
 *
 * CRITICAL: This function NEVER calls AI. Pure math only.
 */
async function runRiskCycle(botId, botSnapshot, creds) {
  // MUTEX GUARD: Prevent overlapping cycles for the same bot
  if (riskLocks.has(botId)) return;
  riskLocks.add(botId);

  try {
    const [bot] = await db.select().from(deployedBots).where(eq(deployedBots.id, botId));
    if (!bot || bot.status !== 'running') return;
    // 1. Fetch wallet
    const walletData = await bybit.getWalletBalance(creds.apiKey, creds.apiSecret);
    
    if (walletData.retCode !== 0) {
      console.warn(`[Risk:${botId.slice(0, 8)}] API Error:`, walletData);
      // We log to UI so user visibly sees the API key error instead of silent failure
      await logTrade(botId, bot.userId, {
        action: 'ERROR',
        source: 'risk_engine',
        symbol: bot.symbol,
        aiReasoning: `Bybit API Validation Failed: ${walletData.retMsg} (Code: ${walletData.retCode}). Engine halted temporarily, retrying next cycle...`,
      });
      return; 
    }

    const wallet = walletData.result?.list?.[0];
    const equity = parseFloat(wallet?.totalEquity || 0);

    // 2. Fetch closed PnL for today (to calculate daily P&L)
    const closedPnlData = await bybit.getClosedPnl(creds.apiKey, creds.apiSecret, 'linear', 50);
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    // If a manual reset has been triggered, use it as the start time instead of 00:00 UTC
    const pnlStartTime = (bot.pnlResetAt && new Date(bot.pnlResetAt) > todayStart)
      ? new Date(bot.pnlResetAt).getTime()
      : todayStart.getTime();

    const todayPnl = (closedPnlData.result?.list || [])
      .filter(p => parseInt(p.createdTime) >= pnlStartTime)
      .reduce((sum, p) => sum + parseFloat(p.closedPnl || 0), 0);

    // ── Daily Reset Logic ──────────────────────────────────────────
    // If it's a new calendar day (UTC), reset dailyTradeCount and dailyPnl
    const now = new Date();
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const lastUpdate = bot.updatedAt ? new Date(bot.updatedAt) : null;
    const isNewDay = !lastUpdate || lastUpdate < startOfToday;

    // ── Win/Loss & History Sync ────────────────────────────────────
    const closedList = (closedPnlData.result?.list || []);

    // Optimization & Deduplication: Fetch all CLOSE logs from the last 24 hours into memory
    // This allows us to perform accurate float comparisons and reduce DB queries.
    const recentDbCloses = await db.select().from(tradeLogs).where(and(
      eq(tradeLogs.botId, botId),
      eq(tradeLogs.action, 'CLOSE'),
      gt(tradeLogs.createdAt, new Date(Date.now() - 86400000))
    ));
    
    // 1. Sync missing CLOSE logs (for trades closed by Bybit native SL/TP)
    for (const p of closedList) {
      const pnlTime = new Date(parseInt(p.updatedTime || p.createdTime));
      
      // CRITICAL FIX: Do not ingest global exchange logs that occurred BEFORE this bot was even created!
      if (pnlTime < new Date(bot.createdAt)) continue;

      const pnlValue = parseFloat(p.closedPnl || 0);

      // Check if we already logged this close
      let existing = null;

      // Primary check: Strict Order ID matching
      if (p.orderId) {
        existing = recentDbCloses.find(log => log.orderId === p.orderId);
      }

      // Fallback check: 5-minute window + Symbol + Exact PnL matching
      if (!existing) {
        existing = recentDbCloses.find(log => {
          const timeDiff = Math.abs(new Date(log.createdAt).getTime() - pnlTime.getTime());
          return timeDiff <= 300000 && 
                 log.symbol === p.symbol && 
                 Math.abs((parseFloat(log.pnl) || 0) - pnlValue) < 0.0001; 
        });
      }

      if (!existing) {
        // This trade was closed on Bybit (SL/TP) but not logged in our DB
        console.log(`[Risk:${botId.slice(0, 8)}] 🔄 Syncing missing CLOSE log for ${p.symbol} (PnL: ${p.closedPnl})`);
        
        const newLog = {
          action: 'CLOSE',
          source: 'risk_engine',
          symbol: p.symbol,
          side: p.side === 'Buy' ? 'Sell' : 'Buy', // Closing side
          qty: p.qty,
          pnl: pnlValue,
          orderId: p.orderId, // Store orderId for future dedup!
          orderStatus: 'filled',
          aiReasoning: 'Position closed via Bybit native StopLoss/TakeProfit or manual close.',
          createdAt: pnlTime
        };
        
        await logTrade(botId, bot.userId, newLog);
        
        // Push to memory array to prevent duplicates in the very same loop
        recentDbCloses.push(newLog);
      }
    }

    // 2. Fetch logged CLOSE actions from OUR DB for Win/Loss counting
    const executedLogs = await db
      .select()
      .from(tradeLogs)
      .where(and(
        eq(tradeLogs.botId, botId),
        eq(tradeLogs.action, 'CLOSE'),
      ));

    const newWinCount = executedLogs.filter(l => (l.pnl ?? 0) > 0).length;
    const newLossCount = executedLogs.filter(l => (l.pnl ?? 0) < 0).length;

    // Also count opened trades (BUY/SELL filled) as the totalTrades denominator
    const openedLogs = await db
      .select()
      .from(tradeLogs)
      .where(and(
        eq(tradeLogs.botId, botId),
        eq(tradeLogs.orderStatus, 'filled'),
      ));

    // Only count actions that represent opening a trade
    const openedTradeCount = openedLogs.filter(l => l.action === 'BUY' || l.action === 'SELL').length;

    // Daily trades = filled orders placed today
    const dailyOpenedCount = openedLogs.filter(l => {
      const logTime = new Date(l.createdAt).getTime();
      return (l.action === 'BUY' || l.action === 'SELL') && logTime >= startOfToday.getTime();
    }).length;

    const updatePayload = {
      dailyPnl: todayPnl,
      winCount: newWinCount,
      lossCount: newLossCount,
      totalTrades: openedTradeCount,
      dailyTradeCount: isNewDay ? dailyOpenedCount : bot.dailyTradeCount,
      lastRiskCheckAt: now,
      updatedAt: now,
    };

    if (isNewDay) {
      console.log(`[Risk:${botId.slice(0, 8)}] 🌅 New day detected — resetting daily PnL.`);
      updatePayload.dailyPnl = 0;
    }

    await db.update(deployedBots).set(updatePayload).where(eq(deployedBots.id, botId));

    // 3. KILL-SWITCH: Max daily loss
    const maxDailyLossUsd = equity * (bot.maxDailyLossPct / 100);
    if (todayPnl <= -maxDailyLossUsd) {
      console.error(`[Risk:${botId.slice(0, 8)}] ⛔ KILL-SWITCH TRIGGERED! Daily PnL: $${todayPnl.toFixed(2)} exceeds max loss -$${maxDailyLossUsd.toFixed(2)}`);

      // Close all positions immediately
      const positionQuerySymbol = bot.symbol === 'ALL_MARKETS' ? undefined : bot.symbol;
      const positionData = await bybit.getPositions(creds.apiKey, creds.apiSecret, 'linear', positionQuerySymbol);
      const positions = (positionData.result?.list || []).filter(p => parseFloat(p.size) > 0);
      if (positions.length > 0) {
        await closeAllPositions(creds, bot, positions, 'KILL-SWITCH: Max daily loss exceeded', botId, 'risk_engine');
      }

      // Kill the bot
      await stopBot(botId);
      await updateBotStatus(botId, 'killed', `Daily max loss exceeded: $${todayPnl.toFixed(2)} / -$${maxDailyLossUsd.toFixed(2)}`);

      await logTrade(botId, bot.userId, {
        action: 'KILL_SWITCH',
        source: 'risk_engine',
        symbol: bot.symbol,
        pnl: todayPnl,
        aiReasoning: `SYSTEM HALT: Daily Max Drawdown of ${bot.maxDailyLossPct}% (-$${maxDailyLossUsd.toFixed(2)}) hit. PnL today: $${todayPnl.toFixed(2)}. All positions closed. Trading suspended.`,
      });
      return;
    }

    // 4. Fetch active positions
    const positionQuerySymbol = bot.symbol === 'ALL_MARKETS' ? undefined : bot.symbol;
    const positionData = await bybit.getPositions(creds.apiKey, creds.apiSecret, 'linear', positionQuerySymbol);
    const positions = (positionData.result?.list || []).filter(p => parseFloat(p.size) > 0);

    if (positions.length === 0) return; // No positions to manage

    // 5. Dynamic Trailing Stop Management
    for (const pos of positions) {
      await manageDynamicTrailingStop(creds, bot, pos, botId);
    }

  } catch (err) {
    // Risk engine errors should not crash silently
    console.error(`[Risk:${botId.slice(0, 8)}] Error:`, err.message);
    if (err.message.toLowerCase().includes('permission') || err.message.toLowerCase().includes('auth') || err.message.toLowerCase().includes('api')) {
      await markBotError(botId, err.message);
    }
  } finally {
    // ALWAYS release the lock
    riskLocks.delete(botId);
  }
}

/**
 * Manage dynamic trailing stop for a single position.
 *
 * Logic:
 * 1. Calculate current profit % from entry price
 * 2. If profit >= activationPct → trailing stop is ACTIVE
 * 3. Compute trailing stop price = markPrice * (1 - callbackPct/100) for Longs
 *    (or markPrice * (1 + callbackPct/100) for Shorts)
 * 4. If new trailing stop is better than current → update via Bybit API
 */
async function manageDynamicTrailingStop(creds, bot, position, botId) {
  const entryPrice = parseFloat(position.avgPrice || position.entryPrice);
  const markPrice = parseFloat(position.markPrice);
  const size = parseFloat(position.size);
  const side = position.side; // 'Buy' (Long) or 'Sell' (Short)
  const currentTrailingStop = parseFloat(position.trailingStop || 0);

  if (!entryPrice || !markPrice || !size) return;

  // Calculate profit % from entry
  let profitPct;
  if (side === 'Buy') {
    profitPct = ((markPrice - entryPrice) / entryPrice) * 100;
  } else {
    profitPct = ((entryPrice - markPrice) / entryPrice) * 100;
  }

  // [FIX] Leverage-adjusted activation: trailing stop activates when the *leveraged* profit
  // equals the configured activation%. E.g. trailingStopActivationPct=1%, leverage=10x means
  // we only need 0.1% price movement. Convert back to raw price % for comparison.
  const leverage = parseFloat(position.leverage || bot.leverage || 1);
  const rawPriceActivationPct = bot.trailingStopActivationPct / leverage;

  // Check if trailing stop should be activated
  if (profitPct < rawPriceActivationPct) return; // Not yet in profit enough

  // [BUG FIX]: Do NOT continuously update. If Bybit already has a trailing stop natively,
  // we must let it handle the high-water mark tracking! Continuously updating the distance
  // resets the active trigger price to the *current* market price, ruining the trail
  // and causing premature close.
  if (currentTrailingStop > 0) return;

  // Calculate the trailing distance in price terms
  // Leverage-adjusted callback: The user expects CallbackPct as a % of their ROE (margin).
  const rawPriceCallbackPct = bot.trailingStopCallbackPct / leverage;
  const trailingDistance = markPrice * (rawPriceCallbackPct / 100);
  
  // Format the distance safely dynamically to avoid rounding small altcoins to 0.
  // We use max 6 decimals to satisfy most exchanges.
  const distanceStr = Math.max(trailingDistance, 0.000001).toFixed(6).replace(/\.?0+$/, '');

  try {
    // Use Bybit's native trading stop API to set/update trailing stop
    const result = await bybit.makeBybitRequest('POST', '/v5/position/trading-stop', {
      category: 'linear',
      symbol: position.symbol, // use position.symbol, NOT bot.symbol (which may be 'ALL_MARKETS')
      trailingStop: distanceStr,
      positionIdx: position.positionIdx || 0,
    }, creds.apiKey, creds.apiSecret);

    if (result.retCode === 0) {
      console.log(`[Risk:${botId.slice(0, 8)}] 📐 Trailing stop activated: ${side} ${position.symbol} | Profit: ${profitPct.toFixed(2)}% | Trail: $${distanceStr}`);

      await logTrade(botId, bot.userId, {
        action: 'TRAILING_STOP',
        source: 'risk_engine',
        symbol: position.symbol,
        side,
        price: String(markPrice),
        trailingStop: distanceStr,
        aiReasoning: `Dynamic trailing stop activated. Position profit: ${profitPct.toFixed(2)}%. Callback configured: ${bot.trailingStopCallbackPct}% (ROE). Trail distance: $${distanceStr}`,
        marketSnapshot: { entryPrice, markPrice, profitPct, size },
      });
    } else {
      // Bybit returns "not modified" if the value exists and is identical. 
      // We suppress this warning to keep logs clean.
      if (result.retMsg && result.retMsg.toLowerCase().includes('not modified')) {
         return;
      }
      console.warn(`[Risk:${botId.slice(0, 8)}] Trailing stop update failed: ${result.retMsg}`);
    }
  } catch (err) {
    console.error(`[Risk:${botId.slice(0, 8)}] Trailing stop error:`, err.message);
  }
}


// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Build the AI signal prompt.
 */
function buildSignalPrompt({ strategyScript, equity, positionsJson, recentHistory, dailyTrades, maxTradesPerDay, dailyPnl, maxDailyLoss, symbol, signalInterval, klinesFormatted }) {
  const isScanner = symbol === 'ALL_MARKETS';
  const instruction = isScanner 
    ? `1. Analyze the provided Top 5 markets independently against the strategy. Select EXACTLY ONE strongest setup out of all candidates.\n2. Respond with ONLY valid JSON: {"action":"BUY|SELL|HOLD|CLOSE","symbol":"<THE_WINNING_SYMBOL>","reasoning":"<1-2 sentences>"}`
    : `1. Respond with ONLY valid JSON: {"action":"BUY|SELL|HOLD|CLOSE","symbol":"${symbol}","reasoning":"<1-2 sentences>"}`;

  return `You are AlphaNode AI, an autonomous institutional trading agent.

ACTIVE STRATEGY:
${strategyScript}

CURRENT STATE:
- Wallet Balance: $${equity.toFixed(2)}
- Active Positions: ${positionsJson}
- Today's Trades: ${dailyTrades}/${maxTradesPerDay} (max ${maxTradesPerDay})
- Today's P&L: $${dailyPnl.toFixed(2)} (max loss limit: -$${maxDailyLoss.toFixed(2)})

RECENT TRADE MEMORY:
${recentHistory}

MARKET DATA (last 100 candles, timeframe: ${signalInterval}):
${klinesFormatted}

RULES:
${instruction}
3. DO NOT output qty. The execution engine will automatically calculate the optimal position size based on available equity and risk parameters.
4. DO NOT provide baseline SL/TP. The dynamic Trailing Stop will be managed independently by the Hardcoded Risk Engine once the trade is active.
5. NEVER exceed max daily trades or max daily loss.
6. Position size must respect the 1% risk-per-trade rule.
7. CRITICAL: Do NOT issue CLOSE on a position that has unrealized profit > $1.00. Let the Trailing Stop manage profitable exits. Only CLOSE if the position is losing money or the setup has fundamentally invalidated.
8. When issuing CLOSE, you are ONLY closing the specific symbol you mention. Other positions remain unaffected.
9. ANTI-REVENGE GUARD: Analyze the RECENT TRADE MEMORY. Do not reopen the exact same position immediately after a StopLoss hit unless the market structure drastically changed in a higher timeframe. Avoid rapid Whipsaws (reversing direction continuously) on the same asset.`;
}

/**
 * Parse AI JSON response into a decision object.
 */
function parseAIDecision(raw) {
  try {
    // Try to extract JSON from the response (AI might wrap it)
    const jsonMatch = raw.match(/\{[\s\S]*?"action"[\s\S]*?\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.action) return null;
    return {
      action: parsed.action.toUpperCase(),
      symbol: parsed.symbol,
      qty: parsed.qty,
      sl: parsed.sl,
      tp: parsed.tp,
      reasoning: parsed.reasoning || '',
    };
  } catch {
    return null;
  }
}

/**
 * Call AI via the same proxy logic used in aiProxy.js
 */
async function callAI(userId, prompt) {
  const preferredPlatforms = ['minimax', 'openai', 'anthropic', 'gemini'];
  let keyData = null;
  let activePlatform = null;

  for (const platformId of preferredPlatforms) {
    const found = await getDecryptedKey(userId, platformId);
    if (found && found.isConnected) {
      keyData = found;
      activePlatform = platformId;
      break;
    }
  }

  if (!keyData) throw new Error('No AI API key connected');

  const fields = keyData.fields;
  const messages = [
    { role: 'system', content: 'You are AlphaNode AI, an autonomous institutional trading agent. Respond ONLY with valid JSON.' },
    { role: 'user', content: prompt },
  ];

  switch (activePlatform) {
    case 'minimax': {
      const url = `https://api.minimax.io/v1/text/chatcompletion_v2?GroupId=${fields.group_id}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${fields.key}`,
          'Content-Type': 'application/json',
          'GroupId': fields.group_id,
        },
        body: JSON.stringify({
          model: 'MiniMax-M2.7-highspeed',
          messages,
          tokens_to_generate: 1024,
          temperature: 0.3, // Low temp for deterministic trading decisions
        }),
      });
      const data = await res.json();
      if (data.base_resp?.status_code !== 0) {
        throw new Error(`Minimax: ${data.base_resp?.status_msg}`);
      }
      return data.choices?.[0]?.message?.content || data.reply || '';
    }

    case 'openai': {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${fields.key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages, max_tokens: 1024, temperature: 0.3 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(`OpenAI: ${data.error.message}`);
      return data.choices?.[0]?.message?.content || '';
    }

    case 'anthropic': {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': fields.key, 'content-type': 'application/json', 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-3-5-sonnet-20241022', max_tokens: 1024, messages, temperature: 0.3 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(`Anthropic: ${data.error.message}`);
      return data.content?.[0]?.text || '';
    }

    case 'gemini': {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${fields.key}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : m.role, parts: [{ text: m.content }] })),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(`Gemini: ${data.error.message}`);
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    default:
      throw new Error(`Unsupported AI platform: ${activePlatform}`);
  }
}

/**
 * Place an order based on AI signal decision.
 */
async function placeSignalOrder(creds, bot, decision) {
  const orderParams = {
    category: 'linear',
    symbol: decision.symbol || bot.symbol,
    side: decision.action === 'BUY' ? 'Buy' : 'Sell',
    orderType: 'Market',
    qty: decision.qty,
  };
  
  if (decision.nativeSL) orderParams.stopLoss = decision.nativeSL;
  if (decision.nativeTP) orderParams.takeProfit = decision.nativeTP;

  // The AI hallucination bug is bypassed. Native backend engine dictates exact step-sized SL/TP.

  console.log(`[Signal] Placing order:`, JSON.stringify(orderParams));
  return bybit.placeOrder(creds.apiKey, creds.apiSecret, orderParams);
}

/**
 * Calculate Bybit-compliant order quantity natively based on Risk % and minimum exchange limits.
 * Fetches the instruments-info to align with `qtyStep` precision.
 */
async function calculateValidOrderQty(symbol, equity, riskPct, leverage, currentPrice, creds) {
  try {
    if (!currentPrice || currentPrice <= 0) return null;

    // 1. Fetch lot size filter from Bybit
    const infoData = await bybit.makeBybitRequest('GET', '/v5/market/instruments-info', { category: 'linear', symbol }, creds.apiKey, creds.apiSecret);
    const instrument = infoData?.result?.list?.[0];
    if (!instrument) return null;

    const qtyStep = parseFloat(instrument.lotSizeFilter?.qtyStep || '1');
    const minOrderQty = parseFloat(instrument.lotSizeFilter?.minOrderQty || '0.001');
    const tickSize = parseFloat(instrument.priceFilter?.tickSize || '0.001');

    // 2. Calculate raw Target USDT position
    // Margin used = equity * riskPct. Total leverage size = margin * leverage.
    let targetUsdtValue = (equity * (riskPct / 100)) * leverage;

    // 3. Bybit linear pairs minimum order value is strictly > 5 USDT. We enforce 10 USDT for buffer.
    if (targetUsdtValue < 10) {
      targetUsdtValue = 10;
    }

    // 4. Calculate raw quantity
    const rawQty = targetUsdtValue / currentPrice;

    // 5. Floor to the nearest qtyStep to satisfy Bybit tick size rules
    // Because JS float math is messy, dividing by step, flooring, then multiplying back is best.
    let finalQty = Math.floor(rawQty / qtyStep) * qtyStep;

    // JS floating point correction
    const precisionMatch = qtyStep.toString().match(/(?:\.(\d+))?$/);
    const precisionCount = precisionMatch && precisionMatch[1] ? precisionMatch[1].length : 0;
    finalQty = parseFloat(finalQty.toFixed(precisionCount));

    // Fallback if formatting went beneath minimums
    if (finalQty < minOrderQty) {
      finalQty = minOrderQty;
    }

    return { qty: finalQty, tickSize };
  } catch (err) {
    console.error(`[RiskMath] Failed to calculate quantity for ${symbol}:`, err);
    return null;
  }
}

/**
 * Emergency close all positions for a bot.
 */
async function closeAllPositions(creds, bot, positions, reason, botId, source = 'risk_engine') {
  for (const pos of positions) {
    const closeSide = pos.side === 'Buy' ? 'Sell' : 'Buy';
    try {
      const result = await bybit.placeOrder(creds.apiKey, creds.apiSecret, {
        category: 'linear',
        symbol: pos.symbol,
        side: closeSide,
        orderType: 'Market',
        qty: pos.size,
        reduceOnly: true,
      });
      console.log(`[BotEngine] Closed ${pos.side} ${pos.symbol} x${pos.size}: ${result.retMsg}`);

      // Fetch realized PnL from Bybit for this closed position to store in logs
      let realizedPnl = null;
      if (result.retCode === 0) {
        try {
          // Small delay to allow Bybit to settle the closed trade
          await new Promise(r => setTimeout(r, 1500));
          const pnlData = await bybit.getClosedPnl(creds.apiKey, creds.apiSecret, 'linear', 5);
          const matchedClose = (pnlData.result?.list || []).find(p => p.symbol === pos.symbol);
          if (matchedClose) {
            realizedPnl = parseFloat(matchedClose.closedPnl || 0);
          }
        } catch (pnlErr) {
          console.warn(`[BotEngine] Could not fetch realized PnL for ${pos.symbol}:`, pnlErr.message);
        }
      }

      await logTrade(botId, bot.userId, {
        action: 'CLOSE',
        source,
        symbol: pos.symbol,
        side: closeSide,
        orderType: 'Market',
        qty: pos.size,
        pnl: realizedPnl,  // Now populated!
        orderId: result.result?.orderId,
        orderStatus: result.retCode === 0 ? 'filled' : 'rejected',
        aiReasoning: reason,
        errorDetails: result.retCode !== 0 ? result.retMsg : null,
      });
    } catch (err) {
      console.error(`[BotEngine] Failed to close ${pos.symbol}:`, err.message);
    }
  }
}

/**
 * Map signal interval string to Bybit kline interval.
 */
function mapSignalIntervalToKlineInterval(interval) {
  const map = {
    '1m': '1', '3m': '3', '5m': '5', '15m': '15', '30m': '30',
    '1h': '60', '2h': '120', '4h': '240', '6h': '360', '12h': '720',
    '1d': 'D', '1w': 'W',
  };
  return map[interval] || '30';
}

/**
 * Update bot status in DB.
 */
async function updateBotStatus(botId, status, errorMessage = null) {
  await db.update(deployedBots).set({
    status,
    errorMessage,
    updatedAt: new Date(),
  }).where(eq(deployedBots.id, botId));
}

/**
 * Insert a trade log entry.
 */
async function logTrade(botId, userId, data) {
  const createdAt = data.createdAt || new Date();
  try {
    await db.insert(tradeLogs).values({
      id: generateId(),
      botId,
      userId,
      action: data.action,
      source: data.source || 'signal_engine',
      symbol: data.symbol,
      side: data.side,
      orderType: data.orderType,
      qty: data.qty,
      price: data.price,
      takeProfit: data.takeProfit,
      stopLoss: data.stopLoss,
      trailingStop: data.trailingStop,
      orderId: data.orderId,
      orderStatus: data.orderStatus,
      pnl: data.pnl,
      pnlPercentage: data.pnlPercentage,
      fees: data.fees,
      aiReasoning: data.aiReasoning,
      marketSnapshot: data.marketSnapshot,
      errorDetails: data.errorDetails,
      createdAt: createdAt
    });
  } catch (err) {
    console.error(`[BotEngine] Failed to log trade:`, err.message);
  }
}
