import { calculateSIP, compareSIPFrequencies } from '../sip';
import { calculateLumpsum } from '../lumpsum';
import { calculateSWP } from '../swp';
import { calculateGoalSIP } from '../goals';
import { calculateCAGR, calculateAbsoluteReturn, calculateRealReturn } from '../returns';
import { calculateXIRR } from '../xirr';
import { calculateEquityTax, calculateDirectVsRegular } from '../tax';
import { runMonteCarloSimulation } from '../monteCarlo';
import { runStressTests } from '../stressTest';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
  }
}

console.log('--- RUNNING FUNDWISE PRO QUANTITATIVE FINANCIAL TESTS ---');

// 1. SIP Tests
const sip = calculateSIP({
  monthlyInvestment: 10000,
  expectedReturnRate: 12,
  timePeriodYears: 10,
});
assert(sip.totalInvested === 1200000, 'SIP Total Invested 10y @ 10k/mo = 12,00,000');
assert(sip.totalMaturityValue > 2300000 && sip.totalMaturityValue < 2350000, 'SIP Terminal Value ~23.23L');
assert(sip.schedule.length === 10, 'SIP Schedule has 10 yearly rows');

// Zero Return test
const zeroReturnSIP = calculateSIP({
  monthlyInvestment: 5000,
  expectedReturnRate: 0,
  timePeriodYears: 5,
});
assert(zeroReturnSIP.totalMaturityValue === 300000, 'Zero Return SIP handles 0% gracefully');

// Step-up test
const flatSIP5 = calculateSIP({
  monthlyInvestment: 10000,
  expectedReturnRate: 12,
  timePeriodYears: 5,
  stepUpPct: 0,
});
const stepUpSIP5 = calculateSIP({
  monthlyInvestment: 10000,
  expectedReturnRate: 12,
  timePeriodYears: 5,
  stepUpPct: 10,
});
assert(stepUpSIP5.totalMaturityValue > flatSIP5.totalMaturityValue, 'Step-Up SIP yields accelerated growth over Flat SIP');

// Frequency comparison: Monthly beginning-of-month cash flow puts capital to work slightly earlier than phased weekly
const freq = compareSIPFrequencies(120000, 12, 5);
assert(freq.monthly.maturityValue >= freq.weekly.maturityValue, 'Monthly beginning-of-month timing provides early compounding advantage');

// 2. Lumpsum Tests
const lumpsum = calculateLumpsum({
  investmentAmount: 100000,
  expectedReturnRate: 12,
  timePeriodYears: 6,
});
assert(lumpsum.totalMaturityValue === 197382, 'Lumpsum 100k @ 12% 6y = 197,382');
assert(Math.abs(lumpsum.doublingYears - 6.12) < 0.1, 'Rule of 72 / Exact doubling time is ~6.12 years');

// 3. SWP Tests
const swpSustainable = calculateSWP({
  initialCorpus: 5000000,
  monthlyWithdrawal: 25000,
  expectedReturnRate: 9,
  timePeriodYears: 10,
});
assert(!swpSustainable.isDepleted, 'SWP 6% withdrawal rate is sustainable');

const swpDepleted = calculateSWP({
  initialCorpus: 1000000,
  monthlyWithdrawal: 60000,
  expectedReturnRate: 6,
  timePeriodYears: 10,
});
assert(swpDepleted.isDepleted && (swpDepleted.depletionYear ?? 0) < 3, 'High SWP triggers premature depletion accurately');

// 4. Goal Intelligence Tests
const goal = calculateGoalSIP({
  currentCost: 1000000,
  timePeriodYears: 10,
  inflationRate: 6,
  expectedReturnRate: 12,
  existingSavings: 200000,
});
assert(goal.futureCost > 1700000, 'Goal inflated target ~17.9L');
assert(goal.requiredMonthlySIP > 0, 'Goal solves for required monthly SIP');
assert(goal.sensitivity.sipIfHorizonExtendedBy2Yrs < goal.requiredMonthlySIP, 'Extending horizon reduces required monthly SIP');

// 5. Returns & XIRR
const cagr = calculateCAGR(100, 200, 5);
assert(Math.abs(cagr - 14.87) < 0.1, 'CAGR 100->200 in 5y is 14.87%');

const realRet = calculateRealReturn(12, 6);
assert(Math.abs(realRet - 5.66) < 0.1, 'Real Return Fisher equation is 5.66%');

const xirr = calculateXIRR([
  { date: '2020-01-01', amount: -100000 },
  { date: '2021-01-01', amount: -100000 },
  { date: '2023-01-01', amount: 260000 },
]);
assert(xirr > 8 && xirr < 15, 'Newton-Raphson XIRR converges accurately');

// 6. Tax Rules (Budget 2024)
const stcg = calculateEquityTax({
  purchasePrice: 100000,
  salePrice: 150000,
  holdingPeriodMonths: 6,
});
assert(stcg.gainType === 'STCG' && stcg.estimatedTax === 10000, 'STCG at 20% on 50k gain is 10,000');

const ltcg = calculateEquityTax({
  purchasePrice: 200000,
  salePrice: 400000,
  holdingPeriodMonths: 24,
});
assert(ltcg.gainType === 'LTCG' && ltcg.applicableExemption === 125000 && ltcg.estimatedTax === 9375, 'LTCG 12.5% above ₹1.25L exemption');

// 7. Monte Carlo & Stress Test
const mc = runMonteCarloSimulation({
  initialCorpus: 100000,
  monthlyContribution: 10000,
  timePeriodYears: 5,
  expectedReturnRate: 12,
  volatilityRate: 15,
  simulationsCount: 100,
});
assert(mc.years.length === 5 && mc.medianTerminalValue > 0, 'Monte Carlo produces 5-year stochastic percentile fan');

const stress = runStressTests({
  monthlyInvestment: 10000,
  expectedReturnRate: 12,
  timePeriodYears: 10,
});
assert(stress.length === 4, 'Stress testing produces 4 distinct adverse scenarios');

console.log(`\n=========================================`);
console.log(`ALL FINANCIAL CALCULATIONS VERIFIED: ${passed} PASSED, ${failed} FAILED.`);
console.log(`=========================================\n`);
if (failed > 0) {
  process.exit(1);
}
