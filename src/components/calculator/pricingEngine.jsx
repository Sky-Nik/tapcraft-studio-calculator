/**
 * 3D Print Pricing Engine
 * Calculates all cost components and pricing tiers
 */

export const DEFAULT_SETTINGS = {
  vatPercent: 15,
  laborRate: 25,
  materialEfficiency: 1.05,
  printerCost: 500,
  annualMaintenance: 100,
  estimatedLifeYears: 5,
  uptimePercent: 70,
  powerConsumptionWatts: 200,
  electricityCostPerKwh: 0.12,
  bufferFactor: 1.1,
};

export const MARGIN_TIERS = [
  { label: "Competitive", margin: 25, color: "from-emerald-500 to-teal-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
  { label: "Standard", margin: 40, color: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
  { label: "Premium", margin: 60, color: "from-violet-500 to-purple-500", bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400" },
  { label: "Luxury", margin: 80, color: "from-amber-500 to-orange-500", bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
];

export function calculateCosts(inputs, settings = DEFAULT_SETTINGS) {
  const {
    filamentRows = [],
    printTimeHours = 0,
    printTimeMinutes = 0,
    laborTimeMinutes = 0,
    hardwareCost = 0,
    packagingCost = 0,
    batchQuantity = 1,
  } = inputs;

  const s = { ...DEFAULT_SETTINGS, ...settings };

  // Print hours
  const totalPrintHours = printTimeHours + printTimeMinutes / 60;
  const laborHours = laborTimeMinutes / 60;

  // Material cost from all filament rows
  const materialCost = filamentRows.reduce((total, row) => {
    const usageG = row.usage || 0;
    const costPerKg = row.costPerKg || 0;
    return total + (usageG * (costPerKg / 1000));
  }, 0) * s.materialEfficiency;

  // Total material weight
  const totalMaterialWeight = filamentRows.reduce((sum, row) => sum + (row.usage || 0), 0);

  // Electricity cost
  const electricityCost = (s.powerConsumptionWatts / 1000) * totalPrintHours * s.electricityCostPerKwh;

  // Machine depreciation per hour
  const uptimeHoursPerYear = s.uptimePercent / 100 * 365 * 24;
  const yearlyDepreciation = (s.printerCost / s.estimatedLifeYears) + s.annualMaintenance;
  const machineRatePerHour = uptimeHoursPerYear > 0 ? yearlyDepreciation / uptimeHoursPerYear : 0;
  const machineCost = machineRatePerHour * totalPrintHours + electricityCost;

  // Labor cost
  const laborCost = s.laborRate * laborHours;

  // Unit base cost (for one unit)
  const unitBaseCost = (materialCost + laborCost + machineCost + hardwareCost + packagingCost) * s.bufferFactor;

  // Batch total cost
  const batchBaseCost = unitBaseCost * batchQuantity;

  // Calculate pricing tiers (CORRECTED BATCH LOGIC)
  const pricingTiers = MARGIN_TIERS.map((tier) => {
    const profit = (tier.margin / 100) * batchBaseCost;
    const subtotalWithProfit = batchBaseCost + profit;
    const vat = (s.vatPercent / 100) * subtotalWithProfit;
    const grandTotal = subtotalWithProfit + vat;
    const unitSellPrice = grandTotal / batchQuantity;
    
    return {
      ...tier,
      price: subtotalWithProfit,
      profit,
      priceWithVat: grandTotal,
      unitPrice: unitSellPrice,
      unitPriceWithVat: unitSellPrice,
    };
  });

  // Cost breakdown for chart
  const breakdown = [
    { label: "Material", value: materialCost, color: "#8b5cf6" },
    { label: "Labor", value: laborCost, color: "#6366f1" },
    { label: "Machine", value: machineCost, color: "#a78bfa" },
    { label: "Hardware", value: hardwareCost, color: "#818cf8" },
    { label: "Packaging", value: packagingCost, color: "#c4b5fd" },
  ].filter((item) => item.value > 0);

  return {
    materialCost,
    electricityCost,
    machineCost,
    laborCost,
    hardwareCost: hardwareCost,
    packagingCost: packagingCost,
    subtotal: unitBaseCost,
    totalCost: batchBaseCost,
    unitCost: unitBaseCost,
    pricingTiers,
    breakdown,
    totalPrintHours,
    laborHours,
    totalMaterialWeight,
  };
}

export function calculateCustomPrice(totalCost, marginPercent, vatPercent = 15) {
  const price = totalCost / (1 - marginPercent / 100);
  const priceWithVat = price * (1 + vatPercent / 100);
  return { price, priceWithVat, profit: price - totalCost };
}