import type { AmortizationRow } from '../types';

export interface SWPInputs {
  initialCorpus: number;
  monthlyWithdrawal: number;
  expectedReturnRate: number; // Annual %
  timePeriodYears: number;
  withdrawalStepUpPct?: number; // Annual step-up for inflation (e.g. 5%)
}

export interface SWPResult {
  initialCorpus: number;
  totalWithdrawn: number;
  finalRemainingCorpus: number;
  totalGrowthAccrued: number;
  isDepleted: boolean;
  depletionYear: number | null;
  depletionMonth: number | null;
  depletionTimeText: string;
  sustainabilityRatio: number; // Final corpus / Initial corpus
  schedule: AmortizationRow[];
  yearlyChartData: {
    year: number;
    remainingCorpus: number;
    totalWithdrawn: number;
    yearWithdrawal: number;
    interestEarned: number;
  }[];
}

export function calculateSWP(inputs: SWPInputs): SWPResult {
  const {
    initialCorpus,
    monthlyWithdrawal,
    expectedReturnRate,
    timePeriodYears,
    withdrawalStepUpPct = 0,
  } = inputs;

  const totalMonths = Math.max(1, Math.round(timePeriodYears * 12));
  const monthlyRate = expectedReturnRate > 0 ? expectedReturnRate / 12 / 100 : 0;

  let balance = initialCorpus;
  let currentWithdrawal = monthlyWithdrawal;
  let totalWithdrawn = 0;
  let totalGrowthAccrued = 0;

  let isDepleted = false;
  let depletionMonth: number | null = null;
  let depletionYear: number | null = null;

  const schedule: AmortizationRow[] = [];
  const yearlyChartData: SWPResult['yearlyChartData'] = [];

  let currentYearOpening = initialCorpus;
  let currentYearWithdrawn = 0;
  let currentYearInterest = 0;

  for (let month = 1; month <= totalMonths; month++) {
    const currentYear = Math.ceil(month / 12);

    // Apply annual step-up to monthly withdrawal
    if (month > 1 && (month - 1) % 12 === 0 && withdrawalStepUpPct > 0) {
      currentWithdrawal = Math.round(currentWithdrawal * (1 + withdrawalStepUpPct / 100));
    }

    if (balance > 0) {
      // Calculate growth on remaining balance
      const interestEarned = balance * monthlyRate;
      balance += interestEarned;
      totalGrowthAccrued += interestEarned;
      currentYearInterest += interestEarned;

      // Deduct monthly withdrawal
      const actualWithdrawal = Math.min(balance, currentWithdrawal);
      balance -= actualWithdrawal;
      totalWithdrawn += actualWithdrawal;
      currentYearWithdrawn += actualWithdrawal;

      if (balance <= 0 && !isDepleted) {
        isDepleted = true;
        depletionMonth = month;
        depletionYear = currentYear;
        balance = 0;
      }
    }

    if (month % 12 === 0 || month === totalMonths) {
      schedule.push({
        period: currentYear,
        periodLabel: `Year ${currentYear}`,
        openingBalance: Math.round(currentYearOpening),
        contribution: 0,
        withdrawal: Math.round(currentYearWithdrawn),
        interestEarned: Math.round(currentYearInterest),
        totalInvested: Math.round(initialCorpus),
        closingBalance: Math.round(balance),
      });

      yearlyChartData.push({
        year: currentYear,
        remainingCorpus: Math.round(balance),
        totalWithdrawn: Math.round(totalWithdrawn),
        yearWithdrawal: Math.round(currentYearWithdrawn),
        interestEarned: Math.round(currentYearInterest),
      });

      currentYearOpening = balance;
      currentYearWithdrawn = 0;
      currentYearInterest = 0;
    }
  }

  let depletionTimeText = 'Corpus is sustainable across the selected duration';
  if (isDepleted && depletionMonth) {
    const y = Math.floor(depletionMonth / 12);
    const m = depletionMonth % 12;
    depletionTimeText = `Corpus fully depleted in ${y > 0 ? `${y} yr ` : ''}${m > 0 ? `${m} mo` : ''}`;
  }

  const sustainabilityRatio = initialCorpus > 0 ? balance / initialCorpus : 0;

  return {
    initialCorpus: Math.round(initialCorpus),
    totalWithdrawn: Math.round(totalWithdrawn),
    finalRemainingCorpus: Math.round(balance),
    totalGrowthAccrued: Math.round(totalGrowthAccrued),
    isDepleted,
    depletionYear,
    depletionMonth,
    depletionTimeText,
    sustainabilityRatio: Number(sustainabilityRatio.toFixed(2)),
    schedule,
    yearlyChartData,
  };
}
