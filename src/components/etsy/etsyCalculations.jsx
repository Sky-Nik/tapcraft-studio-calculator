export const DEFAULT_ETSY_SETTINGS = {
  sellerLocation: "US",
  listingFee: 0.28,
  transactionFeeRate: 6.5,
  paymentFeeRate: 3,
  paymentFeeFixed: 0.371338607094133,
  vatRate: 20,
  offsiteAdsRate: 15,
  regulatoryFee: 0,
};

export function calculateEtsyMetrics(form, settings = DEFAULT_ETSY_SETTINGS) {
  const {
    productPrice = 0,
    shippingPrice = 0,
    discount = 0,
    productCost = 0,
    shippingCost = 0,
    packagingCost = 0,
  } = form;

  const totalRevenue = productPrice + shippingPrice;
  const discountAmount = totalRevenue * (discount / 100);
  const revenueAfterDiscount = totalRevenue - discountAmount;

  // Etsy Fees
  const listingFee = settings.listingFee;
  const transactionFee = revenueAfterDiscount * (settings.transactionFeeRate / 100);
  const paymentFee = revenueAfterDiscount * (settings.paymentFeeRate / 100) + settings.paymentFeeFixed;
  const regulatoryFee = revenueAfterDiscount * (settings.regulatoryFee / 100);
  const offsiteAdsFee = revenueAfterDiscount * (settings.offsiteAdsRate / 100);

  const totalEtsyFees = listingFee + transactionFee + paymentFee + regulatoryFee;
  const totalEtsyFeesWithAds = totalEtsyFees + offsiteAdsFee;

  // Costs
  const totalCosts = productCost + shippingCost + packagingCost;

  // Profit
  const standardProfit = revenueAfterDiscount - totalEtsyFees - totalCosts;
  const offsiteAdsProfit = revenueAfterDiscount - totalEtsyFeesWithAds - totalCosts;

  // Breakeven
  const breakeven = totalCosts + totalEtsyFees;

  // Target unit profit (user can set this)
  const targetProfit = form.targetProfit || 0;

  // Fee allocation for chart
  const feeAllocation = [
    { label: "Listing Fee", value: listingFee, color: "#f59e0b", percent: totalEtsyFees > 0 ? (listingFee / totalEtsyFees) * 100 : 0 },
    { label: "Transaction Fee", value: transactionFee, color: "#3b82f6", percent: totalEtsyFees > 0 ? (transactionFee / totalEtsyFees) * 100 : 0 },
    { label: "Payment Fee", value: paymentFee, color: "#8b5cf6", percent: totalEtsyFees > 0 ? (paymentFee / totalEtsyFees) * 100 : 0 },
  ].filter(item => item.value > 0);

  if (regulatoryFee > 0) {
    feeAllocation.push({
      label: "Regulatory Fee",
      value: regulatoryFee,
      color: "#ec4899",
      percent: (regulatoryFee / totalEtsyFees) * 100,
    });
  }

  return {
    totalRevenue,
    revenueAfterDiscount,
    listingFee,
    transactionFee,
    paymentFee,
    regulatoryFee,
    offsiteAdsFee,
    totalEtsyFees,
    totalEtsyFeesWithAds,
    totalCosts,
    standardProfit,
    offsiteAdsProfit,
    breakeven,
    targetProfit,
    feeAllocation,
  };
}