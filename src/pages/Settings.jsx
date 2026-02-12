import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Settings as SettingsIcon, User, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { DEFAULT_SETTINGS } from "../components/calculator/pricingEngine";

const inputClass = "bg-slate-800/50 border-slate-700/50 text-white rounded-xl h-10 text-sm";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [defaults, setDefaults] = useState({ ...DEFAULT_SETTINGS });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (u.calculator_defaults) {
        setDefaults({ ...DEFAULT_SETTINGS, ...u.calculator_defaults });
      }
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ calculator_defaults: defaults });
    setSaving(false);
    toast.success("Settings saved");
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <User className="w-4 h-4 text-violet-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">Profile</h3>
        </div>
        {user && (
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs text-slate-400">Name</Label><Input className={inputClass} value={user.full_name || ""} readOnly /></div>
            <div><Label className="text-xs text-slate-400">Email</Label><Input className={inputClass} value={user.email || ""} readOnly /></div>
          </div>
        )}
      </motion.div>

      {/* Default Calculator Settings */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">Default Calculator Settings</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-xs text-slate-400">VAT %</Label><Input type="number" className={inputClass} value={defaults.vatPercent || ""} onChange={(e) => setDefaults({ ...defaults, vatPercent: parseFloat(e.target.value) || 0 })} /></div>
          <div><Label className="text-xs text-slate-400">Labor Rate ($/hr)</Label><Input type="number" className={inputClass} value={defaults.laborRate || ""} onChange={(e) => setDefaults({ ...defaults, laborRate: parseFloat(e.target.value) || 0 })} /></div>
          <div><Label className="text-xs text-slate-400">Material Efficiency</Label><Input type="number" step="0.01" className={inputClass} value={defaults.materialEfficiency || ""} onChange={(e) => setDefaults({ ...defaults, materialEfficiency: parseFloat(e.target.value) || 1 })} /></div>
          <div><Label className="text-xs text-slate-400">Buffer Factor</Label><Input type="number" step="0.01" className={inputClass} value={defaults.bufferFactor || ""} onChange={(e) => setDefaults({ ...defaults, bufferFactor: parseFloat(e.target.value) || 1 })} /></div>
          <div><Label className="text-xs text-slate-400">Electricity ($/kWh)</Label><Input type="number" step="0.01" className={inputClass} value={defaults.electricityCostPerKwh || ""} onChange={(e) => setDefaults({ ...defaults, electricityCostPerKwh: parseFloat(e.target.value) || 0 })} /></div>
          <div><Label className="text-xs text-slate-400">Default Printer Cost ($)</Label><Input type="number" className={inputClass} value={defaults.printerCost || ""} onChange={(e) => setDefaults({ ...defaults, printerCost: parseFloat(e.target.value) || 0 })} /></div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl h-11 shadow-lg shadow-violet-500/20">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </motion.div>
    </div>
  );
}