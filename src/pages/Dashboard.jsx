import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Calculator,
  TrendingUp,
  FileText,
  DollarSign,
  ArrowRight,
  Layers,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { format } from "date-fns";

const StatCard = ({ icon: Icon, label, value, accent, bg, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] p-5 card-hover"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${accent}`} />
      </div>
    </div>
  </motion.div>
);

const ChartTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-slate-400">{payload[0].payload.name}</p>
        <p className="text-sm font-semibold text-white">${payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { data: quotes = [] } = useQuery({
    queryKey: ["quotes"],
    queryFn: () => base44.entities.Quote.list("-created_date", 50),
  });

  const { data: sales = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: () => base44.entities.Sale.list("-sale_date"),
  });

  const { data: printers = [] } = useQuery({
    queryKey: ["printers"],
    queryFn: () => base44.entities.PrinterProfile.list(),
  });

  const totalInvestment = printers.reduce((sum, p) => sum + (p.printer_cost || 0), 0);
  const completedSales = sales.filter(s => s.status === "completed");
  const totalRevenue = completedSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const totalProfit = completedSales.reduce((sum, s) => sum + (s.profit || 0), 0);
  const avgProfit = completedSales.length > 0
    ? (totalProfit / totalRevenue) * 100
    : 0;

  // Recent sales for chart
  const recentData = completedSales.slice(0, 7).reverse().map((s) => ({
    name: s.product_name?.substring(0, 12) || "—",
    value: s.total_amount || 0,
  }));

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">Here's your 3D printing business overview</p>
        </div>
        <Link to={createPageUrl("Calculator")}>
          <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-violet-500/20">
            <Calculator className="w-4 h-4 mr-2" />
            New Quote
          </Button>
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Investment" value={`$${totalInvestment.toFixed(0)}`} accent="text-emerald-400" bg="bg-emerald-500/10" delay={0} />
        <StatCard icon={FileText} label="Total Sales" value={completedSales.length} accent="text-violet-400" bg="bg-violet-500/10" delay={0.05} />
        <StatCard icon={DollarSign} label="Total Revenue" value={`$${totalRevenue.toFixed(0)}`} accent="text-blue-400" bg="bg-blue-500/10" delay={0.1} />
        <StatCard icon={TrendingUp} label="Profit Margin" value={`${avgProfit.toFixed(0)}%`} accent="text-amber-400" bg="bg-amber-500/10" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] p-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4">Recent Sales</h3>
          {recentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={recentData}>
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(139,92,246,0.08)" }} />
                <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-slate-600 text-sm">
              No sales yet — record your first one!
            </div>
          )}
        </motion.div>

        {/* Recent sales list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Latest Sales</h3>
            <Link to={createPageUrl("Sales")} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {completedSales.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <div>
                  <p className="text-sm text-slate-300 font-medium">{s.product_name || "Untitled"}</p>
                  <p className="text-[11px] text-slate-600">
                    {s.sale_date ? format(new Date(s.sale_date), "MMM d, yyyy") : "—"}
                  </p>
                </div>
                <p className="text-sm font-semibold text-green-400">${(s.total_amount || 0).toFixed(2)}</p>
              </div>
            ))}
            {completedSales.length === 0 && (
              <p className="text-xs text-slate-600 text-center py-6">No sales yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}