import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../engine/formatters';
import {
  TrendingUp,
  ArrowDownRight,
  Target,
  PieChart,
  GitCompare,
  Plus,
  ChevronRight,
  Sparkles,
  Bookmark,
  ShieldCheck,
  Activity,
  Calculator,
} from 'lucide-react';
import { CALCULATORS } from '../../data/calculators';

export const OverviewDashboard: React.FC = () => {
  const {
    setActiveSection,
    setActiveCalculatorId,
    goals,
    savedScenarios,
    portfolioTransactions,
  } = useApp();

  const handleQuickLaunch = (calcId: string, section: any) => {
    setActiveCalculatorId(calcId);
    setActiveSection(section);
  };

  // Compute portfolio quick summary if transactions exist
  const portfolioSummary = React.useMemo(() => {
    let totalInvested = 0;
    let totalCurrentValue = 0;

    portfolioTransactions.forEach((tx) => {
      if (tx.type === 'BUY') {
        totalInvested += tx.amount;
        // Estimate 15% growth for demo valuation
        totalCurrentValue += tx.amount * 1.18;
      }
    });

    const pnl = totalCurrentValue - totalInvested;
    const pnlPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

    return { totalInvested, totalCurrentValue, pnl, pnlPct };
  }, [portfolioTransactions]);

  return (
    <div className="space-y-6">
      {/* Executive Welcome Header */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8 text-white shadow-sm dark:border-slate-800">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>FundWise Pro Engine 2024.2</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3">
            Plan smarter. Understand your money.
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Welcome to your quantitative mutual fund and wealth planning workspace. Model SIPs, step-up trajectories, SWP pensions, and inflation-protected goals with validated mathematical accuracy.
          </p>

          {/* Primary & Secondary Actions */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleQuickLaunch('sip', 'investments')}
              className="inline-flex items-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>New Calculation</span>
            </button>
            <button
              onClick={() => setActiveSection('scenario-lab')}
              className="inline-flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-all"
            >
              <GitCompare className="h-4 w-4 text-indigo-400" />
              <span>Compare Scenarios</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quick Actions & Core Calculators
          </h2>
          <button
            onClick={() => setActiveSection('all-calculators')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center"
          >
            <span>View All 53 Tools</span>
            <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            onClick={() => handleQuickLaunch('sip', 'investments')}
            className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-500 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 cursor-pointer transition-all"
          >
            <div className="p-2 w-fit rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-2">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              SIP Calculator
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Monthly wealth compounding
            </p>
          </div>

          <div
            onClick={() => handleQuickLaunch('step-up-sip', 'investments')}
            className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-500 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 cursor-pointer transition-all"
          >
            <div className="p-2 w-fit rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 mb-2">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              Step-Up SIP
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Annual salary increment model
            </p>
          </div>

          <div
            onClick={() => handleQuickLaunch('swp', 'withdrawals')}
            className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-500 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 cursor-pointer transition-all"
          >
            <div className="p-2 w-fit rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 mb-2">
              <ArrowDownRight className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
              SWP Pension
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Corpus longevity & withdrawals
            </p>
          </div>

          <div
            onClick={() => handleQuickLaunch('goal-based-sip', 'goals')}
            className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-500 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 cursor-pointer transition-all"
          >
            <div className="p-2 w-fit rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 mb-2">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400">
              Goal Planner
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Inflation-adjusted target solver
            </p>
          </div>
        </div>
      </div>

      {/* Goal Intelligence Snapshot & Portfolio Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Financial Goals (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-emerald-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Active Financial Goals ({goals.length})
              </h2>
            </div>
            <button
              onClick={() => setActiveSection('goals')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Manage Goals
            </button>
          </div>

          <div className="space-y-3">
            {goals.slice(0, 3).map((goal) => {
              // Calculate future cost with inflation
              const futureCost = Math.round(goal.currentCost * Math.pow(1 + goal.inflationRate / 100, goal.targetYears));
              const progressPct = Math.min(100, Math.round((goal.existingSavings / futureCost) * 100));

              return (
                <div
                  key={goal.id}
                  onClick={() => setActiveSection('goals')}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:border-slate-300 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {goal.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        Target horizon: {goal.targetYears} Years • Inflation: {goal.inflationRate}%
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {formatINR(futureCost, { compact: true })}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Today: {formatINR(goal.currentCost, { compact: true })}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                      <span>Funded: {formatINR(goal.existingSavings, { compact: true })}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{progressPct}% Funded</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Portfolio Snapshot & Saved Scenarios (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Portfolio Snapshot */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <PieChart className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Tracked Portfolio Snapshot
                </h3>
              </div>
              <button
                onClick={() => setActiveSection('portfolio')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                View Holdings
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Total Invested</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {formatINR(portfolioSummary.totalInvested, { compact: true })}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Current Valuation</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {formatINR(portfolioSummary.totalCurrentValue, { compact: true })}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Total Unrealized P&L:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                +{formatINR(portfolioSummary.pnl, { compact: true })} (+{portfolioSummary.pnlPct.toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Saved Scenarios Workspace */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Bookmark className="h-4 w-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Recent Saved Scenarios ({savedScenarios.length})
                </h3>
              </div>
              <button
                onClick={() => setActiveSection('saved')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                All Scenarios
              </button>
            </div>

            {savedScenarios.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                No saved calculations yet. Use "Save Scenario" inside any calculator to preserve your strategies locally.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {savedScenarios.slice(0, 2).map((scen) => (
                  <div
                    key={scen.id}
                    onClick={() => {
                      setActiveCalculatorId(scen.calculatorId);
                      setActiveSection('investments');
                    }}
                    className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex justify-between items-center text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[180px]">
                        {scen.name}
                      </span>
                      <span className="text-[10px] text-slate-400">{scen.calculatorName} • {scen.date}</span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatINR(scen.primaryResult.value, { compact: true })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
