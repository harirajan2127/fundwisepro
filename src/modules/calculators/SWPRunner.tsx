import React, { useState } from 'react';
import { CalculatorMeta, CalculationResult } from '../../types';
import { calculateSWP } from '../../engine/swp';
import { generateSWPInsights } from '../../engine/insightsEngine';
import { CalculatorLayout } from '../../components/calculator/CalculatorLayout';
import { InputWithSlider } from '../../components/common/InputWithSlider';

export const SWPRunner: React.FC<{ meta: CalculatorMeta }> = ({ meta }) => {
  const [initialCorpus, setInitialCorpus] = useState(10000000); // 1 Crore
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(50000); // 50k/mo (6% SWR)
  const [expectedReturnRate, setExpectedReturnRate] = useState(8.5); // Conservative hybrid return
  const [timePeriodYears, setTimePeriodYears] = useState(20);
  const [withdrawalStepUpPct, setWithdrawalStepUpPct] = useState(0);

  const swpResult = calculateSWP({
    initialCorpus,
    monthlyWithdrawal,
    expectedReturnRate,
    timePeriodYears,
    withdrawalStepUpPct,
  });

  const insights = generateSWPInsights({
    initialCorpus,
    monthlyWithdrawal,
    expectedReturnRate,
    totalWithdrawn: swpResult.totalWithdrawn,
    finalRemainingCorpus: swpResult.finalRemainingCorpus,
    isDepleted: swpResult.isDepleted,
    depletionYear: swpResult.depletionYear,
    depletionMonth: swpResult.depletionMonth,
  });

  // Compare with traditional Bank FD interest payout
  const fdRate = 6.5; // Typical 6.5% FD interest
  const annualFDInterest = initialCorpus * (fdRate / 100);
  const fdMonthlyPayout = Math.round(annualFDInterest / 12);

  const formattedResult: CalculationResult = {
    primaryLabel: 'Remaining Corpus Balance',
    primaryValue: swpResult.finalRemainingCorpus,
    summaryNote: swpResult.isDepleted
      ? `Corpus is exhausted in Year ${swpResult.depletionYear}. Withdrawals exceed organic growth.`
      : `Sustainable plan: You withdraw ₹${(swpResult.totalWithdrawn / 100000).toFixed(1)} Lakhs while retaining ₹${(swpResult.finalRemainingCorpus / 100000).toFixed(1)} Lakhs.`,
    secondaryMetrics: [
      {
        label: 'Total Withdrawn (Income)',
        value: swpResult.totalWithdrawn,
        subtext: 'Accumulated cash flow received',
      },
      {
        label: 'Capital Growth Generated',
        value: swpResult.totalGrowthAccrued,
        isPositive: true,
        subtext: 'Growth during holding period',
      },
      {
        label: 'Depletion Status',
        value: swpResult.isDepleted ? 'Depleted' : 'Sustainable',
        isPositive: !swpResult.isDepleted,
        isNegative: swpResult.isDepleted,
        subtext: swpResult.depletionTimeText,
      },
      {
        label: 'Withdrawal Rate (SWR)',
        value: `${((monthlyWithdrawal * 12 / initialCorpus) * 100).toFixed(1)}% p.a.`,
        subtext: 'Recommended rate: 4% - 6%',
      },
    ],
    chartData: swpResult.yearlyChartData,
    schedule: swpResult.schedule,
    insights,
  };

  const onReset = () => {
    setInitialCorpus(10000000);
    setMonthlyWithdrawal(50000);
    setExpectedReturnRate(8.5);
    setTimePeriodYears(20);
    setWithdrawalStepUpPct(0);
  };

  const inputsComponent = (
    <>
      <InputWithSlider
        label="Total Starting Corpus"
        prefix="₹"
        min={500000}
        max={100000000}
        step={100000}
        value={initialCorpus}
        onChange={setInitialCorpus}
        presets={[
          { label: '₹25 Lakhs', value: 2500000 },
          { label: '₹50 Lakhs', value: 5000000 },
          { label: '₹1 Crore', value: 10000000 },
          { label: '₹2 Crores', value: 20000000 },
          { label: '₹5 Crores', value: 50000000 },
        ]}
      />

      <InputWithSlider
        label="Monthly Withdrawal Amount"
        prefix="₹"
        min={1000}
        max={1000000}
        step={1000}
        value={monthlyWithdrawal}
        onChange={setMonthlyWithdrawal}
        helperText={initialCorpus > 0 ? `Annual rate: ${((monthlyWithdrawal * 12 / initialCorpus) * 100).toFixed(1)}% of corpus` : undefined}
        presets={[
          { label: '₹25K/mo', value: 25000 },
          { label: '₹50K/mo', value: 50000 },
          { label: '₹75K/mo', value: 75000 },
          { label: '₹1 Lakh/mo', value: 100000 },
          { label: '₹1.5 Lakhs/mo', value: 150000 },
        ]}
      />

      <InputWithSlider
        label="Expected Portfolio Return (p.a.)"
        suffix="%"
        min={1}
        max={20}
        step={0.5}
        value={expectedReturnRate}
        onChange={setExpectedReturnRate}
        helperText="Conservative Hybrid/BAF ~8-9%"
        presets={[
          { label: '7% (Debt/FD)', value: 7 },
          { label: '8.5% (Hybrid)', value: 8.5 },
          { label: '10% (Equity Hybrid)', value: 10 },
          { label: '12% (Pure Equity)', value: 12 },
        ]}
      />

      <InputWithSlider
        label="Withdrawal Timeframe"
        suffix="Years"
        min={1}
        max={40}
        step={1}
        value={timePeriodYears}
        onChange={setTimePeriodYears}
        presets={[
          { label: '10 Yrs', value: 10 },
          { label: '15 Yrs', value: 15 },
          { label: '20 Yrs', value: 20 },
          { label: '25 Yrs', value: 25 },
          { label: '30 Yrs', value: 30 },
        ]}
      />
    </>
  );

  const advancedInputsComponent = (
    <>
      <InputWithSlider
        label="Annual Withdrawal Step-Up (Inflation Adjustment)"
        suffix="%"
        min={0}
        max={15}
        step={0.5}
        value={withdrawalStepUpPct}
        onChange={setWithdrawalStepUpPct}
        helperText="Simulates escalating living expenses"
        presets={[
          { label: '0% (Flat)', value: 0 },
          { label: '5% Step-Up', value: 5 },
          { label: '6% Step-Up', value: 6 },
          { label: '8% Step-Up', value: 8 },
        ]}
      />

      {/* SWP vs FD comparison card */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-3 text-xs space-y-1.5">
        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
          SWP vs Bank FD Comparison Note
        </span>
        <p className="text-slate-600 dark:text-slate-400">
          In Bank FD, the entire monthly interest (₹{(fdMonthlyPayout / 1000).toFixed(0)}K at 6.5%) is 100% taxable at your slab rate (up to 30% + cess). In mutual fund SWP, redemptions represent return of capital + capital gains, meaning only the capital gain portion attracts 12.5% LTCG tax after ₹1.25L exemption.
        </p>
      </div>
    </>
  );

  return (
    <CalculatorLayout
      meta={meta}
      result={formattedResult}
      inputsComponent={inputsComponent}
      advancedInputsComponent={advancedInputsComponent}
      onReset={onReset}
      rawInputs={{
        initialCorpus,
        monthlyWithdrawal,
        expectedReturnRate,
        timePeriodYears,
        withdrawalStepUpPct,
      }}
      isSWP={true}
    />
  );
};
