import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { orgContext } from '../middleware/orgContext.js';
import { getPlans, createCheckout, handleWebhook, getSubscriptionStatus, cancelSubscription } from '../services/billingService.js';

const router = Router();

// GET /api/billing/plans — Available plans (public)
router.get('/plans', (req, res) => {
  res.json({ plans: getPlans() });
});

// POST /api/billing/webhook — Midtrans notification (NO AUTH — verified by Midtrans signature)
router.post('/webhook', async (req, res) => {
  try {
    // TODO: Verify Midtrans server key signature in production
    const result = await handleWebhook(req.body);
    res.json(result);
  } catch (err) {
    console.error('[billing webhook] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- All routes below require auth + org context ---
router.use(requireAuth);
router.use(orgContext);

// GET /api/billing/status — Current subscription + usage
router.get('/status', async (req, res) => {
  try {
    const status = await getSubscriptionStatus(req.org.id);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/billing/checkout — Create payment for plan upgrade
router.post('/checkout', async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan. Choose pro or enterprise.' });
    }

    if (req.org.plan === plan) {
      return res.status(400).json({ error: `Already on ${plan} plan` });
    }

    const checkout = await createCheckout(
      req.org.id,
      plan,
      req.user.email,
      req.user.name,
    );

    res.json(checkout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/billing/cancel — Cancel subscription
router.post('/cancel', async (req, res) => {
  try {
    if (req.org.role !== 'owner') {
      return res.status(403).json({ error: 'Only org owner can cancel subscription' });
    }

    const result = await cancelSubscription(req.org.id);
    if (result.error) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/billing/history — Payment history
router.get('/history', async (req, res) => {
  try {
    const status = await getSubscriptionStatus(req.org.id);
    res.json({ payments: status?.payments || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
