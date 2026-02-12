import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DollarSign } from "lucide-react";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-slate-400">{payload[0].name}</p>
        <p className="text-sm font-semibold text-white">${payload[0].value.toFixed(2)}</p>
        <p className="text-[11px] text-slate-500">{payload[0].payload.percent.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

const FeeItem = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
    <span className="text-xs text-slate-400">{label}</span>
    <span className="text-sm font-medium text-white">${value.toFixed(2)}</span>
  </div>
);

export default function EtsyFeeBreakdown({ metrics }) {
  const hasData = metrics.totalEtsyFees > 0;

  return (
    <div className="space-y-4">
      {/* Fee Breakdown */}
      <div className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Etsy Fees Breakdown</h3>
        <div className="space-y-1">
          <FeeItem label="Listing Fee" value={metrics.listingFee} />
          <FeeItem label="Transaction Fee" value={metrics.transactionFee} />
          <FeeItem label="Payment Fee" value={metrics.paymentFee} />
          {metrics.regulatoryFee > 0 && <FeeItem label="Regulatory Fee" value={metrics.regulatoryFee} />}
          {metrics.offsiteAdsFee > 0 && <FeeItem label="Offsite Ads" value={metrics.offsiteAdsFee} />}
        </div>
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Total Etsy Fees</span>
          <div className="text-right">
            <p className="text-xl font-bold text-white">${metrics.totalEtsyFees.toFixed(2)}</p>
            <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
              {metrics.revenueAfterDiscount > 0 ? ((metrics.totalEtsyFees / metrics.revenueAfterDiscount) * 100).toFixed(1) : 0}% OF ORDER
            </span>
          </div>
        </div>
      </div>

      {/* Fee Allocation Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] p-5"
      >
        <h3 className="text-sm font-semibold text-white mb-4">Fee Allocation</h3>
        
        {hasData ? (
          <div className="flex items-center gap-6">
            <div className="w-48 h-48 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.feeAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {metrics.feeAllocation.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center -mt-28">
                <p className="text-xs text-slate-500">TOTAL ETSY FEES</p>
                <p className="text-lg font-bold text-white">${metrics.totalEtsyFees.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex-1 space-y-2.5">
              {metrics.feeAllocation.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-slate-400 flex-1">{item.label}</span>
                  <span className="text-xs font-medium text-white">{item.percent.toFixed(1)}%</span>
                  <span className="text-xs text-slate-500">${item.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-600 text-sm">
            Enter revenue to see fee allocation
          </div>
        )}
      </motion.div>
    </div>
  );
}