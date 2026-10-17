import { Insight } from '../types';
import { formatINR, formatPercent } from './formatters';

export function generateSIPInsights(params: {
  monthlyInvestment: number;
  expectedReturnRate: number;
  timePeriodYears: number;
  totalInvested: number;
  estimatedReturns: number;
  totalMaturityValue: number;
  inflationAdjustedValue: number;
  stepUpPct?: number;
}): Insight[] {
  const {
    monthlyInvestment,
    expectedReturnRate,
    timePeriodYears,
    totalInvested,
    estimatedReturns,
    totalMaturityValue,
    inflationAdjustedValue,
    stepUpPct = 0,
  } = params;

  const insights: Insight[] = [];

  // 1. Compound Interest Multiplier
  const returnsProportion = totalMaturityValue > 0 ? (estimatedReturns / totalMaturityValue) * 100 : 0;
  if (returnsProportion > 50) {
    insights.push({
      id: 'compound_power',
      type: 'positive',
      title: 'Compounding Dominance Over Principal',
      observation: `Capital growth contributes more to your final wealth than your own out-of-pocket contributions.`,
      numericalComparison: `Estimated returns of ${formatINR(estimatedReturns, { compact: true })} represent ${returnsProportion.toFixed(0)}% of your total corpus of ${formatINR(totalMaturityValue, { compact: true })}.`,
      assumption: `Assumes a consistent annualized compound return of ${expectedReturnRate}% over ${timePeriodYears} years.`,
      actionRecommendation: `Extending your investment horizon by just 3 years typically yields exponential acceleration in returns.`,
    });
  }

  // 2. Step-up SIP impact
  if (stepUpPct > 0) {
    insights.push({
      id: 'step_up_boost',
      type: 'positive',
      title: 'Step-Up Supercharger Active',
      observation: `Your ${stepUpPct}% annual contribution increase protects your strategy from inflation and wage stagnation.`,
      numericalComparison: `Your monthly contribution scales from ${formatINR(monthlyInvestment)} in Year 1 to higher levels in tandem with expected career salary increments.`,
      assumption: `Contributions are adjusted upward once every 12 months by ${stepUpPct}%.`,
      actionRecommendation: `Review your step-up percentage annually alongside your actual appraisal or income growth.`,
    });
  } else {
    insights.push({
      id: 'flat_sip_opportunity',
      type: 'info',
      title: 'Opportunity: Annual Step-Up Boost',
      observation: `A flat monthly SIP loses purchasing power each year as your salary increases.`,
      numericalComparison: `Adding a modest 10% annual step-up typically boosts terminal maturity wealth by 50% to 80% over 10-15 years.`,
      assumption: `Comparing a flat ₹${monthlyInvestment} SIP against an annually escalating SIP.`,
      actionRecommendation: `Enable the Step-Up SIP slider in the inputs panel to test the outcome.`,
    });
  }

  // 3. Inflation Purchasing Power
  const inflationErosion = totalMaturityValue - inflationAdjustedValue;
  if (inflationErosion > 0) {
    insights.push({
      id: 'inflation_haircut',
      type: 'warning',
      title: 'Inflation Purchasing Power Adjustment',
      observation: `The nominal corpus of ${formatINR(totalMaturityValue, { compact: true })} will buy less in ${timePeriodYears} years than it would today.`,
      numericalComparison: `In real terms (today's prices), your corpus is worth ${formatINR(inflationAdjustedValue, { compact: true })} (erosion of ${formatINR(inflationErosion, { compact: true })}).`,
      assumption: `Assumes a conservative 6% annual headline inflation rate across the period.`,
      actionRecommendation: `When planning long-term goals like retirement, always use the inflation-adjusted value as your benchmark.`,
    });
  }

  return insights;
}

export function generateSWPInsights(params: {
  initialCorpus: number;
  monthlyWithdrawal: number;
  expectedReturnRate: number;
  totalWithdrawn: number;
  finalRemainingCorpus: number;
  isDepleted: boolean;
  depletionYear: number | null;
  depletionMonth: number | null;
}): Insight[] {
  const {
    initialCorpus,
    monthlyWithdrawal,
    expectedReturnRate,
    totalWithdrawn,
    finalRemainingCorpus,
    isDepleted,
    depletionYear,
  } = params;

  const insights: Insight[] = [];
  const annualWithdrawal = monthlyWithdrawal * 12;
  const withdrawalRatePct = initialCorpus > 0 ? (annualWithdrawal / initialCorpus) * 100 : 0;

  if (isDepleted) {
    insights.push({
      id: 'corpus_depletion',
      type: 'critical',
      title: 'Warning: Corpus Depletion Detected',
      observation: `The selected withdrawal amount exceeds the portfolio's growth capacity, exhausting the corpus prematurely.`,
      numericalComparison: `Corpus drops to ₹0 in Year ${depletionYear}. Annual withdrawal rate of ${withdrawalRatePct.toFixed(1)}% outpaces the ${expectedReturnRate}% annual return.`,
      assumption: `Month-by-month withdrawals continue even after capital declines below threshold.`,
      actionRecommendation: `Reduce monthly withdrawal or increase starting corpus to bring annual withdrawal rate below 4% - 6%.`,
    });
  } else {
    insights.push({
      id: 'swp_sustainability',
      type: 'positive',
      title: 'Sustainable Withdrawal Profile',
      observation: `Your portfolio generates sufficient growth to fund withdrawals while retaining or expanding principal capital.`,
      numericalComparison: `Total withdrawals of ${formatINR(totalWithdrawn, { compact: true })} achieved, leaving a remaining balance of ${formatINR(finalRemainingCorpus, { compact: true })}.`,
      assumption: `Assumes steady annualized portfolio return of ${expectedReturnRate}%.`,
      actionRecommendation: `Maintain an emergency cash buffer in a liquid fund to avoid having to withdraw during sudden market drawdowns.`,
    });
  }

  return insights;
}
