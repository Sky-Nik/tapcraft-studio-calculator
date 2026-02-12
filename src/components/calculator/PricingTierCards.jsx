import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, Sparkles, Crown, Gem } from "lucide-react";
import { motion } from "framer-motion";

const tierIcons = [TrendingUp, Sparkles, Crown, Gem];

export default function PricingTierCards({ pricingTiers, batchQuantity }) {
  const isBatch = batchQuantity > 1;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {pricingTiers.map((tier, i) => {
        const Icon = tierIcons[i];
        return (
          <motion.div
            key={tier.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className={cn(
              "relative rounded-2xl border p-4 card-hover cursor-default overflow-hidden",
              tier.bg,
              tier.border
            )}
          >
            {/* Background glow */}
            <div className={cn("absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20 blur-2xl bg-gradient-to-br", tier.color)} />

            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className={cn("text-[11px] font-semibold uppercase tracking-wider", tier.text)}>
                  {tier.label}
                </span>
                <Icon className={cn("w-4 h-4", tier.text)} />
              </div>

              <div className="space-y-1">
                <p className="text-xl font-bold text-white">
                  ${(isBatch ? tier.unitPrice : tier.price).toFixed(2)}
                </p>
                {isBatch && (
                  <p className="text-[11px] text-slate-500">
                    Total: ${tier.price.toFixed(2)} ({batchQuantity} units)
                  </p>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">{tier.margin}% margin</span>
                  <span className="text-[11px] text-slate-400">
                    +VAT: ${(isBatch ? tier.unitPriceWithVat : tier.priceWithVat).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}