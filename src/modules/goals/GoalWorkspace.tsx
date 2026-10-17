import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GoalItem } from '../../types';
import { calculateGoalSIP } from '../../engine/goals';
import { formatINR } from '../../engine/formatters';
import {
  Target,
  Plus,
  Trash2,
  TrendingUp,
  Sparkles,
  GraduationCap,
  Home,
  Heart,
  ShieldAlert,
  Coins,
  ChevronRight,
} from 'lucide-react';

export const GoalWorkspace: React.FC = () => {
  const { goals, addGoal, deleteGoal, setActiveCalculatorId, setActiveSection } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Goal Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalItem['category']>('retirement');
  const [currentCost, setCurrentCost] = useState(2500000);
  const [targetYears, setTargetYears] = useState(10);
  const [inflationRate, setInflationRate] = useState(6);
  const [expectedReturnRate, setExpectedReturnRate] = useState(12);
  const [existingSavings, setExistingSavings] = useState(200000);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addGoal({
      title: title.trim(),
      category,
      currentCost: currentCost || 500000,
      targetYears: targetYears || 5,
      inflationRate: inflationRate || 6,
      expectedReturnRate: expectedReturnRate || 12,
      existingSavings: existingSavings || 0,
      priority: 'high',
    });

    // Reset and close
    setTitle('');
    setIsAddModalOpen(false);
  };

  const getCategoryIcon = (cat: GoalItem['category']) => {
    switch (cat) {
      case 'education': return GraduationCap;
      case 'house': return Home;
      case 'marriage': return Heart;
      case 'emergency': return ShieldAlert;
      case 'retirement': return Coins;
      default: return Target;
    }
  };

  // Aggregate goal portfolio metrics
  const portfolioStats = React.useMemo(() => {
    let totalTargetFuture = 0;
    let totalExisting = 0;
    let totalRequiredMonthlySIP = 0;

    goals.forEach((g) => {
      const res = calculateGoalSIP({
        currentCost: g.currentCost,
        timePeriodYears: g.targetYears,
        inflationRate: g.inflationRate,
        expectedReturnRate: g.expectedReturnRate,
        existingSavings: g.existingSavings,
      });

      totalTargetFuture += res.futureCost;
      totalExisting += g.existingSavings;
      totalRequiredMonthlySIP += res.requiredMonthlySIP;
    });

    const progressPct = totalTargetFuture > 0 ? Math.round((totalExisting / totalTargetFuture) * 100) : 0;
    return { totalTargetFuture, totalExisting, totalRequiredMonthlySIP, progressPct };
  }, [goals]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              Goal Intelligence
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">Multi-Milestone Tracker</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Financial Goal Planning Workspace
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Map, prioritize, and monitor your long-term milestones with compounding inflation protection.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Aggregate Goal Portfolio Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Total Inflated Target</span>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono">
            {formatINR(portfolioStats.totalTargetFuture, { compact: true })}
          </div>
          <span className="text-[10px] text-slate-400">Across {goals.length} life goals</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Current Savings Allocated</span>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-mono">
            {formatINR(portfolioStats.totalExisting, { compact: true })}
          </div>
          <span className="text-[10px] text-slate-400">Compounding capital</span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/20">
          <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 block">Total Monthly SIP Needed</span>
          <div className="text-lg font-extrabold text-emerald-950 dark:text-emerald-200 mt-1 font-mono">
            {formatINR(portfolioStats.totalRequiredMonthlySIP, { compact: true })}
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400">Monthly commitment required</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Overall Funding Progress</span>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {portfolioStats.progressPct}%
          </div>
          <span className="text-[10px] text-slate-400">Aggregate goal coverage</span>
        </div>
      </div>

      {/* Goal Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Individual Milestone Trackers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => {
            const Icon = getCategoryIcon(goal.category);
            const res = calculateGoalSIP({
              currentCost: goal.currentCost,
              timePeriodYears: goal.targetYears,
              inflationRate: goal.inflationRate,
              expectedReturnRate: goal.expectedReturnRate,
              existingSavings: goal.existingSavings,
              annualStepUpPct: goal.annualStepUpPct,
            });

            return (
              <div
                key={goal.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4 transition-all hover:border-slate-300"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                          {goal.title}
                        </h3>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          {goal.category} • {goal.targetYears} Yrs Horizon
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Inflated Target vs Today */}
                  <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Target (Inflated {goal.inflationRate}%):</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">
                        {formatINR(res.futureCost, { compact: true })}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Cost in today's prices:</span>
                      <span>{formatINR(goal.currentCost, { compact: true })}</span>
                    </div>
                  </div>

                  {/* Required Monthly SIP */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Required Monthly SIP:</span>
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatINR(res.requiredMonthlySIP)}/mo
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                      <span>Existing: {formatINR(goal.existingSavings, { compact: true })}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {res.fundingProgressPct}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all"
                        style={{ width: `${res.fundingProgressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Open in calculator action */}
                <button
                  onClick={() => {
                    setActiveCalculatorId('goal-based-sip');
                    setActiveSection('goals');
                  }}
                  className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
                >
                  <span>Open Detailed Sensitivity Model</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-slate-900 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create Financial Milestone</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master's Degree in Germany"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-2 py-2 text-xs font-semibold"
                  >
                    <option value="retirement">Retirement</option>
                    <option value="education">Education</option>
                    <option value="house">House Purchase</option>
                    <option value="marriage">Marriage</option>
                    <option value="emergency">Emergency Fund</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Years to Target
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={targetYears === 0 ? '' : targetYears}
                    onChange={(e) => setTargetYears(e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Cost in Today's Prices (₹)
                </label>
                <input
                  type="number"
                  min={10000}
                  step={10000}
                  value={currentCost === 0 ? '' : currentCost}
                  onChange={(e) => setCurrentCost(e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Inflation Rate (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={15}
                    step={0.5}
                    value={inflationRate === 0 ? '' : inflationRate}
                    onChange={(e) => setInflationRate(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Expected Return (%)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    step={0.5}
                    value={expectedReturnRate === 0 ? '' : expectedReturnRate}
                    onChange={(e) => setExpectedReturnRate(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Existing Savings (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={existingSavings === 0 ? '' : existingSavings}
                  onChange={(e) => setExistingSavings(e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border px-3 py-1.5 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
