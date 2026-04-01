import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import apiKeysRouter from './routes/apiKeys.js';
import exchangeProxyRouter from './routes/exchangeProxy.js';
import aiProxyRouter from './routes/aiProxy.js';
import botRouter from './routes/botRoutes.js';

const app = express();
const PORT = process.env.PORT || 8001;

// ─── CORS ──────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173',
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

// ─── Health Check ──────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Start Server ──────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ⚡ Twin Capital API running on http://localhost:${PORT}`);
  console.log(`  📦 Auth:    http://localhost:${PORT}/api/auth`);
  console.log(`  🔑 Keys:    http://localhost:${PORT}/api/keys`);
  console.log(`  🔄 Proxy:   http://localhost:${PORT}/api/proxy/{bybit,binance,okx}`);
  console.log(`  🤖 Bots:    http://localhost:${PORT}/api/bots`);
  console.log(`  ❤️  Health:  http://localhost:${PORT}/api/health\n`);
});
