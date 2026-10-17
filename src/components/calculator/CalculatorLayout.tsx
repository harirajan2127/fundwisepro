import React, { useState } from 'react';
import { CalculatorMeta, CalculationResult } from '../../types';
import { formatINR } from '../../engine/formatters';
import { AmortizationTable } from './AmortizationTable';
import { InsightBanner } from './InsightBanner';
import { MonteCarloVisualizer } from './MonteCarloVisualizer';
import { StressTestCard } from './StressTestCard';
import { SaveScenarioModal } from './SaveScenarioModal';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Bookmark,
  Printer,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  BarChart2,
  TrendingUp,
  SlidersHorizontal,
  FileText,
  Table as TableIcon,
  Activity,
  ShieldAlert,
} from 'lucide-react';

interface CalculatorLayoutProps {
  meta: CalculatorMeta;
  result: CalculationResult;
  inputsComponent: React.ReactNode;
  advancedInputsComponent?: React.ReactNode;
  onReset?: () => void;
  rawInputs: Record<string, any>;
  isSWP?: boolean;
}

export const CalculatorLayout: React.FC<CalculatorLayoutProps> = ({
  meta,
  result,
  inputsComponent,
  advancedInputsComponent,
  onReset,
  rawInputs,
  isSWP = false,
}) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'monte-carlo' | 'stress-test' | 'methodology'>('schedule');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title & Metadata Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {meta.categoryName}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Validated Engine</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {meta.name}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
            {meta.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0 no-print">
          <button
            onClick={() => setIsSaveModalOpen(true)}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Bookmark className="h-3.5 w-3.5 text-emerald-600" />
            <span>Save Scenario</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm"
            title="Print or Save as PDF"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Inputs Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Investment Parameters
                </h3>
              </div>
              {onReset && (
                <button
                  onClick={onReset}
                  className="flex items-center space-x-1 text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset Defaults</span>
                </button>
              )}
            </div>

            {/* Inputs Injection */}
            <div className="space-y-4">{inputsComponent}</div>

            {/* Expandable Advanced Settings */}
            {advancedInputsComponent && (
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex w-full items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <span className="flex items-center space-x-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Advanced Assumptions & Adjustments</span>
                  </span>
                  {showAdvanced ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>

                {showAdvanced && (
                  <div className="mt-4 space-y-4 pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                    {advancedInputsComponent}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Output & Visualization (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Primary Result Highlight Banner */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  {result.primaryLabel}
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white mt-1">
                  {formatINR(result.primaryValue)}
                </div>
                {result.summaryNote && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {result.summaryNote}
                  </p>
                )}
              </div>
              <div className="sm:text-right">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Compact View
                </span>
                <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                  {formatINR(result.primaryValue, { compact: true })}
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {result.secondaryMetrics.map((metric, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors"
              >
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
                  {metric.label}
                </span>
                <div
                  className={`text-base sm:text-lg font-bold mt-1 truncate ${
                    metric.isPositive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : metric.isNegative
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {typeof metric.value === 'number' ? formatINR(metric.value, { compact: true }) : metric.value}
                </div>
                {metric.subtext && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate mt-0.5">
                    {metric.subtext}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Chart Section */}
          {result.chartData && result.chartData.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Wealth Growth Projection
                  </h3>
                </div>

                {/* Chart Toggle */}
                <div className="flex items-center rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
                  <button
                    onClick={() => setChartType('area')}
                    className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                      chartType === 'area'
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                    }`}
                  >
                    Area
                  </button>
                  <button
                    onClick={() => setChartType('bar')}
                    className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                      chartType === 'bar'
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                    }`}
                  >
                    Bar
                  </button>
                </div>
              </div>

              {/* Chart Canvas */}
              <div className="h-64 sm:h-72 w-full pt-3">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'area' ? (
                    <AreaChart
                      data={result.chartData}
                      margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#475569" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#475569" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => `Yr ${v}`}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => formatINR(v, { compact: true })}
                      />
                      <Tooltip
                        formatter={(val: any) => [formatINR(Number(val)), '']}
                        labelFormatter={(lbl) => `Year ${lbl}`}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                        formatter={(value) =>
                          value === 'total'
                            ? 'Total Corpus (Maturity)'
                            : value === 'invested'
                            ? 'Total Invested Capital'
                            : value === 'realValue'
                            ? 'Inflation-Adjusted Value'
                            : value === 'remainingCorpus'
                            ? 'Remaining SWP Corpus'
                            : value === 'totalWithdrawn'
                            ? 'Total Withdrawn'
                            : value
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey={isSWP ? 'remainingCorpus' : 'total'}
                        stroke="#059669"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#totalGrad)"
                      />
                      <Area
                        type="monotone"
                        dataKey={isSWP ? 'totalWithdrawn' : 'invested'}
                        stroke="#475569"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#investedGrad)"
                      />
                    </AreaChart>
                  ) : (
                    <BarChart
                      data={result.chartData}
                      margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => `Yr ${v}`}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => formatINR(v, { compact: true })}
                      />
                      <Tooltip
                        formatter={(val: any) => [formatINR(Number(val)), '']}
                        labelFormatter={(lbl) => `Year ${lbl}`}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                      <Bar
                        dataKey={isSWP ? 'remainingCorpus' : 'invested'}
                        name={isSWP ? 'Remaining Balance' : 'Principal Invested'}
                        fill="#475569"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey={isSWP ? 'totalWithdrawn' : 'interest'}
                        name={isSWP ? 'Cumulative Withdrawn' : 'Wealth Gain (Interest)'}
                        fill="#059669"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Smart Insights Banner */}
          {result.insights && result.insights.length > 0 && (
            <InsightBanner insights={result.insights} />
          )}
        </div>
      </div>

      {/* Deep-Dive Bottom Tabs */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center space-x-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'border-emerald-600 text-emerald-800 dark:border-emerald-400 dark:text-emerald-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <TableIcon className="h-4 w-4" />
            <span>Year-by-Year Schedule</span>
          </button>

          <button
            onClick={() => setActiveTab('monte-carlo')}
            className={`flex items-center space-x-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'monte-carlo'
                ? 'border-indigo-600 text-indigo-800 dark:border-indigo-400 dark:text-indigo-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="h-4 w-4 text-indigo-500" />
            <span>Probabilistic Monte Carlo</span>
          </button>

          <button
            onClick={() => setActiveTab('stress-test')}
            className={`flex items-center space-x-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'stress-test'
                ? 'border-rose-600 text-rose-800 dark:border-rose-400 dark:text-rose-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="h-4 w-4 text-rose-500" />
            <span>Financial Stress Test</span>
          </button>

          <button
            onClick={() => setActiveTab('methodology')}
            className={`flex items-center space-x-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'methodology'
                ? 'border-slate-800 text-slate-900 dark:border-slate-200 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Formula & Notes</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div>
          {activeTab === 'schedule' && (
            <AmortizationTable schedule={result.schedule} isSWP={isSWP} />
          )}

          {activeTab === 'monte-carlo' && (
            <MonteCarloVisualizer
              initialCorpus={rawInputs.initialCorpus || rawInputs.investmentAmount || 0}
              monthlyContribution={rawInputs.monthlyInvestment || 0}
              years={rawInputs.timePeriodYears || 10}
              expectedReturnRate={rawInputs.expectedReturnRate || 12}
              monthlyWithdrawal={rawInputs.monthlyWithdrawal || 0}
              targetGoal={rawInputs.targetGoal || 0}
            />
          )}

          {activeTab === 'stress-test' && (
            <StressTestCard
              monthlyInvestment={rawInputs.monthlyInvestment || Math.round((rawInputs.investmentAmount || 100000) / 12)}
              expectedReturnRate={rawInputs.expectedReturnRate || 12}
              years={rawInputs.timePeriodYears || 10}
              inflationRate={rawInputs.inflationRate || 6}
            />
          )}

          {activeTab === 'methodology' && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Formula: {meta.formula}
              </h3>
              <p>{meta.formulaExplanation}</p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                <strong>Assumption Transparency:</strong> Cash flows timing is modeled using standard mutual fund conventions. Taxes are calculated in accordance with the Indian Income Tax Act as updated by Finance Act 2024.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Scenario Modal */}
      <SaveScenarioModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        calculatorId={meta.id}
        calculatorName={meta.name}
        inputs={rawInputs}
        primaryResult={{
          label: result.primaryLabel,
          value: result.primaryValue,
        }}
      />
    </div>
  );
};
