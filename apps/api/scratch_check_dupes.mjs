import { db } from './src/db/index.js';
import { tradeLogs } from './src/db/schema.js';
import { desc, gt } from 'drizzle-orm';

async function run() {
  const timestampThreshold = new Date(Date.now() - 3600000); // 1 hour ago
  const logs = await db.select().from(tradeLogs).where(gt(tradeLogs.createdAt, timestampThreshold)).orderBy(desc(tradeLogs.createdAt));
  
  if (logs.length === 0) {
    console.log("No logs in the last hour.");
    process.exit(0);
  }
  
  // Group by action and symbol
  const counts = {};
  logs.forEach(l => {
    const key = `${l.action} ${l.symbol} ${new Date(l.createdAt).toLocaleTimeString()}`;
    counts[key] = (counts[key] || 0) + 1;
  });
  
  console.log('=== DUPLICATE TEST (Last 1 Hour) ===');
  Object.entries(counts).forEach(([k, v]) => {
    if (v > 1) {
      console.log(`⚠️ DUPLICATE FOUND: ${v}x ${k}`);
    }
  });
  
  console.log(`\nChecked ${logs.length} logs. Zero duplicates: ${Object.values(counts).every(v => v === 1)}`);
  
  // Show Trailing Stop logic
  const tStops = logs.filter(l => l.action === 'TRAILING_STOP');
  console.log(`\nTrailing Stops in last hour: ${tStops.length}`);
  if (tStops.length) console.log(typeof tStops[0].aiReasoning, tStops[0].aiReasoning);
  
  process.exit(0);
}
run();
