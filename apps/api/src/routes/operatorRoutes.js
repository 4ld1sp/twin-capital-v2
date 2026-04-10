/**
 * ═══════════════════════════════════════════════════════════════
 * Operator Key Management + Quick Status Endpoint
 * ═══════════════════════════════════════════════════════════════
 *
 * These endpoints are used to:
 * 1. Generate API keys for external agents (OpenClaw)
 * 2. List/revoke existing keys
 * 3. Provide a single-call status overview for agents
 *
 * Key generation requires session auth (dashboard).
 * Status endpoint works with both session and operator key.
 */
import { Router } from 'express';
import crypto from 'crypto';
import { requireAuth } from '../middleware/requireAuth.js';
import { operatorAuth } from '../middleware/operatorAuth.js';
import { db } from '../db/index.js';
import { operatorKeys, deployedBots, tradeLogs } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { getDecryptedKey } from '../services/apiKeyService.js';
import * as bybit from '../services/bybitService.js';
import { getActiveBotIds } from '../services/botEngine.js';

const router = Router();

// ═══════════════════════════════════════════════════════════════
// KEY MANAGEMENT (Session Auth only — must be done from dashboard)
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/operator/keys
 * Generate a new operator key. The raw key is returned ONCE.
 */
router.post('/keys', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name = 'OpenClaw Agent', expiresInDays } = req.body;

    // Generate a secure random key with tc_op_ prefix
    const rawKey = `tc_op_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyId = crypto.randomUUID();

    let expiresAt = null;
    if (expiresInDays && expiresInDays > 0) {
      expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    }

    await db.insert(operatorKeys).values({
      id: keyId,
      userId,
      name,
      keyHash,
      permissions: ['*'], // Full access
      expiresAt,
      isActive: true,
    });

    console.log(`[Operator] 🔑 New key "${name}" generated for user ${userId}`);

    res.json({
      success: true,
      key: rawKey,  // ⚠️  SHOWN ONCE — user must copy this!
      keyId,
      name,
      expiresAt,
      message: '⚠️  SAVE THIS KEY NOW — it will never be shown again!',
    });
  } catch (err) {
    console.error('[Operator] Key generation error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/operator/keys
 * List all operator keys (masked) for the current user.
 */
router.get('/keys', requireAuth, async (req, res) => {
  try {
    const keys = await db.select().from(operatorKeys)
      .where(eq(operatorKeys.userId, req.user.id))
      .orderBy(desc(operatorKeys.createdAt));

    // Never expose the hash
    const masked = keys.map(k => ({
      id: k.id,
      name: k.name,
      permissions: k.permissions,
      isActive: k.isActive,
      lastUsedAt: k.lastUsedAt,
      expiresAt: k.expiresAt,
      createdAt: k.createdAt,
    }));

    res.json(masked);
  } catch (err) {
    console.error('[Operator] List keys error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/operator/keys/:id
 * Revoke (deactivate) an operator key.
 */
router.delete('/keys/:id', requireAuth, async (req, res) => {
  try {
    const [key] = await db.select().from(operatorKeys)
      .where(
        and(
          eq(operatorKeys.id, req.params.id),
          eq(operatorKeys.userId, req.user.id)
        )
      );

    if (!key) return res.status(404).json({ error: 'Key not found' });

    await db.update(operatorKeys)
      .set({ isActive: false })
      .where(eq(operatorKeys.id, req.params.id));

    console.log(`[Operator] 🗑️  Key "${key.name}" revoked`);
    res.json({ success: true, message: `Key "${key.name}" has been revoked` });
  } catch (err) {
    console.error('[Operator] Revoke key error:', err.message);
    res.status(500).json({ error: err.message });
  }
});


// ═══════════════════════════════════════════════════════════════
// OPERATOR STATUS — Single-call overview for agents
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/operator/status
 * Returns a comprehensive snapshot of the entire system state.
 * Designed for OpenClaw to get full context in ONE API call.
 */
router.get('/status', operatorAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch all bots
    const bots = await db.select().from(deployedBots)
      .where(eq(deployedBots.userId, userId))
      .orderBy(desc(deployedBots.createdAt));

    const activeIds = getActiveBotIds();
    const enrichedBots = bots.map(b => ({
      id: b.id,
      strategyName: b.strategyName,
      symbol: b.symbol,
      status: b.status,
      isLive: activeIds.includes(b.id),
      networkMode: b.networkMode,
      leverage: b.leverage,
      totalPnl: b.totalPnl,
      totalTrades: b.totalTrades,
      winCount: b.winCount,
      lossCount: b.lossCount,
      dailyPnl: b.dailyPnl,
      dailyTradeCount: b.dailyTradeCount,
      maxTradesPerDay: b.maxTradesPerDay,
      lastSignalAt: b.lastSignalAt,
      lastSignalAction: b.lastSignalAction,
      errorMessage: b.errorMessage,
      startedAt: b.startedAt,
      createdAt: b.createdAt,
    }));

    // 2. Try to fetch wallet balance
    let wallet = null;
    try {
      const keyData = await getDecryptedKey(userId, 'bybit');
      if (keyData && keyData.isConnected) {
        const walletData = await bybit.getWalletBalance(keyData.fields.key, keyData.fields.secret);
        if (walletData.retCode === 0) {
          const w = walletData.result?.list?.[0];
          wallet = {
            totalEquity: parseFloat(w?.totalEquity || 0),
            availableBalance: parseFloat(w?.totalAvailableBalance || 0),
            totalWalletBalance: parseFloat(w?.totalWalletBalance || 0),
            totalUnrealisedPnl: parseFloat(w?.totalPerpUPL || 0),
          };
        }
      }
    } catch (e) {
      wallet = { error: e.message };
    }

    // 3. Fetch recent trade logs (last 20 across all bots)
    const recentLogs = await db.select().from(tradeLogs)
      .where(eq(tradeLogs.userId, userId))
      .orderBy(desc(tradeLogs.createdAt))
      .limit(20);

    const logsSimplified = recentLogs.map(l => ({
      botId: l.botId,
      action: l.action,
      source: l.source,
      symbol: l.symbol,
      side: l.side,
      qty: l.qty,
      pnl: l.pnl,
      aiReasoning: l.aiReasoning,
      errorDetails: l.errorDetails,
      createdAt: l.createdAt,
    }));

    // 4. Summary stats
    const runningBots = enrichedBots.filter(b => b.status === 'running').length;
    const totalDailyPnl = enrichedBots.reduce((s, b) => s + (b.dailyPnl || 0), 0);

    res.json({
      timestamp: new Date().toISOString(),
      operator: req.operatorKey ? req.operatorKey.name : 'dashboard_session',
      summary: {
        runningBots,
        totalBots: enrichedBots.length,
        totalDailyPnl: parseFloat(totalDailyPnl.toFixed(2)),
        walletEquity: wallet?.totalEquity || null,
        availableBalance: wallet?.availableBalance || null,
      },
      wallet,
      bots: enrichedBots,
      recentLogs: logsSimplified,
    });
  } catch (err) {
    console.error('[Operator] Status error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
