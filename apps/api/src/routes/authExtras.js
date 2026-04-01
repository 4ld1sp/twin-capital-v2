import express from 'express';
import { db } from '../db/index.js';
import { user } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = express.Router();

/**
 * Check if a username (name) or email is already taken.
 * GET /api/auth/check-availability?type=name|email&value=...
 */
router.get('/check-availability', async (req, res) => {
  const { type, value } = req.query;

  if (!type || !value) {
    return res.status(400).json({ error: 'Missing type or value' });
  }

  try {
    let exists = false;
    if (type === 'email') {
      const result = await db.select().from(user).where(eq(user.email, value.toLowerCase())).limit(1);
      exists = result.length > 0;
    } else if (type === 'name') {
      const result = await db.select().from(user).where(eq(user.name, value)).limit(1);
      exists = result.length > 0;
    } else {
      return res.status(400).json({ error: 'Invalid type. Use "name" or "email".' });
    }

    return res.json({ available: !exists, type, value });
  } catch (err) {
    console.error('Availability check error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Confirm 2FA is verified and set the flag on the user record.
 * POST /api/auth-extras/confirm-2fa
 * Body: { userId }
 */
router.post('/confirm-2fa', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }
  try {
    await db.update(user).set({ twoFactorEnabled: true }).where(eq(user.id, userId));
    console.log(`[2FA] Confirmed for user ${userId} - two_factor_enabled = true`);
    return res.json({ success: true });
  } catch (err) {
    console.error('Confirm 2FA error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Disable 2FA for a user (requires OTP verification first on frontend).
 * POST /api/auth-extras/disable-2fa
 * Body: { userId }
 */
router.post('/disable-2fa', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }
  try {
    await db.update(user).set({ twoFactorEnabled: false }).where(eq(user.id, userId));
    console.log(`[2FA] Disabled for user ${userId} - two_factor_enabled = false`);
    return res.json({ success: true });
  } catch (err) {
    console.error('Disable 2FA error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
