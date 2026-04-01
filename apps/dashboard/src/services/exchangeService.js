/**
 * Exchange API Service — Bybit V5 Public API + WebSocket
 * Supports testnet/mainnet toggle and extensible for other exchanges.
 */

// ─── API Base URLs ─────────────────────────────────────────────
const API_URLS = {
  bybit: {
    mainnet: 'https://api.bybit.com',
    testnet: 'https://api-testnet.bybit.com',
  },
  binance: {
    mainnet: 'https://api.binance.com',
    testnet: 'https://testnet.binance.vision',
  },
};

const WS_URLS = {
  bybit: {
    mainnet: 'wss://stream.bybit.com/v5/public/spot',
    testnet: 'wss://stream-testnet.bybit.com/v5/public/spot',
  },
  binance: {
    mainnet: 'wss://stream.binance.com:9443/ws',
    testnet: 'wss://testnet.binance.vision/ws',
  },
};

function getBaseUrl(exchange = 'bybit', mode = 'testnet') {
  return API_URLS[exchange]?.[mode] || API_URLS.bybit.testnet;
}

function getWsUrl(exchange = 'bybit', mode = 'testnet') {
  return WS_URLS[exchange]?.[mode] || WS_URLS.bybit.testnet;
}

// ─── Public REST API ───────────────────────────────────────────

/**
 * Get ticker data for a symbol
 */
export async function getTickerREST(symbol = 'BTCUSDT', exchange = 'bybit', mode = 'testnet') {
  try {
    if (exchange === 'bybit') {
      const base = getBaseUrl(exchange, mode);
      const res = await fetch(`${base}/v5/market/tickers?category=spot&symbol=${symbol}`);
      const data = await res.json();
      if (data.retCode === 0 && data.result?.list?.length > 0) {
        const t = data.result.list[0];
        return {
          symbol: t.symbol,
          lastPrice: t.lastPrice,
          highPrice24h: t.highPrice24h,
          lowPrice24h: t.lowPrice24h,
          volume24h: t.volume24h,
          turnover24h: t.turnover24h,
          price24hPcnt: t.price24hPcnt,
          bid1Price: t.bid1Price,
          ask1Price: t.ask1Price,
        };
      }
    } else if (exchange === 'binance') {
      const base = getBaseUrl(exchange, mode);
      const res = await fetch(`${base}/api/v3/ticker/24hr?symbol=${symbol}`);
      const t = await res.json();
      return {
        symbol: t.symbol,
        lastPrice: t.lastPrice,
        highPrice24h: t.highPrice,
        lowPrice24h: t.lowPrice,
        volume24h: t.volume,
        turnover24h: t.quoteVolume,
        price24hPcnt: (parseFloat(t.priceChangePercent) / 100).toFixed(4),
        bid1Price: t.bidPrice,
        ask1Price: t.askPrice,
      };
    }
    return null;
  } catch (err) {
    console.error(`[exchangeService] getTickerREST error:`, err);
    return null;
  }
}

/**
 * Get kline/candlestick data
 */
export async function getKlines(symbol = 'BTCUSDT', interval = '15', limit = 200, exchange = 'bybit', mode = 'testnet') {
  try {
    if (exchange === 'bybit') {
      const base = getBaseUrl(exchange, mode);
      const res = await fetch(`${base}/v5/market/kline?category=spot&symbol=${symbol}&interval=${interval}&limit=${limit}`);
      const data = await res.json();
      if (data.retCode === 0) {
        return data.result.list.map(k => ({
          time: parseInt(k[0]),
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
          volume: parseFloat(k[5]),
        })).reverse();
      }
    }
    return [];
  } catch (err) {
    console.error(`[exchangeService] getKlines error:`, err);
    return [];
  }
}

/**
 * Get available trading pairs
 */
export async function getSymbols(exchange = 'bybit', mode = 'testnet') {
  try {
    if (exchange === 'bybit') {
      const base = getBaseUrl(exchange, mode);
      const res = await fetch(`${base}/v5/market/instruments-info?category=spot&limit=50`);
      const data = await res.json();
      if (data.retCode === 0) {
        return data.result.list
          .filter(s => s.status === 'Trading')
          .map(s => ({
            symbol: s.symbol,
            baseCoin: s.baseCoin,
            quoteCoin: s.quoteCoin,
          }))
          .slice(0, 50);
      }
    }
    return [];
  } catch (err) {
    console.error(`[exchangeService] getSymbols error:`, err);
    return [];
  }
}

// ─── WebSocket Manager ─────────────────────────────────────────

let ws = null;
let wsHeartbeat = null;

/**
 * Subscribe to live ticker updates via WebSocket
 * Returns a cleanup function
 */
export function subscribeTickerWS(symbol = 'BTCUSDT', exchange = 'bybit', mode = 'testnet', onUpdate) {
  // Close existing connection
  if (ws) {
    try { ws.close(); } catch {}
    ws = null;
  }
  if (wsHeartbeat) {
    clearInterval(wsHeartbeat);
    wsHeartbeat = null;
  }

  const url = getWsUrl(exchange, mode);

  try {
    ws = new WebSocket(url);

    ws.onopen = () => {
      console.log(`[WS] Connected to ${exchange} ${mode}`);

      if (exchange === 'bybit') {
        ws.send(JSON.stringify({
          op: 'subscribe',
          args: [`tickers.${symbol}`],
        }));
      } else if (exchange === 'binance') {
        // Binance uses stream URL directly
        ws.send(JSON.stringify({
          method: 'SUBSCRIBE',
          params: [`${symbol.toLowerCase()}@ticker`],
          id: 1,
        }));
      }

      // Heartbeat ping every 20s
      wsHeartbeat = setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ op: 'ping' }));
        }
      }, 20000);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (exchange === 'bybit' && msg.topic && msg.data) {
          const d = msg.data;
          onUpdate({
            symbol: d.symbol,
            lastPrice: d.lastPrice,
            highPrice24h: d.highPrice24h,
            lowPrice24h: d.lowPrice24h,
            volume24h: d.volume24h,
            turnover24h: d.turnover24h,
            price24hPcnt: d.price24hPcnt,
            bid1Price: d.bid1Price,
            ask1Price: d.ask1Price,
          });
        } else if (exchange === 'binance' && msg.e === '24hrTicker') {
          onUpdate({
            symbol: msg.s,
            lastPrice: msg.c,
            highPrice24h: msg.h,
            lowPrice24h: msg.l,
            volume24h: msg.v,
            turnover24h: msg.q,
            price24hPcnt: (parseFloat(msg.P) / 100).toFixed(4),
            bid1Price: msg.b,
            ask1Price: msg.a,
          });
        }
      } catch {}
    };

    ws.onerror = (err) => {
      console.error('[WS] Error:', err);
    };

    ws.onclose = () => {
      console.log('[WS] Disconnected');
      if (wsHeartbeat) {
        clearInterval(wsHeartbeat);
        wsHeartbeat = null;
      }
    };
  } catch (err) {
    console.error('[WS] Failed to connect:', err);
  }

  return () => {
    if (ws) {
      try { ws.close(); } catch {}
      ws = null;
    }
    if (wsHeartbeat) {
      clearInterval(wsHeartbeat);
      wsHeartbeat = null;
    }
  };
}

export function unsubscribeAll() {
  if (ws) {
    try { ws.close(); } catch {}
    ws = null;
  }
  if (wsHeartbeat) {
    clearInterval(wsHeartbeat);
    wsHeartbeat = null;
  }
}

// ─── Private API via Backend Proxy ─────────────────────────────
// All private endpoints go through /api/proxy/{exchange}/* 
// which handles HMAC signing server-side. Secrets never touch the browser.

const PROXY_BASE = '/api/proxy';

/**
 * Fetch account balance via backend proxy.
 * Normalizes response to a unified format across exchanges.
 */
export async function getAccountBalance(exchange = 'bybit') {
  try {
    let url;
    if (exchange === 'bybit') url = `${PROXY_BASE}/bybit/wallet?accountType=UNIFIED`;
    else if (exchange === 'binance') url = `${PROXY_BASE}/binance/account`;
    else if (exchange === 'okx') url = `${PROXY_BASE}/okx/balance`;
    else return null;

    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(`[exchangeService] getAccountBalance error:`, err);
      return { data: null, error: err.error || res.statusText };
    }
    const data = await res.json();

    // Normalize Bybit response
    if (exchange === 'bybit') {
      if (data.retCode !== 0) {
        console.error('[exchangeService] Bybit wallet error:', data.retMsg);
        return { data: null, error: `Bybit: ${data.retMsg} (code: ${data.retCode})` };
      }
      const account = data.result?.list?.[0];
      if (!account) return { data: null, error: 'Empty account data received' };

      const totalEquity = parseFloat(account.totalEquity || 0);
      const totalWalletBalance = parseFloat(account.totalWalletBalance || 0);
      const totalAvailableBalance = parseFloat(account.totalAvailableBalance || 0);
      const totalMarginBalance = parseFloat(account.totalMarginBalance || 0);
      const unrealizedPnL = parseFloat(account.totalPerpUPL || 0);
      const usedMargin = totalMarginBalance - totalAvailableBalance;

      return {
        data: {
          totalEquity: totalEquity.toFixed(2),
          availableBalance: totalAvailableBalance.toFixed(2),
          usedMargin: usedMargin.toFixed(2),
          unrealizedPnL: unrealizedPnL.toFixed(2),
          marginRatio: totalEquity > 0 ? ((usedMargin / totalEquity) * 100).toFixed(1) : '0.0',
          assets: (account.coin || []).map(c => ({
            coin: c.coin,
            balance: parseFloat(c.walletBalance || 0).toFixed(4),
            equity: parseFloat(c.equity || 0).toFixed(4),
            available: parseFloat(c.availableToWithdraw || 0).toFixed(4),
            unrealizedPnL: parseFloat(c.unrealisedPnl || 0).toFixed(4),
            cumRealisedPnl: parseFloat(c.cumRealisedPnl || 0).toFixed(4)
          })).filter(a => parseFloat(a.balance) > 0),
        },
        error: null
      };
    }

    return { data, error: null };
  } catch (err) {
    console.error(`[exchangeService] getAccountBalance error:`, err);
    return { data: null, error: err.message };
  }
}

/**
 * Fetch open positions via backend proxy.
 */
export async function getPositions(exchange = 'bybit') {
  try {
    let url;
    if (exchange === 'bybit') url = `${PROXY_BASE}/bybit/positions?category=linear`;
    else if (exchange === 'okx') url = `${PROXY_BASE}/okx/positions?instType=SWAP`;
    else return { list: [] };

    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { list: [], error: err.error || res.statusText };
    }
    const data = await res.json();

    if (exchange === 'bybit') {
      if (data.retCode !== 0) return { list: [], error: `Bybit: ${data.retMsg}` };
      return {
        list: (data.result?.list || []).map(p => ({
          id: p.positionIdx + '_' + p.symbol,
          symbol: p.symbol,
          side: p.side === 'Buy' ? 'Long' : 'Short',
          size: p.size,
          entryPrice: p.avgPrice || p.entryPrice,
          leverage: p.leverage,
          tp: p.takeProfit || '0',
          sl: p.stopLoss || '0',
          trailingStop: parseFloat(p.trailingStop || 0) > 0,
          unrealizedPnl: p.unrealisedPnl,
          markPrice: p.markPrice,
          liqPrice: p.liqPrice,
          createdTime: p.createdTime,
        })).filter(p => parseFloat(p.size) > 0),
      };
    }
    return { list: data.list || [], error: null };
  } catch (err) {
    console.error(`[exchangeService] getPositions error:`, err);
    return { list: [], error: err.message };
  }
}

/**
 * Fetch active/open orders via backend proxy.
 */
export async function getActiveOrders(exchange = 'bybit') {
  try {
    let url;
    if (exchange === 'bybit') url = `${PROXY_BASE}/bybit/active-orders?category=linear`;
    else if (exchange === 'binance') url = `${PROXY_BASE}/binance/orders`;
    else if (exchange === 'okx') url = `${PROXY_BASE}/okx/orders?instType=SWAP`;
    else return { list: [] };

    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { list: [], error: err.error || res.statusText };
    }
    const data = await res.json();

    if (exchange === 'bybit') {
      if (data.retCode !== 0) return { list: [], error: `Bybit: ${data.retMsg}` };
      return {
        list: (data.result?.list || []).map(o => ({
          id: o.orderId,
          symbol: o.symbol,
          type: o.orderType,
          side: o.side,
          price: o.price,
          qty: o.qty,
          status: o.orderStatus,
          created: parseInt(o.createdTime),
        })),
      };
    }
    return { list: data.list || [], error: null };
  } catch (err) {
    console.error(`[exchangeService] getActiveOrders error:`, err);
    return { list: [], error: err.message };
  }
}

/**
 * Fetch order history (filled/cancelled) via backend proxy.
 */
export async function getOrderHistory(exchange = 'bybit', limit = 50) {
  try {
    let url;
    if (exchange === 'bybit') url = `${PROXY_BASE}/bybit/orders?category=linear&limit=${limit}`;
    else if (exchange === 'binance') url = `${PROXY_BASE}/binance/trades`;
    else return { list: [] };

    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { list: [], error: err.error || res.statusText };
    }
    const data = await res.json();

    if (exchange === 'bybit') {
      if (data.retCode !== 0) return { list: [], error: `Bybit: ${data.retMsg}` };
      return {
        list: (data.result?.list || []).map(o => ({
          id: o.orderId,
          symbol: o.symbol,
          type: o.orderType,
          side: o.side,
          price: o.avgPrice || o.price,
          qty: o.qty,
          status: o.orderStatus,
          created: parseInt(o.createdTime),
          updated: parseInt(o.updatedTime),
          cumExecQty: o.cumExecQty,
          cumExecValue: o.cumExecValue,
        })),
      };
    }
    return { list: data.list || [], error: null };
  } catch (err) {
    console.error(`[exchangeService] getOrderHistory error:`, err);
    return { list: [], error: err.message };
  }
}

/**
 * Fetch closed P&L history via backend proxy.
 */
export async function getClosedPnl(exchange = 'bybit', limit = 50) {
  try {
    let url;
    if (exchange === 'bybit') url = `${PROXY_BASE}/bybit/closed-pnl?category=linear&limit=${limit}`;
    else return { list: [] };

    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { list: [], error: err.error || res.statusText };
    }
    const data = await res.json();

    if (exchange === 'bybit') {
      if (data.retCode !== 0) return { list: [], error: `Bybit: ${data.retMsg}` };
      return {
        list: (data.result?.list || []).map(p => ({
          id: p.orderId,
          symbol: p.symbol,
          orderType: p.orderType,
          side: p.side === 'Buy' ? 'Short' : 'Long', // If closing, opposite of entry. Bybit usually gives side of the closing order. (Or we can just show p.side)
          qty: p.qty,
          entryPrice: p.avgEntryPrice,
          exitPrice: p.avgExitPrice,
          closedPnl: p.closedPnl,
          createdTime: parseInt(p.createdTime),
          updatedTime: parseInt(p.updatedTime),
        })),
      };
    }
    return { list: data.list || [], error: null };
  } catch (err) {
    console.error(`[exchangeService] getClosedPnl error:`, err);
    return { list: [], error: err.message };
  }
}

/**
 * Place a new order via backend proxy.
 * Returns { success, orderId, message }
 */
export async function placeOrder(params, exchange = 'bybit') {
  try {
    let url;
    let body;

    if (exchange === 'bybit') {
      url = `${PROXY_BASE}/bybit/order`;
      body = {
        category: 'linear',
        symbol: params.symbol,
        side: params.side === 'buy' ? 'Buy' : 'Sell',
        orderType: params.type === 'market' ? 'Market' : 'Limit',
        qty: params.qty,
        price: params.price,
        takeProfit: params.tp,
        stopLoss: params.sl,
      };
    } else {
      return { success: false, message: `${exchange} order placement not yet supported` };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (exchange === 'bybit') {
      if (data.retCode === 0) {
        return { success: true, orderId: data.result?.orderId, message: 'Order placed successfully' };
      }
      return { success: false, message: data.retMsg || 'Unknown error' };
    }
    return data;
  } catch (err) {
    console.error(`[exchangeService] placeOrder error:`, err);
    return { success: false, message: err.message };
  }
}

/**
 * Cancel an existing order via backend proxy.
 */
export async function cancelOrder(exchange = 'bybit', params = {}) {
  try {
    let url;
    let body;

    if (exchange === 'bybit') {
      url = `${PROXY_BASE}/bybit/cancel`;
      body = {
        category: params.category || 'linear',
        symbol: params.symbol,
        orderId: params.orderId,
      };
    } else {
      return { success: false, message: `${exchange} cancel not yet supported` };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (exchange === 'bybit') {
      if (data.retCode === 0) {
        return { success: true, message: 'Order cancelled' };
      }
      return { success: false, message: data.retMsg || 'Cancel failed' };
    }
    return data;
  } catch (err) {
    console.error(`[exchangeService] cancelOrder error:`, err);
    return { success: false, message: err.message };
  }
}
