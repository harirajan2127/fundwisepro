import { MonteCarloPercentiles } from '../types/index.ts';

export interface MonteCarloInputs {
  initialCorpus: number;
  monthlyContribution: number;
  timePeriodYears: number;
  expectedReturnRate: number; // % e.g. 12
  volatilityRate: number; // % annual standard deviation e.g. 15
  monthlyWithdrawal?: number;
  targetGoal?: number;
  simulationsCount?: number;
}

/**
 * Standard Box-Muller transform for generating standard normal random variables
 */
function randomNormal(mean: number, stdDev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * stdDev;
}

export function runMonteCarloSimulation(inputs: MonteCarloInputs): MonteCarloPercentiles & {
  medianTerminalValue: number;
  p10TerminalValue: number;
  p90TerminalValue: number;
} {
  const {
    initialCorpus,
    monthlyContribution,
    timePeriodYears,
    expectedReturnRate,
    volatilityRate,
    monthlyWithdrawal = 0,
    targetGoal = 0,
    simulationsCount = 500,
  } = inputs;

  const totalYears = Math.max(1, timePeriodYears);
  const totalMonths = totalYears * 12;

  // Monthly drift and diffusion parameters
  const annualReturn = expectedReturnRate / 100;
  const annualVol = volatilityRate / 100;

  const dt = 1 / 12;
  const monthlyDrift = (annualReturn - 0.5 * Math.pow(annualVol, 2)) * dt;
  const monthlyVol = annualVol * Math.sqrt(dt);

  // Trajectories matrix: [sim][year]
  const yearTrajectories: number[][] = Array.from({ length: simulationsCount }, () =>
    new Array(totalYears + 1).fill(0)
  );

  let successCount = 0;
  let depletionCount = 0;

  for (let s = 0; s < simulationsCount; s++) {
    let balance = initialCorpus;
    yearTrajectories[s][0] = balance;
    let depletedInThisSim = false;

    for (let m = 1; m <= totalMonths; m++) {
      if (balance > 0) {
        const shock = randomNormal(0, 1);
        const monthlyReturnFactor = Math.exp(monthlyDrift + monthlyVol * shock);
        balance = balance * monthlyReturnFactor;
        balance += monthlyContribution;

        if (monthlyWithdrawal > 0) {
          if (balance <= monthlyWithdrawal) {
            balance = 0;
            depletedInThisSim = true;
          } else {
            balance -= monthlyWithdrawal;
          }
        }
      } else {
        balance = 0;
        depletedInThisSim = true;
      }

      if (m % 12 === 0) {
        const yr = m / 12;
        yearTrajectories[s][yr] = Math.round(balance);
      }
    }

    if (depletedInThisSim) {
      depletionCount++;
    }

    if (targetGoal > 0 && balance >= targetGoal) {
      successCount++;
    }
  }

  // Calculate percentiles for each year (1 to totalYears)
  const years: number[] = [];
  const p10: number[] = [];
  const p25: number[] = [];
  const p50: number[] = [];
  const p75: number[] = [];
  const p90: number[] = [];

  for (let y = 1; y <= totalYears; y++) {
    years.push(y);
    const valuesAtYear = yearTrajectories.map((traj) => traj[y]).sort((a, b) => a - b);

    const getPercentile = (p: number) => {
      const idx = Math.min(
        valuesAtYear.length - 1,
        Math.max(0, Math.floor((p / 100) * valuesAtYear.length))
      );
      return valuesAtYear[idx];
    };

    p10.push(getPercentile(10));
    p25.push(getPercentile(25));
    p50.push(getPercentile(50));
    p75.push(getPercentile(75));
    p90.push(getPercentile(90));
  }

  const successProbability =
    targetGoal > 0
      ? Number(((successCount / simulationsCount) * 100).toFixed(1))
      : 100;

  const depletionProbability = Number(((depletionCount / simulationsCount) * 100).toFixed(1));

  return {
    years,
    p10,
    p25,
    p50,
    p75,
    p90,
    successProbability,
    depletionProbability,
    medianTerminalValue: p50[p50.length - 1] || 0,
    p10TerminalValue: p10[p10.length - 1] || 0,
    p90TerminalValue: p90[p90.length - 1] || 0,
  };
}
