import React from "react";
import { Slider } from "@/components/ui/slider";
import { calculateCustomPrice } from "./pricingEngine";
import { SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export default function CustomMarginSlider({ totalCost, vatPercent, customMargin, setCustomMargin, batchQuantity }) {
  const result = calculateCustomPrice(totalCost, customMargin, vatPercent);
  const isBatch = batchQuantity > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
          <SlidersHorizontal className="w-4 h-4 text-violet-400" />
        </div>
        <h3 className="text-sm font-semibold text-white">Custom Margin</h3>
        <span className="ml-auto text-lg font-bold gradient-text">{customMargin}%</span>
      </div>

      <Slider
        value={[customMargin]}
        onValueChange={([v]) => setCustomMargin(v)}
        min={5}
        max={95}
        step={1}
        className="mb-4"
      />

      <div className="flex items-center justify-between text-sm">
        <div>
          <p className="text-slate-500 text-xs">Selling Price</p>
          <p className="text-white font-semibold text-lg">
            ${(isBatch ? result.price / batchQuantity : result.price).toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-slate-500 text-xs">Profit</p>
          <p className="text-emerald-400 font-semibold text-lg">
            ${(isBatch ? result.profit / batchQuantity : result.profit).toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-slate-500 text-xs">Price + VAT</p>
          <p className="text-slate-300 font-semibold text-lg">
            ${(isBatch ? result.priceWithVat / batchQuantity : result.priceWithVat).toFixed(2)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}