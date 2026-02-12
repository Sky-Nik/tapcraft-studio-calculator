import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Percent, Package, Tag } from "lucide-react";

const inputClass = "bg-slate-800/50 border-slate-700/50 text-white rounded-xl h-10 text-sm";

export default function EtsyRevenueCard({ form, setForm }) {
  return (
    <div className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <Tag className="w-4 h-4 text-emerald-400" />
        </div>
        <h3 className="text-sm font-semibold text-white">Revenue</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-xs text-slate-400">Product Name</Label>
          <Input
            className={inputClass}
            placeholder="Search history or enter name..."
            value={form.productName}
            onChange={(e) => setForm({ ...form, productName: e.target.value })}
          />
        </div>

        <div>
          <Label className="text-xs text-slate-400">Product Price</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">A$</span>
            <Input
              type="number"
              step="0.01"
              className={`${inputClass} pl-10`}
              value={form.productPrice || ""}
              onChange={(e) => setForm({ ...form, productPrice: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-slate-400">Shipping Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">A$</span>
              <Input
                type="number"
                step="0.01"
                className={`${inputClass} pl-10`}
                value={form.shippingPrice || ""}
                onChange={(e) => setForm({ ...form, shippingPrice: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-slate-400">Discount</Label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                className={`${inputClass} pr-8`}
                value={form.discount || ""}
                onChange={(e) => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}