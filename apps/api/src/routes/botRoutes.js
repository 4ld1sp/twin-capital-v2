/**
 * Bot Management Routes
 * CRUD + control endpoints for deployed auto-trading bots.
 */
import { Router } from 'express';
import crypto from 'crypto';
import { requireAuth } from '../middleware/requireAuth.js';
import { db } from '../db/index.js';
import { deployedBots, tradeLogs } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { startBot, stopBot, pauseBot, resumeBot, getActiveBotIds } from '../services/botEngine.js';

const router = Router();
router.use(requireAuth);

// ─── Deploy a new bot ────────────────────────────────────────
router.post('/deploy', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      strategyName,
      strategyScript,
      strategyPrompt,
      symbol = 'BTCUSDT',
      exchange = 'bybit',
      networkMode = 'testnet',
      signalInterval = '30m',
      riskInterval = '10s',
      leverage = 5,
      leverageType = 'isolated',
      maxDailyLossPct = 5,
      maxPositions = 1,
      maxTradesPerDay = 3,
      riskPerTradePct = 1,
      trailingStopActivationPct = 1.0,
      trailingStopCallbackPct = 0.5,
    } = req.body;

    if (!strategyName || !strategyScript) {
      return res.status(400).json({ error: 'strategyName and strategyScript are required' });
    }

    const botId = crypto.randomUUID();

    await db.insert(deployedBots).values({
      id: botId,
      userId,
      strategyName,
      strategyScript,
      strategyPrompt,
      symbol,
      exchange,
      networkMode,
      signalInterval,
      riskInterval,
      leverage,
      leverageType,
      maxDailyLossPct,
      maxPositions,
      maxTradesPerDay,
      riskPerTradePct,
      trailingStopActivationPct,
      trailingStopCallbackPct,
      status: 'stopped',
    });

    // Auto-start the bot
    await startBot(botId);

    res.json({ botId, status: 'running', message: 'Bot deployed and started successfully' });
  } catch (err) {
    console.error('[BotRoutes] Deploy error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── List user's bots ────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const bots = await db.select().from(deployedBots)
      .where(eq(deployedBots.userId, req.user.id))
      .orderBy(desc(deployedBots.createdAt));

    const activeIds = getActiveBotIds();
    const enriched = bots.map(b => ({
      ...b,
      isLive: activeIds.includes(b.id),
      winRate: b.totalTrades > 0 ? ((b.winCount / b.totalTrades) * 100).toFixed(1) : '0.0',
    }));

    res.json(enriched);
  } catch (err) {
    console.error('[BotRoutes] List error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Get bot detail + recent trade logs ──────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [bot] = await db.select().from(deployedBots)
      .where(and(eq(deployedBots.id, req.params.id), eq(deployedBots.userId, req.user.id)));

    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    const logs = await db.select().from(tradeLogs)
      .where(eq(tradeLogs.botId, bot.id))
      .orderBy(desc(tradeLogs.createdAt))
      .limit(50);

    res.json({ bot, logs });
  } catch (err) {
    console.error('[BotRoutes] Detail error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Get paginated trade logs ────────────────────────────────
router.get('/:id/logs', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = parseInt(req.query.offset) || 0;

    const logs = await db.select().from(tradeLogs)
      .where(and(eq(tradeLogs.botId, req.params.id), eq(tradeLogs.userId, req.user.id)))
      .orderBy(desc(tradeLogs.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({ logs, limit, offset });
  } catch (err) {
    console.error('[BotRoutes] Logs error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Stop a bot ──────────────────────────────────────────────
router.post('/:id/stop', async (req, res) => {
  try {
    const [bot] = await db.select().from(deployedBots)
      .where(and(eq(deployedBots.id, req.params.id), eq(deployedBots.userId, req.user.id)));
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    await stopBot(bot.id);
    res.json({ status: 'stopped', message: 'Bot stopped successfully' });
  } catch (err) {
    console.error('[BotRoutes] Stop error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Pause a bot ─────────────────────────────────────────────
router.post('/:id/pause', async (req, res) => {
  try {
    const [bot] = await db.select().from(deployedBots)
      .where(and(eq(deployedBots.id, req.params.id), eq(deployedBots.userId, req.user.id)));
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    await pauseBot(bot.id);
    res.json({ status: 'paused', message: 'Bot paused' });
  } catch (err) {
    console.error('[BotRoutes] Pause error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Resume a bot ────────────────────────────────────────────
router.post('/:id/resume', async (req, res) => {
  try {
    const [bot] = await db.select().from(deployedBots)
      .where(and(eq(deployedBots.id, req.params.id), eq(deployedBots.userId, req.user.id)));
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    await resumeBot(bot.id);
    res.json({ status: 'running', message: 'Bot resumed' });
  } catch (err) {
    console.error('[BotRoutes] Resume error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
