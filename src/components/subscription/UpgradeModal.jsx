import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Star, Building2, Check } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

const TIER_INFO = {
  maker: {
    icon: Star,
    color: "from-violet-500 to-purple-600",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
    price: "$19/mo",
    features: [
      "Multi-filament calculation",
      "Filament database with pricing",
      "Unlimited quotes",
      "Margin presets",
      "Client database",
      "Revenue analytics",
      "Custom branding on PDF",
    ],
  },
  printlab: {
    icon: Building2,
    color: "from-blue-500 to-cyan-600",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    price: "$49/mo",
    features: [
      "Full CRM (Leads, Clients, Pipeline)",
      "Automated follow-ups",
      "Payment link generation",
      "Stripe invoice integration",
      "Multi-printer tracking",
      "Team role access",
      "Social media content vault",
    ],
  },
};

export default function UpgradeModal({ open, onClose, requiredTier = "maker", featureName }) {
  const navigate = useNavigate();
  const info = TIER_INFO[requiredTier] || TIER_INFO.maker;
  const Icon = info.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${info.color} flex items-center justify-center mb-3`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-xl">
            {featureName ? `"${featureName}" requires an upgrade` : "Upgrade to unlock this feature"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            This feature is available on the <span className="font-semibold capitalize">{requiredTier}</span> plan and above.
          </p>
        </DialogHeader>

        <div className="space-y-2 my-2">
          {info.features.map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-foreground">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-lg font-bold">{info.price}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Maybe later</Button>
            <Button
              size="sm"
              className={`bg-gradient-to-r ${info.color} text-white border-0`}
              onClick={() => { onClose(); navigate(createPageUrl("Subscription")); }}
            >
              <Zap className="w-4 h-4 mr-1" />
              Upgrade Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}