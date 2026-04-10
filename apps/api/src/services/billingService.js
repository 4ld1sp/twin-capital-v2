import { db } from '../db/index.js';
import { organizations, subscriptions, payments } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'crypto';

// Plan pricing in IDR
const PLAN_PRICING = {
  pro: {
    name: 'Pro',
    priceIDR: 1_500_000,    // Rp 1.500.000/month (~$99)
    priceUSD: 99,
    features: ['5 bots (mainnet)', '8 social platforms', 'Unlimited trades', '500 AI calls/day', 'Email support'],
    limits: { maxBots: 5, maxSocialAccounts: 8, maxTradesPerDay: 999999 },
  },
  enterprise: {
    name: 'Enterprise',
    priceIDR: 5_250_000,    // Rp 5.250.000/month (~$349)
    priceUSD: 349,
    features: ['Unlimited bots', 'Unlimited platforms', 'Unlimited everything', 'White-label', 'Priority support + SLA'],
    limits: { maxBots: 999999, maxSocialAccounts: 999999, maxTradesPerDay: 999999 },
  },
};

/**
 * Get available plans with pricing
 */
export function getPlans() {
  return {
    free: {
      name: 'Free',
      priceIDR: 0,
      priceUSD: 0,
      features: ['1 bot (testnet only)', '2 social platforms', '10 trades/day', '50 AI calls/day', 'Community support'],
      limits: { maxBots: 1, maxSocialAccounts: 2, maxTradesPerDay: 10 },
    },
    ...PLAN_PRICING,
  };
}

/**
 * Create a Midtrans Snap transaction for subscription upgrade.
 * Returns a snap token/redirect URL for the client to open payment popup.
 */
export async function createCheckout(orgId, targetPlan, userEmail, userName) {
  const planInfo = PLAN_PRICING[targetPlan];
  if (!planInfo) throw new Error(`Invalid plan: ${targetPlan}`);

  const orderId = `sub_${crypto.randomBytes(12).toString('hex')}`;
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  // Create pending subscription
  const subId = `sub_${crypto.randomBytes(12).toString('hex')}`;
  await db.insert(subscriptions).values({
    id: subId,
    orgId,
    plan: targetPlan,
    status: 'pending',
    midtransOrderId: orderId,
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
  });

  // Create pending payment record
  const payId = `pay_${crypto.randomBytes(12).toString('hex')}`;
  await db.insert(payments).values({
    id: payId,
    orgId,
    subscriptionId: subId,
    midtransTransactionId: orderId,
    amount: planInfo.priceIDR,
    currency: 'IDR',
    status: 'pending',
  });

  // Build Midtrans Snap payload
  // In production: use midtrans-client SDK to create snap token
  // For now, return the order details for frontend to process
  return {
    orderId,
    subscriptionId: subId,
    paymentId: payId,
    plan: targetPlan,
    amount: planInfo.priceIDR,
    currency: 'IDR',
    customerEmail: userEmail,
    customerName: userName,
    itemName: `Twin Capital ${planInfo.name} - Monthly`,
    // TODO: Replace with actual Midtrans Snap token when SDK is integrated
    // snapToken: await snap.createTransaction(transactionDetails),
    snapRedirectUrl: null,
  };
}

/**
 * Handle Midtrans webhook notification.
 * Called by POST /api/billing/webhook (no auth required, verified by signature).
 */
export async function handleWebhook(notification) {
  const { order_id, transaction_status, payment_type, gross_amount } = notification;

  // Find the payment by order ID
  const [payment] = await db.select()
    .from(payments)
    .where(eq(payments.midtransTransactionId, order_id))
    .limit(1);

  if (!payment) {
    console.warn(`[billing] Webhook for unknown order: ${order_id}`);
    return { status: 'ignored' };
  }

  // Map Midtrans status to our status
  let newStatus = 'pending';
  if (['capture', 'settlement'].includes(transaction_status)) {
    newStatus = 'settlement';
  } else if (['deny', 'cancel', 'expire'].includes(transaction_status)) {
    newStatus = transaction_status;
  } else if (transaction_status === 'refund') {
    newStatus = 'refund';
  }

  // Update payment
  await db.update(payments)
    .set({ status: newStatus, paymentType: payment_type, paidAt: newStatus === 'settlement' ? new Date() : null })
    .where(eq(payments.id, payment.id));

  // If payment successful, activate subscription + upgrade org
  if (newStatus === 'settlement' && payment.subscriptionId) {
    const [sub] = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.id, payment.subscriptionId))
      .limit(1);

    if (sub) {
      await db.update(subscriptions)
        .set({ status: 'active' })
        .where(eq(subscriptions.id, sub.id));

      const planLimits = PLAN_PRICING[sub.plan]?.limits || {};
      await db.update(organizations)
        .set({
          plan: sub.plan,
          maxBots: planLimits.maxBots || 1,
          maxSocialAccounts: planLimits.maxSocialAccounts || 2,
          maxTradesPerDay: planLimits.maxTradesPerDay || 10,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, sub.orgId));
    }
  }

  return { status: 'ok', paymentStatus: newStatus };
}

/**
 * Get current subscription status for an org.
 */
export async function getSubscriptionStatus(orgId) {
  const [org] = await db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1);
  if (!org) return null;

  const [activeSub] = await db.select()
    .from(subscriptions)
    .where(and(eq(subscriptions.orgId, orgId), eq(subscriptions.status, 'active')))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  const recentPayments = await db.select()
    .from(payments)
    .where(eq(payments.orgId, orgId))
    .orderBy(desc(payments.createdAt))
    .limit(10);

  return {
    org: { id: org.id, name: org.name, plan: org.plan, status: org.status },
    subscription: activeSub || null,
    payments: recentPayments,
  };
}

/**
 * Cancel subscription — downgrade to free at period end.
 */
export async function cancelSubscription(orgId) {
  const [activeSub] = await db.select()
    .from(subscriptions)
    .where(and(eq(subscriptions.orgId, orgId), eq(subscriptions.status, 'active')))
    .limit(1);

  if (!activeSub) return { error: 'No active subscription' };

  await db.update(subscriptions)
    .set({ status: 'canceled', canceledAt: new Date(), updatedAt: new Date() })
    .where(eq(subscriptions.id, activeSub.id));

  // Downgrade org to free
  await db.update(organizations)
    .set({ plan: 'free', maxBots: 1, maxSocialAccounts: 2, maxTradesPerDay: 10, updatedAt: new Date() })
    .where(eq(organizations.id, orgId));

  return { status: 'canceled' };
}
