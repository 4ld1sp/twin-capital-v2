import 'dotenv/config';
import { db } from './src/db/index.js';
import { user } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function test() {
  try {
    console.log("Checking availability for 'fix@test.com'...");
    const result = await db.select().from(user).where(eq(user.email, 'fix@test.com'.toLowerCase())).limit(1);
    console.log("Result:", result);
  } catch (err) {
    console.error("Error caught:", err);
  }
}

test();
