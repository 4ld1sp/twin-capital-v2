/**
 * Plan enforcement middleware factory.
 * Usage: router.post('/deploy', requirePlan('bots'), handler)
 */

const PLAN_LIMITS = {
  free: {
    maxBots: 1,
    maxSocialAccounts: 2,
    maxTradesPerDay: 10,
    maxAiCallsPerDay: 50,
    mainnetAllowed: false,
  },
  pro: {
    maxBots: 5,
    maxSocialAccounts: 8,
    maxTradesPerDay: 999999,
    maxAiCallsPerDay: 500,
    mainnetAllowed: true,
  },
  enterprise: {
    maxBots: 999999,
    maxSocialAccounts: 999999,
    maxTradesPerDay: 999999,
    maxAiCallsPerDay: 999999,
    mainnetAllowed: true,
  },
};

export function requirePlan(feature) {
  return (req, res, next) => {
    if (!req.org) {
      return res.status(500).json({ error: 'Organization context not loaded' });
    }

    const plan = req.org.plan || 'free';
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

    // Check specific feature constraints
    if (feature === 'mainnet' && !limits.mainnetAllowed) {
      return res.status(403).json({
        error: 'Mainnet trading requires Pro plan or higher',
        currentPlan: plan,
        requiredPlan: 'pro',
      });
    }

    // Attach limits to request for downstream use
    req.planLimits = limits;
    next();
  };
}

export { PLAN_LIMITS };
