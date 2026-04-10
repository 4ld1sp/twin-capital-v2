import { db } from '../db/index.js';
import { organizations, orgMembers } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * Middleware that resolves the user's organization and attaches it to req.org.
 * Auto-creates a personal org if the user doesn't have one yet (lazy migration).
 */
export async function orgContext(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Find user's org membership
    const memberships = await db.select({
      memberId: orgMembers.id,
      role: orgMembers.role,
      orgId: organizations.id,
      orgName: organizations.name,
      orgSlug: organizations.slug,
      orgPlan: organizations.plan,
      orgStatus: organizations.status,
      maxBots: organizations.maxBots,
      maxSocialAccounts: organizations.maxSocialAccounts,
      maxTradesPerDay: organizations.maxTradesPerDay,
      features: organizations.features,
    })
    .from(orgMembers)
    .innerJoin(organizations, eq(orgMembers.orgId, organizations.id))
    .where(eq(orgMembers.userId, userId))
    .limit(1);

    if (memberships.length > 0) {
      const m = memberships[0];
      req.org = {
        id: m.orgId,
        name: m.orgName,
        slug: m.orgSlug,
        plan: m.orgPlan,
        status: m.orgStatus,
        role: m.role,
        limits: {
          maxBots: m.maxBots,
          maxSocialAccounts: m.maxSocialAccounts,
          maxTradesPerDay: m.maxTradesPerDay,
        },
        features: m.features || {},
      };
      return next();
    }

    // Auto-create personal org for existing users (lazy migration)
    const orgId = `org_${crypto.randomBytes(12).toString('hex')}`;
    const memberId = `mem_${crypto.randomBytes(12).toString('hex')}`;
    const userName = req.user.name || req.user.email?.split('@')[0] || 'User';
    const slug = userName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30);

    await db.insert(organizations).values({
      id: orgId,
      name: `${userName}'s Workspace`,
      slug: `${slug}-${orgId.slice(-6)}`,
      ownerId: userId,
      plan: 'free',
      status: 'active',
    });

    await db.insert(orgMembers).values({
      id: memberId,
      orgId,
      userId,
      role: 'owner',
    });

    req.org = {
      id: orgId,
      name: `${userName}'s Workspace`,
      slug: `${slug}-${orgId.slice(-6)}`,
      plan: 'free',
      status: 'active',
      role: 'owner',
      limits: { maxBots: 1, maxSocialAccounts: 2, maxTradesPerDay: 10 },
      features: {},
    };

    next();
  } catch (err) {
    console.error('[orgContext] Error:', err.message);
    return res.status(500).json({ error: 'Failed to resolve organization' });
  }
}
