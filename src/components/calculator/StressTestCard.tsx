import React from 'react';
import { runStressTests, StressTestScenario } from '../../engine/stressTest';
import { formatINR } from '../../engine/formatters';
import { ShieldAlert, AlertTriangle, ArrowDownRight, CheckCircle2 } from 'lucide-react';

interface StressTestCardProps {
  monthlyInvestment: number;
  expectedReturnRate: number;
  years: number;
  inflationRate?: number;
}

export const StressTestCard: React.FC<StressTestCardProps> = ({
  monthlyInvestment,
  expectedReturnRate,
  years,
  inflationRate = 6,
}) => {
  const scenarios: StressTestScenario[] = React.useMemo(() => {
    return runStressTests({
      monthlyInvestment,
      expectedReturnRate,
      timePeriodYears: years,
      inflationRate,
    });
  }, [monthlyInvestment, expectedReturnRate, years, inflationRate]);

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          <ShieldAlert className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Adverse Financial Stress Testing Suite
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Evaluate how shocks, pauses, inflation spikes, and emergency withdrawals impact terminal wealth.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {scenarios.map((scen) => {
          let scoreBadge = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
          if (scen.resilienceScore === 'Moderate') {
            scoreBadge = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
          } else if (scen.resilienceScore === 'Vulnerable') {
            scoreBadge = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
          }

          return (
            <div
              key={scen.id}
              className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {scen.title}
                  </h4>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${scoreBadge}`}>
                    {scen.resilienceScore} Resilience
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {scen.description}
                </p>

                {/* Numbers */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs py-2 px-3 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Stressed Corpus</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatINR(scen.stressedCorpus, { compact: true })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Impact vs Base</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center">
                      <ArrowDownRight className="h-3 w-3 mr-0.5" />
                      -{formatINR(scen.corpusDifference, { compact: true })} ({scen.differencePct}%)
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800 pt-2 italic">
                {scen.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
