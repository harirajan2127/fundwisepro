export interface EquityTaxInputs {
  purchasePrice: number;
  salePrice: number;
  holdingPeriodMonths: number;
  otherRealizedLTCGInFY?: number; // toward ₹1.25L exemption
}

export interface EquityTaxResult {
  investedAmount: number;
  saleValue: number;
  totalGain: number;
  isLoss: boolean;
  gainType: 'STCG' | 'LTCG';
  taxRatePct: number;
  applicableExemption: number;
  taxableGain: number;
  estimatedTax: number;
  effectiveTaxRatePct: number;
  netPostTaxGain: number;
  ruleExplanation: string;
}

/**
 * Calculates Indian Equity Mutual Fund Tax post Budget 2024:
 * STCG (<=12m): 20%
 * LTCG (>12m): 12.5% on gains exceeding ₹1.25 Lakhs annual exemption
 */
export function calculateEquityTax(inputs: EquityTaxInputs): EquityTaxResult {
  const { purchasePrice, salePrice, holdingPeriodMonths, otherRealizedLTCGInFY = 0 } = inputs;

  const totalGain = salePrice - purchasePrice;
  const isLoss = totalGain <= 0;

  if (isLoss) {
    return {
      investedAmount: purchasePrice,
      saleValue: salePrice,
      totalGain,
      isLoss: true,
      gainType: holdingPeriodMonths <= 12 ? 'STCG' : 'LTCG',
      taxRatePct: holdingPeriodMonths <= 12 ? 20 : 12.5,
      applicableExemption: 0,
      taxableGain: 0,
      estimatedTax: 0,
      effectiveTaxRatePct: 0,
      netPostTaxGain: totalGain,
      ruleExplanation: 'No tax is payable on capital loss. Loss can be carried forward up to 8 assessment years.',
    };
  }

  const isLTCG = holdingPeriodMonths > 12;

  if (!isLTCG) {
    // STCG: Flat 20% (Budget 2024)
    const tax = Math.round(totalGain * 0.2);
    return {
      investedAmount: purchasePrice,
      saleValue: salePrice,
      totalGain,
      isLoss: false,
      gainType: 'STCG',
      taxRatePct: 20,
      applicableExemption: 0,
      taxableGain: totalGain,
      estimatedTax: tax,
      effectiveTaxRatePct: 20,
      netPostTaxGain: totalGain - tax,
      ruleExplanation: 'Units held for 12 months or less attract Short-Term Capital Gains (STCG) tax at 20% (Budget 2024 rate).',
    };
  } else {
    // LTCG: 12.5% on gains exceeding ₹1.25 Lakh exemption limit
    const availableExemption = Math.max(0, 125000 - otherRealizedLTCGInFY);
    const applicableExemption = Math.min(totalGain, availableExemption);
    const taxableGain = Math.max(0, totalGain - applicableExemption);
    const tax = Math.round(taxableGain * 0.125);
    const effectiveTaxRate = totalGain > 0 ? (tax / totalGain) * 100 : 0;

    return {
      investedAmount: purchasePrice,
      saleValue: salePrice,
      totalGain,
      isLoss: false,
      gainType: 'LTCG',
      taxRatePct: 12.5,
      applicableExemption,
      taxableGain,
      estimatedTax: tax,
      effectiveTaxRatePct: Number(effectiveTaxRate.toFixed(2)),
      netPostTaxGain: totalGain - tax,
      ruleExplanation: 'Units held over 12 months qualify for Long-Term Capital Gains (LTCG) tax at 12.5% on gains exceeding the ₹1,25,000 threshold (Finance Act 2024).',
    };
  }
}

/**
 * Expense Ratio Drag Analysis (Direct vs Regular Plan)
 */
export function calculateDirectVsRegular(
  monthlySIP: number,
  years: number,
  grossReturnRate: number = 13,
  directExpenseRatio: number = 0.6,
  regularExpenseRatio: number = 1.8
) {
  const directNetReturn = Math.max(0, grossReturnRate - directExpenseRatio);
  const regularNetReturn = Math.max(0, grossReturnRate - regularExpenseRatio);

  const months = years * 12;
  const directMonthlyRate = directNetReturn / 12 / 100;
  const regularMonthlyRate = regularNetReturn / 12 / 100;

  let directCorpus = 0;
  let regularCorpus = 0;
  const totalInvested = monthlySIP * months;

  const comparisonData = [];

  for (let m = 1; m <= months; m++) {
    directCorpus = (directCorpus + monthlySIP) * (1 + directMonthlyRate);
    regularCorpus = (regularCorpus + monthlySIP) * (1 + regularMonthlyRate);

    if (m % 12 === 0) {
      const yr = m / 12;
      comparisonData.push({
        year: yr,
        directCorpus: Math.round(directCorpus),
        regularCorpus: Math.round(regularCorpus),
        wealthDifference: Math.round(directCorpus - regularCorpus),
      });
    }
  }

  const lostWealth = Math.round(directCorpus - regularCorpus);
  const percentageLost = directCorpus > 0 ? ((lostWealth / directCorpus) * 100) : 0;

  return {
    totalInvested,
    directNetReturn,
    regularNetReturn,
    directMaturityValue: Math.round(directCorpus),
    regularMaturityValue: Math.round(regularCorpus),
    lostWealth,
    percentageLost: Number(percentageLost.toFixed(1)),
    comparisonData,
  };
}

/**
 * ELSS Section 80C Tax-Saving Estimator
 */
export function calculateELSSTaxSaving(
  investmentAmount: number,
  taxSlabPct: number = 30, // 5, 10, 15, 20, 30
  existing80CDeduction: number = 0
) {
  const maxEligible80C = 150000;
  const remaining80CSpace = Math.max(0, maxEligible80C - existing80CDeduction);
  const eligibleAmount = Math.min(investmentAmount, remaining80CSpace);
  const taxSaved = Math.round(eligibleAmount * (taxSlabPct / 100));

  return {
    investmentAmount,
    eligibleAmount,
    taxSaved,
    effectiveInvestmentCost: investmentAmount - taxSaved,
    lockInYears: 3,
    note: 'Under the Old Tax Regime, Section 80C allows deductions up to ₹1.5 Lakhs per financial year. 3-year lock-in applies.',
  };
}
