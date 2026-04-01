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
import { eq, and } from 'drizzle-orm';
import { getDecryptedKey } from './apiKeyService.js';
import * as bybit from './bybitService.js';

// ─── In-Memory Bot Registry ───────────────────────────────────
// Maps botId → { signalTimer, riskTimer, isRunning }
const activeBots = new Map();

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
    // 1. Fetch market data — 100 klines
    const interval = mapSignalIntervalToKlineInterval(bot.signalInterval);
    const klineData = await bybit.makeBybitRequest('GET', '/v5/market/kline', {
      category: 'linear',
      symbol: bot.symbol,
      interval: interval,
      limit: '100'
    }, creds.apiKey, creds.apiSecret);
    
    const klines = klineData.result?.list || [];

    if (klines.length === 0) {
      console.warn(`[Signal:${botId.slice(0, 8)}] No kline data returned. Bybit response:`, klineData);
      return;
    }

    // 2. Fetch wallet + positions
    const [walletData, positionData] = await Promise.all([
      bybit.getWalletBalance(creds.apiKey, creds.apiSecret),
      bybit.getPositions(creds.apiKey, creds.apiSecret, 'linear', bot.symbol),
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

    const klinesFormatted = klines
      .reverse() // oldest first
      .map(k => `[${new Date(parseInt(k[0])).toISOString()}, O:${k[1]}, H:${k[2]}, L:${k[3]}, C:${k[4]}, V:${k[5]}]`)
      .join('\n');

    const prompt = buildSignalPrompt({
      strategyScript: bot.strategyScript,
      equity,
      positionsJson,
      dailyTrades: bot.dailyTradeCount,
      maxTradesPerDay: bot.maxTradesPerDay,
      dailyPnl: bot.dailyPnl,
      maxDailyLoss: equity * (bot.maxDailyLossPct / 100),
      symbol: bot.symbol,
      signalInterval: bot.signalInterval,
      klinesFormatted,
    });

    // 5. Call AI
    console.log(`[Signal:${botId.slice(0, 8)}] Calling AI (${klines.length} candles)...`);
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
        marketSnapshot: { equity, positions: positionsJson, klineCount: klines.length },
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
          symbol: bot.symbol,
          aiReasoning: `AI said ${decision.action} but max positions reached (${positions.length}/${bot.maxPositions})`,
        });
        return;
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
        price: decision.price || String(parseFloat(klines[klines.length - 1]?.[4] || 0)),
        takeProfit: decision.tp,
        stopLoss: decision.sl,
        orderId: orderResult?.result?.orderId,
        orderStatus: orderResult?.retCode === 0 ? 'filled' : 'rejected',
        aiReasoning: decision.reasoning,
        marketSnapshot: { equity, klineCount: klines.length },
        errorDetails: orderResult?.retCode !== 0 ? orderResult?.retMsg : null,
      });

      // Update daily trade count
      if (orderResult?.retCode === 0) {
        await db.update(deployedBots).set({
          dailyTradeCount: bot.dailyTradeCount + 1,
          totalTrades: bot.totalTrades + 1,
          updatedAt: new Date(),
        }).where(eq(deployedBots.id, botId));
      }
    }

    if (decision.action === 'CLOSE') {
      await closeAllPositions(creds, bot, positions, decision.reasoning, botId);
    }

  } catch (err) {
    console.error(`[Signal:${botId.slice(0, 8)}] Error:`, err.message);
    await logTrade(botId, bot.userId, {
      action: 'ERROR',
      source: 'signal_engine',
      symbol: bot.symbol,
      errorDetails: err.message,
    });
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
  const [bot] = await db.select().from(deployedBots).where(eq(deployedBots.id, botId));
  if (!bot || bot.status !== 'running') return;

  try {
    // 1. Fetch wallet
    const walletData = await bybit.getWalletBalance(creds.apiKey, creds.apiSecret);
    const wallet = walletData.result?.list?.[0];
    const equity = parseFloat(wallet?.totalEquity || 0);

    // 2. Fetch closed PnL for today (to calculate daily P&L)
    const closedPnlData = await bybit.getClosedPnl(creds.apiKey, creds.apiSecret, 'linear', 50);
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayPnl = (closedPnlData.result?.list || [])
      .filter(p => parseInt(p.createdTime) >= todayStart.getTime())
      .reduce((sum, p) => sum + parseFloat(p.closedPnl || 0), 0);

    // Update daily P&L in DB
    await db.update(deployedBots).set({
      dailyPnl: todayPnl,
      lastRiskCheckAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(deployedBots.id, botId));

    // 3. KILL-SWITCH: Max daily loss
    const maxDailyLossUsd = equity * (bot.maxDailyLossPct / 100);
    if (todayPnl <= -maxDailyLossUsd) {
      console.error(`[Risk:${botId.slice(0, 8)}] ⛔ KILL-SWITCH TRIGGERED! Daily PnL: $${todayPnl.toFixed(2)} exceeds max loss -$${maxDailyLossUsd.toFixed(2)}`);

      // Close all positions immediately
      const positionData = await bybit.getPositions(creds.apiKey, creds.apiSecret, 'linear', bot.symbol);
      const positions = (positionData.result?.list || []).filter(p => parseFloat(p.size) > 0);
      if (positions.length > 0) {
        await closeAllPositions(creds, bot, positions, 'KILL-SWITCH: Max daily loss exceeded', botId);
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
    const positionData = await bybit.getPositions(creds.apiKey, creds.apiSecret, 'linear', bot.symbol);
    const positions = (positionData.result?.list || []).filter(p => parseFloat(p.size) > 0);

    if (positions.length === 0) return; // No positions to manage

    // 5. Dynamic Trailing Stop Management
    for (const pos of positions) {
      await manageDynamicTrailingStop(creds, bot, pos, botId);
    }

  } catch (err) {
    // Risk engine errors should not crash silently
    console.error(`[Risk:${botId.slice(0, 8)}] Error:`, err.message);
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

  // Calculate profit %
  let profitPct;
  if (side === 'Buy') {
    profitPct = ((markPrice - entryPrice) / entryPrice) * 100;
  } else {
    profitPct = ((entryPrice - markPrice) / entryPrice) * 100;
  }

  // Check if trailing stop should be activated
  if (profitPct < bot.trailingStopActivationPct) return; // Not yet in profit enough

  // Calculate the trailing distance in price terms
  // Bybit's trailingStop is the callback distance, not the price level
  const trailingDistance = markPrice * (bot.trailingStopCallbackPct / 100);
  const roundedDistance = Math.round(trailingDistance * 100) / 100; // Round to 2 decimals

  // Only update if there's no trailing stop or the new value differs significantly
  if (currentTrailingStop > 0 && Math.abs(currentTrailingStop - roundedDistance) < 0.01) return;

  try {
    // Use Bybit's native trading stop API to set/update trailing stop
    const result = await bybit.makeBybitRequest('POST', '/v5/position/trading-stop', {
      category: 'linear',
      symbol: bot.symbol,
      trailingStop: String(roundedDistance),
      positionIdx: position.positionIdx || 0,
    }, creds.apiKey, creds.apiSecret);

    if (result.retCode === 0) {
      console.log(`[Risk:${botId.slice(0, 8)}] 📐 Trailing stop updated: ${side} ${bot.symbol} | Profit: ${profitPct.toFixed(2)}% | Trail: $${roundedDistance}`);

      await logTrade(botId, bot.userId, {
        action: 'TRAILING_STOP',
        source: 'risk_engine',
        symbol: bot.symbol,
        side,
        price: String(markPrice),
        trailingStop: String(roundedDistance),
        aiReasoning: `Dynamic trailing stop adjusted. Position profit: ${profitPct.toFixed(2)}%. Callback: ${bot.trailingStopCallbackPct}%. Trail distance: $${roundedDistance}`,
        marketSnapshot: { entryPrice, markPrice, profitPct, size },
      });
    } else {
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
function buildSignalPrompt({ strategyScript, equity, positionsJson, dailyTrades, maxTradesPerDay, dailyPnl, maxDailyLoss, symbol, signalInterval, klinesFormatted }) {
  return `You are AlphaNode AI, an autonomous institutional trading agent.

ACTIVE STRATEGY:
${strategyScript}

CURRENT STATE:
- Wallet Balance: $${equity.toFixed(2)}
- Active Positions: ${positionsJson}
- Today's Trades: ${dailyTrades}/${maxTradesPerDay} (max ${maxTradesPerDay})
- Today's P&L: $${dailyPnl.toFixed(2)} (max loss limit: -$${maxDailyLoss.toFixed(2)})

MARKET DATA (last 100 candles, timeframe: ${signalInterval}):
${klinesFormatted}

RULES:
1. Respond with ONLY valid JSON: {"action":"BUY|SELL|HOLD|CLOSE","symbol":"${symbol}","qty":"<amount>","sl":"<price>","tp":"<price>","reasoning":"<1-2 sentences>"}
2. If HOLD, set qty/sl/tp to null.
3. Provide baseline SL/TP. The dynamic Trailing Stop will be managed independently by the Hardcoded Risk Engine once the trade is active.
4. NEVER exceed max daily trades or max daily loss.
5. Position size must respect the 1% risk-per-trade rule.`;
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
          model: 'MiniMax-M2.5',
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
  if (decision.sl) orderParams.stopLoss = decision.sl;
  if (decision.tp) orderParams.takeProfit = decision.tp;

  console.log(`[Signal] Placing order:`, JSON.stringify(orderParams));
  return bybit.placeOrder(creds.apiKey, creds.apiSecret, orderParams);
}

/**
 * Emergency close all positions for a bot.
 */
async function closeAllPositions(creds, bot, positions, reason, botId) {
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
      await logTrade(botId, bot.userId, {
        action: 'CLOSE',
        source: 'risk_engine',
        symbol: pos.symbol,
        side: closeSide,
        orderType: 'Market',
        qty: pos.size,
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
    });
  } catch (err) {
    console.error(`[BotEngine] Failed to log trade:`, err.message);
  }
}
