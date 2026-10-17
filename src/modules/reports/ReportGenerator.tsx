import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateSIP } from '../../engine/sip';
import { calculateSWP } from '../../engine/swp';
import { formatINR } from '../../engine/formatters';
import {
  Printer,
  Download,
  FileText,
  ShieldCheck,
  User,
  Calendar,
  CheckCircle,
  Building,
} from 'lucide-react';

export const ReportGenerator: React.FC = () => {
  const { goals, portfolioTransactions } = useApp();

  const [investorName, setInvestorName] = useState('Valued Investor');
  const [analystName, setAnalystName] = useState('FundWise Quantitative Advisory');
  const [monthlySIP, setMonthlySIP] = useState(25000);
  const [returnRate, setReturnRate] = useState(12);
  const [horizonYears, setHorizonYears] = useState(15);
  const [stepUpPct, setStepUpPct] = useState(10);

  const reportSIP = calculateSIP({
    monthlyInvestment: monthlySIP,
    expectedReturnRate: returnRate,
    timePeriodYears: horizonYears,
    stepUpPct,
    inflationRate: 6,
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header (Hidden on print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Export Dossier
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">Institutional Financial Report</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Executive Financial Planning Dossier
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure your personalized wealth report and generate a clean, print-friendly PDF document.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center space-x-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 shadow-sm transition-all self-start sm:self-auto"
        >
          <Printer className="h-4 w-4" />
          <span>Print or Save PDF</span>
        </button>
      </div>

      {/* Inputs Configuration Form (Hidden on print) */}
      <div className="no-print rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 pb-2 border-b border-slate-100 dark:border-slate-800">
          Report Parameters & Metadata
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Investor Full Name
            </label>
            <input
              type="text"
              value={investorName}
              onChange={(e) => setInvestorName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Monthly Investment (SIP)
            </label>
            <input
              type="number"
              step={1000}
              value={monthlySIP === 0 ? '' : monthlySIP}
              onChange={(e) => setMonthlySIP(e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Horizon (Years)
            </label>
            <input
              type="number"
              min={1}
              max={35}
              value={horizonYears === 0 ? '' : horizonYears}
              onChange={(e) => setHorizonYears(e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Annual Step-Up (%)
            </label>
            <input
              type="number"
              min={0}
              max={25}
              value={stepUpPct === 0 ? '' : stepUpPct}
              onChange={(e) => setStepUpPct(e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
            />
          </div>
        </div>
      </div>

      {/* PRINTABLE DOSSIER SHEET */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-slate-100 space-y-8 font-sans print:p-0 print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900 dark:border-slate-700">
          <div>
            <span className="text-2xl font-black tracking-tight text-slate-950 dark:text-white uppercase">
              FundWise<span className="text-emerald-600">Pro</span>
            </span>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Quantitative Investment Planning & Valuation Dossier
            </div>
          </div>
          <div className="text-right text-xs text-slate-500 dark:text-slate-400">
            <div>Date: {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
              Prepared for: {investorName}
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1.5">
            1. Executive Strategic Summary
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            This comprehensive quantitative report evaluates the strategic wealth accumulation roadmap for{' '}
            <strong>{investorName}</strong>. Based on a disciplined monthly investment of{' '}
            <strong>{formatINR(monthlySIP)}</strong> escalating by <strong>{stepUpPct}%</strong> annually over a{' '}
            <strong>{horizonYears}-year</strong> horizon at an assumed <strong>{returnRate}%</strong> annualized compound rate, the projected maturity corpus equals{' '}
            <strong>{formatINR(reportSIP.totalMaturityValue)}</strong> (Real purchasing power:{' '}
            <strong>{formatINR(reportSIP.inflationAdjustedValue)}</strong>).
          </p>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Invested Capital</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1 block">
                {formatINR(reportSIP.totalInvested)}
              </span>
            </div>
            <div className="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 uppercase font-semibold block">
                Projected Terminal Corpus
              </span>
              <span className="text-base font-extrabold font-mono text-emerald-900 dark:text-emerald-200 mt-1 block">
                {formatINR(reportSIP.totalMaturityValue)}
              </span>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Compound Wealth Gain</span>
              <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                +{formatINR(reportSIP.estimatedReturns)}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Financial Goal Roadmap */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1.5">
            2. Life Goal Milestone Alignment ({goals.length} Goals)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2">Milestone</th>
                  <th className="py-2">Category</th>
                  <th className="py-2 text-right">Horizon</th>
                  <th className="py-2 text-right">Today's Cost</th>
                  <th className="py-2 text-right">Inflated Target</th>
                  <th className="py-2 text-right">Existing Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700 dark:text-slate-300">
                {goals.map((g) => {
                  const futureCost = Math.round(g.currentCost * Math.pow(1 + g.inflationRate / 100, g.targetYears));
                  return (
                    <tr key={g.id}>
                      <td className="py-2 font-sans font-medium text-slate-900 dark:text-white">{g.title}</td>
                      <td className="py-2 font-sans text-slate-500">{g.category}</td>
                      <td className="py-2 text-right">{g.targetYears} Yrs</td>
                      <td className="py-2 text-right">{formatINR(g.currentCost, { compact: true })}</td>
                      <td className="py-2 text-right font-bold text-slate-900 dark:text-white">{formatINR(futureCost, { compact: true })}</td>
                      <td className="py-2 text-right text-emerald-600">{formatINR(g.existingSavings, { compact: true })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Tax Compliance & Statutory Disclosures */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
            3. Regulatory Disclosures & Mathematical Assumptions
          </h3>
          <p className="leading-relaxed">
            All calculations utilize compound annuity due scheduling (beginning of installment periods). Tax estimates are structured under the Indian Income Tax Act as amended by Finance Act 2024: Equity Long-Term Capital Gains (LTCG) at 12.5% on gains exceeding ₹1,25,000; Equity Short-Term Capital Gains (STCG) at 20%; Debt Mutual Funds at applicable marginal slab rate.
          </p>
          <div className="flex items-center space-x-2 pt-2 text-[10px] text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>FundWise Pro is an analytical and educational calculation tool. Not SEBI registered investment advice. Mutual fund investments are subject to market risks.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
