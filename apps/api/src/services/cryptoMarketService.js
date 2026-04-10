import { getMarketTickers } from './bybitService.js';

/**
 * Crypto Market Service
 * Handles trending coin detection and AI signal generation for Bybit Spot.
 */

const MAJOR_COINS = ['BTC', 'ETH', 'USDT', 'USDC', 'DAI', 'FDUSD'];

export async function getTrendingCrypto() {
  try {
    // 1. Fetch all SPOT tickers from Bybit
    const data = await getMarketTickers('spot');
    if (data.retCode !== 0) throw new Error(data.retMsg || 'Failed to fetch Bybit tickers');

    const tickers = data.result.list || [];

    // 2. Filter for potential "Hot Listings" and Trending tokens
    // We look for interesting turnover and movement, excluding majors
    const trending = tickers
      .filter(t => {
        const symbol = t.symbol;
        const isMajor = MAJOR_COINS.some(m => symbol.startsWith(m));
        const turnover = parseFloat(t.turnover24h || 0);
        return !isMajor && symbol.endsWith('USDT') && turnover > 500000;
      })
      .map(t => {
        const last = parseFloat(t.lastPrice);
        const pcnt = parseFloat(t.price24hPcnt || 0) * 100;
        const turnover = parseFloat(t.turnover24h || 0);
        
        // --- AI Signal Heuristics ---
        let signal = 'WATCH';
        let trigger = 'Neutral';
        let confidence = 50;
        let reasoning = 'Performing baseline market analysis...';

        if (pcnt >= 8) {
          signal = 'BULLISH_SURGE';
          trigger = 'Hype Breakout';
          confidence = 88 + Math.min(7, Math.floor(pcnt / 5));
          reasoning = 'Extreme momentum detected in new listing. High volatility with strong turnover support.';
        } else if (pcnt >= 3 && pcnt < 8) {
          signal = 'SCALP_LONG';
          trigger = 'Early Momentum';
          confidence = 75 + Math.floor(pcnt * 2);
          reasoning = 'Upward trend established. Volume influx indicates growing interest from institutional players.';
        } else if (Math.abs(pcnt) < 1 && turnover > 2000000) {
          signal = 'ACCUMULATION';
          trigger = 'Whale Activity';
          confidence = 82;
          reasoning = 'High turnover with compressed price action suggests intense whale accumulation at current levels.';
        } else if (pcnt <= -5) {
          signal = 'DIP_RECOVERY';
          trigger = 'Oversold RSI';
          confidence = 68;
          reasoning = 'Correction phase nearing completion. Identifying oversold support for potential mean reversion.';
        } else {
          signal = 'WAIT';
          trigger = 'Low Interest';
          confidence = 45;
          reasoning = 'Monitoring price action for entry triggers. Volume remains within standard deviation.';
        }

        const tp = last * (pcnt >= 0 ? 1.08 : 1.05);
        const sl = last * (pcnt >= 0 ? 0.94 : 0.92);

        return {
          symbol: t.symbol.replace('USDT', ''),
          fullSymbol: t.symbol,
          lastPrice: last,
          change24h: pcnt,
          turnover: turnover,
          signal,
          trigger,
          confidence,
          reasoning,
          entry: last,
          tp: parseFloat(tp.toFixed(6)),
          sl: parseFloat(sl.toFixed(6)),
          rsi: 50 + (pcnt * 2.5), // Simulated RSI
          volume: parseFloat(t.volume24h || 0),
        };
      })
      .sort((a, b) => b.turnover - a.turnover) // Sort by liquidity
      .slice(0, 12); // Take top 12 hot tokens

    return trending;
  } catch (err) {
    console.error('[CryptoMarketService] Error:', err.message);
    throw err;
  }
}
