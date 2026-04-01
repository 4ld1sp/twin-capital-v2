import crypto from 'crypto';

const BINANCE_BASE = 'https://api.binance.com';

/**
 * Generate HMAC-SHA256 signature for Binance API.
 * @see https://binance-docs.github.io/apidocs/spot/en/
 */
function signRequest(queryString, apiSecret) {
  return crypto.createHmac('sha256', apiSecret).update(queryString).digest('hex');
}

/**
 * Make an authenticated request to Binance API.
 */
export async function makeBinanceRequest(method, path, params, apiKey, apiSecret) {
  const timestamp = Date.now();
  const allParams = { ...params, timestamp, recvWindow: 5000 };
  const queryString = new URLSearchParams(allParams).toString();
  const signature = signRequest(queryString, apiSecret);
  
  let url = `${BINANCE_BASE}${path}?${queryString}&signature=${signature}`;
  
  const headers = {
    'X-MBX-APIKEY': apiKey,
    'Content-Type': 'application/json',
  };

  const options = { method, headers, signal: AbortSignal.timeout(10000) };

  const res = await fetch(url, options);
  return res.json();
}

/**
 * Get spot account information (balances).
 */
export async function getAccountInfo(apiKey, apiSecret) {
  return makeBinanceRequest('GET', '/api/v3/account', {}, apiKey, apiSecret);
}

/**
 * Get all open orders.
 */
export async function getOpenOrders(apiKey, apiSecret, symbol) {
  const params = {};
  if (symbol) params.symbol = symbol;
  return makeBinanceRequest('GET', '/api/v3/openOrders', params, apiKey, apiSecret);
}

/**
 * Get recent trades (order history).
 */
export async function getMyTrades(apiKey, apiSecret, symbol, limit = 20) {
  return makeBinanceRequest('GET', '/api/v3/myTrades', { symbol, limit }, apiKey, apiSecret);
}

/**
 * Get market ticker (public, no auth needed).
 */
export async function getMarketTicker(symbol) {
  const url = `${BINANCE_BASE}/api/v3/ticker/24hr${symbol ? `?symbol=${symbol}` : ''}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  return res.json();
}

/**
 * Get klines/candlestick data (public).
 */
export async function getKlines(symbol, interval = '1h', limit = 100) {
  const url = `${BINANCE_BASE}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  return res.json();
}
