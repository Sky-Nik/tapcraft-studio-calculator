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
import TotalOverviewCard from "../components/calculator/TotalOverviewCard";
import { calculateCosts, DEFAULT_SETTINGS } from "../components/calculator/pricingEngine";

export default function Calculator() {
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  const [inputs, setInputs] = useState({
    partName: "",
    category: "",
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

  // Persist inputs to localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('calculator_inputs');
    const savedMargin = localStorage.getItem('calculator_customMargin');
    const savedAdvanced = localStorage.getItem('calculator_advancedSettings');
    if (saved) {
      try { setInputs(JSON.parse(saved)); } catch {}
    }
    if (savedMargin) setCustomMargin(parseFloat(savedMargin));
    if (savedAdvanced) {
      try { setAdvancedSettings(JSON.parse(savedAdvanced)); } catch {}
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem('calculator_inputs', JSON.stringify(inputs));
  }, [inputs]);

  React.useEffect(() => {
    localStorage.setItem('calculator_customMargin', String(customMargin));
  }, [customMargin]);

  React.useEffect(() => {
    localStorage.setItem('calculator_advancedSettings', JSON.stringify(advancedSettings));
  }, [advancedSettings]);

  // Check for edit mode on mount
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    const quoteData = urlParams.get('data');
    
    if (editId && quoteData) {
      try {
        const quote = JSON.parse(decodeURIComponent(quoteData));
        setEditingQuoteId(editId);
        setInputs({
          partName: quote.part_name || "",
          category: quote.category || "",
          printerProfile: quote.printer_profile || "",
          filamentRows: [],
          printTimeHours: Math.floor((quote.print_time_minutes || 0) / 60),
          printTimeMinutes: (quote.print_time_minutes || 0) % 60,
          laborTimeMinutes: quote.labor_time_minutes || 0,
          selectedHardware: [],
          selectedPackaging: [],
          batchEnabled: (quote.batch_quantity || 1) > 1,
          batchQuantity: quote.batch_quantity || 1,
        });
        setCustomMargin(quote.selected_margin || 40);
        if (quote.vat_percent !== undefined) {
          setAdvancedSettings(prev => ({ ...prev, vatPercent: quote.vat_percent }));
        }
      } catch (err) {
        console.error('Failed to load quote for editing:', err);
      }
    }
  }, []);

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

  // Calculate total inventory investment (printers + hardware + filaments + packaging)
  const totalInventoryInvestment = useMemo(() => {
    const printersTotal = printerProfiles.reduce((sum, printer) => sum + (printer.printer_cost || 0), 0);
    const hardwareTotal = hardwareItems.reduce((sum, item) => sum + ((item.unit_cost || 0) * (item.stock_quantity || 0)), 0);
    const filamentsTotal = filamentTypes.reduce((sum, fil) => sum + ((fil.cost_per_kg || 0) * (fil.stock_kg || 0)), 0);
    const packagingTotal = packagingItems.reduce((sum, pkg) => sum + ((pkg.unit_cost || 0) * (pkg.stock_quantity || 0)), 0);
    return printersTotal + hardwareTotal + filamentsTotal + packagingTotal;
  }, [printerProfiles, hardwareItems, filamentTypes, packagingItems]);

  // Get selected printer cost
  const selectedPrinterCost = useMemo(() => {
    const printer = printerProfiles.find(p => p.id === inputs.printerProfile);
    return printer?.printer_cost || 0;
  }, [printerProfiles, inputs.printerProfile]);

  // Calculate total hardware cost from selected items (with qty)
  const totalHardwareCost = useMemo(() => {
    return inputs.selectedHardware.reduce((total, hw) => {
      const item = hardwareItems.find(h => h.id === hw.id);
      return total + (item?.unit_cost || 0) * (hw.qty || 1);
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
      filamentRows: enrichedFilamentRows,
      hardwareCost: totalHardwareCost,
      packagingCost: totalPackagingCost
    }, advancedSettings);
  }, [inputs, advancedSettings, totalHardwareCost, totalPackagingCost, enrichedFilamentRows]);

  const batchQty = inputs.batchEnabled ? inputs.batchQuantity : 1;

  const handleReset = () => {
    const defaultInputs = {
      partName: "",
      category: "",
      printerProfile: "",
      filamentRows: [],
      printTimeHours: 0,
      printTimeMinutes: 0,
      laborTimeMinutes: 0,
      selectedHardware: [],
      selectedPackaging: [],
      batchEnabled: false,
      batchQuantity: 1,
    };
    setInputs(defaultInputs);
    setCustomMargin(40);
    setAdvancedSettings({ ...DEFAULT_SETTINGS });
    setBatchDiscount(0);
    setEditingQuoteId(null);
    localStorage.removeItem('calculator_inputs');
    localStorage.removeItem('calculator_customMargin');
    localStorage.removeItem('calculator_advancedSettings');
    // Clear URL params if in edit mode
    if (window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

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
        <CalculatedMetrics 
          costs={costs} 
          advancedSettings={advancedSettings} 
          totalInventoryInvestment={totalInventoryInvestment}
          selectedPrinterCost={selectedPrinterCost}
          totalHardwareCost={totalHardwareCost}
        />

        {/* Total Overview */}
        <TotalOverviewCard
          costs={costs}
          advancedSettings={advancedSettings}
          customMargin={customMargin}
          batchQuantity={batchQty}
        />

        {/* Actions */}
        <QuoteActions
          inputs={inputs}
          costs={costs}
          advancedSettings={advancedSettings}
          customMargin={customMargin}
          filamentTypes={filamentTypes}
          editingQuoteId={editingQuoteId}
        />
      </div>
    </div>
  );
}