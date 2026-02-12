import React from "react";
import { motion } from "framer-motion";
import { Layers, Percent } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function BatchProductionCard({ 
  unitCost, 
  batchQuantity, 
  batchDiscount, 
  setBatchDiscount,
  vatPercent 
}) {
  const batchTotal = unitCost * batchQuantity;
  const discountAmount = batchTotal * (batchDiscount / 100);
  const batchAfterDiscount = batchTotal - discountAmount;
  const batchWithVat = batchAfterDiscount * (1 + vatPercent / 100);

  if (batchQuantity <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <Layers className="w-4 h-4 text-emerald-400" />
        </div>
        <h3 className="text-sm font-semibold text-white">Batch Production Pricing</h3>
      </div>

      <div className="space-y-6">
        {/* Unit & Batch Pricing */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-slate-800/50 border border-white/[0.06] p-4">
            <p className="text-xs text-slate-500 mb-1">Unit Cost</p>
            <p className="text-2xl font-bold text-white">AUD {unitCost.toFixed(2)}</p>
            <p className="text-[10px] text-slate-600 mt-1">Per single item</p>
          </div>
          <div className="rounded-xl bg-violet-500/10 border border-violet-500/30 p-4">
            <p className="text-xs text-violet-400 mb-1">Batch Total ({batchQuantity} units)</p>
            <p className="text-2xl font-bold text-white">AUD {batchTotal.toFixed(2)}</p>
            <p className="text-[10px] text-slate-600 mt-1">Before discount</p>
          </div>
        </div>

        {/* Discount Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-slate-400">Batch Discount</span>
            </div>
            <span className="text-sm font-bold text-emerald-400">{batchDiscount}%</span>
          </div>
          
          <Slider
            value={[batchDiscount]}
            onValueChange={(vals) => setBatchDiscount(vals[0])}
            max={100}
            step={1}
            className="py-2"
          />

          <div className="flex justify-between text-[10px] text-slate-600">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Final Pricing */}
        <div className="space-y-3 pt-4 border-t border-white/[0.04]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Discount Amount</span>
            <span className="text-sm text-red-400 font-medium">-AUD {discountAmount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">After Discount</span>
            <span className="text-sm text-white font-medium">AUD {batchAfterDiscount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">VAT ({vatPercent}%)</span>
            <span className="text-sm text-slate-300">+AUD {(batchWithVat - batchAfterDiscount).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
            <span className="text-sm font-semibold text-white">Batch Total (incl. VAT)</span>
            <span className="text-xl font-bold text-emerald-400">AUD {batchWithVat.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Per Unit Price</span>
            <span className="text-sm text-slate-300">{(batchWithVat / batchQuantity).toFixed(2)} AUD</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}