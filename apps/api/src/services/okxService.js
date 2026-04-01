import crypto from 'crypto';

const OKX_BASE = 'https://www.okx.com';

/**
 * Generate signature for OKX API (HMAC-SHA256 with Base64).
 * @see https://www.okx.com/docs-v5/en/#overview-authentication
 */
function signRequest(timestamp, method, requestPath, body, apiSecret) {
  const preSign = `${timestamp}${method.toUpperCase()}${requestPath}${body || ''}`;
  return crypto.createHmac('sha256', apiSecret).update(preSign).digest('base64');
}

/**
 * Make an authenticated request to OKX V5 API.
 */
export async function makeOkxRequest(method, path, params, apiKey, apiSecret, passphrase) {
  const timestamp = new Date().toISOString();

  let requestPath = path;
  let body = '';

  if (method === 'GET' && params && Object.keys(params).length > 0) {
    const query = new URLSearchParams(params).toString();
    requestPath += `?${query}`;
  } else if (method === 'POST' && params) {
    body = JSON.stringify(params);
  }

  const signature = signRequest(timestamp, method, requestPath, body, apiSecret);

  const headers = {
    'OK-ACCESS-KEY': apiKey,
    'OK-ACCESS-SIGN': signature,
    'OK-ACCESS-TIMESTAMP': timestamp,
    'OK-ACCESS-PASSPHRASE': passphrase,
    'Content-Type': 'application/json',
  };

  const url = `${OKX_BASE}${requestPath}`;
  const options = { method, headers, signal: AbortSignal.timeout(10000) };
  if (method === 'POST' && body) options.body = body;

  const res = await fetch(url, options);
  return res.json();
}

/**
 * Get account balance.
 */
export async function getAccountBalance(apiKey, apiSecret, passphrase, ccy) {
  const params = {};
  if (ccy) params.ccy = ccy;
  return makeOkxRequest('GET', '/api/v5/account/balance', params, apiKey, apiSecret, passphrase);
}

/**
 * Get positions.
 */
export async function getPositions(apiKey, apiSecret, passphrase, instType = 'SWAP') {
  return makeOkxRequest('GET', '/api/v5/account/positions', { instType }, apiKey, apiSecret, passphrase);
}

/**
 * Get order history.
 */
export async function getOrderHistory(apiKey, apiSecret, passphrase, instType = 'SWAP', limit = 20) {
  return makeOkxRequest('GET', '/api/v5/trade/orders-history-archive', { instType, limit: String(limit) }, apiKey, apiSecret, passphrase);
}

/**
 * Get market tickers (public, no auth needed).
 */
export async function getMarketTickers(instType = 'SWAP', instId) {
  const params = { instType };
  if (instId) params.instId = instId;
  const url = `${OKX_BASE}/api/v5/market/tickers?${new URLSearchParams(params)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  return res.json();
}
