import React, { useState, useMemo } from "react";
import EtsyRevenueCard from "../components/etsy/EtsyRevenueCard";
import EtsyCostsCard from "../components/etsy/EtsyCostsCard";
import EtsyAdvancedSettings from "../components/etsy/EtsyAdvancedSettings";
import EtsyProfitAnalysis from "../components/etsy/EtsyProfitAnalysis";
import EtsyFeeBreakdown from "../components/etsy/EtsyFeeBreakdown";
import { calculateEtsyMetrics, DEFAULT_ETSY_SETTINGS } from "../components/etsy/etsyCalculations";

export default function EtsyCalculator() {
  const [form, setForm] = useState({
    productName: "",
    productPrice: 0,
    shippingPrice: 0,
    discount: 0,
    productCost: 0,
    shippingCost: 0,
    packagingCost: 0,
    targetProfit: 0,
  });

  const [settings, setSettings] = useState({ ...DEFAULT_ETSY_SETTINGS });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const metrics = useMemo(() => {
    return calculateEtsyMetrics(form, settings);
  }, [form, settings]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-[1600px] mx-auto">
      {/* Left Panel — Input Forms */}
      <div className="xl:col-span-5 space-y-6">
        <EtsyRevenueCard form={form} setForm={setForm} />
        <EtsyCostsCard form={form} setForm={setForm} />
        <EtsyAdvancedSettings
          settings={settings}
          setSettings={setSettings}
          showAdvanced={showAdvanced}
          setShowAdvanced={setShowAdvanced}
        />
      </div>

      {/* Right Panel — Results */}
      <div className="xl:col-span-7 space-y-6">
        <EtsyProfitAnalysis metrics={metrics} />
        <EtsyFeeBreakdown metrics={metrics} />
      </div>
    </div>
  );
}