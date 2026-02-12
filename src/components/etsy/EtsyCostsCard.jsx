import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";

const inputClass = "bg-slate-800/50 border-slate-700/50 text-white rounded-xl h-10 text-sm";

export default function EtsyCostsCard({ form, setForm }) {
  return (
    <div className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-red-400" />
        </div>
        <h3 className="text-sm font-semibold text-white">Costs</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-slate-400">Product Cost</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">A$</span>
              <Input
                type="number"
                step="0.01"
                className={`${inputClass} pl-10`}
                value={form.productCost || ""}
                onChange={(e) => setForm({ ...form, productCost: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-slate-400">Shipping Cost</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">A$</span>
              <Input
                type="number"
                step="0.01"
                className={`${inputClass} pl-10`}
                value={form.shippingCost || ""}
                onChange={(e) => setForm({ ...form, shippingCost: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>

        <div>
          <Label className="text-xs text-slate-400">Packaging Cost</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">A$</span>
            <Input
              type="number"
              step="0.01"
              className={`${inputClass} pl-10`}
              value={form.packagingCost || ""}
              onChange={(e) => setForm({ ...form, packagingCost: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}