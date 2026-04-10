/**
 * Stock Service — IDX (Indonesia Stock Exchange) Market Data
 * Uses Yahoo Finance public API (no API key required).
 * IDX stocks are fetched with the .JK suffix (e.g., BBCA.JK)
 */

const YF_QUOTE_URL = 'https://query1.finance.yahoo.com/v7/finance/quote';
const YF_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

// In-memory cache to throttle Yahoo Finance requests (15 min TTL)
const quoteCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// IDX Top 30 most liquid stocks
export const IDX_TOP_STOCKS = [
  { ticker: 'BBCA', name: 'Bank Central Asia Tbk', sector: 'Finance' },
  { ticker: 'BMRI', name: 'Bank Mandiri (Persero) Tbk', sector: 'Finance' },
  { ticker: 'BBRI', name: 'Bank Rakyat Indonesia Tbk', sector: 'Finance' },
  { ticker: 'ASII', name: 'Astra International Tbk', sector: 'Consumer Cyclical' },
  { ticker: 'TLKM', name: 'Telkom Indonesia Tbk', sector: 'Communication' },
  { ticker: 'GOTO', name: 'GoTo Gojek Tokopedia Tbk', sector: 'Technology' },
  { ticker: 'ANTM', name: 'Aneka Tambang Tbk', sector: 'Basic Materials' },
  { ticker: 'UNVR', name: 'Unilever Indonesia Tbk', sector: 'Consumer Defensive' },
  { ticker: 'BBNI', name: 'Bank Negara Indonesia Tbk', sector: 'Finance' },
  { ticker: 'ADRO', name: 'Adaro Energy Indonesia Tbk', sector: 'Energy' },
  { ticker: 'ICBP', name: 'Indofood CBP Sukses Makmur', sector: 'Consumer Defensive' },
  { ticker: 'INDF', name: 'Indofood Sukses Makmur Tbk', sector: 'Consumer Defensive' },
  { ticker: 'KLBF', name: 'Kalbe Farma Tbk', sector: 'Healthcare' },
  { ticker: 'PTBA', name: 'Bukit Asam Tbk', sector: 'Energy' },
  { ticker: 'SMGR', name: 'Semen Indonesia Tbk', sector: 'Basic Materials' },
];

/**
 * Fetch current quotes for given IDX tickers.
 * Uses v8/finance/chart which is more stable than v7/quote.
 * Returns normalized array of quote objects.
 */
export async function getIdxQuotes(tickers = IDX_TOP_STOCKS.map(s => s.ticker)) {
  const cacheKey = tickers.sort().join(',');
  const cached = quoteCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  // Build a metadata map for company info
  const metaMap = {};
  IDX_TOP_STOCKS.forEach(s => { metaMap[s.ticker] = s; });

  // Fetch each ticker individually but in parallel
  const results = await Promise.all(tickers.map(async (ticker) => {
    try {
      const symbol = ticker.includes('.JK') ? ticker : `${ticker}.JK`;
      const url = `${YF_CHART_URL}/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
      
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) return null;

      const body = await res.json();
      const meta = body?.chart?.result?.[0]?.meta;
      if (!meta) return null;

      const tickerClean = ticker.replace('.JK', '');
      const company = metaMap[tickerClean] || {};
      
      const price = meta.regularMarketPrice;
      const prevClose = meta.chartPreviousClose || price;
      const change = price - prevClose;
      const changePct = prevClose ? (change / prevClose) * 100 : 0;

      return {
        ticker: tickerClean,
        name: company.name || meta.longName || meta.shortName || meta.symbol,
        sector: company.sector || 'Unknown',
        price,
        change,
        changePct: parseFloat(changePct.toFixed(2)),
        volume: meta.regularMarketVolume || 0,
        dayHigh: meta.regularMarketDayHigh || price,
        dayLow: meta.regularMarketDayLow || price,
        open: meta.regularMarketPrice || 0,
        week52High: meta.fiftyTwoWeekHigh || price,
        week52Low: meta.fiftyTwoWeekLow || price,
        marketCap: 0, 
        pe: null,
        trend: changePct >= 1.5 ? 'strong_up' : changePct >= 0 ? 'up' : changePct >= -1.5 ? 'down' : 'strong_down',
      };
    } catch (err) {
      console.error(`[StockService] Failed to fetch ${ticker}:`, err.message);
      return null;
    }
  }));

  const normalized = results.filter(r => r !== null);
  
  // Sort by ticker name or volume if we had it
  normalized.sort((a, b) => b.volume - a.volume);

  quoteCache.set(cacheKey, { ts: Date.now(), data: normalized });
  return normalized;
}

/**
 * Fetch OHLCV chart data for a single IDX ticker (for mini-charts).
 * interval: '1d' | '1wk' | '1mo'
 * range: '1mo' | '3mo' | '6mo' | '1y'
 */
export async function getIdxChart(ticker, interval = '1d', range = '3mo') {
  const symbol = ticker.includes('.JK') ? ticker : `${ticker}.JK`;
  const url = `${YF_CHART_URL}/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TwinCapital/1.0)' },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error(`Yahoo Finance chart HTTP ${res.status}`);

  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result) return [];

  const timestamps = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];

  return timestamps.map((ts, i) => ({
    date: new Date(ts * 1000).toISOString().slice(0, 10),
    close: closes[i] || null,
  })).filter(p => p.close !== null);
}
