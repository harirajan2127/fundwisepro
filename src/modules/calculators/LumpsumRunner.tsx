import React, { useState } from 'react';
import { CalculatorMeta, CalculationResult } from '../../types';
import { calculateLumpsum } from '../../engine/lumpsum';
import { CalculatorLayout } from '../../components/calculator/CalculatorLayout';
import { InputWithSlider } from '../../components/common/InputWithSlider';

export const LumpsumRunner: React.FC<{ meta: CalculatorMeta }> = ({ meta }) => {
  const [investmentAmount, setInvestmentAmount] = useState(500000);
  const [expectedReturnRate, setExpectedReturnRate] = useState(12);
  const [timePeriodYears, setTimePeriodYears] = useState(10);
  const [compoundingFrequency, setCompoundingFrequency] = useState<'annual' | 'semi-annual' | 'quarterly' | 'monthly'>('annual');
  const [inflationRate, setInflationRate] = useState(6);

  const lumpsumResult = calculateLumpsum({
    investmentAmount,
    expectedReturnRate,
    timePeriodYears,
    compoundingFrequency,
    inflationRate,
  });

  const formattedResult: CalculationResult = {
    primaryLabel: 'Expected Maturity Value',
    primaryValue: lumpsumResult.totalMaturityValue,
    summaryNote: `One-time deployment of ₹${(investmentAmount / 100000).toFixed(1)} Lakhs over ${timePeriodYears} years at ${expectedReturnRate}%.`,
    secondaryMetrics: [
      {
        label: 'Initial Principal Invested',
        value: lumpsumResult.investedAmount,
      },
      {
        label: 'Total Compound Gain',
        value: lumpsumResult.estimatedReturns,
        isPositive: true,
      },
      {
        label: 'Time to Double (Rule of 72)',
        value: `${lumpsumResult.doublingYears} Years`,
        subtext: `Triples in ${lumpsumResult.triplingYears} yrs`,
      },
      {
        label: 'Inflation-Adjusted Real Value',
        value: lumpsumResult.inflationAdjustedValue,
        subtext: `At ${inflationRate}% annual inflation`,
      },
    ],
    chartData: lumpsumResult.yearlyChartData,
    schedule: lumpsumResult.schedule,
    insights: [
      {
        id: 'lumpsum_mult',
        type: 'positive',
        title: 'Capital Multiplier Impact',
        observation: `Your capital multiplies by ${(lumpsumResult.totalMaturityValue / investmentAmount).toFixed(1)}x across the investment period.`,
        numericalComparison: `Principal of ₹${(investmentAmount / 100000).toFixed(1)}L grows to ₹${(lumpsumResult.totalMaturityValue / 100000).toFixed(1)}L, generating ₹${(lumpsumResult.estimatedReturns / 100000).toFixed(1)}L in wealth.`,
        assumption: `Assumes unbroken reinvestment of all capital gains with ${compoundingFrequency} compounding.`,
      },
      {
        id: 'doubling_insight',
        type: 'info',
        title: 'Doubling Period Rule of 72',
        observation: `At ${expectedReturnRate}%, your money doubles approximately every ${lumpsumResult.doublingYears} years.`,
        numericalComparison: `In a 10-year horizon, your capital doubles ~${(10 / lumpsumResult.doublingYears).toFixed(1)} times.`,
        assumption: `Based on logarithmic compounding formulation ln(2)/ln(1+r).`,
      },
    ],
  };

  const onReset = () => {
    setInvestmentAmount(500000);
    setExpectedReturnRate(12);
    setTimePeriodYears(10);
    setCompoundingFrequency('annual');
    setInflationRate(6);
  };

  const inputsComponent = (
    <>
      <InputWithSlider
        label="Total Lump Sum Investment"
        prefix="₹"
        min={5000}
        max={10000000}
        step={5000}
        value={investmentAmount}
        onChange={setInvestmentAmount}
        presets={[
          { label: '₹1 Lakh', value: 100000 },
          { label: '₹2.5 Lakhs', value: 250000 },
          { label: '₹5 Lakhs', value: 500000 },
          { label: '₹10 Lakhs', value: 1000000 },
          { label: '₹25 Lakhs', value: 2500000 },
        ]}
      />

      <InputWithSlider
        label="Expected Annual Return (p.a.)"
        suffix="%"
        min={1}
        max={30}
        step={0.5}
        value={expectedReturnRate}
        onChange={setExpectedReturnRate}
        presets={[
          { label: '7% (Debt/FD)', value: 7 },
          { label: '10% (Hybrid)', value: 10 },
          { label: '12% (Equity)', value: 12 },
          { label: '15% (Midcap)', value: 15 },
        ]}
      />

      <InputWithSlider
        label="Holding Duration"
        suffix="Years"
        min={1}
        max={40}
        step={1}
        value={timePeriodYears}
        onChange={setTimePeriodYears}
        presets={[
          { label: '3 Yrs', value: 3 },
          { label: '5 Yrs', value: 5 },
          { label: '10 Yrs', value: 10 },
          { label: '15 Yrs', value: 15 },
          { label: '20 Yrs', value: 20 },
        ]}
      />
    </>
  );

  const advancedInputsComponent = (
    <>
      <div>
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
          Compounding Frequency
        </label>
        <select
          value={compoundingFrequency}
          onChange={(e) => setCompoundingFrequency(e.target.value as any)}
          className="w-full rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2 text-xs font-semibold text-slate-900 dark:text-white"
        >
          <option value="annual">Annually (Mutual Funds Standard)</option>
          <option value="semi-annual">Semi-Annually</option>
          <option value="quarterly">Quarterly (Bank FDs)</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <InputWithSlider
        label="Inflation Rate (p.a.)"
        suffix="%"
        min={0}
        max={15}
        step={0.5}
        value={inflationRate}
        onChange={setInflationRate}
        presets={[
          { label: '5%', value: 5 },
          { label: '6%', value: 6 },
          { label: '7%', value: 7 },
        ]}
      />
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
        investmentAmount,
        expectedReturnRate,
        timePeriodYears,
        compoundingFrequency,
        inflationRate,
      }}
    />
  );
};
