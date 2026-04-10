import { db } from './src/db/index.js';
import { tradeLogs, deployedBots } from './src/db/schema.js';
import { eq, asc } from 'drizzle-orm';

async function run() {
  const botId = '3745c170-235c-4abd-a411-6f63bc9a5ca4';
  const bots = await db.select().from(deployedBots).where(eq(deployedBots.id, botId)).limit(1);
  
  if (bots.length === 0) {
    console.log(`Bot ${botId} not found`);
    process.exit(1);
  }
  
  console.log('Bot Created At (DB/UTC):', bots[0].createdAt);
  console.log('Bot Status:', bots[0].status);
  
  const logs = await db.select().from(tradeLogs).where(eq(tradeLogs.botId, botId)).orderBy(asc(tradeLogs.createdAt));
  console.log(`\nTotal logs: ${logs.length}`);
  
  if (logs.length > 0) {
    console.log('First 5 logs:');
    logs.slice(0, 5).forEach(l => console.log('  ', l.createdAt, l.action, l.symbol));
    console.log('...\nLast 5 logs:');
    logs.slice(-5).forEach(l => console.log('  ', l.createdAt, l.action, l.symbol));
  }
  
  process.exit(0);
}

run();
