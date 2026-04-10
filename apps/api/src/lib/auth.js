import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { twoFactor } from 'better-auth/plugins';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true if we want to block login until verified
  },
  emailVerification: {
    autoSend: true,
    sendVerificationEmail: async ({ user, url }) => {
      console.log(`\n--- [SECURITY] EMAIL VERIFICATION ---`);
      console.log(`Target: ${user.email} (${user.name})`);
      console.log(`Link:   ${url}`);
      console.log(`------------------------------------\n`);
    },
  },
  plugins: [
    twoFactor({
      issuer: 'Twin Capital',
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // refresh every 24h
  },
  trustedOrigins: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://192.168.1.11:5173',
    'https://smart-lite-alike-hearings.trycloudflare.com',
    'https://teddy-mill-telecommunications-titles.trycloudflare.com',
  ],
});
