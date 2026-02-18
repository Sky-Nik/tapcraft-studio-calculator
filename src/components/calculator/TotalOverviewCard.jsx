import React from "react";
import { motion } from "framer-motion";
import { DollarSign, Layers, Clock, Cpu, HardDrive, Package, TrendingUp, Receipt, Percent, BadgeCheck } from "lucide-react";
import { calculateCustomPrice } from "./pricingEngine";

export default function TotalOverviewCard({ costs, advancedSettings, customMargin, batchQuantity }) {
  const vatPercent = advancedSettings.vatPercent || 0;
  const result = calculateCustomPrice(costs.totalCost, customMargin, vatPercent);
  const isBatch = batchQuantity > 1;

  const unitSellingPrice = isBatch ? result.price / batchQuantity : result.price;
  const unitProfit = isBatch ? result.profit / batchQuantity : result.profit;
  const unitPriceVat = isBatch ? result.priceWithVat / batchQuantity : result.priceWithVat;
  const batchSellingPrice = result.price;
  const batchPriceVat = result.priceWithVat;

  const rows = [
    { label: "Material Cost", icon: Layers, color: "text-violet-400", value: costs.materialCost || 0 },
    { label: "Labor Cost", icon: Clock, color: "text-blue-400", value: costs.laborCost || 0 },
    { label: "Machine Cost", icon: Cpu, color: "text-indigo-400", value: costs.machineCost || 0 },
    { label: "Electricity Cost", icon: Cpu, color: "text-sky-400", value: costs.electricityCost || 0 },
    { label: "Hardware Cost", icon: HardDrive, color: "text-cyan-400", value: costs.hardwareCost || 0 },
    { label: "Packaging Cost", icon: Package, color: "text-purple-400", value: costs.packagingCost || 0 },
  ].filter(r => r.value > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <Receipt className="w-4 h-4 text-emerald-400" />
        </div>
        <h3 className="text-sm font-semibold text-white">Total Overview</h3>
        <span className="ml-auto text-xs text-slate-500 bg-slate-800/60 px-2 py-1 rounded-full">
          {isBatch ? `Batch × ${batchQuantity}` : "Single Unit"}
        </span>
      </div>

      <div className="p-6 space-y-5">
        {/* Cost rows */}
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <row.icon className={`w-3.5 h-3.5 ${row.color}`} />
                <span className="text-xs text-slate-400">{row.label}</span>
              </div>
              <span className="text-xs text-slate-300 font-medium">${row.value.toFixed(2)}</span>
            </div>
          ))}

          <div className="border-t border-white/[0.06] my-2" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-semibold text-slate-300">Total Landed Cost</span>
            </div>
            <span className="text-sm font-bold text-white">${(costs.totalCost || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Margin applied section */}
        <div className="rounded-xl bg-slate-800/40 border border-slate-700/40 p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Percent className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-semibold text-slate-300">Custom Margin Applied — {customMargin}%</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Selling Price (unit)</span>
            <span className="text-sm font-bold text-white">${unitSellingPrice.toFixed(2)}</span>
          </div>

          {vatPercent > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Price + VAT {vatPercent}% (unit)</span>
              <span className="text-sm font-semibold text-slate-300">${unitPriceVat.toFixed(2)}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Profit (unit)</span>
            <span className="text-sm font-semibold text-emerald-400">+${unitProfit.toFixed(2)}</span>
          </div>

          {isBatch && (
            <>
              <div className="border-t border-white/[0.04] pt-3 mt-1 flex items-center justify-between">
                <span className="text-xs text-slate-500">Total Batch Price (×{batchQuantity})</span>
                <span className="text-sm font-bold text-[#1E73FF]">${batchSellingPrice.toFixed(2)}</span>
              </div>
              {vatPercent > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Batch Price + VAT</span>
                  <span className="text-sm font-semibold text-slate-300">${batchPriceVat.toFixed(2)}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Final price highlight */}
        <div className="rounded-xl bg-gradient-to-br from-[#1E73FF]/15 to-emerald-500/10 border border-[#1E73FF]/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-[#1E73FF]" />
            <div>
              <p className="text-xs text-slate-400">Final Quote Price</p>
              <p className="text-[10px] text-slate-500">{vatPercent > 0 ? `Incl. ${vatPercent}% VAT` : "Excl. VAT"} · {customMargin}% margin</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">
            ${(vatPercent > 0 ? unitPriceVat : unitSellingPrice).toFixed(2)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}