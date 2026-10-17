import type { AmortizationRow } from '../types';

export interface LumpsumInputs {
  investmentAmount: number;
  expectedReturnRate: number; // Annual %
  timePeriodYears: number;
  compoundingFrequency?: 'annual' | 'semi-annual' | 'quarterly' | 'monthly';
  inflationRate?: number;
}

export interface LumpsumResult {
  investedAmount: number;
  estimatedReturns: number;
  totalMaturityValue: number;
  inflationAdjustedValue: number;
  simpleInterestEquivalent: number;
  doublingYears: number;
  triplingYears: number;
  schedule: AmortizationRow[];
  yearlyChartData: {
    year: number;
    invested: number;
    interest: number;
    total: number;
    realValue: number;
  }[];
}

export function calculateLumpsum(inputs: LumpsumInputs): LumpsumResult {
  const {
    investmentAmount,
    expectedReturnRate,
    timePeriodYears,
    compoundingFrequency = 'annual',
    inflationRate = 0,
  } = inputs;

  let freqPerYear = 1;
  if (compoundingFrequency === 'semi-annual') freqPerYear = 2;
  if (compoundingFrequency === 'quarterly') freqPerYear = 4;
  if (compoundingFrequency === 'monthly') freqPerYear = 12;

  const totalPeriods = Math.max(1, Math.round(timePeriodYears * freqPerYear));
  const ratePerPeriod = expectedReturnRate > 0 ? expectedReturnRate / freqPerYear / 100 : 0;

  let currentBalance = investmentAmount;
  const schedule: AmortizationRow[] = [];
  const yearlyChartData: LumpsumResult['yearlyChartData'] = [];

  let yearOpeningBalance = investmentAmount;
  let yearInterestAccrued = 0;

  for (let period = 1; period <= totalPeriods; period++) {
    const interest = currentBalance * ratePerPeriod;
    currentBalance += interest;
    yearInterestAccrued += interest;

    if (period % freqPerYear === 0 || period === totalPeriods) {
      const year = Math.ceil(period / freqPerYear);
      const discountFactor = Math.pow(1 + inflationRate / 100, year);
      const realValue = currentBalance / discountFactor;

      schedule.push({
        period: year,
        periodLabel: `Year ${year}`,
        openingBalance: Math.round(yearOpeningBalance),
        contribution: 0,
        interestEarned: Math.round(yearInterestAccrued),
        totalInvested: Math.round(investmentAmount),
        closingBalance: Math.round(currentBalance),
        inflationAdjustedBalance: Math.round(realValue),
      });

      yearlyChartData.push({
        year,
        invested: Math.round(investmentAmount),
        interest: Math.round(currentBalance - investmentAmount),
        total: Math.round(currentBalance),
        realValue: Math.round(realValue),
      });

      yearOpeningBalance = currentBalance;
      yearInterestAccrued = 0;
    }
  }

  const finalRealValue = currentBalance / Math.pow(1 + inflationRate / 100, timePeriodYears);
  const simpleInterestTotal = investmentAmount + (investmentAmount * (expectedReturnRate / 100) * timePeriodYears);

  // Exact logarithmic doubling time
  const rDecimal = expectedReturnRate / 100;
  const doublingYears = rDecimal > 0 ? Math.log(2) / Math.log(1 + rDecimal) : 0;
  const triplingYears = rDecimal > 0 ? Math.log(3) / Math.log(1 + rDecimal) : 0;

  return {
    investedAmount: Math.round(investmentAmount),
    estimatedReturns: Math.round(currentBalance - investmentAmount),
    totalMaturityValue: Math.round(currentBalance),
    inflationAdjustedValue: Math.round(finalRealValue),
    simpleInterestEquivalent: Math.round(simpleInterestTotal),
    doublingYears: Number(doublingYears.toFixed(2)),
    triplingYears: Number(triplingYears.toFixed(2)),
    schedule,
    yearlyChartData,
  };
}
