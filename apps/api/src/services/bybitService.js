import crypto from 'crypto';

const BYBIT_BASE = 'https://api.bytick.com';

/**
 * Generate HMAC-SHA256 signature for Bybit V5 API.
 * @see https://bybit-exchange.github.io/docs/v5/guide
 */
function signRequest(apiKey, apiSecret, timestamp, recvWindow, params = '') {
  const preSign = `${timestamp}${apiKey}${recvWindow}${params}`;
  return crypto.createHmac('sha256', apiSecret).update(preSign).digest('hex');
}

/**
 * Make an authenticated request to Bybit V5 API.
 */
export async function makeBybitRequest(method, path, params, apiKey, apiSecret) {
  const timestamp = Date.now().toString();
  const recvWindow = '5000'; // 5 seconds max as recommended by Bybit docs

  let url = `${BYBIT_BASE}${path}`;
  let body = '';
  let queryString = '';

  if (method === 'GET' && params && Object.keys(params).length > 0) {
    queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  } else if (method === 'POST' && params) {
    body = JSON.stringify(params);
  }

  const signPayload = method === 'GET' ? queryString : body;
  const signature = signRequest(apiKey, apiSecret, timestamp, recvWindow, signPayload);

  const headers = {
    'X-BAPI-API-KEY': apiKey,
    'X-BAPI-SIGN': signature,
    'X-BAPI-TIMESTAMP': timestamp,
    'X-BAPI-RECV-WINDOW': recvWindow,
    'Content-Type': 'application/json',
  };

  const options = { method, headers, signal: AbortSignal.timeout(10000) };
  if (method === 'POST' && body) options.body = body;

  const res = await fetch(url, options);
  return res.json();
}

/**
 * Get wallet balance (Unified Trading Account).
 */
export async function getWalletBalance(apiKey, apiSecret, accountType = 'UNIFIED') {
  return makeBybitRequest('GET', '/v5/account/wallet-balance', { accountType }, apiKey, apiSecret);
}

/**
 * Get open positions.
 */
export async function getPositions(apiKey, apiSecret, category = 'linear', symbol) {
  const params = { category };
  if (category === 'linear') params.settleCoin = 'USDT';
  if (symbol) params.symbol = symbol;
  return makeBybitRequest('GET', '/v5/position/list', params, apiKey, apiSecret);
}

/**
 * Get order history.
 */
export async function getOrderHistory(apiKey, apiSecret, category = 'linear', limit = 20) {
  const params = { category, limit: String(limit) };
  if (category === 'linear') params.settleCoin = 'USDT';
  return makeBybitRequest('GET', '/v5/order/history', params, apiKey, apiSecret);
}

/**
 * Get closed positions / Realized P&L.
 */
export async function getClosedPnl(apiKey, apiSecret, category = 'linear', limit = 50) {
  const params = { category, limit: String(limit) };
  if (category === 'linear') params.settleCoin = 'USDT';
  return makeBybitRequest('GET', '/v5/position/closed-pnl', params, apiKey, apiSecret);
}

/**
 * Get market tickers (public, no auth needed but we sign anyway).
 */
export async function getMarketTickers(category = 'linear', symbol) {
  const params = { category };
  if (symbol) params.symbol = symbol;
  const url = `${BYBIT_BASE}/v5/market/tickers?${new URLSearchParams(params)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  return res.json();
}

/**
 * Get active/open orders.
 */
export async function getActiveOrders(apiKey, apiSecret, category = 'linear', symbol, limit = 50) {
  const params = { category, limit: String(limit) };
  if (category === 'linear') params.settleCoin = 'USDT';
  if (symbol) params.symbol = symbol;
  return makeBybitRequest('GET', '/v5/order/realtime', params, apiKey, apiSecret);
}

/**
 * Place a new order.
 * @param {Object} orderParams - { category, symbol, side, orderType, qty, price?, timeInForce?, takeProfit?, stopLoss? }
 */
export async function placeOrder(apiKey, apiSecret, orderParams) {
  const params = {
    category: orderParams.category || 'linear',
    symbol: orderParams.symbol,
    side: orderParams.side,         // 'Buy' | 'Sell'
    orderType: orderParams.orderType, // 'Market' | 'Limit'
    qty: String(orderParams.qty),
    timeInForce: orderParams.timeInForce || (orderParams.orderType === 'Market' ? 'IOC' : 'GTC'),
  };
  if (orderParams.price) params.price = String(orderParams.price);
  if (orderParams.takeProfit) params.takeProfit = String(orderParams.takeProfit);
  if (orderParams.stopLoss) params.stopLoss = String(orderParams.stopLoss);
  if (orderParams.leverage) params.leverage = String(orderParams.leverage);

  return makeBybitRequest('POST', '/v5/order/create', params, apiKey, apiSecret);
}

/**
 * Cancel an existing order.
 */
export async function cancelOrder(apiKey, apiSecret, category = 'linear', symbol, orderId) {
  return makeBybitRequest('POST', '/v5/order/cancel', {
    category,
    symbol,
    orderId,
  }, apiKey, apiSecret);
}
