import React, { useState } from 'react';
import { CalculatorMeta, CalculationResult } from '../../types';
import { calculateCAGR, calculateAbsoluteReturn, calculateRealReturn, calculateInflationImpact } from '../../engine/returns';
import { formatINR } from '../../engine/formatters';
import { CalculatorLayout } from '../../components/calculator/CalculatorLayout';
import { InputWithSlider } from '../../components/common/InputWithSlider';

export const ReturnsRunner: React.FC<{ meta: CalculatorMeta }> = ({ meta }) => {
  const mode = meta.id;

  // State for CAGR / Absolute Return
  const [initialValue, setInitialValue] = useState(100000);
  const [finalValue, setFinalValue] = useState(320000);
  const [holdingYears, setHoldingYears] = useState(7);

  // State for Inflation / Real Return
  const [nominalRate, setNominalRate] = useState(12);
  const [inflationRate, setInflationRate] = useState(6);
  const [corpusAmount, setCorpusAmount] = useState(10000000); // 1 Cr

  let formattedResult: CalculationResult;
  let inputsComponent: React.ReactNode;
  let rawInputs: Record<string, any> = {};

  if (mode === 'inflation' || mode === 'real-returns') {
    const realReturnPct = calculateRealReturn(nominalRate, inflationRate);
    const inflationImpact = calculateInflationImpact(corpusAmount, inflationRate, holdingYears);

    formattedResult = {
      primaryLabel: mode === 'real-returns' ? 'Real Rate of Return (After Inflation)' : 'Future Purchasing Power',
      primaryValue: mode === 'real-returns' ? realReturnPct : inflationImpact.purchasingPower,
      summaryNote: mode === 'real-returns'
        ? `A nominal return of ${nominalRate}% against ${inflationRate}% inflation delivers a true annual purchasing power growth of ${realReturnPct}% (Fisher relation).`
        : `Due to ${inflationRate}% annual inflation, ₹${(corpusAmount / 10000000).toFixed(1)} Crore in ${holdingYears} years will only buy what ₹${(inflationImpact.purchasingPower / 100000).toFixed(1)} Lakhs buys today.`,
      secondaryMetrics: [
        {
          label: 'Nominal Return Rate',
          value: `${nominalRate}% p.a.`,
          subtext: 'Before inflation adjustment',
        },
        {
          label: 'Assumed Inflation Rate',
          value: `${inflationRate}% p.a.`,
          subtext: 'CPI benchmark',
          isNegative: true,
        },
        {
          label: 'Real Net Purchasing Gain',
          value: `${realReturnPct}% p.a.`,
          subtext: 'Fisher equation [(1+r)/(1+i)] - 1',
          isPositive: realReturnPct > 0,
        },
        {
          label: 'Purchasing Power Loss',
          value: `${inflationImpact.purchasingPowerLossPct}%`,
          isNegative: true,
          subtext: `Lost to currency erosion`,
        },
      ],
      chartData: inflationImpact.yearlyData.map((d) => ({
        year: d.year,
        total: d.futureCost,
        invested: corpusAmount,
        realValue: d.purchasingPower,
      })),
      schedule: inflationImpact.yearlyData.map((d) => ({
        period: d.year,
        periodLabel: `Year ${d.year}`,
        openingBalance: corpusAmount,
        contribution: 0,
        interestEarned: d.futureCost - corpusAmount,
        totalInvested: corpusAmount,
        closingBalance: d.futureCost,
        inflationAdjustedBalance: d.purchasingPower,
      })),
      insights: [
        {
          id: 'fisher_rule',
          type: 'info',
          title: 'The Fisher Equation of Real Returns',
          observation: `Nominal returns can create an illusion of wealth if inflation is ignored.`,
          numericalComparison: `At ${nominalRate}% nominal return and ${inflationRate}% inflation, your true growth is ${realReturnPct}% rather than the simple difference of ${(nominalRate - inflationRate)}%.`,
          assumption: `Irving Fisher non-linear relation: (1 + r_real) = (1 + r_nominal) / (1 + inflation).`,
        },
      ],
    };

    inputsComponent = (
      <>
        <InputWithSlider
          label="Corpus / Investment Amount"
          prefix="₹"
          min={100000}
          max={100000000}
          step={100000}
          value={corpusAmount}
          onChange={setCorpusAmount}
          presets={[
            { label: '₹10 Lakhs', value: 1000000 },
            { label: '₹50 Lakhs', value: 5000000 },
            { label: '₹1 Crore', value: 10000000 },
            { label: '₹2 Crores', value: 20000000 },
          ]}
        />

        <InputWithSlider
          label="Nominal Investment Return (p.a.)"
          suffix="%"
          min={0}
          max={25}
          step={0.5}
          value={nominalRate}
          onChange={setNominalRate}
          presets={[
            { label: '7% (Debt/FD)', value: 7 },
            { label: '10% (Balanced)', value: 10 },
            { label: '12% (Equity)', value: 12 },
            { label: '15% (Aggressive)', value: 15 },
          ]}
        />

        <InputWithSlider
          label="Annual Inflation Rate (p.a.)"
          suffix="%"
          min={0}
          max={15}
          step={0.5}
          value={inflationRate}
          onChange={setInflationRate}
          presets={[
            { label: '4%', value: 4 },
            { label: '6%', value: 6 },
            { label: '8%', value: 8 },
          ]}
        />

        <InputWithSlider
          label="Time Horizon"
          suffix="Years"
          min={1}
          max={35}
          step={1}
          value={holdingYears}
          onChange={setHoldingYears}
          presets={[
            { label: '5 Yrs', value: 5 },
            { label: '10 Yrs', value: 10 },
            { label: '15 Yrs', value: 15 },
            { label: '20 Yrs', value: 20 },
          ]}
        />
      </>
    );

    rawInputs = { corpusAmount, nominalRate, inflationRate, holdingYears };
  } else {
    // CAGR & Absolute Return
    const cagr = calculateCAGR(initialValue, finalValue, holdingYears);
    const absReturn = calculateAbsoluteReturn(initialValue, finalValue);
    const wealthCreated = finalValue - initialValue;

    formattedResult = {
      primaryLabel: 'Compound Annual Growth Rate (CAGR)',
      primaryValue: cagr,
      summaryNote: `Growing from ${formatINR(initialValue)} to ${formatINR(finalValue)} over ${holdingYears} years represents a CAGR of ${cagr}% p.a. and an absolute gain of ${absReturn}%.`,
      secondaryMetrics: [
        {
          label: 'Total Capital Gain',
          value: wealthCreated,
          subtext: 'Rupees profit generated',
          isPositive: wealthCreated > 0,
        },
        {
          label: 'Absolute Return (%)',
          value: `${absReturn}%`,
          subtext: 'Unsmoothed point-to-point',
          isPositive: absReturn > 0,
        },
        {
          label: 'Initial Value',
          value: initialValue,
          subtext: 'Purchase price / cost basis',
        },
        {
          label: 'Terminal Value',
          value: finalValue,
          subtext: `Holding period: ${holdingYears} years`,
        },
      ],
      chartData: [
        { year: 0, total: initialValue, invested: initialValue },
        { year: holdingYears, total: finalValue, invested: initialValue },
      ],
      schedule: [],
      insights: [
        {
          id: 'cagr_cushion',
          type: 'positive',
          title: 'Geometric Progression Efficiency',
          observation: `A ${cagr}% CAGR represents steady geometric compounding that smooths out interim market dips.`,
          numericalComparison: `An absolute gain of ${absReturn}% translates into ${cagr}% annualized growth over ${holdingYears} years.`,
          assumption: `Continuous reinvestment of all dividends and capital distributions.`,
        },
      ],
    };

    inputsComponent = (
      <>
        <InputWithSlider
          label="Beginning Investment Value (PV)"
          prefix="₹"
          min={5000}
          max={10000000}
          step={5000}
          value={initialValue}
          onChange={setInitialValue}
          presets={[
            { label: '₹50K', value: 50000 },
            { label: '₹1 Lakh', value: 100000 },
            { label: '₹5 Lakhs', value: 500000 },
            { label: '₹10 Lakhs', value: 1000000 },
          ]}
        />

        <InputWithSlider
          label="Ending Investment Value (FV)"
          prefix="₹"
          min={5000}
          max={30000000}
          step={5000}
          value={finalValue}
          onChange={setFinalValue}
          presets={[
            { label: '₹2 Lakhs', value: 200000 },
            { label: '₹3.2 Lakhs', value: 320000 },
            { label: '₹10 Lakhs', value: 1000000 },
            { label: '₹25 Lakhs', value: 2500000 },
          ]}
        />

        <InputWithSlider
          label="Holding Period"
          suffix="Years"
          min={0.5}
          max={30}
          step={0.5}
          value={holdingYears}
          onChange={setHoldingYears}
          presets={[
            { label: '3 Yrs', value: 3 },
            { label: '5 Yrs', value: 5 },
            { label: '7 Yrs', value: 7 },
            { label: '10 Yrs', value: 10 },
          ]}
        />
      </>
    );

    rawInputs = { initialValue, finalValue, holdingYears };
  }

  return (
    <CalculatorLayout
      meta={meta}
      result={formattedResult}
      inputsComponent={inputsComponent}
      rawInputs={rawInputs}
    />
  );
};
