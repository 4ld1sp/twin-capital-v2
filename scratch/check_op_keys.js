
import { db } from '../apps/api/src/db/index.js';
import { operatorKeys } from '../apps/api/src/db/schema.js';

async function checkKeys() {
  try {
    const keys = await db.select().from(operatorKeys);
    console.log('--- Operator Keys ---');
    console.table(keys.map(k => ({
      name: k.name,
      isActive: k.isActive,
      expiresAt: k.expiresAt,
      lastUsedAt: k.lastUsedAt
    })));
    process.exit(0);
  } catch (err) {
    console.error('Error fetching keys:', err);
    process.exit(1);
  }
}

checkKeys();
