import { Router } from 'express';
import { operatorAuth } from '../middleware/operatorAuth.js';
import { getDecryptedKey } from '../services/apiKeyService.js';

// Exchange services
import * as bybit from '../services/bybitService.js';
import * as binance from '../services/binanceService.js';
import * as okx from '../services/okxService.js';

const router = Router();
router.use(operatorAuth);

// ─── Rate Limiting (simple in-memory) ───────────────────
const rateLimits = new Map();
const RATE_LIMIT = 10; // max requests per second per user
const RATE_WINDOW = 1000; // 1 second

function checkRateLimit(userId) {
  const now = Date.now();
  const userLimits = rateLimits.get(userId) || [];
  const recent = userLimits.filter(ts => now - ts < RATE_WINDOW);
  if (recent.length >= RATE_LIMIT) return false;
  recent.push(now);
  rateLimits.set(userId, recent);
  return true;
}

// ─── Helper: Get decrypted keys ─────────────────────────
async function getKeys(userId, platformId, res) {
  const keyData = await getDecryptedKey(userId, platformId);
  if (!keyData) {
    res.status(404).json({ error: `No ${platformId} API key found. Please add one in Settings → API Config.` });
    return null;
  }
  return keyData.fields;
}

// ═══════════════════════════════════════════════════════════
// BYBIT PROXY
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/proxy/bybit/wallet
 * Fetch unified wallet balance.
 */
router.get('/bybit/wallet', async (req, res) => {
  if (!checkRateLimit(req.user.id)) return res.status(429).json({ error: 'Rate limit exceeded' });
  try {
    const fields = await getKeys(req.user.id, 'bybit', res);
    if (!fields) return;
    const data = await bybit.getWalletBalance(fields.key, fields.secret, req.query.accountType);
    res.json(data);
  } catch (err) {
    console.error('[Proxy:Bybit] wallet error:', err.message);
    res.status(502).json({ error: 'Failed to fetch Bybit wallet', details: err.message });
  }
});

/**
 * GET /api/proxy/bybit/positions
 * Fetch open positions.
 */
router.get('/bybit/positions', async (req, res) => {
  if (!checkRateLimit(req.user.id)) return res.status(429).json({ error: 'Rate limit exceeded' });
  try {
    const fields = await getKeys(req.user.id, 'bybit', res);
    if (!fields) return;
    const data = await bybit.getPositions(fields.key, fields.secret, req.query.category, req.query.symbol);
    res.json(data);
  } catch (err) {
    console.error('[Proxy:Bybit] positions error:', err.message);
    res.status(502).json({ error: 'Failed to fetch Bybit positions', details: err.message });
  }
});

/**
 * GET /api/proxy/bybit/orders
 * Fetch order history.
 */
router.get('/bybit/orders', async (req, res) => {
  if (!checkRateLimit(req.user.id)) return res.status(429).json({ error: 'Rate limit exceeded' });
  try {
    const fields = await getKeys(req.user.id, 'bybit', res);
    if (!fields) return;
    const data = await bybit.getOrderHistory(fields.key, fields.secret, req.query.category, req.query.limit);
    res.json(data);
  } catch (err) {
    console.error('[Proxy:Bybit] orders error:', err.message);
    res.status(502).json({ error: 'Failed to fetch Bybit orders', details: err.message });
  }
});

/**
 * GET /api/proxy/bybit/closed-pnl
 * Fetch realized P&L (closed positions/trades).
 */
router.get('/bybit/closed-pnl', async (req, res) => {
  if (!checkRateLimit(req.user.id)) return res.status(429).json({ error: 'Rate limit exceeded' });
  try {
    const fields = await getKeys(req.user.id, 'bybit', res);
    if (!fields) return;
    const data = await bybit.getClosedPnl(fields.key, fields.secret, req.query.category, req.query.limit);
    res.json(data);
  } catch (err) {
    console.error('[Proxy:Bybit] closed P&L error:', err.message);
    res.status(502).json({ error: 'Failed to fetch Bybit closed P&L', details: err.message });
  }
});

/**
 * GET /api/proxy/bybit/tickers
 * Fetch market tickers (public).
 */
router.get('/bybit/tickers', async (req, res) => {
  try {
    const data = await bybit.getMarketTickers(req.query.category, req.query.symbol);
    res.json(data);
  } catch (err) {
    console.error('[Proxy:Bybit] tickers error:', err.message);
    res.status(502).json({ error: 'Failed to fetch Bybit tickers', details: err.message });
  }
});

/**
 * GET /api/proxy/bybit/active-orders
 * Fetch currently active/open orders.
 */
router.get('/bybit/active-orders', async (req, res) => {
  if (!checkRateLimit(req.user.id)) return res.status(429).json({ error: 'Rate limit exceeded' });
  try {
    const fields = await getKeys(req.user.id, 'bybit', res);
    if (!fields) return;
    const data = await bybit.getActiveOrders(fields.key, fields.secret, req.query.category, req.query.symbol);
    res.json(data);
  } catch (err) {
    console.error('[Proxy:Bybit] active-orders error:', err.message);
    res.status(502).json({ error: 'Failed to fetch Bybit active orders', details: err.message });
  }
});

/**
 * POST /api/proxy/bybit/order
 * Place a new order.
 */
router.post('/bybit/order', async (req, res) => {
  if (!checkRateLimit(req.user.id)) return res.status(429).json({ error: 'Rate limit exceeded' });
  try {
    const fields = await getKeys(req.user.id, 'bybit', res);
    if (!fields) return;
    const data = await bybit.placeOrder(fields.key, fields.secret, req.body);
    res.json(data);
  } catch (err) {
    console.error('[Proxy:Bybit] place order error:', err.message);
    res.status(502).json({ error: 'Failed to place Bybit order', details: err.message });
  }
});

/**
 * POST /api/proxy/bybit/cancel
 * Cancel an existing order.
 */
router.post('/bybit/cancel', async (req, res) => {
  if (!checkRateLimit(req.user.id)) return res.status(429).json({ error: 'Rate limit exceeded' });
  try {
    const fields = await getKeys(req.user.id, 'bybit', res);
    if (!fields) return;
    const { category, symbol, orderId } = req.body;
    const data = await bybit.cancelOrder(fields.key, fields.secret, category, symbol, orderId);
    res.json(data);
  } catch (err) {
    console.error('[Proxy:Bybit] cancel order error:', err.message);
    res.status(502).json({ error: 'Failed to cancel Bybit order', details: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// BINANCE PROXY
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/proxy/binance/account
 * Fetch spot account info (balances).
 */
router.get('/binance/account', async (req, res) => {
  if (!checkRateLimit(req.user.id)) return res.status(429).json({ error: 'Rate limit exceeded' });
  try {
    const fields = await getKeys(req.user.id, 'binance', res);
    if (!fields) return;
    const data = await binance.getAccountInfo(fields.key, fields.secret);
    res.json(data);
  } catch (err) {
    console.error('[Proxy:Binance] account error:', err.message);
    res.status(502).json({ error: 'Failed to fetch Binance account', details: err.message });
  }
});

/**
 * GET /api/proxy/binance/orders
 * Fetch open orders.
 */
router.get('/binance/orders', async (req, res) => {
  if (!checkRateLimit(req.user.id)) return res.status(429).json({ error: 'Rate limit exceeded' });
  try {
    const fields = await getKeys(req.user.id, 'binance', res);
    if (!fields) return;
    const data = await binance.getOpenOrders(fields.key, fields.secret, req.query.symbol);
    res.json(data);
  } catch (err) {
    console.error('[Proxy:Binance] orders error:', err.message);
    res.status(502).json({ error: 'Failed to fetch Binance orders', details: err.message });
  }
});

/**
 * GET /api/proxy/binance/trades
 * Fetch trade history.
 */
router.get('/binance/trades', async (req, res) => {
  if (!checkRateLimit(req.user.id)) return res.status(429).json({ error: 'Rate limit exceeded' });
  try {
    const fields = await getKeys(req.user.id, 'binance', res);
    if (!fields) return;
    if (!req.query.symbol) return res.status(400).json({ error: 'symbol is required' });
    const data = await binance.getMyTrades(fields.key, fields.secret, req.query.symbol, req.query.limit);
    res.json(data);
  } catch (err) {
    console.error('[Proxy:Binance] trades error:', err.message);
    res.status(502).json({ error: 'Failed to fetch Binance trades', details: err.message });
  }
});

/**
 * GET /api/proxy/binance/tickers
 * Fetch market tickers (public).
 */
router.get('/binance/tickers', async (req, res) => {
  try {
    const data = await binance.getMarketTicker(req.query.symbol);
    res.json(data);
  } catch (err) {
    console.error('[Proxy:Binance] tickers error:', err.message);
    res.status(502).json({ error: 'Failed to fetch Binance tickers', details: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// OKX PROXY
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/proxy/okx/balance
 * Fetch account balance.
 */
router.get('/okx/balance', async (req, res) => {
  if (!checkRateLimit(req.user.id)) return res.status(429).json({ error: 'Rate limit exceeded' });
  try {
    const fields = await getKeys(req.user.id, 'okx', res);
    if (!fields) return;
    const data = await okx.getAccountBalance(fields.key, fields.secret, fields.passphrase, req.query.ccy);
    res.json(data);
  } catch (err) {
    console.error('[Proxy:OKX] balance error:', err.message);
    res.status(502).json({ error: 'Failed to fetch OKX balance', details: err.message });
  }
});

/**
 * GET /api/proxy/okx/positions
 * Fetch positions.
 */
router.get('/okx/positions', async (req, res) => {
  if (!checkRateLimit(req.user.id)) return res.status(429).json({ error: 'Rate limit exceeded' });
  try {
    const fields = await getKeys(req.user.id, 'okx', res);
    if (!fields) return;
    const data = await okx.getPositions(fields.key, fields.secret, fields.passphrase, req.query.instType);
    res.json(data);
  } catch (err) {
    console.error('[Proxy:OKX] positions error:', err.message);
    res.status(502).json({ error: 'Failed to fetch OKX positions', details: err.message });
  }
});

/**
 * GET /api/proxy/okx/orders
 * Fetch order history.
 */
router.get('/okx/orders', async (req, res) => {
  if (!checkRateLimit(req.user.id)) return res.status(429).json({ error: 'Rate limit exceeded' });
  try {
    const fields = await getKeys(req.user.id, 'okx', res);
    if (!fields) return;
    const data = await okx.getOrderHistory(fields.key, fields.secret, fields.passphrase, req.query.instType, req.query.limit);
    res.json(data);
  } catch (err) {
    console.error('[Proxy:OKX] orders error:', err.message);
    res.status(502).json({ error: 'Failed to fetch OKX orders', details: err.message });
  }
});

/**
 * GET /api/proxy/okx/tickers
 * Fetch market tickers (public).
 */
router.get('/okx/tickers', async (req, res) => {
  try {
    const data = await okx.getMarketTickers(req.query.instType, req.query.instId);
    res.json(data);
  } catch (err) {
    console.error('[Proxy:OKX] tickers error:', err.message);
    res.status(502).json({ error: 'Failed to fetch OKX tickers', details: err.message });
  }
});

export default router;
