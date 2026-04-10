import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import apiKeysRouter from './routes/apiKeys.js';
import exchangeProxyRouter from './routes/exchangeProxy.js';
import aiProxyRouter from './routes/aiProxy.js';
import botRouter from './routes/botRoutes.js';
import agentRouter from './routes/agentRoutes.js';
import operatorRouter from './routes/operatorRoutes.js';
import stockRouter from './routes/stockRoutes.js';
import assetSahamRouter from './routes/assetSaham.js';
import orgRouter from './routes/orgRoutes.js';
import billingRouter from './routes/billingRoutes.js';
import { requireAuth } from './middleware/requireAuth.js';
import { orgContext } from './middleware/orgContext.js';

const app = express();
const PORT = process.env.PORT || 8001;

// ─── CORS ──────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow dashboard, tunnels, and server-to-server (no origin)
    const allowedPatterns = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ];
    if (!origin || allowedPatterns.includes(origin) || origin.endsWith('.ngrok-free.app') || origin.endsWith('.trycloudflare.com')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for operator key auth (key itself is the guard)
    }
  },
  credentials: true,
}));

// ─── Better Auth ───────────────────────────────────────
// Must be mounted BEFORE express.json() because Better Auth
// handles its own body parsing for auth routes.
console.log('Registered Auth Routes:', Object.keys(auth.api));
app.all('/api/auth/*', toNodeHandler(auth));

// ─── Body Parser ───────────────────────────────────────
app.use(express.json());

// ─── API Routes ────────────────────────────────────────
import authExtrasRouter from './routes/authExtras.js';
app.use('/api/auth-extras', authExtrasRouter);
app.use('/api/keys', apiKeysRouter);
app.use('/api/proxy', exchangeProxyRouter);
app.use('/api/proxy/ai', aiProxyRouter);
app.use('/api/bots', botRouter);
app.use('/api/agent', agentRouter);
app.use('/api/operator', operatorRouter);
app.use('/api/stocks', stockRouter);
app.use('/api/assets-saham', assetSahamRouter);
app.use('/api/org', requireAuth, orgContext, orgRouter);
app.use('/api/billing', billingRouter);

// ─── Health Check ──────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Start Server ──────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n  ⚡ Twin Capital API running on http://localhost:${PORT}`);
  console.log(`  📦 Auth:    http://localhost:${PORT}/api/auth`);
  console.log(`  🔑 Keys:    http://localhost:${PORT}/api/keys`);
  console.log(`  🔄 Proxy:   http://localhost:${PORT}/api/proxy/{bybit,binance,okx}`);
  console.log(`  🤖 Bots:    http://localhost:${PORT}/api/bots`);
  console.log(`  🔐 Operator: http://localhost:${PORT}/api/operator`);
  console.log(`  ❤️  Health:  http://localhost:${PORT}/api/health\n`);

  // ─── Auto-Resume Bots ──────────────────────────────────
  // Restart all bots that were "running" before server reload/restart
  try {
    const { db } = await import('./db/index.js');
    const { deployedBots } = await import('./db/schema.js');
    const { startBot } = await import('./services/botEngine.js');
    const { eq } = await import('drizzle-orm');

    const runningBots = await db.select().from(deployedBots)
      .where(eq(deployedBots.status, 'running'));

    if (runningBots.length > 0) {
      console.log(`  🔄 Auto-resuming ${runningBots.length} bot(s)...`);
      for (const bot of runningBots) {
        try {
          await startBot(bot.id);
          console.log(`  ✅ Resumed: "${bot.strategyName}" (${bot.symbol})`);
        } catch (err) {
          console.error(`  ❌ Failed to resume "${bot.strategyName}": ${err.message}`);
        }
      }
      console.log(`  🔄 Auto-resume complete.\n`);
    } else {
      console.log(`  ℹ️  No bots to auto-resume.\n`);
    }
  } catch (err) {
    console.error(`  ❌ Auto-resume error: ${err.message}\n`);
  }
});
