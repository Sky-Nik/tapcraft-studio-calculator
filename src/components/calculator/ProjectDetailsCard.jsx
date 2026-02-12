import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, ChevronDown, ChevronRight, Layers, FileText, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

function FieldWithTooltip({ label, tooltip, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label className="text-xs font-medium text-slate-400">{label}</Label>
        {tooltip && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 text-slate-600 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px] text-xs bg-slate-800 border-slate-700">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {children}
    </div>
  );
}

const inputClass = "bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-600 rounded-xl h-10 text-sm focus:border-violet-500/50 focus:ring-violet-500/20 input-glow transition-all";

export default function ProjectDetailsCard({
  inputs,
  setInputs,
  advancedSettings,
  setAdvancedSettings,
  showAdvanced,
  setShowAdvanced,
  printerProfiles,
  filamentTypes,
  hardwareItems,
  packagingItems,
  totalHardwareCost,
  totalPackagingCost,
}) {
  const handleInput = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdvanced = (field, value) => {
    setAdvancedSettings((prev) => ({ ...prev, [field]: value }));
  };

  const addHardwareItem = (itemId) => {
    if (itemId && !inputs.selectedHardware.includes(itemId)) {
      setInputs((prev) => ({
        ...prev,
        selectedHardware: [...prev.selectedHardware, itemId],
      }));
    }
  };

  const removeHardwareItem = (itemId) => {
    setInputs((prev) => ({
      ...prev,
      selectedHardware: prev.selectedHardware.filter((id) => id !== itemId),
    }));
  };

  const addPackagingItem = (itemId) => {
    if (itemId && !inputs.selectedPackaging.includes(itemId)) {
      setInputs((prev) => ({
        ...prev,
        selectedPackaging: [...prev.selectedPackaging, itemId],
      }));
    }
  };

  const removePackagingItem = (itemId) => {
    setInputs((prev) => ({
      ...prev,
      selectedPackaging: prev.selectedPackaging.filter((id) => id !== itemId),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Project Details Card */}
      <div className="bg-[hsl(224,20%,9%)] rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-violet-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">Project Details</h3>
        </div>

        <div className="p-5 space-y-4">
          <FieldWithTooltip label="Part Name" tooltip="A descriptive name for the part being quoted">
            <Input
              className={inputClass}
              placeholder="Enter part name..."
              value={inputs.partName}
              onChange={(e) => handleInput("partName", e.target.value)}
            />
          </FieldWithTooltip>

          <FieldWithTooltip label="Printer Profile" tooltip="Select which printer will be used">
            <Select value={inputs.printerProfile} onValueChange={(v) => handleInput("printerProfile", v)}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select printer" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {printerProfiles.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-slate-200 focus:bg-violet-500/20 focus:text-white">
                    {p.name}
                  </SelectItem>
                ))}
                {printerProfiles.length === 0 && (
                  <SelectItem value="default" className="text-slate-400">Default Printer</SelectItem>
                )}
              </SelectContent>
            </Select>
          </FieldWithTooltip>

          <FieldWithTooltip label="Filament Materials" tooltip="Add one or more filaments used">
            <div className="space-y-2">
              <Select onValueChange={(filamentId) => {
                const filament = filamentTypes.find(f => f.id === filamentId);
                if (filament) {
                  setInputs(prev => ({
                    ...prev,
                    filamentRows: [...prev.filamentRows, { filamentId, usage: 0 }]
                  }));
                }
              }}>
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="Add filament..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {filamentTypes.map((f) => (
                    <SelectItem key={f.id} value={f.id} className="text-slate-200 focus:bg-violet-500/20 focus:text-white">
                      {f.name} - {f.material} - ${f.cost_per_kg}/kg
                    </SelectItem>
                  ))}
                  {filamentTypes.length === 0 && (
                    <SelectItem value="none" disabled className="text-slate-500">No filaments in inventory</SelectItem>
                  )}
                </SelectContent>
              </Select>

              {inputs.filamentRows.length > 0 && (
                <div className="space-y-1.5">
                  {inputs.filamentRows.map((row, idx) => {
                    const filament = filamentTypes.find(f => f.id === row.filamentId);
                    return (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <div className="flex-1">
                          <p className="text-xs text-slate-300 font-medium">{filament?.name || 'Unknown'}</p>
                          <p className="text-[10px] text-slate-500">${filament?.cost_per_kg || 0}/kg (auto)</p>
                        </div>
                        <Input
                          type="number"
                          placeholder="0"
                          className="w-20 h-8 text-xs bg-slate-900/50"
                          value={row.usage || ""}
                          onChange={(e) => {
                            const newRows = [...inputs.filamentRows];
                            newRows[idx].usage = parseFloat(e.target.value) || 0;
                            setInputs(prev => ({ ...prev, filamentRows: newRows }));
                          }}
                        />
                        <span className="text-[10px] text-slate-500 w-6">g</span>
                        <button
                          onClick={() => {
                            setInputs(prev => ({
                              ...prev,
                              filamentRows: prev.filamentRows.filter((_, i) => i !== idx)
                            }));
                          }}
                          className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/30">
                    <span className="text-xs font-semibold text-violet-300">Total Material</span>
                    <span className="text-sm font-bold text-violet-400">
                      {inputs.filamentRows.reduce((sum, r) => sum + (r.usage || 0), 0).toFixed(1)}g
                    </span>
                  </div>
                </div>
              )}
            </div>
          </FieldWithTooltip>

          <FieldWithTooltip label="Printing Time" tooltip="Total estimated print time">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Input
                  type="number"
                  className={cn(inputClass, "pr-10")}
                  placeholder="0"
                  value={inputs.printTimeHours || ""}
                  onChange={(e) => handleInput("printTimeHours", parseFloat(e.target.value) || 0)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">hrs</span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  className={cn(inputClass, "pr-10")}
                  placeholder="0"
                  value={inputs.printTimeMinutes || ""}
                  onChange={(e) => handleInput("printTimeMinutes", parseFloat(e.target.value) || 0)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">min</span>
              </div>
            </div>
          </FieldWithTooltip>

          <FieldWithTooltip label="Labor Time (mins)" tooltip="Post-processing, cleaning, support removal">
            <Input
              type="number"
              className={inputClass}
              placeholder="0"
              value={inputs.laborTimeMinutes || ""}
              onChange={(e) => handleInput("laborTimeMinutes", parseFloat(e.target.value) || 0)}
            />
          </FieldWithTooltip>

          <FieldWithTooltip label="Hardware Items" tooltip="Select hardware components used">
            <div className="space-y-2">
              <Select onValueChange={addHardwareItem}>
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="Add hardware..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {hardwareItems
                    .filter((item) => !inputs.selectedHardware.includes(item.id))
                    .map((item) => (
                      <SelectItem
                        key={item.id}
                        value={item.id}
                        className="text-slate-200 focus:bg-violet-500/20 focus:text-white"
                      >
                        {item.name} - ${item.unit_cost?.toFixed(2) || "0.00"}
                      </SelectItem>
                    ))}
                  {hardwareItems.filter((item) => !inputs.selectedHardware.includes(item.id)).length === 0 && (
                    <SelectItem value="none" disabled className="text-slate-500">
                      No more items available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              {inputs.selectedHardware.length > 0 && (
                <div className="space-y-1.5">
                  {inputs.selectedHardware.map((hwId) => {
                    const item = hardwareItems.find((h) => h.id === hwId);
                    if (!item) return null;
                    return (
                      <div
                        key={hwId}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50"
                      >
                        <span className="text-xs text-slate-300">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-violet-400 font-medium">
                            ${item.unit_cost?.toFixed(2) || "0.00"}
                          </span>
                          <button
                            onClick={() => removeHardwareItem(hwId)}
                            className="w-5 h-5 rounded flex items-center justify-center hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/30">
                    <span className="text-xs font-semibold text-violet-300">Total Hardware Cost</span>
                    <span className="text-sm font-bold text-violet-400">${totalHardwareCost.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </FieldWithTooltip>

          <FieldWithTooltip label="Packaging Items" tooltip="Select packaging materials used">
            <div className="space-y-2">
              <Select onValueChange={addPackagingItem}>
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="Add packaging..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {packagingItems
                    .filter((item) => !inputs.selectedPackaging.includes(item.id))
                    .map((item) => (
                      <SelectItem
                        key={item.id}
                        value={item.id}
                        className="text-slate-200 focus:bg-violet-500/20 focus:text-white"
                      >
                        {item.name} - ${item.unit_cost?.toFixed(2) || "0.00"}
                      </SelectItem>
                    ))}
                  {packagingItems.filter((item) => !inputs.selectedPackaging.includes(item.id)).length === 0 && (
                    <SelectItem value="none" disabled className="text-slate-500">
                      No more items available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              {inputs.selectedPackaging.length > 0 && (
                <div className="space-y-1.5">
                  {inputs.selectedPackaging.map((pkgId) => {
                    const item = packagingItems.find((p) => p.id === pkgId);
                    if (!item) return null;
                    return (
                      <div
                        key={pkgId}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50"
                      >
                        <span className="text-xs text-slate-300">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-violet-400 font-medium">
                            ${item.unit_cost?.toFixed(2) || "0.00"}
                          </span>
                          <button
                            onClick={() => removePackagingItem(pkgId)}
                            className="w-5 h-5 rounded flex items-center justify-center hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/30">
                    <span className="text-xs font-semibold text-violet-300">Total Packaging Cost</span>
                    <span className="text-sm font-bold text-violet-400">${totalPackagingCost.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </FieldWithTooltip>

          {/* Batch toggle */}
          <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-800/30 border border-white/[0.04]">
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4 text-violet-400" />
              <div>
                <p className="text-sm font-medium text-slate-300">Batch Production</p>
                <p className="text-[11px] text-slate-500">Calculate for multiple units</p>
              </div>
            </div>
            <Switch
              checked={inputs.batchEnabled}
              onCheckedChange={(v) => handleInput("batchEnabled", v)}
            />
          </div>

          {inputs.batchEnabled && (
            <FieldWithTooltip label="Batch Quantity" tooltip="Number of units in the batch">
              <Input
                type="number"
                className={inputClass}
                placeholder="1"
                min="1"
                value={inputs.batchQuantity || ""}
                onChange={(e) => handleInput("batchQuantity", Math.max(1, parseInt(e.target.value) || 1))}
              />
            </FieldWithTooltip>
          )}
        </div>
      </div>

      {/* Advanced Settings Card */}
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
            {showAdvanced ? "Collapse" : "Expand"}
          </span>
        </button>

        {showAdvanced && (
          <div className="p-5 pt-0 space-y-4 border-t border-white/[0.04]">
            <div className="pt-4 grid grid-cols-2 gap-3">
              <FieldWithTooltip label="VAT %" tooltip="Value Added Tax percentage">
                <Input type="number" className={inputClass} value={advancedSettings.vatPercent || ""} onChange={(e) => handleAdvanced("vatPercent", parseFloat(e.target.value) || 0)} />
              </FieldWithTooltip>
              <FieldWithTooltip label="Labor Rate ($/hr)" tooltip="Cost per hour for labor">
                <Input type="number" className={inputClass} value={advancedSettings.laborRate || ""} onChange={(e) => handleAdvanced("laborRate", parseFloat(e.target.value) || 0)} />
              </FieldWithTooltip>
              <FieldWithTooltip label="Material Efficiency" tooltip="Factor for material waste (1.05 = 5% waste)">
                <Input type="number" step="0.01" className={inputClass} value={advancedSettings.materialEfficiency || ""} onChange={(e) => handleAdvanced("materialEfficiency", parseFloat(e.target.value) || 1)} />
              </FieldWithTooltip>
              <FieldWithTooltip label="Printer Cost ($)" tooltip="Purchase price of the printer">
                <Input type="number" className={inputClass} value={advancedSettings.printerCost || ""} onChange={(e) => handleAdvanced("printerCost", parseFloat(e.target.value) || 0)} />
              </FieldWithTooltip>
              <FieldWithTooltip label="Annual Maintenance ($)" tooltip="Yearly maintenance and parts cost">
                <Input type="number" className={inputClass} value={advancedSettings.annualMaintenance || ""} onChange={(e) => handleAdvanced("annualMaintenance", parseFloat(e.target.value) || 0)} />
              </FieldWithTooltip>
              <FieldWithTooltip label="Estimated Life (yrs)" tooltip="Expected lifespan of the printer">
                <Input type="number" className={inputClass} value={advancedSettings.estimatedLifeYears || ""} onChange={(e) => handleAdvanced("estimatedLifeYears", parseFloat(e.target.value) || 1)} />
              </FieldWithTooltip>
              <FieldWithTooltip label="Uptime %" tooltip="Percentage of time the printer is operational">
                <Input type="number" className={inputClass} value={advancedSettings.uptimePercent || ""} onChange={(e) => handleAdvanced("uptimePercent", parseFloat(e.target.value) || 0)} />
              </FieldWithTooltip>
              <FieldWithTooltip label="Power (W)" tooltip="Printer power consumption in watts">
                <Input type="number" className={inputClass} value={advancedSettings.powerConsumptionWatts || ""} onChange={(e) => handleAdvanced("powerConsumptionWatts", parseFloat(e.target.value) || 0)} />
              </FieldWithTooltip>
              <FieldWithTooltip label="Electricity ($/kWh)" tooltip="Cost per kilowatt-hour">
                <Input type="number" step="0.01" className={inputClass} value={advancedSettings.electricityCostPerKwh || ""} onChange={(e) => handleAdvanced("electricityCostPerKwh", parseFloat(e.target.value) || 0)} />
              </FieldWithTooltip>
              <FieldWithTooltip label="Buffer Factor" tooltip="Safety margin multiplier (1.1 = 10% buffer)">
                <Input type="number" step="0.01" className={inputClass} value={advancedSettings.bufferFactor || ""} onChange={(e) => handleAdvanced("bufferFactor", parseFloat(e.target.value) || 1)} />
              </FieldWithTooltip>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}