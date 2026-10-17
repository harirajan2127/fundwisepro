import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, BookOpen, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

export const MethodologyModal: React.FC = () => {
  const { isMethodologyOpen, setIsMethodologyOpen } = useApp();

  if (!isMethodologyOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-3xl rounded-xl bg-white shadow-2xl ring-1 ring-slate-900/10 dark:bg-slate-900 dark:ring-slate-700 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Mathematical Methodology & Tax Rules
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quantitative formulas, Indian taxation frameworks, and model assumptions.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMethodologyOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-5 space-y-6 text-sm text-slate-600 dark:text-slate-300">
          {/* Section 1: SIP Formula */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>1. Systematic Investment Plan (SIP) Cash Flow Timing</span>
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Mutual fund SIP installments are deducted and units allotted at the beginning of each installment cycle. Consequently, FundWise Pro models SIPs strictly using an <strong>annuity due</strong> cash-flow schedule rather than an ordinary annuity (end-of-period):
            </p>
            <div className="mt-2 rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              FV = P × [ ((1 + i)^n - 1) / i ] × (1 + i)
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Where <code>P</code> is the monthly investment amount, <code>i</code> is the periodic monthly rate (<code>annualRate / 12 / 100</code>), and <code>n</code> is the total months invested.
            </p>
          </div>

          {/* Section 2: Indian Mutual Fund Taxation (Budget 2024 Updates) */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>2. Indian Mutual Fund Taxation Framework (FY 2024-25 & 2025-26)</span>
            </h3>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="font-semibold text-slate-900 dark:text-white">Equity Funds (Hold &gt; 12m)</span>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  <strong>LTCG: 12.5%</strong> on realized capital gains exceeding the annual exemption limit of <strong>₹1,25,000</strong> (raised from ₹1 Lakh in Finance Act 2024).
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="font-semibold text-slate-900 dark:text-white">Equity Funds (Hold ≤ 12m)</span>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  <strong>STCG: Flat 20%</strong> (increased from 15% in Finance Act 2024) on net short-term gains.
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="font-semibold text-slate-900 dark:text-white">Debt Mutual Funds</span>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  All capital gains on specified debt funds (equity &lt; 35%) purchased on or after April 1, 2023 are taxed at the investor's marginal <strong>income tax slab rate</strong> without indexation.
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="font-semibold text-slate-900 dark:text-white">ELSS (Section 80C)</span>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  Up to <strong>₹1,50,000</strong> deduction under Old Tax Regime. Units are locked for 3 years; subsequent gains attract Equity LTCG rates.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: XIRR Newton-Raphson Solver */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>3. Exact Numerical XIRR Calculation</span>
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              For portfolio transactions and irregular contributions, XIRR is computed numerically by finding the discount root <code>r</code> where the net present value equals zero:
            </p>
            <div className="mt-2 rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              Σ [ C_i / (1 + r)^((d_i - d_1) / 365) ] = 0
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              We employ first-order Newton-Raphson gradient descent coupled with an automatic Bisection fallback to guarantee convergence even across volatile non-standard cashflows.
            </p>
          </div>

          {/* Section 4: Monte Carlo Model */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>4. Monte Carlo Probabilistic Simulation Model</span>
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              To model real-world market uncertainty, our advanced simulation executes 500+ geometric Brownian random walks using standard Box-Muller normal transforms:
            </p>
            <div className="mt-2 rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              R_t = exp( (μ - 0.5 σ^2)·Δt + σ·√Δt·Z ) - 1
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Results are reported across percentiles (10th percentile adverse, 50th median, 90th optimistic) to provide a transparent distribution of potential outcomes rather than a false deterministic guarantee.
            </p>
          </div>

          {/* Legal Disclaimer */}
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
            <div className="flex items-start space-x-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200">
                <span className="font-semibold">Educational & Analytical Tool Disclaimer:</span>
                <p className="mt-1">
                  FundWise Pro is designed solely for financial education, modeling, and quantitative estimation. It does not constitute investment advice, portfolio management, or a solicitation to buy or sell securities. Mutual fund investments are subject to market risks; read all scheme-related documents carefully.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setIsMethodologyOpen(false)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-colors"
          >
            I Understand & Close
          </button>
        </div>
      </div>
    </div>
  );
};
