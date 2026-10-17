export function calculateCAGR(initialValue: number, finalValue: number, years: number): number {
  if (initialValue <= 0 || finalValue <= 0 || years <= 0) return 0;
  const cagr = Math.pow(finalValue / initialValue, 1 / years) - 1;
  return Number((cagr * 100).toFixed(2));
}

export function calculateAbsoluteReturn(initialValue: number, finalValue: number): number {
  if (initialValue <= 0) return 0;
  const ret = ((finalValue - initialValue) / initialValue) * 100;
  return Number(ret.toFixed(2));
}

export function calculateRealReturn(nominalReturnPct: number, inflationPct: number): number {
  const nominal = nominalReturnPct / 100;
  const inflation = inflationPct / 100;
  const real = (1 + nominal) / (1 + inflation) - 1;
  return Number((real * 100).toFixed(2));
}

export function calculatePostTaxReturn(preTaxReturnPct: number, taxRatePct: number): number {
  const postTax = preTaxReturnPct * (1 - taxRatePct / 100);
  return Number(postTax.toFixed(2));
}

export function calculateInflationImpact(amount: number, inflationPct: number, years: number) {
  const futureCost = amount * Math.pow(1 + inflationPct / 100, years);
  const purchasingPower = amount / Math.pow(1 + inflationPct / 100, years);
  const purchasingPowerLossPct = ((amount - purchasingPower) / amount) * 100;

  const yearlyData = [];
  for (let y = 1; y <= years; y++) {
    yearlyData.push({
      year: y,
      futureCost: Math.round(amount * Math.pow(1 + inflationPct / 100, y)),
      purchasingPower: Math.round(amount / Math.pow(1 + inflationPct / 100, y)),
    });
  }

  return {
    originalAmount: amount,
    futureCost: Math.round(futureCost),
    purchasingPower: Math.round(purchasingPower),
    purchasingPowerLossPct: Number(purchasingPowerLossPct.toFixed(1)),
    yearlyData,
  };
}
