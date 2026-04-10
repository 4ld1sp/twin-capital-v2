import React, { useState, useEffect } from 'react';
import { useTrans } from '../context/LanguageContext';
import { CreditCard, Check, ArrowRight, Loader2, Clock, AlertCircle } from 'lucide-react';

const PLANS = {
  free: { name: 'Free', priceIDR: 0, priceUSD: 0, features: ['1 bot (testnet)', '2 social platforms', '10 trades/day', '50 AI calls/day', 'Community support'] },
  pro: { name: 'Pro', priceIDR: 1_500_000, priceUSD: 99, features: ['5 bots (mainnet)', '8 social platforms', 'Unlimited trades', '500 AI calls/day', 'Email support'] },
  enterprise: { name: 'Enterprise', priceIDR: 5_250_000, priceUSD: 349, features: ['Unlimited bots', 'Unlimited platforms', 'Unlimited everything', 'White-label portal', 'Priority support + SLA'] },
};

export default function Billing() {
  const t = useTrans();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  useEffect(() => {
    fetch('/api/billing/status')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setStatus)
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  const handleCheckout = async (plan) => {
    setCheckoutLoading(plan);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert(`Order created: ${data.orderId}\nAmount: Rp ${data.amount.toLocaleString()}\n\nMidtrans Snap integration coming soon!`);
      }
    } catch (err) {
      alert('Checkout failed');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will be downgraded to Free.')) return;
    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST' });
      const data = await res.json();
      if (data.error) alert(data.error);
      else window.location.reload();
    } catch { alert('Cancel failed'); }
  };

  const currentPlan = status?.org?.plan || 'free';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">{t('billing.title')}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t('billing.subtitle')}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Current Plan */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">{t('billing.currentPlan')}</p>
                <p className="text-lg font-semibold text-[var(--text-primary)] mt-1 flex items-center gap-2">
                  {PLANS[currentPlan]?.name || 'Free'}
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${currentPlan === 'free' ? 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]' : 'bg-primary/10 text-primary'}`}>
                    {currentPlan === 'free' ? 'Free' : 'Active'}
                  </span>
                </p>
              </div>
              {currentPlan !== 'free' && (
                <button onClick={handleCancel} className="text-xs text-[var(--danger)] hover:underline">
                  {t('billing.cancel')}
                </button>
              )}
            </div>
            {status?.subscription?.currentPeriodEnd && (
              <p className="text-xs text-[var(--text-tertiary)] mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Renews {new Date(status.subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Plan Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(PLANS).map(([key, plan]) => (
              <div key={key} className={`bg-[var(--bg-surface)] border rounded-xl p-5 transition-colors ${key === 'pro' ? 'border-primary' : 'border-[var(--border)]'}`}>
                {key === 'pro' && (
                  <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-3 inline-block">
                    Recommended
                  </span>
                )}
                <h3 className="text-base font-semibold text-[var(--text-primary)]">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-2xl font-semibold text-[var(--text-primary)] font-mono">${plan.priceUSD}</span>
                  <span className="text-sm text-[var(--text-secondary)]">/mo</span>
                  {plan.priceIDR > 0 && (
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Rp {plan.priceIDR.toLocaleString()}</p>
                  )}
                </div>
                <ul className="space-y-2 mb-5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Check className="w-3.5 h-3.5 text-[var(--success)] flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {key === currentPlan ? (
                  <button disabled className="w-full py-2 rounded-lg text-sm font-medium bg-[var(--bg-subtle)] text-[var(--text-tertiary)] cursor-not-allowed">
                    {t('billing.currentPlan')}
                  </button>
                ) : key === 'free' ? (
                  <div />
                ) : (
                  <button
                    onClick={() => handleCheckout(key)}
                    disabled={!!checkoutLoading}
                    className="w-full py-2 rounded-lg text-sm font-medium bg-primary hover:bg-primary-hover text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {checkoutLoading === key ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <>{t('billing.upgrade')} <ArrowRight className="w-3.5 h-3.5" /></>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Payment History */}
          {status?.payments?.length > 0 && (
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-3">{t('billing.history')}</h3>
              <div className="space-y-0">
                {status.payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0">
                    <div>
                      <p className="text-sm text-[var(--text-primary)]">Rp {p.amount.toLocaleString()}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      p.status === 'settlement' ? 'bg-[var(--success)]/10 text-[var(--success)]' :
                      p.status === 'pending' ? 'bg-[var(--warning)]/10 text-[var(--warning)]' :
                      'bg-[var(--danger)]/10 text-[var(--danger)]'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
