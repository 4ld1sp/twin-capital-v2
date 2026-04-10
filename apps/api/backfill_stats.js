
import { db } from './src/db/index.js';
import { tradeLogs, deployedBots } from './src/db/schema.js';
import { eq, and, gt } from 'drizzle-orm';
import * as bybit from './src/services/bybitService.js';
import { getDecryptedKey } from './src/services/apiKeyService.js';
import crypto from 'crypto';

const BOT_ID = '7bc7ad1e-7d44-407b-9637-49206332d37f';
const USER_ID = 't3H0YMHZpdAAZzcfWWL4gyCafwdXg303';

async function backfill() {
  console.log(`[Backfill] Starting sync for bot ${BOT_ID}...`);
  
  const [bot] = await db.select().from(deployedBots).where(eq(deployedBots.id, BOT_ID));
  if (!bot) {
    console.error('Bot not found');
    process.exit(1);
  }

  const keyData = await getDecryptedKey(USER_ID, 'bybit');
  if (!keyData || !keyData.isConnected) {
    console.error('Bybit key not connected');
    process.exit(1);
  }

  const res = await bybit.getClosedPnl(keyData.fields.key, keyData.fields.secret, 'linear', 50);
  if (res.retCode !== 0) {
    console.error('Bybit API Error:', res.retMsg);
    process.exit(1);
  }

  const closedList = res.result?.list || [];
  console.log(`[Backfill] Fetched ${closedList.length} closed trades from Bybit.`);

  let syncedCount = 0;
  for (const p of closedList) {
    const pnlTime = new Date(parseInt(p.updatedTime || p.createdTime));
    
    // Check if exists
    const [existing] = await db.select().from(tradeLogs).where(and(
      eq(tradeLogs.botId, BOT_ID),
      eq(tradeLogs.action, 'CLOSE'),
      eq(tradeLogs.symbol, p.symbol),
      gt(tradeLogs.createdAt, new Date(pnlTime.getTime() - 600000)) // 10 min window for safety
    )).limit(1);

    if (!existing) {
      console.log(`[Backfill] Adding missing log for ${p.symbol} at ${pnlTime.toISOString()}`);
      await db.insert(tradeLogs).values({
        id: crypto.randomUUID(),
        botId: BOT_ID,
        userId: USER_ID,
        action: 'CLOSE',
        source: 'risk_engine',
        symbol: p.symbol,
        side: p.side === 'Buy' ? 'Sell' : 'Buy',
        qty: p.qty,
        pnl: parseFloat(p.closedPnl || 0),
        orderStatus: 'filled',
        aiReasoning: 'Historical sync: Position closed via Bybit.',
        createdAt: pnlTime
      });
      syncedCount++;
    }
  }

  console.log(`[Backfill] Synced ${syncedCount} new logs. Recalculating totals...`);

  // Recalculate stats
  const executedLogs = await db.select().from(tradeLogs).where(and(
    eq(tradeLogs.botId, BOT_ID),
    eq(tradeLogs.action, 'CLOSE')
  ));

  const winCount = executedLogs.filter(l => (l.pnl ?? 0) > 0).length;
  const lossCount = executedLogs.filter(l => (l.pnl ?? 0) < 0).length;

  const openedLogs = await db.select().from(tradeLogs).where(and(
    eq(tradeLogs.botId, BOT_ID),
    eq(tradeLogs.orderStatus, 'filled')
  ));
  const totalTrades = openedLogs.filter(l => l.action === 'BUY' || l.action === 'SELL').length;

  console.log(`[Backfill] New Stats -> Win: ${winCount}, Loss: ${lossCount}, Total: ${totalTrades}`);

  await db.update(deployedBots).set({
    winCount,
    lossCount,
    totalTrades,
    updatedAt: new Date()
  }).where(eq(deployedBots.id, BOT_ID));

  console.log('[Backfill] Done!');
  process.exit(0);
}

backfill().catch(err => {
  console.error(err);
  process.exit(1);
});
