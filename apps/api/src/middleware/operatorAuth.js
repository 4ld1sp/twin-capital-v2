import crypto from 'crypto';
import { auth } from '../lib/auth.js';
import { fromNodeHeaders } from 'better-auth/node';
import { db } from '../db/index.js';
import { operatorKeys, user } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

/**
 * ═══════════════════════════════════════════════════════════════
 * Hybrid Auth Middleware — Session Cookie OR Bearer Token
 * ═══════════════════════════════════════════════════════════════
 *
 * Priority:
 * 1. If `Authorization: Bearer tc_op_xxx` header → validate operator key
 * 2. If session cookie present → validate via Better Auth (existing flow)
 * 3. Neither → 401 Unauthorized
 *
 * On success, attaches `req.user` and optionally `req.operatorKey`.
 */
export async function operatorAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // ─── Path 1: Bearer Token (Operator Key) ───
    if (authHeader && authHeader.startsWith('Bearer tc_op_')) {
      const rawKey = authHeader.replace('Bearer ', '');
      const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

      // Lookup key in DB
      const [opKey] = await db.select().from(operatorKeys)
        .where(
          and(
            eq(operatorKeys.keyHash, keyHash),
            eq(operatorKeys.isActive, true)
          )
        );

      if (!opKey) {
        return res.status(401).json({ error: 'Invalid or revoked operator key' });
      }

      // Check expiration
      if (opKey.expiresAt && new Date(opKey.expiresAt) < new Date()) {
        return res.status(401).json({ error: 'Operator key has expired' });
      }

      // Fetch linked user
      const [linkedUser] = await db.select().from(user)
        .where(eq(user.id, opKey.userId));

      if (!linkedUser) {
        return res.status(401).json({ error: 'Operator key linked to non-existent user' });
      }

      // Update last used timestamp (fire-and-forget)
      db.update(operatorKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(operatorKeys.id, opKey.id))
        .catch(() => {}); // Non-blocking

      // Inject user context
      req.user = linkedUser;
      req.operatorKey = {
        id: opKey.id,
        name: opKey.name,
        permissions: opKey.permissions || ['*'],
      };

      console.log(`[OperatorAuth] ✓ Key "${opKey.name}" authenticated as ${linkedUser.email}`);
      return next();
    }

    // ─── Path 2: Session Cookie (Better Auth — existing flow) ───
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized — no valid session or operator key' });
    }

    req.user = session.user;
    req.session = session.session;
    return next();

  } catch (err) {
    console.error('[OperatorAuth] Auth check failed:', err.message);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
