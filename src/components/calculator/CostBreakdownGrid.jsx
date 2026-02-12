import React from "react";
import { cn } from "@/lib/utils";
import { Layers, Clock, Cpu, HardDrive, Package, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const costItems = [
  { key: "materialCost", label: "Material Cost", icon: Layers, accent: "text-violet-400", bg: "bg-violet-500/10" },
  { key: "laborCost", label: "Labor Cost", icon: Clock, accent: "text-blue-400", bg: "bg-blue-500/10" },
  { key: "machineCost", label: "Machine Cost", icon: Cpu, accent: "text-indigo-400", bg: "bg-indigo-500/10" },
  { key: "hardwareCost", label: "Hardware Cost", icon: HardDrive, accent: "text-cyan-400", bg: "bg-cyan-500/10" },
  { key: "packagingCost", label: "Packaging Cost", icon: Package, accent: "text-purple-400", bg: "bg-purple-500/10" },
];

export default function CostBreakdownGrid({ costs }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-violet-400" />
        Cost Breakdown
      </h3>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {costItems.map((item, i) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="bg-[hsl(224,20%,9%)] rounded-xl border border-white/[0.06] p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", item.bg)}>
                <item.icon className={cn("w-3 h-3", item.accent)} />
              </div>
              <span className="text-[11px] text-slate-500 font-medium">{item.label}</span>
            </div>
            <p className="text-lg font-bold text-white">
              ${(costs[item.key] || 0).toFixed(2)}
            </p>
          </motion.div>
        ))}

        {/* Total Landed Cost - highlighted */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-br from-violet-500/15 to-indigo-500/10 rounded-xl border border-violet-500/20 p-4 glow-purple-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center">
              <DollarSign className="w-3 h-3 text-violet-300" />
            </div>
            <span className="text-[11px] text-violet-300 font-semibold">Total Landed Cost</span>
          </div>
          <p className="text-xl font-bold text-white">
            ${(costs.totalCost || 0).toFixed(2)}
          </p>
        </motion.div>
      </div>
    </div>
  );
}