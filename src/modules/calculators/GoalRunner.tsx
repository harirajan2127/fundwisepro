import React, { useState } from 'react';
import { CalculatorMeta, CalculationResult } from '../../types';
import { calculateGoalSIP } from '../../engine/goals';
import { formatINR } from '../../engine/formatters';
import { CalculatorLayout } from '../../components/calculator/CalculatorLayout';
import { InputWithSlider } from '../../components/common/InputWithSlider';
import { Target, TrendingUp, Clock, AlertCircle } from 'lucide-react';

export const GoalRunner: React.FC<{
  meta: CalculatorMeta;
  defaultCost?: number;
  defaultYears?: number;
  defaultInflation?: number;
}> = ({
  meta,
  defaultCost = 2500000, // 25 Lakhs
  defaultYears = 10,
  defaultInflation = 6,
}) => {
  const [currentCost, setCurrentCost] = useState(defaultCost);
  const [timePeriodYears, setTimePeriodYears] = useState(defaultYears);
  const [inflationRate, setInflationRate] = useState(defaultInflation);
  const [expectedReturnRate, setExpectedReturnRate] = useState(12);
  const [existingSavings, setExistingSavings] = useState(200000); // 2L
  const [annualStepUpPct, setAnnualStepUpPct] = useState(0);

  const goalResult = calculateGoalSIP({
    currentCost,
    timePeriodYears,
    inflationRate,
    expectedReturnRate,
    existingSavings,
    annualStepUpPct,
  });

  const chartData = goalResult.schedule.map((row) => ({
    year: row.year,
    target: row.targetCostInflated,
    total: row.projectedAccumulation,
    invested: row.investedAmount,
  }));

  const formattedResult: CalculationResult = {
    primaryLabel: annualStepUpPct > 0 ? 'Starting Monthly Step-Up SIP' : 'Required Monthly SIP',
    primaryValue: annualStepUpPct > 0 ? goalResult.requiredStepUpSIPInitial : goalResult.requiredMonthlySIP,
    summaryNote: goalResult.isAlreadyFunded
      ? 'Goal is already 100% funded! Existing savings compounded at selected return will exceed the future inflated target.'
      : `Invest ${formatINR(
          annualStepUpPct > 0 ? goalResult.requiredStepUpSIPInitial : goalResult.requiredMonthlySIP
        )}/month to reach the future target of ${formatINR(goalResult.futureCost, { compact: true })}.`,
    secondaryMetrics: [
      {
        label: 'Future Inflated Target',
        value: goalResult.futureCost,
        subtext: `Target cost in ${timePeriodYears} years`,
      },
      {
        label: 'Existing Savings Growth',
        value: goalResult.existingSavingsGrowth,
        subtext: `Compounded value of ₹${(existingSavings / 100000).toFixed(1)}L`,
        isPositive: true,
      },
      {
        label: 'Net Fresh Corpus Needed',
        value: goalResult.netCorpusNeeded,
        subtext: 'To be funded via new SIP',
      },
      {
        label: 'Funding Progress',
        value: `${goalResult.fundingProgressPct}%`,
        subtext: goalResult.isAlreadyFunded ? 'Goal Fully Funded' : `${(100 - goalResult.fundingProgressPct).toFixed(0)}% remaining`,
        isPositive: goalResult.fundingProgressPct >= 50,
      },
    ],
    chartData,
    schedule: goalResult.schedule.map((s) => ({
      period: s.year,
      periodLabel: `Year ${s.year}`,
      openingBalance: s.investedAmount,
      contribution: Math.round(s.investedAmount / s.year),
      interestEarned: s.projectedAccumulation - s.investedAmount,
      totalInvested: s.investedAmount,
      closingBalance: s.projectedAccumulation,
      inflationAdjustedBalance: s.targetCostInflated,
    })),
    insights: [
      {
        id: 'inflation_scale',
        type: 'warning',
        title: `Inflation Target Escalation (+${inflationRate}% p.a.)`,
        observation: `Due to ${inflationRate}% inflation, your ₹${(currentCost / 100000).toFixed(1)}L goal will actually require ₹${(goalResult.futureCost / 100000).toFixed(1)}L when the time arrives.`,
        numericalComparison: `Target expands by ₹${((goalResult.futureCost - currentCost) / 100000).toFixed(1)} Lakhs over ${timePeriodYears} years.`,
        assumption: `Assumes constant annual compounded inflation of ${inflationRate}%.`,
      },
      {
        id: 'horizon_impact',
        type: 'info',
        title: 'Sensitivity: Extending Horizon by 2 Years',
        observation: `Extending your investment horizon by just 2 years reduces required monthly SIP from ${formatINR(
          goalResult.requiredMonthlySIP
        )} to ${formatINR(goalResult.sensitivity.sipIfHorizonExtendedBy2Yrs)}.`,
        numericalComparison: `Saves ₹${(goalResult.requiredMonthlySIP - goalResult.sensitivity.sipIfHorizonExtendedBy2Yrs).toLocaleString('en-IN')}/month in cash flow commitments.`,
        assumption: `Compounds over ${timePeriodYears + 2} years instead of ${timePeriodYears} years.`,
      },
    ],
  };

  const onReset = () => {
    setCurrentCost(defaultCost);
    setTimePeriodYears(defaultYears);
    setInflationRate(defaultInflation);
    setExpectedReturnRate(12);
    setExistingSavings(200000);
    setAnnualStepUpPct(0);
  };

  const inputsComponent = (
    <>
      <InputWithSlider
        label="Target Cost at Today's Prices"
        prefix="₹"
        min={100000}
        max={100000000}
        step={50000}
        value={currentCost}
        onChange={setCurrentCost}
        presets={[
          { label: '₹10 Lakhs', value: 1000000 },
          { label: '₹25 Lakhs', value: 2500000 },
          { label: '₹50 Lakhs', value: 5000000 },
          { label: '₹1 Crore', value: 10000000 },
          { label: '₹2.5 Crores', value: 25000000 },
        ]}
      />

      <InputWithSlider
        label="Years Until Target Date"
        suffix="Years"
        min={1}
        max={35}
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

      <InputWithSlider
        label="Expected Inflation Rate (p.a.)"
        suffix="%"
        min={0}
        max={15}
        step={0.5}
        value={inflationRate}
        onChange={setInflationRate}
        helperText="Education inflation is often 8-10%"
        presets={[
          { label: '5% (CPI)', value: 5 },
          { label: '6% (General)', value: 6 },
          { label: '8% (Education)', value: 8 },
          { label: '10% (Higher Edu)', value: 10 },
        ]}
      />

      <InputWithSlider
        label="Expected Portfolio Return (p.a.)"
        suffix="%"
        min={1}
        max={25}
        step={0.5}
        value={expectedReturnRate}
        onChange={setExpectedReturnRate}
        presets={[
          { label: '10% (Cons.)', value: 10 },
          { label: '12% (Nifty 50)', value: 12 },
          { label: '14% (Active MF)', value: 14 },
        ]}
      />
    </>
  );

  const advancedInputsComponent = (
    <>
      <InputWithSlider
        label="Existing Savings Allocated to this Goal"
        prefix="₹"
        min={0}
        max={50000000}
        step={25000}
        value={existingSavings}
        onChange={setExistingSavings}
        helperText="Funds already set aside that will compound"
        presets={[
          { label: '₹0', value: 0 },
          { label: '₹1 Lakh', value: 100000 },
          { label: '₹5 Lakhs', value: 500000 },
          { label: '₹10 Lakhs', value: 1000000 },
        ]}
      />

      <InputWithSlider
        label="Annual Contribution Step-Up (%)"
        suffix="%"
        min={0}
        max={25}
        step={1}
        value={annualStepUpPct}
        onChange={setAnnualStepUpPct}
        helperText="Reduces required starting monthly SIP"
        presets={[
          { label: '0% (Flat)', value: 0 },
          { label: '5% Step-Up', value: 5 },
          { label: '10% Step-Up', value: 10 },
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
        currentCost,
        timePeriodYears,
        inflationRate,
        expectedReturnRate,
        existingSavings,
        annualStepUpPct,
        targetGoal: goalResult.futureCost,
      }}
    />
  );
};
