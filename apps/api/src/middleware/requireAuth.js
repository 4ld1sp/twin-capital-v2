import { auth } from '../lib/auth.js';
import { fromNodeHeaders } from 'better-auth/node';

/**
 * Express middleware that guards routes behind a valid Better Auth session.
 * Attaches `req.user` and `req.session` on success.
 */
export async function requireAuth(req, res, next) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized — no valid session' });
    }

    req.user = session.user;
    req.session = session.session;
    next();
  } catch (err) {
    console.error('[requireAuth] Session check failed:', err.message);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
