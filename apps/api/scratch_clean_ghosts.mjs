import { db } from './src/db/index.js';
import { tradeLogs, deployedBots } from './src/db/schema.js';
import { eq, sql } from 'drizzle-orm';

async function cleanup() {
  console.log("Cleaning up ghost logs from new bot ingestion bug...");
  
  // Drizzle equivalent of: DELETE FROM tradeLogs t USING deployedBots b WHERE t.botId = b.id AND t.createdAt < b.createdAt;
  const result = await db.execute(sql`
    DELETE FROM "trade_logs" 
    WHERE id IN (
      SELECT t.id 
      FROM "trade_logs" t 
      JOIN "deployed_bots" b ON t.bot_id = b.id 
      WHERE t.created_at < b.created_at
    )
  `);
  
  console.log(`Cleanup complete. Deleted old ghost logs.`);
  process.exit(0);
}

cleanup();
