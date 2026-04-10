import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getIdxQuotes, getIdxChart, IDX_TOP_STOCKS } from '../services/stockService.js';
import { getTrendingCrypto } from '../services/cryptoMarketService.js';

const router = Router();
router.use(requireAuth);

/**
 * GET /api/stocks/idx/quotes
 * Fetch real-time IDX stock quotes.
 * Query params:
 *   ?tickers=BBCA,BMRI,ASII  (optional, defaults to top 15)
 */
router.get('/idx/quotes', async (req, res) => {
  try {
    const requestedTickers = req.query.tickers
      ? req.query.tickers.split(',').map(t => t.trim().toUpperCase())
      : IDX_TOP_STOCKS.map(s => s.ticker);

    const quotes = await getIdxQuotes(requestedTickers);
    res.json({ success: true, quotes, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[StockRoute] IDX quotes error:', err.message);
    res.status(502).json({ error: 'Failed to fetch IDX stock data', details: err.message });
  }
});

/**
 * GET /api/stocks/idx/chart/:ticker
 * Fetch OHLCV chart data for a single IDX stock.
 * Query params:
 *   ?interval=1d&range=3mo
 */
router.get('/idx/chart/:ticker', async (req, res) => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const interval = req.query.interval || '1d';
    const range = req.query.range || '3mo';

    const chart = await getIdxChart(ticker, interval, range);
    res.json({ success: true, ticker, chart });
  } catch (err) {
    console.error('[StockRoute] IDX chart error:', err.message);
    res.status(502).json({ error: 'Failed to fetch chart data', details: err.message });
  }
});

/**
 * GET /api/stocks/idx/list
 * Returns the list of supported IDX tickers with metadata.
 */
router.get('/idx/list', (req, res) => {
  res.json({ success: true, stocks: IDX_TOP_STOCKS });
});

/**
 * GET /api/stocks/crypto/trending
 * Detect hot listings and trending coins on Bybit with AI Signals.
 */
router.get('/crypto/trending', async (req, res) => {
  try {
    const trending = await getTrendingCrypto();
    res.json({ success: true, trending, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[StockRoute] Crypto trending error:', err.message);
    res.status(502).json({ error: 'Failed to fetch crypto trending data', details: err.message });
  }
});

export default router;
