import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

import ProjectDetailsCard from "../components/calculator/ProjectDetailsCard";
import PricingTierCards from "../components/calculator/PricingTierCards";
import CustomMarginSlider from "../components/calculator/CustomMarginSlider";
import CostBreakdownGrid from "../components/calculator/CostBreakdownGrid";
import CostAllocationChart from "../components/calculator/CostAllocationChart";
import QuoteActions from "../components/calculator/QuoteActions";
import { calculateCosts, DEFAULT_SETTINGS } from "../components/calculator/pricingEngine";

export default function Calculator() {
  const [inputs, setInputs] = useState({
    partName: "",
    printerProfile: "",
    filamentType: "",
    costPerKg: 25,
    materialWeightG: 0,
    printTimeHours: 0,
    printTimeMinutes: 0,
    laborTimeMinutes: 0,
    hardwareCost: 0,
    packagingCost: 0,
    batchEnabled: false,
    batchQuantity: 1,
  });

  const [advancedSettings, setAdvancedSettings] = useState({ ...DEFAULT_SETTINGS });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customMargin, setCustomMargin] = useState(40);

  const { data: printerProfiles = [] } = useQuery({
    queryKey: ["printerProfiles"],
    queryFn: () => base44.entities.PrinterProfile.list(),
  });

  const { data: filamentTypes = [] } = useQuery({
    queryKey: ["filamentTypes"],
    queryFn: () => base44.entities.FilamentType.list(),
  });

  // Real-time cost calculation
  const costs = useMemo(() => {
    return calculateCosts(inputs, advancedSettings);
  }, [inputs, advancedSettings]);

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

        {/* Cost Breakdown + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CostBreakdownGrid costs={costs} />
          <CostAllocationChart breakdown={costs.breakdown} totalCost={costs.totalCost} />
        </div>

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