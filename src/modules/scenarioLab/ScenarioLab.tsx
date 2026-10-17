import React, { useState } from 'react';
import { calculateSIP, SIPInputs } from '../../engine/sip';
import { formatINR } from '../../engine/formatters';
import { InputWithSlider } from '../../components/common/InputWithSlider';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { GitCompare, Sparkles, TrendingUp, ArrowUpRight, Scale } from 'lucide-react';

export const ScenarioLab: React.FC = () => {
  // Scenario A (Baseline Flat SIP)
  const [sipA, setSipA] = useState(10000);
  const [returnA, setReturnA] = useState(12);
  const [stepUpA, setStepUpA] = useState(0);

  // Scenario B (Step-up SIP)
  const [sipB, setSipB] = useState(10000);
  const [returnB, setReturnB] = useState(12);
  const [stepUpB, setStepUpB] = useState(10);

  // Scenario C (Higher initial commitment or higher return)
  const [sipC, setSipC] = useState(15000);
  const [returnC, setReturnC] = useState(12);
  const [stepUpC, setStepUpC] = useState(0);

  // Shared Horizon & Inflation
  const [years, setYears] = useState(15);
  const [inflationRate, setInflationRate] = useState(6);

  const resA = calculateSIP({
    monthlyInvestment: sipA,
    expectedReturnRate: returnA,
    timePeriodYears: years,
    stepUpPct: stepUpA,
    inflationRate,
  });

  const resB = calculateSIP({
    monthlyInvestment: sipB,
    expectedReturnRate: returnB,
    timePeriodYears: years,
    stepUpPct: stepUpB,
    inflationRate,
  });

  const resC = calculateSIP({
    monthlyInvestment: sipC,
    expectedReturnRate: returnC,
    timePeriodYears: years,
    stepUpPct: stepUpC,
    inflationRate,
  });

  // Synced chart data
  const chartData = resA.yearlyChartData.map((d, idx) => ({
    year: `Yr ${d.year}`,
    scenarioA: d.total,
    scenarioB: resB.yearlyChartData[idx]?.total || 0,
    scenarioC: resC.yearlyChartData[idx]?.total || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              Strategy Lab
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">Multi-Path Simulation</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Scenario Comparison Lab (3-Way Strategy Modeling)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulate and contrast 3 distinct investment strategies side-by-side with synchronized compounding curves.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 shadow-sm">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Horizon:</span>
          <select
            value={years}
            onChange={(e) => setYears(parseInt(e.target.value, 10))}
            className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 font-bold text-slate-900 dark:text-white"
          >
            <option value={5}>5 Years</option>
            <option value={10}>10 Years</option>
            <option value={15}>15 Years</option>
            <option value={20}>20 Years</option>
            <option value={25}>25 Years</option>
          </select>
        </div>
      </div>

      {/* 3 Strategy Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Scenario A Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-500" />
              <span>Strategy A (Baseline Flat)</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-500">Standard</span>
          </div>

          <div className="space-y-3">
            <InputWithSlider
              label="Monthly SIP"
              prefix="₹"
              min={1000}
              max={100000}
              step={1000}
              value={sipA}
              onChange={setSipA}
            />
            <InputWithSlider
              label="Expected Return"
              suffix="%"
              min={5}
              max={25}
              step={0.5}
              value={returnA}
              onChange={setReturnA}
            />
            <InputWithSlider
              label="Annual Step-Up"
              suffix="%"
              min={0}
              max={25}
              step={1}
              value={stepUpA}
              onChange={setStepUpA}
            />
          </div>

          {/* Outcome Metric */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Final Projected Corpus</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              {formatINR(resA.totalMaturityValue, { compact: true })}
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Invested:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{formatINR(resA.totalInvested, { compact: true })}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Returns:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">+{formatINR(resA.estimatedReturns, { compact: true })}</span>
            </div>
          </div>
        </div>

        {/* Scenario B Card (Step-Up Boost) */}
        <div className="rounded-xl border border-emerald-300 bg-emerald-50/20 p-5 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/10 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-100 dark:border-emerald-900/60">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span>Strategy B (10% Step-Up)</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
              Recommended
            </span>
          </div>

          <div className="space-y-3">
            <InputWithSlider
              label="Monthly SIP"
              prefix="₹"
              min={1000}
              max={100000}
              step={1000}
              value={sipB}
              onChange={setSipB}
            />
            <InputWithSlider
              label="Expected Return"
              suffix="%"
              min={5}
              max={25}
              step={0.5}
              value={returnB}
              onChange={setReturnB}
            />
            <InputWithSlider
              label="Annual Step-Up"
              suffix="%"
              min={0}
              max={25}
              step={1}
              value={stepUpB}
              onChange={setStepUpB}
            />
          </div>

          {/* Outcome Metric */}
          <div className="pt-3 border-t border-emerald-100 dark:border-emerald-900/60 space-y-2">
            <span className="text-[10px] uppercase font-semibold text-emerald-700 dark:text-emerald-400 block">Final Projected Corpus</span>
            <div className="text-xl font-extrabold text-emerald-950 dark:text-emerald-300 font-mono">
              {formatINR(resB.totalMaturityValue, { compact: true })}
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Invested:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{formatINR(resB.totalInvested, { compact: true })}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Delta vs A:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
                +{formatINR(resB.totalMaturityValue - resA.totalMaturityValue, { compact: true })}
              </span>
            </div>
          </div>
        </div>

        {/* Scenario C Card */}
        <div className="rounded-xl border border-indigo-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              <span>Strategy C (Higher Outlay)</span>
            </span>
            <span className="text-[10px] font-semibold text-indigo-600">Aggressive</span>
          </div>

          <div className="space-y-3">
            <InputWithSlider
              label="Monthly SIP"
              prefix="₹"
              min={1000}
              max={100000}
              step={1000}
              value={sipC}
              onChange={setSipC}
            />
            <InputWithSlider
              label="Expected Return"
              suffix="%"
              min={5}
              max={25}
              step={0.5}
              value={returnC}
              onChange={setReturnC}
            />
            <InputWithSlider
              label="Annual Step-Up"
              suffix="%"
              min={0}
              max={25}
              step={1}
              value={stepUpC}
              onChange={setStepUpC}
            />
          </div>

          {/* Outcome Metric */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-semibold text-indigo-600 dark:text-indigo-400 block">Final Projected Corpus</span>
            <div className="text-xl font-extrabold text-indigo-950 dark:text-indigo-200 font-mono">
              {formatINR(resC.totalMaturityValue, { compact: true })}
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Invested:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{formatINR(resC.totalInvested, { compact: true })}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Delta vs A:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
                +{formatINR(resC.totalMaturityValue - resA.totalMaturityValue, { compact: true })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized Multi-Curve Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          Synchronized Wealth Trajectory Comparison
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="curveB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="curveC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => formatINR(v, { compact: true })}
              />
              <Tooltip formatter={(val: any) => [formatINR(Number(val)), '']} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                formatter={(val) =>
                  val === 'scenarioA'
                    ? 'Strategy A (Flat)'
                    : val === 'scenarioB'
                    ? 'Strategy B (Step-Up 10%)'
                    : 'Strategy C (Higher SIP)'
                }
              />
              <Area
                type="monotone"
                dataKey="scenarioB"
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#curveB)"
              />
              <Area
                type="monotone"
                dataKey="scenarioC"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#curveC)"
              />
              <Area
                type="monotone"
                dataKey="scenarioA"
                stroke="#64748b"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
