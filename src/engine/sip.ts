import type { AmortizationRow } from '../types';

export interface SIPInputs {
  monthlyInvestment: number;
  expectedReturnRate: number; // Annual %
  timePeriodYears: number;
  stepUpPct?: number; // Annual step up percentage (e.g. 10%)
  stepUpAmount?: number; // Annual fixed rupee step up (e.g. 1000)
  inflationRate?: number; // Annual inflation % for real value (e.g. 6%)
}

export interface SIPResult {
  totalInvested: number;
  estimatedReturns: number;
  totalMaturityValue: number;
  inflationAdjustedValue: number;
  schedule: AmortizationRow[];
  yearlyChartData: {
    year: number;
    invested: number;
    interest: number;
    total: number;
    realValue: number;
    monthlyContribution: number;
  }[];
}

/**
 * Calculates standard or step-up SIP with month-by-month compounding and year-end schedules
 */
export function calculateSIP(inputs: SIPInputs): SIPResult {
  const {
    monthlyInvestment,
    expectedReturnRate,
    timePeriodYears,
    stepUpPct = 0,
    stepUpAmount = 0,
    inflationRate = 0,
  } = inputs;

  const totalMonths = Math.max(1, Math.round(timePeriodYears * 12));
  const monthlyRate = expectedReturnRate > 0 ? expectedReturnRate / 12 / 100 : 0;
  const monthlyInflation = inflationRate > 0 ? inflationRate / 12 / 100 : 0;

  let currentMonthlyInvestment = monthlyInvestment;
  let runningBalance = 0;
  let totalInvested = 0;

  const schedule: AmortizationRow[] = [];
  const yearlyChartData: SIPResult['yearlyChartData'] = [];

  let currentYearOpening = 0;
  let currentYearInvested = 0;
  let currentYearInterest = 0;

  for (let month = 1; month <= totalMonths; month++) {
    const currentYear = Math.ceil(month / 12);

    // Apply annual step-up at start of year 2, 3, etc.
    if (month > 1 && (month - 1) % 12 === 0) {
      if (stepUpPct > 0) {
        currentMonthlyInvestment = Math.round(currentMonthlyInvestment * (1 + stepUpPct / 100));
      } else if (stepUpAmount > 0) {
        currentMonthlyInvestment += stepUpAmount;
      }
    }

    // Mutual fund SIP typically deposited at beginning of month
    totalInvested += currentMonthlyInvestment;
    currentYearInvested += currentMonthlyInvestment;

    const balanceBeforeInterest = runningBalance + currentMonthlyInvestment;
    const monthInterest = balanceBeforeInterest * monthlyRate;
    runningBalance = balanceBeforeInterest + monthInterest;
    currentYearInterest += monthInterest;

    // At the end of each 12th month or the final month, record yearly data
    if (month % 12 === 0 || month === totalMonths) {
      const discountFactor = Math.pow(1 + inflationRate / 100, currentYear);
      const realValue = runningBalance / discountFactor;

      schedule.push({
        period: currentYear,
        periodLabel: `Year ${currentYear}`,
        openingBalance: Math.round(currentYearOpening),
        contribution: Math.round(currentYearInvested),
        interestEarned: Math.round(currentYearInterest),
        totalInvested: Math.round(totalInvested),
        closingBalance: Math.round(runningBalance),
        inflationAdjustedBalance: Math.round(realValue),
      });

      yearlyChartData.push({
        year: currentYear,
        invested: Math.round(totalInvested),
        interest: Math.round(runningBalance - totalInvested),
        total: Math.round(runningBalance),
        realValue: Math.round(realValue),
        monthlyContribution: Math.round(currentMonthlyInvestment),
      });

      // Reset yearly counters for next year
      currentYearOpening = runningBalance;
      currentYearInvested = 0;
      currentYearInterest = 0;
    }
  }

  const discountFactor = Math.pow(1 + inflationRate / 100, timePeriodYears);
  const inflationAdjustedValue = runningBalance / discountFactor;

  return {
    totalInvested: Math.round(totalInvested),
    estimatedReturns: Math.round(runningBalance - totalInvested),
    totalMaturityValue: Math.round(runningBalance),
    inflationAdjustedValue: Math.round(inflationAdjustedValue),
    schedule,
    yearlyChartData,
  };
}

/**
 * Compares Weekly, Monthly, and Quarterly SIP for the same total annual outlay
 */
export function compareSIPFrequencies(annualOutlay: number, returnRate: number, years: number) {
  // Monthly
  const monthly = calculateSIP({
    monthlyInvestment: annualOutlay / 12,
    expectedReturnRate: returnRate,
    timePeriodYears: years,
  });

  // Quarterly (4 installments/yr)
  const quarterlyInstallment = annualOutlay / 4;
  const quarterlyRate = returnRate / 4 / 100;
  let qBalance = 0;
  for (let q = 1; q <= years * 4; q++) {
    qBalance = (qBalance + quarterlyInstallment) * (1 + quarterlyRate);
  }

  // Weekly (52 installments/yr)
  const weeklyInstallment = annualOutlay / 52;
  const weeklyRate = returnRate / 52 / 100;
  let wBalance = 0;
  for (let w = 1; w <= years * 52; w++) {
    wBalance = (wBalance + weeklyInstallment) * (1 + weeklyRate);
  }

  return {
    weekly: {
      installment: Math.round(weeklyInstallment),
      maturityValue: Math.round(wBalance),
      totalInvested: Math.round(annualOutlay * years),
      returns: Math.round(wBalance - annualOutlay * years),
    },
    monthly: {
      installment: Math.round(annualOutlay / 12),
      maturityValue: monthly.totalMaturityValue,
      totalInvested: monthly.totalInvested,
      returns: monthly.estimatedReturns,
    },
    quarterly: {
      installment: Math.round(quarterlyInstallment),
      maturityValue: Math.round(qBalance),
      totalInvested: Math.round(annualOutlay * years),
      returns: Math.round(qBalance - annualOutlay * years),
    },
  };
}
