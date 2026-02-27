import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const TIER_ORDER = { free: 0, maker: 1, printlab: 2 };

export function useSubscription() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const tier = user?.subscription_tier || 'free';
  const status = user?.subscription_status || 'none';
  const isActive = ['active', 'trialing'].includes(status) || tier === 'free';

  const hasFeature = (requiredTier) => {
    if (!isActive && tier !== 'free') return false;
    return TIER_ORDER[tier] >= TIER_ORDER[requiredTier];
  };

  return { user, tier, status, isActive, hasFeature, loading };
}

export const FEATURES = {
  multiFilament: { tier: 'maker', label: 'Multi-filament Calculation' },
  filamentDatabase: { tier: 'maker', label: 'Filament Database' },
  unlimitedQuotes: { tier: 'maker', label: 'Unlimited Quotes' },
  marginPresets: { tier: 'maker', label: 'Margin Presets' },
  clientDatabase: { tier: 'maker', label: 'Client Database' },
  revenueAnalytics: { tier: 'maker', label: 'Revenue Analytics' },
  customBranding: { tier: 'maker', label: 'Custom PDF Branding' },
  fullCRM: { tier: 'printlab', label: 'Full CRM' },
  automatedFollowups: { tier: 'printlab', label: 'Automated Follow-ups' },
  paymentLinks: { tier: 'printlab', label: 'Payment Links' },
  stripeInvoicing: { tier: 'printlab', label: 'Stripe Invoicing' },
  costTracking: { tier: 'printlab', label: 'Cost Tracking' },
  multiPrinter: { tier: 'printlab', label: 'Multi-printer Tracking' },
  teamAccess: { tier: 'printlab', label: 'Team Access' },
  socialVault: { tier: 'printlab', label: 'Social Media Vault' },
};