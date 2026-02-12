import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, ChevronDown, ChevronRight } from "lucide-react";

const inputClass = "bg-slate-800/50 border-slate-700/50 text-white rounded-xl h-10 text-sm";

export default function EtsyAdvancedSettings({ settings, setSettings, showAdvanced, setShowAdvanced }) {
  return (
    <div className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] overflow-hidden">
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full px-5 py-4 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
          {showAdvanced ? (
            <ChevronDown className="w-4 h-4 text-indigo-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-indigo-400" />
          )}
        </div>
        <h3 className="text-sm font-semibold text-white">Advanced Settings</h3>
        <span className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full ml-auto">
          Configure Etsy Fee Rates and VAT Settings
        </span>
      </button>

      {showAdvanced && (
        <div className="p-5 pt-0 space-y-4 border-t border-white/[0.04]">
          <div className="pt-4">
            <Label className="text-xs text-slate-400 mb-1.5 block">Seller Location (Bank)</Label>
            <Select value={settings.sellerLocation} onValueChange={(v) => setSettings({ ...settings, sellerLocation: v })}>
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="US" className="text-slate-200">United States</SelectItem>
                <SelectItem value="AU" className="text-slate-200">Australia</SelectItem>
                <SelectItem value="UK" className="text-slate-200">United Kingdom</SelectItem>
                <SelectItem value="EU" className="text-slate-200">European Union</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-400">Listing Fee</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">A$</span>
                <Input type="number" step="0.01" className={`${inputClass} pl-10`} value={settings.listingFee || ""} onChange={(e) => setSettings({ ...settings, listingFee: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-400">Transaction Fee Rate</Label>
              <div className="relative">
                <Input type="number" step="0.1" className={`${inputClass} pr-8`} value={settings.transactionFeeRate || ""} onChange={(e) => setSettings({ ...settings, transactionFeeRate: parseFloat(e.target.value) || 0 })} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-400">Payment Fee Rate</Label>
              <div className="relative">
                <Input type="number" step="0.1" className={`${inputClass} pr-8`} value={settings.paymentFeeRate || ""} onChange={(e) => setSettings({ ...settings, paymentFeeRate: parseFloat(e.target.value) || 0 })} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-400">Payment Fee Fixed</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">A$</span>
                <Input type="number" step="0.01" className={`${inputClass} pl-10`} value={settings.paymentFeeFixed || ""} onChange={(e) => setSettings({ ...settings, paymentFeeFixed: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-400">VAT Rate</Label>
              <div className="relative">
                <Input type="number" step="1" className={`${inputClass} pr-8`} value={settings.vatRate || ""} onChange={(e) => setSettings({ ...settings, vatRate: parseFloat(e.target.value) || 0 })} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-400">Offsite Ads Rate</Label>
              <div className="relative">
                <Input type="number" step="1" className={`${inputClass} pr-8`} value={settings.offsiteAdsRate || ""} onChange={(e) => setSettings({ ...settings, offsiteAdsRate: parseFloat(e.target.value) || 0 })} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs text-slate-400">Regulatory Operating Fee</Label>
            <div className="relative">
              <Input type="number" step="0.1" className={`${inputClass} pr-8`} value={settings.regulatoryFee || ""} onChange={(e) => setSettings({ ...settings, regulatoryFee: parseFloat(e.target.value) || 0 })} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}