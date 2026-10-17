import React, { useState } from 'react';
import { CalculatorMeta, CalculationResult } from '../../types';
import { calculateEquityTax, calculateDirectVsRegular, calculateELSSTaxSaving } from '../../engine/tax';
import { formatINR } from '../../engine/formatters';
import { CalculatorLayout } from '../../components/calculator/CalculatorLayout';
import { InputWithSlider } from '../../components/common/InputWithSlider';

export const TaxRunner: React.FC<{ meta: CalculatorMeta }> = ({ meta }) => {
  // Modes: equity-ltcg, equity-stcg, elss-tax, direct-vs-regular, debt-tax
  const mode = meta.id;

  // State for Capital Gains (LTCG / STCG / Debt)
  const [purchasePrice, setPurchasePrice] = useState(300000);
  const [salePrice, setSalePrice] = useState(650000);
  const [holdingMonths, setHoldingMonths] = useState(mode === 'equity-stcg' ? 8 : 24);
  const [otherLTCG, setOtherLTCG] = useState(0);

  // State for Direct vs Regular
  const [monthlySIP, setMonthlySIP] = useState(15000);
  const [directYears, setDirectYears] = useState(20);
  const [grossReturn, setGrossReturn] = useState(13);
  const [directTER, setDirectTER] = useState(0.6);
  const [regularTER, setRegularTER] = useState(1.8);

  // State for ELSS
  const [elssAmount, setElssAmount] = useState(150000);
  const [taxSlab, setTaxSlab] = useState(30);

  let formattedResult: CalculationResult;
  let inputsComponent: React.ReactNode;
  let advancedInputsComponent: React.ReactNode = null;
  let rawInputs: Record<string, any> = {};

  if (mode === 'direct-vs-regular' || mode === 'expense-ratio') {
    const drag = calculateDirectVsRegular(monthlySIP, directYears, grossReturn, directTER, regularTER);

    formattedResult = {
      primaryLabel: 'Lost Wealth to Distributor Commissions',
      primaryValue: drag.lostWealth,
      summaryNote: `Over ${directYears} years, distributor commissions strip away ${drag.percentageLost}% of your potential wealth. Direct plan earns you ${formatINR(drag.directMaturityValue, { compact: true })} vs ${formatINR(drag.regularMaturityValue, { compact: true })} in Regular plan.`,
      secondaryMetrics: [
        {
          label: 'Direct Plan Final Corpus',
          value: drag.directMaturityValue,
          subtext: `Net return: ${drag.directNetReturn.toFixed(1)}% p.a.`,
          isPositive: true,
        },
        {
          label: 'Regular Plan Final Corpus',
          value: drag.regularMaturityValue,
          subtext: `Net return: ${drag.regularNetReturn.toFixed(1)}% p.a.`,
        },
        {
          label: 'Percentage of Wealth Lost',
          value: `${drag.percentageLost}%`,
          isNegative: true,
          subtext: 'Paid to intermediaries',
        },
        {
          label: 'Total Out-of-Pocket Invested',
          value: drag.totalInvested,
          subtext: `${directYears * 12} monthly installments`,
        },
      ],
      chartData: drag.comparisonData.map((d) => ({
        year: d.year,
        total: d.directCorpus,
        invested: d.regularCorpus,
        loss: d.wealthDifference,
      })),
      schedule: drag.comparisonData.map((d) => ({
        period: d.year,
        periodLabel: `Year ${d.year}`,
        openingBalance: d.regularCorpus,
        contribution: monthlySIP * 12,
        interestEarned: d.wealthDifference,
        totalInvested: drag.totalInvested,
        closingBalance: d.directCorpus,
      })),
      insights: [
        {
          id: 'direct_compounding',
          type: 'critical',
          title: 'The Silent 1% Commission Drain',
          observation: `A mere ${(regularTER - directTER).toFixed(1)}% difference in Total Expense Ratio compounds into ${formatINR(drag.lostWealth, { compact: true })} of unearned wealth loss.`,
          numericalComparison: `By switching to Direct plans, you keep 100% of your scheme returns without paying commission cuts to brokers.`,
          assumption: `Gross scheme return before fees: ${grossReturn}%.`,
          actionRecommendation: `Verify on your MF statement that scheme names state 'Direct Plan' rather than 'Regular Plan'.`,
        },
      ],
    };

    inputsComponent = (
      <>
        <InputWithSlider
          label="Monthly SIP Amount"
          prefix="₹"
          min={1000}
          max={500000}
          step={1000}
          value={monthlySIP}
          onChange={setMonthlySIP}
          presets={[
            { label: '₹10K', value: 10000 },
            { label: '₹15K', value: 15000 },
            { label: '₹25K', value: 25000 },
            { label: '₹50K', value: 50000 },
          ]}
        />

        <InputWithSlider
          label="Investment Horizon"
          suffix="Years"
          min={1}
          max={35}
          step={1}
          value={directYears}
          onChange={setDirectYears}
          presets={[
            { label: '10 Yrs', value: 10 },
            { label: '15 Yrs', value: 15 },
            { label: '20 Yrs', value: 20 },
            { label: '25 Yrs', value: 25 },
          ]}
        />

        <InputWithSlider
          label="Gross Fund Performance (Pre-Fee Return)"
          suffix="%"
          min={5}
          max={20}
          step={0.5}
          value={grossReturn}
          onChange={setGrossReturn}
          presets={[
            { label: '11%', value: 11 },
            { label: '13%', value: 13 },
            { label: '15%', value: 15 },
          ]}
        />
      </>
    );

    advancedInputsComponent = (
      <>
        <InputWithSlider
          label="Direct Plan Expense Ratio (TER)"
          suffix="%"
          min={0.1}
          max={1.5}
          step={0.05}
          value={directTER}
          onChange={setDirectTER}
          helperText="Direct index/flexi caps typically 0.2% - 0.7%"
        />

        <InputWithSlider
          label="Regular Plan Expense Ratio (TER)"
          suffix="%"
          min={0.5}
          max={3.0}
          step={0.05}
          value={regularTER}
          onChange={setRegularTER}
          helperText="Regular plans include distributor trail commission"
        />
      </>
    );

    rawInputs = { monthlySIP, directYears, grossReturn, directTER, regularTER };
  } else if (mode === 'elss-tax') {
    const elssRes = calculateELSSTaxSaving(elssAmount, taxSlab);

    formattedResult = {
      primaryLabel: 'Estimated Tax Saved (Section 80C)',
      primaryValue: elssRes.taxSaved,
      summaryNote: `At ${taxSlab}% income tax slab, an investment of ${formatINR(elssAmount)} saves ${formatINR(elssRes.taxSaved)} in tax. Effective cost of investment: ${formatINR(elssRes.effectiveInvestmentCost)}.`,
      secondaryMetrics: [
        {
          label: 'Eligible 80C Deduction',
          value: elssRes.eligibleAmount,
          subtext: 'Max ₹1,50,000 per financial year',
        },
        {
          label: 'Effective Investment Outlay',
          value: elssRes.effectiveInvestmentCost,
          subtext: 'After factoring tax savings',
          isPositive: true,
        },
        {
          label: 'Mandatory Lock-In Period',
          value: '3 Years',
          subtext: 'Shortest among all 80C options (PPF is 15y)',
        },
      ],
      chartData: [
        { year: 1, total: elssAmount, invested: elssRes.effectiveInvestmentCost },
        { year: 2, total: Math.round(elssAmount * 1.12), invested: elssRes.effectiveInvestmentCost },
        { year: 3, total: Math.round(elssAmount * 1.25), invested: elssRes.effectiveInvestmentCost },
      ],
      schedule: [],
      insights: [
        {
          id: 'elss_lockin',
          type: 'positive',
          title: 'Superior 3-Year Lock-In Horizon',
          observation: `ELSS has a 3-year lock-in, compared to 5 years for Tax-Saving Bank FDs and 15 years for PPF.`,
          numericalComparison: `Provides equity market growth with Section 80C tax relief under the Old Tax Regime.`,
          assumption: `Applicable if opting for Old Tax Regime. Under New Tax Regime (Section 115BAC), 80C is omitted.`,
        },
      ],
    };

    inputsComponent = (
      <>
        <InputWithSlider
          label="ELSS Investment Amount"
          prefix="₹"
          min={500}
          max={500000}
          step={500}
          value={elssAmount}
          onChange={setElssAmount}
          presets={[
            { label: '₹50,000', value: 50000 },
            { label: '₹1,00,000', value: 100000 },
            { label: '₹1.5 Lakhs (Max)', value: 150000 },
          ]}
        />

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Your Income Tax Slab Rate
          </label>
          <select
            value={taxSlab}
            onChange={(e) => setTaxSlab(parseInt(e.target.value, 10))}
            className="w-full rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2 text-xs font-semibold text-slate-900 dark:text-white"
          >
            <option value={5}>5% Tax Bracket</option>
            <option value={10}>10% Tax Bracket</option>
            <option value={15}>15% Tax Bracket</option>
            <option value={20}>20% Tax Bracket</option>
            <option value={30}>30% (+ Cess) Top Tax Bracket</option>
          </select>
        </div>
      </>
    );

    rawInputs = { elssAmount, taxSlab };
  } else {
    // Equity LTCG / STCG
    const taxRes = calculateEquityTax({
      purchasePrice,
      salePrice,
      holdingPeriodMonths: holdingMonths,
      otherRealizedLTCGInFY: otherLTCG,
    });

    formattedResult = {
      primaryLabel: `Estimated ${taxRes.gainType} Tax Liability`,
      primaryValue: taxRes.estimatedTax,
      summaryNote: taxRes.ruleExplanation,
      secondaryMetrics: [
        {
          label: 'Total Capital Gain',
          value: taxRes.totalGain,
          isPositive: taxRes.totalGain > 0,
          subtext: `Sale value: ${formatINR(salePrice, { compact: true })}`,
        },
        {
          label: 'Applicable Exemption',
          value: taxRes.applicableExemption,
          subtext: taxRes.gainType === 'LTCG' ? '₹1,25,000 annual threshold' : 'No exemption on STCG',
          isPositive: taxRes.applicableExemption > 0,
        },
        {
          label: 'Effective Tax Rate',
          value: `${taxRes.effectiveTaxRatePct}%`,
          subtext: `Statutory rate: ${taxRes.taxRatePct}%`,
        },
        {
          label: 'Net Post-Tax Profit',
          value: taxRes.netPostTaxGain,
          isPositive: true,
          subtext: 'Retained profit after tax',
        },
      ],
      chartData: [
        { year: 1, total: salePrice, invested: purchasePrice, gain: taxRes.totalGain },
      ],
      schedule: [],
      insights: [
        {
          id: 'budget_2024_rule',
          type: 'info',
          title: 'Union Budget 2024 Tax Reform Compliance',
          observation: `Under Finance Act 2024, Equity LTCG is 12.5% on gains exceeding ₹1.25 Lakhs. STCG on units held ≤12 months is 20%.`,
          numericalComparison: `Exemption of ₹1.25L shields ${formatINR(taxRes.applicableExemption)} of your capital gains from tax.`,
          assumption: `Applies to Indian listed equity shares and equity-oriented mutual funds (>65% equity allocation).`,
        },
      ],
    };

    inputsComponent = (
      <>
        <InputWithSlider
          label="Total Purchase Value (Cost Basis)"
          prefix="₹"
          min={10000}
          max={10000000}
          step={10000}
          value={purchasePrice}
          onChange={setPurchasePrice}
          presets={[
            { label: '₹1 Lakh', value: 100000 },
            { label: '₹3 Lakhs', value: 300000 },
            { label: '₹5 Lakhs', value: 500000 },
            { label: '₹10 Lakhs', value: 1000000 },
          ]}
        />

        <InputWithSlider
          label="Total Sale / Redemption Value"
          prefix="₹"
          min={10000}
          max={20000000}
          step={10000}
          value={salePrice}
          onChange={setSalePrice}
          presets={[
            { label: '₹2 Lakhs', value: 200000 },
            { label: '₹5 Lakhs', value: 500000 },
            { label: '₹6.5 Lakhs', value: 650000 },
            { label: '₹10 Lakhs', value: 1000000 },
          ]}
        />

        <InputWithSlider
          label="Holding Period"
          suffix="Months"
          min={1}
          max={120}
          step={1}
          value={holdingMonths}
          onChange={setHoldingMonths}
          helperText={holdingMonths > 12 ? 'LTCG (12.5% above ₹1.25L)' : 'STCG (Flat 20%)'}
          presets={[
            { label: '6 Mos (STCG)', value: 6 },
            { label: '12 Mos', value: 12 },
            { label: '24 Mos (LTCG)', value: 24 },
            { label: '36 Mos', value: 36 },
          ]}
        />
      </>
    );

    advancedInputsComponent = (
      <InputWithSlider
        label="Other Realized LTCG in this FY (towards ₹1.25L exemption)"
        prefix="₹"
        min={0}
        max={125000}
        step={5000}
        value={otherLTCG}
        onChange={setOtherLTCG}
        helperText="Reduces available exemption for this transaction"
      />
    );

    rawInputs = { purchasePrice, salePrice, holdingMonths, otherLTCG };
  }

  return (
    <CalculatorLayout
      meta={meta}
      result={formattedResult}
      inputsComponent={inputsComponent}
      advancedInputsComponent={advancedInputsComponent}
      rawInputs={rawInputs}
    />
  );
};
