import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Save, Check, Download } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

export default function QuoteActions({ inputs, costs, advancedSettings, customMargin, filamentTypes = [] }) {
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const quote = `
3D Print Quote — ${inputs.partName || "Untitled Part"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Material: ${inputs.filamentType || "—"} | Weight: ${inputs.materialWeightG || 0}g
Print Time: ${inputs.printTimeHours || 0}h ${inputs.printTimeMinutes || 0}m
Labor: ${inputs.laborTimeMinutes || 0} min

COST BREAKDOWN:
  Material:   $${(costs.materialCost || 0).toFixed(2)}
  Labor:      $${(costs.laborCost || 0).toFixed(2)}
  Machine:    $${(costs.machineCost || 0).toFixed(2)}
  Hardware:   $${(costs.hardwareCost || 0).toFixed(2)}
  Packaging:  $${(costs.packagingCost || 0).toFixed(2)}
  ─────────────────────────
  TOTAL COST: $${(costs.totalCost || 0).toFixed(2)}

SUGGESTED PRICING:
${costs.pricingTiers?.map((t) => `  ${t.label} (${t.margin}%): $${t.price.toFixed(2)} (+VAT: $${t.priceWithVat.toFixed(2)})`).join("\n")}
    `.trim();

    navigator.clipboard.writeText(quote);
    setCopied(true);
    toast.success("Quote copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    const customPrice = costs.totalCost / (1 - customMargin / 100);
    const customPriceVat = customPrice * (1 + (advancedSettings.vatPercent || 15) / 100);

    // Get unique materials from filament rows
    const materials = [...new Set(
      inputs.filamentRows?.map(row => {
        const filament = filamentTypes.find(f => f.id === row.filamentId);
        return filament?.material;
      }).filter(Boolean)
    )];
    const filamentMaterial = materials.join(", ") || "";

    await base44.entities.Quote.create({
      part_name: inputs.partName || "Untitled Part",
      category: inputs.category || "",
      printer_profile: inputs.printerProfile || "",
      filament_type: filamentMaterial,
      material_weight_g: inputs.materialWeightG || 0,
      print_time_minutes: (inputs.printTimeHours || 0) * 60 + (inputs.printTimeMinutes || 0),
      labor_time_minutes: inputs.laborTimeMinutes || 0,
      hardware_cost: inputs.hardwareCost || 0,
      packaging_cost: inputs.packagingCost || 0,
      batch_quantity: inputs.batchQuantity || 1,
      material_cost: costs.materialCost || 0,
      labor_cost: costs.laborCost || 0,
      machine_cost: costs.machineCost || 0,
      electricity_cost: costs.electricityCost || 0,
      total_cost: costs.totalCost || 0,
      selected_margin: customMargin,
      final_price: customPrice,
      final_price_with_vat: customPriceVat,
      status: "draft",
    });

    setSaving(false);
    toast.success("Quote saved successfully");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex gap-3"
    >
      <Button
        onClick={handleCopy}
        variant="outline"
        className="flex-1 bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-xl h-11"
      >
        {copied ? <Check className="w-4 h-4 mr-2 text-emerald-400" /> : <Copy className="w-4 h-4 mr-2" />}
        {copied ? "Copied!" : "Copy Quote"}
      </Button>
      <Button
        onClick={handleSave}
        disabled={saving}
        className="flex-1 bg-gradient-to-r from-[#1E73FF] to-[#0056D6] hover:from-[#4A9AFF] hover:to-[#1E73FF] text-white rounded-xl h-11 shadow-lg shadow-[#1E73FF]/20"
      >
        <Save className="w-4 h-4 mr-2" />
        {saving ? "Saving..." : "Save Quote"}
      </Button>
    </motion.div>
  );
}