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
    materialWeightG = 0,
    costPerKg = 0,
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

  // Material cost
  const materialCost = (materialWeightG * (costPerKg / 1000)) * s.materialEfficiency;

  // Electricity cost
  const electricityCost = (s.powerConsumptionWatts / 1000) * totalPrintHours * s.electricityCostPerKwh;

  // Machine depreciation per hour
  const uptimeHoursPerYear = s.uptimePercent / 100 * 365 * 24;
  const yearlyDepreciation = (s.printerCost / s.estimatedLifeYears) + s.annualMaintenance;
  const machineRatePerHour = uptimeHoursPerYear > 0 ? yearlyDepreciation / uptimeHoursPerYear : 0;
  const machineCost = machineRatePerHour * totalPrintHours + electricityCost;

  // Labor cost
  const laborCost = s.laborRate * laborHours;

  // Subtotal before buffer
  const subtotal = materialCost + laborCost + machineCost + hardwareCost + packagingCost;

  // Apply buffer factor
  const totalCost = subtotal * s.bufferFactor;

  // Per-unit cost for batch
  const unitCost = batchQuantity > 1 ? totalCost / batchQuantity : totalCost;

  // Calculate pricing tiers
  const pricingTiers = MARGIN_TIERS.map((tier) => {
    const price = totalCost / (1 - tier.margin / 100);
    const profit = price - totalCost;
    const priceWithVat = price * (1 + s.vatPercent / 100);
    return {
      ...tier,
      price,
      profit,
      priceWithVat,
      unitPrice: batchQuantity > 1 ? price / batchQuantity : price,
      unitPriceWithVat: batchQuantity > 1 ? priceWithVat / batchQuantity : priceWithVat,
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
    subtotal,
    totalCost,
    unitCost,
    pricingTiers,
    breakdown,
    totalPrintHours,
    laborHours,
  };
}

export function calculateCustomPrice(totalCost, marginPercent, vatPercent = 15) {
  const price = totalCost / (1 - marginPercent / 100);
  const priceWithVat = price * (1 + vatPercent / 100);
  return { price, priceWithVat, profit: price - totalCost };
}