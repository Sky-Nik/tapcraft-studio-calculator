import React from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Clock, Zap, Wrench, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

const MetricCard = ({ icon: Icon, label, value, accent, delay, highlighted }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.3 }}
    className={cn(
      "rounded-xl p-4",
      highlighted
        ? "bg-gradient-to-br from-violet-500/15 to-indigo-500/10 border border-violet-500/20"
        : "bg-slate-800/50 border border-white/[0.06]"
    )}
  >
    <div className="flex items-center gap-2 mb-2">
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", highlighted ? "bg-violet-500/20" : "bg-white/[0.05]")}>
        <Icon className={cn("w-3.5 h-3.5", accent)} />
      </div>
      <span className="text-[11px] text-slate-500 font-medium">{label}</span>
    </div>
    <p className={cn("text-xl font-bold", highlighted ? "text-white" : "text-slate-300")}>
      {value}
    </p>
  </motion.div>
);

export default function CalculatedMetrics({ costs, advancedSettings }) {
  const s = advancedSettings;
  
  // Calculate metrics
  const totalInvestment = s.printerCost || 0;
  const annualCost = (s.annualMaintenance || 0);
  const lifetimeCost = totalInvestment + (annualCost * (s.estimatedLifeYears || 5));
  const estimatedUptimeHrs = ((s.uptimePercent || 70) / 100) * 365 * 24 * (s.estimatedLifeYears || 5);
  
  const printerDepreciationPerHr = estimatedUptimeHrs > 0 
    ? (s.printerCost || 0) / estimatedUptimeHrs 
    : 0;
  
  const maintenanceCostPerHr = estimatedUptimeHrs > 0
    ? (annualCost * (s.estimatedLifeYears || 5)) / estimatedUptimeHrs
    : 0;
  
  const electricityCostPerHr = ((s.powerConsumptionWatts || 200) / 1000) * (s.electricityCostPerKwh || 0.12);
  
  const totalPrinterCostPerHr = printerDepreciationPerHr + maintenanceCostPerHr + electricityCostPerHr;

  return (
    <div className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
          <Calculator className="w-4 h-4 text-indigo-400" />
        </div>
        <h3 className="text-sm font-semibold text-white">Calculated Metrics</h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <MetricCard
          icon={DollarSign}
          label="Total Investment"
          value={`$${totalInvestment.toFixed(2)}`}
          accent="text-emerald-400"
          delay={0}
        />
        <MetricCard
          icon={TrendingUp}
          label="Lifetime Cost"
          value={`$${lifetimeCost.toFixed(2)}`}
          accent="text-blue-400"
          delay={0.05}
        />
        <MetricCard
          icon={Clock}
          label="Estimated Uptime"
          value={`${Math.round(estimatedUptimeHrs)} hrs/year`}
          accent="text-purple-400"
          delay={0.1}
        />
        <MetricCard
          icon={TrendingUp}
          label="Printer Depreciation"
          value={`${printerDepreciationPerHr.toFixed(2)} AUD/hr`}
          accent="text-orange-400"
          delay={0.15}
        />
        <MetricCard
          icon={Wrench}
          label="Maintenance Cost"
          value={`${maintenanceCostPerHr.toFixed(2)} AUD/hr`}
          accent="text-cyan-400"
          delay={0.2}
        />
        <MetricCard
          icon={Zap}
          label="Electricity Cost"
          value={`${electricityCostPerHr.toFixed(2)} AUD/hr`}
          accent="text-yellow-400"
          delay={0.25}
        />
        <MetricCard
          icon={Calculator}
          label="Total Printer Cost"
          value={`${totalPrinterCostPerHr.toFixed(2)} AUD/hr`}
          accent="text-violet-300"
          delay={0.3}
          highlighted
        />
      </div>
    </div>
  );
}