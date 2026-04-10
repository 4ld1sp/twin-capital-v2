import { db } from './src/db/index.js';
import { tradeLogs } from './src/db/schema.js';
import { desc } from 'drizzle-orm';

async function run() {
  const logs = await db.select().from(tradeLogs).orderBy(desc(tradeLogs.createdAt)).limit(15);
  console.log('=== RECENT 15 LOGS ===');
  logs.forEach(l => {
    const time = new Date(l.createdAt).toLocaleTimeString();
    const reason = (l.aiReasoning || '').substring(0, 100).replace(/\n/g, ' ');
    console.log(`[${time}] ${l.action} ${l.symbol} (PnL: ${l.pnl}) | ${reason}`);
  });
  
  process.exit(0);
}
run();
