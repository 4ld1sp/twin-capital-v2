import 'dotenv/config';
import { db } from './src/db/index.js';
import { tradeLogs } from './src/db/schema.js';
import { desc, eq, or } from 'drizzle-orm';

const summary = await db.select({
  action: tradeLogs.action,
  symbol: tradeLogs.symbol,
  side: tradeLogs.side,
  pnl: tradeLogs.pnl,
  price: tradeLogs.price,
  qty: tradeLogs.qty,
  reasoning: tradeLogs.aiReasoning,
  createdAt: tradeLogs.createdAt,
}).from(tradeLogs)
  .where(or(eq(tradeLogs.action, 'BUY'), eq(tradeLogs.action, 'SELL'), eq(tradeLogs.action, 'CLOSE')))
  .orderBy(desc(tradeLogs.createdAt))
  .limit(80);

const closes = summary.filter(s => s.action === 'CLOSE');
const wins = closes.filter(c => c.pnl > 0);
const losses = closes.filter(c => c.pnl < 0);

console.log('=== TRADE SUMMARY ===');
console.log('Total CLOSE:', closes.length);
console.log('Wins:', wins.length, '| Total profit: $' + wins.reduce((s, c) => s + c.pnl, 0).toFixed(4));
console.log('Losses:', losses.length, '| Total loss: $' + losses.reduce((s, c) => s + c.pnl, 0).toFixed(4));
console.log('Net PnL: $' + closes.reduce((s, c) => s + (c.pnl || 0), 0).toFixed(4));
console.log('Win Rate:', ((wins.length / (wins.length + losses.length)) * 100).toFixed(1) + '%');

console.log('\n=== LOSS BREAKDOWN ===');
losses.forEach(l => {
  console.log('  ' + l.symbol + ' | PnL: $' + l.pnl.toFixed(4) + ' | ' + (l.reasoning || '').substring(0, 80) + ' | ' + l.createdAt);
});

console.log('\n=== WIN BREAKDOWN ===');
wins.forEach(w => {
  console.log('  ' + w.symbol + ' | PnL: +$' + w.pnl.toFixed(4) + ' | ' + w.createdAt);
});

console.log('\n=== RECENT ENTRIES (last 15) ===');
const opens = summary.filter(s => s.action === 'BUY' || s.action === 'SELL');
opens.slice(0, 15).forEach(o => {
  console.log('  ' + o.action + ' ' + o.symbol + ' qty=' + o.qty + ' price=$' + o.price + ' | ' + o.createdAt);
});

// Check for duplicate CLOSE logs  
console.log('\n=== DUPLICATE CHECK ===');
const closeMap = {};
closes.forEach(c => {
  const key = c.symbol + '|' + c.pnl + '|' + c.createdAt;
  closeMap[key] = (closeMap[key] || 0) + 1;
});
const dupes = Object.entries(closeMap).filter(([, count]) => count > 1);
if (dupes.length > 0) {
  console.log('DUPLICATES FOUND:');
  dupes.forEach(([key, count]) => console.log('  ' + count + 'x: ' + key));
} else {
  console.log('No duplicate CLOSE logs found.');
}

// SL hit analysis
console.log('\n=== SL HIT ANALYSIS ===');
const slHits = losses.filter(l => l.reasoning && l.reasoning.includes('StopLoss'));
console.log('Losses from native SL/TP:', slHits.length + '/' + losses.length);

process.exit(0);
