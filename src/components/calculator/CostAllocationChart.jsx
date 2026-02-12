import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { motion } from "framer-motion";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-slate-400">{payload[0].name}</p>
        <p className="text-sm font-semibold text-white">${payload[0].value.toFixed(2)}</p>
        <p className="text-[11px] text-slate-500">{((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

export default function CostAllocationChart({ breakdown, totalCost }) {
  const chartData = breakdown.map((item) => ({
    ...item,
    name: item.label,
    total: totalCost,
  }));

  if (chartData.length === 0) {
    return (
      <div className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <PieChartIcon className="w-4 h-4 text-violet-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">Cost Allocation</h3>
        </div>
        <div className="h-48 flex items-center justify-center">
          <p className="text-xs text-slate-600">Enter costs to see chart</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
          <PieChartIcon className="w-4 h-4 text-violet-400" />
        </div>
        <h3 className="text-sm font-semibold text-white">Cost Allocation</h3>
      </div>

      <div className="flex items-center gap-6">
        <div className="w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2.5">
          {chartData.map((item) => {
            const percent = totalCost > 0 ? (item.value / totalCost) * 100 : 0;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-400 flex-1">{item.label}</span>
                <span className="text-xs font-medium text-white">{percent.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}