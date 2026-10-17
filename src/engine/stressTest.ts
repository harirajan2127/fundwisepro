import { calculateSIP, SIPInputs } from './sip';

export type StressShockType =
  | 'market_crash' // -25% shock at year 3
  | 'inflation_surge' // +3% inflation over baseline
  | 'sip_pause' // 12-month hiatus in contributions
  | 'emergency_withdrawal'; // One-time unexpected withdrawal

export interface StressTestScenario {
  id: StressShockType;
  title: string;
  description: string;
  stressedCorpus: number;
  baseCorpus: number;
  corpusDifference: number;
  differencePct: number;
  resilienceScore: 'High' | 'Moderate' | 'Vulnerable';
  explanation: string;
}

export function runStressTests(sipInputs: SIPInputs): StressTestScenario[] {
  const baseResult = calculateSIP(sipInputs);
  const baseCorpus = baseResult.totalMaturityValue;
  const years = sipInputs.timePeriodYears;

  const scenarios: StressTestScenario[] = [];

  // 1. Market Crash (-25% drop at midpoint year, then standard recovery)
  const midpointYear = Math.max(1, Math.floor(years / 2));
  let crashCorpus = 0;
  const monthlyRate = sipInputs.expectedReturnRate / 12 / 100;
  for (let m = 1; m <= years * 12; m++) {
    crashCorpus = (crashCorpus + sipInputs.monthlyInvestment) * (1 + monthlyRate);
    if (m === midpointYear * 12) {
      crashCorpus *= 0.75; // 25% crash
    }
  }
  const crashDiff = Math.round(baseCorpus - crashCorpus);
  const crashPct = baseCorpus > 0 ? (crashDiff / baseCorpus) * 100 : 0;
  scenarios.push({
    id: 'market_crash',
    title: 'Mid-Horizon Market Shock (-25%)',
    description: `Simulates a sharp 25% market correction at Year ${midpointYear}, followed by regular compounding and continued SIP accumulation.`,
    stressedCorpus: Math.round(crashCorpus),
    baseCorpus,
    corpusDifference: crashDiff,
    differencePct: Number(crashPct.toFixed(1)),
    resilienceScore: crashPct < 20 ? 'High' : crashPct < 35 ? 'Moderate' : 'Vulnerable',
    explanation: 'Continuing monthly SIP through market corrections allows purchasing extra mutual fund units at lower NAVs, which buffers long-term terminal wealth.',
  });

  // 2. Inflation Surge (+3% higher inflation)
  const baseInflation = sipInputs.inflationRate || 6;
  const surgeInflation = baseInflation + 3;
  const baseRealValue = baseCorpus / Math.pow(1 + baseInflation / 100, years);
  const stressedRealValue = baseCorpus / Math.pow(1 + surgeInflation / 100, years);
  const inflationLoss = Math.round(baseRealValue - stressedRealValue);
  const inflationPct = baseRealValue > 0 ? (inflationLoss / baseRealValue) * 100 : 0;
  scenarios.push({
    id: 'inflation_surge',
    title: `Inflation Surge (+${3}% to ${surgeInflation}%)`,
    description: `Simulates persistent high consumer inflation (${surgeInflation}% p.a.) eroding real purchasing power.`,
    stressedCorpus: Math.round(stressedRealValue),
    baseCorpus: Math.round(baseRealValue),
    corpusDifference: inflationLoss,
    differencePct: Number(inflationPct.toFixed(1)),
    resilienceScore: inflationPct < 25 ? 'High' : inflationPct < 40 ? 'Moderate' : 'Vulnerable',
    explanation: `High inflation silent tax significantly decreases real purchasing power. Step-up SIPs of at least ${surgeInflation}% annually are recommended to counteract this erosion.`,
  });

  // 3. 12-Month SIP Pause / Career Break
  let pauseCorpus = 0;
  for (let m = 1; m <= years * 12; m++) {
    // Pause during Year 3 (months 25 to 36) if years >= 3, else year 1
    const isPaused = years >= 3 ? m >= 25 && m <= 36 : m <= 12;
    const contribution = isPaused ? 0 : sipInputs.monthlyInvestment;
    pauseCorpus = (pauseCorpus + contribution) * (1 + monthlyRate);
  }
  const pauseDiff = Math.round(baseCorpus - pauseCorpus);
  const pausePct = baseCorpus > 0 ? (pauseDiff / baseCorpus) * 100 : 0;
  scenarios.push({
    id: 'sip_pause',
    title: '1-Year Contribution Pause (Hiatus)',
    description: 'Simulates a 12-month pause in monthly SIP contributions due to a career transition or unexpected life event.',
    stressedCorpus: Math.round(pauseCorpus),
    baseCorpus,
    corpusDifference: pauseDiff,
    differencePct: Number(pausePct.toFixed(1)),
    resilienceScore: pausePct < 15 ? 'High' : pausePct < 25 ? 'Moderate' : 'Vulnerable',
    explanation: 'While skipping 12 installments reduces invested capital, the untouched earlier units continue compounding unimpeded.',
  });

  // 4. Unexpected Emergency Withdrawal
  const withdrawalAmount = Math.min(baseCorpus * 0.25, sipInputs.monthlyInvestment * 24);
  let emergencyCorpus = 0;
  for (let m = 1; m <= years * 12; m++) {
    emergencyCorpus = (emergencyCorpus + sipInputs.monthlyInvestment) * (1 + monthlyRate);
    if (m === midpointYear * 12) {
      emergencyCorpus = Math.max(0, emergencyCorpus - withdrawalAmount);
    }
  }
  const emergencyDiff = Math.round(baseCorpus - emergencyCorpus);
  const emergencyPct = baseCorpus > 0 ? (emergencyDiff / baseCorpus) * 100 : 0;
  scenarios.push({
    id: 'emergency_withdrawal',
    title: 'Unplanned One-Time Withdrawal',
    description: `Simulates an emergency premature lump sum withdrawal of ₹${(withdrawalAmount / 1000).toFixed(0)}K at Year ${midpointYear}.`,
    stressedCorpus: Math.round(emergencyCorpus),
    baseCorpus,
    corpusDifference: emergencyDiff,
    differencePct: Number(emergencyPct.toFixed(1)),
    resilienceScore: emergencyPct < 15 ? 'High' : emergencyPct < 30 ? 'Moderate' : 'Vulnerable',
    explanation: 'Premature withdrawals hurt not only by the amount withdrawn, but by permanent loss of future compound growth on that principal.',
  });

  return scenarios;
}
