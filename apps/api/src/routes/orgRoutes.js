import { Router } from 'express';
import { db } from '../db/index.js';
import { organizations, orgMembers, user } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

// GET /api/org — Get current user's organization
router.get('/', async (req, res) => {
  try {
    res.json({ org: req.org });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/org — Update organization name/slug
router.patch('/', async (req, res) => {
  try {
    if (req.org.role !== 'owner' && req.org.role !== 'admin') {
      return res.status(403).json({ error: 'Only owner or admin can update org' });
    }

    const { name, slug } = req.body;
    const updates = { updatedAt: new Date() };
    if (name) updates.name = name;
    if (slug) updates.slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');

    await db.update(organizations).set(updates).where(eq(organizations.id, req.org.id));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/org/members — List organization members
router.get('/members', async (req, res) => {
  try {
    const members = await db.select({
      id: orgMembers.id,
      role: orgMembers.role,
      joinedAt: orgMembers.joinedAt,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userImage: user.image,
    })
    .from(orgMembers)
    .innerJoin(user, eq(orgMembers.userId, user.id))
    .where(eq(orgMembers.orgId, req.org.id));

    res.json({ members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/org/members — Invite member by email
router.post('/members', async (req, res) => {
  try {
    if (req.org.role !== 'owner' && req.org.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { email, role = 'member' } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    // Find user by email
    const [targetUser] = await db.select().from(user).where(eq(user.email, email)).limit(1);
    if (!targetUser) return res.status(404).json({ error: 'User not found. They must register first.' });

    // Check if already a member
    const [existing] = await db.select().from(orgMembers)
      .where(and(eq(orgMembers.orgId, req.org.id), eq(orgMembers.userId, targetUser.id)))
      .limit(1);
    if (existing) return res.status(409).json({ error: 'User is already a member' });

    const memberId = `mem_${crypto.randomBytes(12).toString('hex')}`;
    await db.insert(orgMembers).values({
      id: memberId,
      orgId: req.org.id,
      userId: targetUser.id,
      role: ['owner', 'admin', 'member', 'viewer'].includes(role) ? role : 'member',
    });

    res.json({ ok: true, memberId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/org/members/:id — Change member role
router.patch('/members/:id', async (req, res) => {
  try {
    if (req.org.role !== 'owner') {
      return res.status(403).json({ error: 'Only owner can change roles' });
    }

    const { role } = req.body;
    if (!['admin', 'member', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await db.update(orgMembers)
      .set({ role })
      .where(and(eq(orgMembers.id, req.params.id), eq(orgMembers.orgId, req.org.id)));

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/org/members/:id — Remove member
router.delete('/members/:id', async (req, res) => {
  try {
    if (req.org.role !== 'owner' && req.org.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Prevent removing owner
    const [member] = await db.select().from(orgMembers)
      .where(and(eq(orgMembers.id, req.params.id), eq(orgMembers.orgId, req.org.id)))
      .limit(1);

    if (!member) return res.status(404).json({ error: 'Member not found' });
    if (member.role === 'owner') return res.status(403).json({ error: 'Cannot remove owner' });

    await db.delete(orgMembers)
      .where(and(eq(orgMembers.id, req.params.id), eq(orgMembers.orgId, req.org.id)));

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
