import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Star, Building2, Crown, CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PRICES = {
  maker: { month: "price_1T5QpRBDFvOSE8HiZmsVAe98", year: "price_1T5QpRBDFvOSE8HiRbd8SwoX" },
  printlab: { month: "price_1T5QpRBDFvOSE8HippxeqFJc", year: "price_1T5QpRBDFvOSE8HivlErlEbE" },
};

const PLANS = [
  {
    id: "free",
    name: "Free",
    icon: Zap,
    monthlyPrice: 0,
    yearlyPrice: 0,
    color: "border-border",
    badge: null,
    features: [
      "Basic cost calculator",
      "Single filament input",
      "Up to 5 saved quotes",
      "Manual filament pricing",
      "Basic PDF export",
    ],
    locked: [],
  },
  {
    id: "maker",
    name: "Maker",
    icon: Star,
    monthlyPrice: 19,
    yearlyPrice: 180,
    color: "border-violet-500",
    badge: "Most Popular",
    gradient: "from-violet-500 to-purple-600",
    features: [
      "Everything in Free",
      "Multi-filament calculation",
      "Filament database with pricing",
      "Unlimited quotes",
      "Margin presets",
      "Client database",
      "Revenue analytics",
      "Custom branding on PDF",
    ],
  },
  {
    id: "printlab",
    name: "PrintLab",
    icon: Building2,
    monthlyPrice: 49,
    yearlyPrice: 470,
    color: "border-blue-500",
    badge: "Full Suite",
    gradient: "from-blue-500 to-cyan-600",
    features: [
      "Everything in Maker",
      "Full CRM (Leads, Clients, Pipeline)",
      "Automated follow-ups",
      "Payment link generation",
      "Stripe invoice integration",
      "Multi-printer tracking",
      "Team role-based access",
      "Social media content vault",
      "API access",
    ],
  },
];

export default function Subscription() {
  const [billing, setBilling] = useState("month");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    // Check for success/cancel URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      toast.success("Subscription activated! Welcome to your new plan.");
    }
    if (params.get("canceled") === "true") {
      toast.error("Checkout canceled. No charges were made.");
    }

    base44.auth.me().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const currentTier = user?.subscription_tier || "free";
  const currentStatus = user?.subscription_status || "none";

  const handleCheckout = async (planId) => {
    if (planId === "free") return;
    const isInIframe = window.self !== window.top;
    if (isInIframe) {
      alert("Checkout is only available in the published app. Please open the app in a new tab.");
      return;
    }

    const priceId = PRICES[planId]?.[billing];
    if (!priceId) return;

    setCheckoutLoading(planId);
    const response = await base44.functions.invoke("createCheckout", { price_id: priceId, billing_interval: billing });
    setCheckoutLoading(null);

    if (response.data?.url) {
      window.location.href = response.data.url;
    } else {
      toast.error("Failed to start checkout. Please try again.");
    }
  };

  const handleManageBilling = async () => {
    const isInIframe = window.self !== window.top;
    if (isInIframe) {
      alert("Billing portal is only available in the published app.");
      return;
    }
    setPortalLoading(true);
    const response = await base44.functions.invoke("createBillingPortal", {});
    setPortalLoading(false);
    if (response.data?.url) {
      window.location.href = response.data.url;
    } else {
      toast.error("Failed to open billing portal.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <Crown className="w-4 h-4" />
          PrintFlow Plans
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">Choose your plan</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Scale your 3D printing business with the right tools. Upgrade or downgrade anytime.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-1 bg-muted p-1 rounded-xl mt-6">
          <button
            onClick={() => setBilling("month")}
            className={cn("px-5 py-2 rounded-lg text-sm font-medium transition-all", billing === "month" ? "bg-background shadow text-foreground" : "text-muted-foreground")}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("year")}
            className={cn("px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2", billing === "year" ? "bg-background shadow text-foreground" : "text-muted-foreground")}
          >
            Yearly
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">Save 20%</Badge>
          </button>
        </div>
      </div>

      {/* Current plan status */}
      {user && currentTier !== "free" && (
        <div className="mb-8 p-4 rounded-xl border border-border bg-muted/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold capitalize">{currentTier} Plan</p>
              <p className="text-sm text-muted-foreground capitalize">Status: {currentStatus}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={portalLoading}>
            {portalLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
            Manage Billing
          </Button>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = currentTier === plan.id;
          const price = billing === "month" ? plan.monthlyPrice : plan.yearlyPrice;
          const isPopular = plan.badge === "Most Popular";

          return (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-2xl border-2 p-6 flex flex-col gap-5 transition-all",
                plan.color,
                isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                isPopular && "shadow-lg shadow-violet-500/10"
              )}
            >
              {plan.badge && (
                <div className={cn("absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r", plan.gradient)}>
                  {plan.badge}
                </div>
              )}

              <div>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", plan.gradient ? `bg-gradient-to-br ${plan.gradient}` : "bg-muted")}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold">{plan.name}</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold">${price}</span>
                  <span className="text-muted-foreground text-sm">/{billing === "month" ? "mo" : "yr"}</span>
                </div>
              </div>

              <ul className="space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div>
                {isCurrent ? (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                ) : plan.id === "free" ? (
                  <Button className="w-full" variant="outline" disabled>
                    Free Forever
                  </Button>
                ) : (
                  <Button
                    className={cn("w-full text-white border-0 bg-gradient-to-r", plan.gradient)}
                    onClick={() => handleCheckout(plan.id)}
                    disabled={checkoutLoading === plan.id}
                  >
                    {checkoutLoading === plan.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Zap className="w-4 h-4 mr-2" />
                    )}
                    {currentTier === "free" ? "Get Started" : "Switch Plan"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ / Notes */}
      <p className="text-center text-sm text-muted-foreground mt-10">
        All plans include a 7-day free trial. Cancel anytime. Prices in USD.
      </p>
    </div>
  );
}