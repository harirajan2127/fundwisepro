import React from 'react';
import { Insight } from '../../types';
import { Lightbulb, AlertTriangle, CheckCircle, Info, ArrowUpRight } from 'lucide-react';

interface InsightBannerProps {
  insights: Insight[];
}

export const InsightBanner: React.FC<InsightBannerProps> = ({ insights }) => {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
        <span>Quantitative Insights & Strategic Observations</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {insights.map((item) => {
          let borderClass = 'border-emerald-200 bg-emerald-50/70 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-100';
          let icon = <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;

          if (item.type === 'warning') {
            borderClass = 'border-amber-200 bg-amber-50/70 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100';
            icon = <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />;
          } else if (item.type === 'critical') {
            borderClass = 'border-rose-200 bg-rose-50/70 text-rose-950 dark:border-rose-900/60 dark:bg-rose-950/20 dark:text-rose-100';
            icon = <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />;
          } else if (item.type === 'info') {
            borderClass = 'border-indigo-200 bg-indigo-50/70 text-indigo-950 dark:border-indigo-900/60 dark:bg-indigo-950/20 dark:text-indigo-100';
            icon = <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />;
          }

          return (
            <div
              key={item.id}
              className={`rounded-xl border p-3.5 transition-all ${borderClass}`}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">{icon}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold leading-none">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed opacity-90">
                    {item.observation}
                  </p>
                  <p className="text-xs font-semibold leading-relaxed">
                    {item.numericalComparison}
                  </p>
                  <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] opacity-75 gap-1">
                    <span>
                      <strong>Basis:</strong> {item.assumption}
                    </span>
                    {item.actionRecommendation && (
                      <span className="flex items-center space-x-1 font-semibold text-emerald-700 dark:text-emerald-300">
                        <span>Action: {item.actionRecommendation}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
