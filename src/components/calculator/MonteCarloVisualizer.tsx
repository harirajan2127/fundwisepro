import React, { useState } from 'react';
import { runMonteCarloSimulation } from '../../engine/monteCarlo';
import { formatINR } from '../../engine/formatters';
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
import { Activity, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

interface MonteCarloVisualizerProps {
  initialCorpus: number;
  monthlyContribution: number;
  years: number;
  expectedReturnRate: number;
  monthlyWithdrawal?: number;
  targetGoal?: number;
}

export const MonteCarloVisualizer: React.FC<MonteCarloVisualizerProps> = ({
  initialCorpus,
  monthlyContribution,
  years,
  expectedReturnRate,
  monthlyWithdrawal = 0,
  targetGoal = 0,
}) => {
  const [volatility, setVolatility] = useState(15); // 15% standard deviation for Indian equity
  const [simCount, setSimCount] = useState(500);
  const [seedKey, setSeedKey] = useState(0);

  const simulation = React.useMemo(() => {
    return runMonteCarloSimulation({
      initialCorpus,
      monthlyContribution,
      timePeriodYears: years,
      expectedReturnRate,
      volatilityRate: volatility,
      monthlyWithdrawal,
      targetGoal,
      simulationsCount: simCount,
    });
  }, [initialCorpus, monthlyContribution, years, expectedReturnRate, volatility, monthlyWithdrawal, targetGoal, simCount, seedKey]);

  // Transform data for Recharts fan chart
  const chartData = simulation.years.map((yr, idx) => ({
    year: `Yr ${yr}`,
    p10: simulation.p10[idx],
    p25: simulation.p25[idx],
    p50: simulation.p50[idx],
    p75: simulation.p75[idx],
    p90: simulation.p90[idx],
  }));

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Monte Carlo Probabilistic Distribution ({simCount} Iterations)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Simulates market volatility paths using log-normal geometric random walks.
            </p>
          </div>
        </div>

        {/* Re-run button */}
        <button
          onClick={() => setSeedKey((k) => k + 1)}
          className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="h-3 w-3 text-slate-500" />
          <span>Re-Simulate</span>
        </button>
      </div>

      {/* Volatility & Param Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            <span>Market Volatility (Annual σ): {volatility}%</span>
            <span className="text-slate-400 font-normal">Nifty 50 Historical ~15%</span>
          </div>
          <input
            type="range"
            min={8}
            max={30}
            step={1}
            value={volatility}
            onChange={(e) => setVolatility(parseInt(e.target.value, 10))}
            className="w-full accent-indigo-600"
          />
        </div>
        <div className="flex items-center justify-between sm:justify-end space-x-4 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Iterations</span>
            <select
              value={simCount}
              onChange={(e) => setSimCount(parseInt(e.target.value, 10))}
              className="mt-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 font-semibold text-slate-900 dark:text-slate-100"
            >
              <option value={200}>200 Trials (Fast)</option>
              <option value={500}>500 Trials (Standard)</option>
              <option value={1000}>1,000 Trials (Detailed)</option>
            </select>
          </div>
          {targetGoal > 0 && (
            <div className="text-right">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Target Goal Chance</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {simulation.successProbability}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Metric summary fan */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
            Adverse Case (10th %ile)
          </span>
          <div className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1">
            {formatINR(simulation.p10TerminalValue, { compact: true })}
          </div>
          <span className="text-[10px] text-slate-400">90% of trials exceeded this</span>
        </div>

        <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-3 dark:border-indigo-900/60 dark:bg-indigo-950/20">
          <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase">
            Median Outcome (50th %ile)
          </span>
          <div className="text-base font-bold text-indigo-950 dark:text-indigo-200 mt-1">
            {formatINR(simulation.medianTerminalValue, { compact: true })}
          </div>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400">50% chance above / below</span>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
            Optimistic Case (90th %ile)
          </span>
          <div className="text-base font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {formatINR(simulation.p90TerminalValue, { compact: true })}
          </div>
          <span className="text-[10px] text-slate-400">Top 10% bullish outcome</span>
        </div>
      </div>

      {/* Fan Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="fan90" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fan75" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => formatINR(v, { compact: true })}
            />
            <Tooltip
              formatter={(val: any, name: any) => [
                formatINR(Number(val)),
                name === 'p50'
                  ? 'Median (50th %ile)'
                  : name === 'p10'
                  ? 'Adverse (10th %ile)'
                  : name === 'p90'
                  ? 'Optimistic (90th %ile)'
                  : name === 'p75'
                  ? 'Upper Band (75th %ile)'
                  : 'Lower Band (25th %ile)',
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              formatter={(value) =>
                value === 'p50'
                  ? 'Median (50th %ile)'
                  : value === 'p10'
                  ? '10th %ile (Adverse)'
                  : value === 'p90'
                  ? '90th %ile (Optimistic)'
                  : value
              }
            />
            <Area
              type="monotone"
              dataKey="p90"
              stroke="#818cf8"
              fillOpacity={1}
              fill="url(#fan90)"
              strokeDasharray="4 4"
            />
            <Area
              type="monotone"
              dataKey="p75"
              stroke="#6366f1"
              fillOpacity={1}
              fill="url(#fan75)"
            />
            <Area
              type="monotone"
              dataKey="p50"
              stroke="#4338ca"
              strokeWidth={2.5}
              fill="none"
            />
            <Area
              type="monotone"
              dataKey="p10"
              stroke="#94a3b8"
              strokeDasharray="4 4"
              fill="none"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
        * Monte Carlo models statistical dispersion based on historical equity volatility. Real markets can encounter structural deviations, non-normal fat tails, and policy shocks.
      </p>
    </div>
  );
};
