import React, { useState } from 'react';
import { CalculatorMeta, CalculationResult } from '../../types';
import { calculateSIP } from '../../engine/sip';
import { generateSIPInsights } from '../../engine/insightsEngine';
import { CalculatorLayout } from '../../components/calculator/CalculatorLayout';
import { InputWithSlider } from '../../components/common/InputWithSlider';

export const SIPRunner: React.FC<{ meta: CalculatorMeta; initialStepUp?: boolean }> = ({
  meta,
  initialStepUp = false,
}) => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(15000);
  const [expectedReturnRate, setExpectedReturnRate] = useState(12);
  const [timePeriodYears, setTimePeriodYears] = useState(15);
  const [stepUpPct, setStepUpPct] = useState(initialStepUp ? 10 : 0);
  const [inflationRate, setInflationRate] = useState(6);

  const sipResult = calculateSIP({
    monthlyInvestment,
    expectedReturnRate,
    timePeriodYears,
    stepUpPct,
    inflationRate,
  });

  const insights = generateSIPInsights({
    monthlyInvestment,
    expectedReturnRate,
    timePeriodYears,
    totalInvested: sipResult.totalInvested,
    estimatedReturns: sipResult.estimatedReturns,
    totalMaturityValue: sipResult.totalMaturityValue,
    inflationAdjustedValue: sipResult.inflationAdjustedValue,
    stepUpPct,
  });

  const formattedResult: CalculationResult = {
    primaryLabel: 'Expected Maturity Corpus',
    primaryValue: sipResult.totalMaturityValue,
    summaryNote: `At ${expectedReturnRate}% annual return over ${timePeriodYears} years${
      stepUpPct > 0 ? ` with ${stepUpPct}% annual step-up` : ''
    }.`,
    secondaryMetrics: [
      {
        label: 'Total Amount Invested',
        value: sipResult.totalInvested,
        subtext: 'Your out-of-pocket capital',
      },
      {
        label: 'Estimated Wealth Gain',
        value: sipResult.estimatedReturns,
        subtext: 'Compound interest generated',
        isPositive: true,
      },
      {
        label: 'Real Purchasing Power',
        value: sipResult.inflationAdjustedValue,
        subtext: `Adjusted for ${inflationRate}% inflation`,
      },
    ],
    chartData: sipResult.yearlyChartData,
    schedule: sipResult.schedule,
    insights,
  };

  const onReset = () => {
    setMonthlyInvestment(15000);
    setExpectedReturnRate(12);
    setTimePeriodYears(15);
    setStepUpPct(initialStepUp ? 10 : 0);
    setInflationRate(6);
  };

  const inputsComponent = (
    <>
      <InputWithSlider
        label="Monthly Investment Amount"
        prefix="₹"
        min={500}
        max={500000}
        step={500}
        value={monthlyInvestment}
        onChange={setMonthlyInvestment}
        presets={[
          { label: '₹5K', value: 5000 },
          { label: '₹10K', value: 10000 },
          { label: '₹25K', value: 25000 },
          { label: '₹50K', value: 50000 },
          { label: '₹1L', value: 100000 },
        ]}
      />

      <InputWithSlider
        label="Expected Annual Return Rate (p.a.)"
        suffix="%"
        min={1}
        max={30}
        step={0.5}
        value={expectedReturnRate}
        onChange={setExpectedReturnRate}
        helperText="Nifty 50 historical 12-14%"
        presets={[
          { label: '10% (Cons.)', value: 10 },
          { label: '12% (Nifty)', value: 12 },
          { label: '15% (Agg.)', value: 15 },
        ]}
      />

      <InputWithSlider
        label="Investment Time Horizon"
        suffix="Years"
        min={1}
        max={40}
        step={1}
        value={timePeriodYears}
        onChange={setTimePeriodYears}
        presets={[
          { label: '5 Yrs', value: 5 },
          { label: '10 Yrs', value: 10 },
          { label: '15 Yrs', value: 15 },
          { label: '20 Yrs', value: 20 },
          { label: '25 Yrs', value: 25 },
        ]}
      />
    </>
  );

  const advancedInputsComponent = (
    <>
      <InputWithSlider
        label="Annual SIP Step-Up (%)"
        suffix="%"
        min={0}
        max={50}
        step={1}
        value={stepUpPct}
        onChange={setStepUpPct}
        helperText="Increases contribution once every 12 months"
        presets={[
          { label: '0% (Flat)', value: 0 },
          { label: '5% Step-Up', value: 5 },
          { label: '10% Step-Up', value: 10 },
          { label: '15% Step-Up', value: 15 },
        ]}
      />

      <InputWithSlider
        label="Assumed Inflation Rate (p.a.)"
        suffix="%"
        min={0}
        max={15}
        step={0.5}
        value={inflationRate}
        onChange={setInflationRate}
        helperText="Used to compute real purchasing power"
        presets={[
          { label: '4% (Low)', value: 4 },
          { label: '6% (RBI Target)', value: 6 },
          { label: '8% (Lifestyle)', value: 8 },
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
        monthlyInvestment,
        expectedReturnRate,
        timePeriodYears,
        stepUpPct,
        inflationRate,
      }}
    />
  );
};
