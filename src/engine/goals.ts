import { calculateSIP } from './sip';

export interface GoalInputs {
  currentCost: number;
  timePeriodYears: number;
  inflationRate: number; // %
  expectedReturnRate: number; // %
  existingSavings?: number;
  annualStepUpPct?: number; // %
}

export interface GoalResult {
  currentCost: number;
  futureCost: number; // Target corpus needed
  existingSavingsGrowth: number;
  netCorpusNeeded: number;
  requiredMonthlySIP: number;
  requiredStepUpSIPInitial: number;
  totalFreshSIPInvested: number;
  isAlreadyFunded: boolean;
  fundingProgressPct: number;
  sensitivity: {
    sipIfHorizonExtendedBy2Yrs: number;
    sipIfReturnHigherBy2Pct: number;
    corpusGainFrom10PctStepUp: number;
  };
  schedule: {
    year: number;
    targetCostInflated: number;
    projectedAccumulation: number;
    investedAmount: number;
  }[];
}

/**
 * Closed-form solver for monthly SIP needed to reach a target corpus
 */
function solveFlatSIP(corpusNeeded: number, months: number, annualReturnRate: number): number {
  if (corpusNeeded <= 0 || months <= 0) return 0;
  const monthlyRate = annualReturnRate > 0 ? annualReturnRate / 12 / 100 : 0;
  if (monthlyRate === 0) {
    return Math.round(corpusNeeded / months);
  }
  const factor = ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  return Math.round(corpusNeeded / factor);
}

export function calculateGoalSIP(inputs: GoalInputs): GoalResult {
  const {
    currentCost,
    timePeriodYears,
    inflationRate,
    expectedReturnRate,
    existingSavings = 0,
    annualStepUpPct = 0,
  } = inputs;

  const years = Math.max(1, timePeriodYears);
  const totalMonths = years * 12;

  // 1. Inflate current cost to future target cost
  const futureCost = Math.round(currentCost * Math.pow(1 + inflationRate / 100, years));

  // 2. Project existing savings growth
  const existingSavingsGrowth = Math.round(
    existingSavings * Math.pow(1 + expectedReturnRate / 100, years)
  );

  // 3. Net corpus required from new SIP
  const netCorpusNeeded = Math.max(0, futureCost - existingSavingsGrowth);
  const isAlreadyFunded = netCorpusNeeded === 0;

  let requiredMonthlySIP = 0;
  let requiredStepUpSIPInitial = 0;

  if (!isAlreadyFunded) {
    requiredMonthlySIP = solveFlatSIP(netCorpusNeeded, totalMonths, expectedReturnRate);

    // Solve for starting SIP if step-up percentage is selected
    if (annualStepUpPct > 0) {
      let low = 100;
      let high = requiredMonthlySIP;
      let bestP = high;

      for (let iter = 0; iter < 40; iter++) {
        const mid = (low + high) / 2;
        const sim = calculateSIP({
          monthlyInvestment: mid,
          expectedReturnRate,
          timePeriodYears: years,
          stepUpPct: annualStepUpPct,
        });

        if (sim.totalMaturityValue >= netCorpusNeeded) {
          bestP = mid;
          high = mid;
        } else {
          low = mid;
        }
      }
      requiredStepUpSIPInitial = Math.round(bestP);
    } else {
      requiredStepUpSIPInitial = requiredMonthlySIP;
    }
  }

  // Calculate year by year timeline
  const activeInitialSIP = annualStepUpPct > 0 ? requiredStepUpSIPInitial : requiredMonthlySIP;
  const sipSimulation = calculateSIP({
    monthlyInvestment: activeInitialSIP,
    expectedReturnRate,
    timePeriodYears: years,
    stepUpPct: annualStepUpPct,
  });

  const totalFreshSIPInvested = sipSimulation.totalInvested;

  const schedule = [];
  for (let y = 1; y <= years; y++) {
    const inflatedTargetAtY = Math.round(currentCost * Math.pow(1 + inflationRate / 100, y));
    const savingsAtY = Math.round(existingSavings * Math.pow(1 + expectedReturnRate / 100, y));
    const sipDataAtY = sipSimulation.yearlyChartData.find((d) => d.year === y);
    const sipMaturityAtY = sipDataAtY ? sipDataAtY.total : 0;
    const sipInvestedAtY = sipDataAtY ? sipDataAtY.invested : 0;

    schedule.push({
      year: y,
      targetCostInflated: inflatedTargetAtY,
      projectedAccumulation: savingsAtY + sipMaturityAtY,
      investedAmount: existingSavings + sipInvestedAtY,
    });
  }

  // Sensitivity analysis calculations without recursion:
  // 1. Horizon extended by 2 years
  const extendedYears = years + 2;
  const extFutureCost = Math.round(currentCost * Math.pow(1 + inflationRate / 100, extendedYears));
  const extSavings = Math.round(existingSavings * Math.pow(1 + expectedReturnRate / 100, extendedYears));
  const extNetNeeded = Math.max(0, extFutureCost - extSavings);
  const sipIfHorizonExtendedBy2Yrs = solveFlatSIP(extNetNeeded, extendedYears * 12, expectedReturnRate);

  // 2. Return rate higher by 2%
  const higherReturn = expectedReturnRate + 2;
  const highRetSavings = Math.round(existingSavings * Math.pow(1 + higherReturn / 100, years));
  const highRetNetNeeded = Math.max(0, futureCost - highRetSavings);
  const sipIfReturnHigherBy2Pct = solveFlatSIP(highRetNetNeeded, totalMonths, higherReturn);

  // 3. Step-up 10%
  const stepUpSim = calculateSIP({
    monthlyInvestment: requiredMonthlySIP,
    expectedReturnRate,
    timePeriodYears: years,
    stepUpPct: 10,
  });

  const fundingProgressPct =
    futureCost > 0
      ? Math.min(100, Number(((existingSavingsGrowth / futureCost) * 100).toFixed(1)))
      : 100;

  return {
    currentCost,
    futureCost,
    existingSavingsGrowth,
    netCorpusNeeded,
    requiredMonthlySIP,
    requiredStepUpSIPInitial,
    totalFreshSIPInvested,
    isAlreadyFunded,
    fundingProgressPct,
    sensitivity: {
      sipIfHorizonExtendedBy2Yrs,
      sipIfReturnHigherBy2Pct,
      corpusGainFrom10PctStepUp: Math.max(0, stepUpSim.totalMaturityValue - sipSimulation.totalMaturityValue),
    },
    schedule,
  };
}
