import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

import ProjectDetailsCard from "../components/calculator/ProjectDetailsCard";
import PricingTierCards from "../components/calculator/PricingTierCards";
import CustomMarginSlider from "../components/calculator/CustomMarginSlider";
import BatchProductionCard from "../components/calculator/BatchProductionCard";
import CostBreakdownGrid from "../components/calculator/CostBreakdownGrid";
import CostAllocationChart from "../components/calculator/CostAllocationChart";
import QuoteActions from "../components/calculator/QuoteActions";
import CalculatedMetrics from "../components/calculator/CalculatedMetrics";
import { calculateCosts, DEFAULT_SETTINGS } from "../components/calculator/pricingEngine";

export default function Calculator() {
  const [inputs, setInputs] = useState({
    partName: "",
    printerProfile: "",
    filamentRows: [],
    printTimeHours: 0,
    printTimeMinutes: 0,
    laborTimeMinutes: 0,
    selectedHardware: [],
    selectedPackaging: [],
    batchEnabled: false,
    batchQuantity: 1,
  });

  const [advancedSettings, setAdvancedSettings] = useState({ ...DEFAULT_SETTINGS });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customMargin, setCustomMargin] = useState(40);
  const [batchDiscount, setBatchDiscount] = useState(0);

  const { data: printerProfiles = [] } = useQuery({
    queryKey: ["printerProfiles"],
    queryFn: () => base44.entities.PrinterProfile.list(),
  });

  const { data: filamentTypes = [] } = useQuery({
    queryKey: ["filamentTypes"],
    queryFn: () => base44.entities.FilamentType.list(),
  });

  const { data: hardwareItems = [] } = useQuery({
    queryKey: ["hardwareItems"],
    queryFn: () => base44.entities.HardwareItem.list(),
  });

  const { data: packagingItems = [] } = useQuery({
    queryKey: ["packagingItems"],
    queryFn: () => base44.entities.PackagingItem.list(),
  });

  // Calculate total investment from printers
  const totalInvestment = useMemo(() => {
    return printerProfiles.reduce((sum, printer) => sum + (printer.printer_cost || 0), 0);
  }, [printerProfiles]);

  // Calculate total hardware cost from selected items
  const totalHardwareCost = useMemo(() => {
    return inputs.selectedHardware.reduce((total, hwId) => {
      const item = hardwareItems.find(h => h.id === hwId);
      return total + (item?.unit_cost || 0);
    }, 0);
  }, [inputs.selectedHardware, hardwareItems]);

  // Calculate total packaging cost from selected items
  const totalPackagingCost = useMemo(() => {
    return inputs.selectedPackaging.reduce((total, pkgId) => {
      const item = packagingItems.find(p => p.id === pkgId);
      return total + (item?.unit_cost || 0);
    }, 0);
  }, [inputs.selectedPackaging, packagingItems]);

  // Populate filament costs from database
  const enrichedFilamentRows = useMemo(() => {
    return inputs.filamentRows.map(row => {
      const filament = filamentTypes.find(f => f.id === row.filamentId);
      return {
        ...row,
        costPerKg: filament?.cost_per_kg || 0,
        filamentName: filament?.name || '',
      };
    });
  }, [inputs.filamentRows, filamentTypes]);

  // Real-time cost calculation
  const costs = useMemo(() => {
    return calculateCosts({ 
      ...inputs, 
      hardwareCost: totalHardwareCost,
      packagingCost: totalPackagingCost,
      filamentRows: enrichedFilamentRows 
    }, advancedSettings);
  }, [inputs, advancedSettings, totalHardwareCost, totalPackagingCost, enrichedFilamentRows]);

  const batchQty = inputs.batchEnabled ? inputs.batchQuantity : 1;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-[1600px] mx-auto">
      {/* Left Panel — Project Details */}
      <div className="xl:col-span-4">
        <ProjectDetailsCard
          inputs={inputs}
          setInputs={setInputs}
          advancedSettings={advancedSettings}
          setAdvancedSettings={setAdvancedSettings}
          showAdvanced={showAdvanced}
          setShowAdvanced={setShowAdvanced}
          printerProfiles={printerProfiles}
          filamentTypes={filamentTypes}
          hardwareItems={hardwareItems}
          packagingItems={packagingItems}
          totalHardwareCost={totalHardwareCost}
          totalPackagingCost={totalPackagingCost}
        />
      </div>

      {/* Right Panel — Pricing & Breakdown */}
      <div className="xl:col-span-8 space-y-6">
        {/* Pricing Tier Cards */}
        <PricingTierCards pricingTiers={costs.pricingTiers} batchQuantity={batchQty} />

        {/* Custom Margin Slider */}
        <CustomMarginSlider
          totalCost={costs.totalCost}
          vatPercent={advancedSettings.vatPercent}
          customMargin={customMargin}
          setCustomMargin={setCustomMargin}
          batchQuantity={batchQty}
        />

        {/* Batch Production Section */}
        <BatchProductionCard
          unitCost={costs.unitCost}
          batchQuantity={batchQty}
          batchDiscount={batchDiscount}
          setBatchDiscount={setBatchDiscount}
          vatPercent={advancedSettings.vatPercent}
        />

        {/* Cost Breakdown + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CostBreakdownGrid costs={costs} />
          <CostAllocationChart breakdown={costs.breakdown} totalCost={costs.totalCost} />
        </div>

        {/* Calculated Metrics */}
        <CalculatedMetrics costs={costs} advancedSettings={advancedSettings} totalInvestment={totalInvestment} />

        {/* Actions */}
        <QuoteActions
          inputs={inputs}
          costs={costs}
          advancedSettings={advancedSettings}
          customMargin={customMargin}
        />
      </div>
    </div>
  );
}