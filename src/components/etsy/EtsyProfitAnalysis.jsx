import React from "react";
import { motion } from "framer-motion";
import { TrendingDown, AlertCircle, Target, TrendingUp } from "lucide-react";

const ProfitCard = ({ icon: Icon, label, description, value, type, delay }) => {
  const colors = {
    negative: "bg-red-500/10 border-red-500/20",
    warning: "bg-orange-500/10 border-orange-500/20",
    info: "bg-blue-500/10 border-blue-500/20",
    target: "bg-purple-500/10 border-purple-500/20",
  };

  const textColors = {
    negative: "text-red-400",
    warning: "text-orange-400",
    info: "text-blue-400",
    target: "text-purple-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-xl p-4 border ${colors[type]}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${textColors[type]}`} />
        <div>
          <h4 className={`text-sm font-semibold ${textColors[type]}`}>{label}</h4>
          <p className="text-[10px] text-slate-500">{description}</p>
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  );
};

export default function EtsyProfitAnalysis({ metrics }) {
  return (
    <div className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Profit Analysis</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ProfitCard
          icon={TrendingDown}
          label="Standard Profit"
          description="Actual profit after marketplace fees & costs"
          value={`${metrics.standardProfit >= 0 ? '' : '-'}$${Math.abs(metrics.standardProfit).toFixed(2)}`}
          type="negative"
          delay={0}
        />
        <ProfitCard
          icon={AlertCircle}
          label="Offsite Ads Profit"
          description="Profit if the order comes from an Etsy Ad"
          value={`${metrics.offsiteAdsProfit >= 0 ? '' : '-'}$${Math.abs(metrics.offsiteAdsProfit).toFixed(2)}`}
          type="warning"
          delay={0.05}
        />
        <ProfitCard
          icon={Target}
          label="Target Unit Profit"
          description="Desired net profit per unit"
          value={`$${metrics.targetProfit.toFixed(2)}`}
          type="target"
          delay={0.1}
        />
        <ProfitCard
          icon={TrendingUp}
          label="Breakeven Price"
          description="Minimum listing price to cover all expenses"
          value={`$${metrics.breakeven.toFixed(2)}`}
          type="info"
          delay={0.15}
        />
      </div>
    </div>
  );
}