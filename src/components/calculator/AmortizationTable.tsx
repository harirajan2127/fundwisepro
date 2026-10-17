import React, { useState } from 'react';
import { AmortizationRow } from '../../types';
import { formatINR } from '../../engine/formatters';
import { Download, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';

interface AmortizationTableProps {
  schedule: AmortizationRow[];
  title?: string;
  isSWP?: boolean;
}

export const AmortizationTable: React.FC<AmortizationTableProps> = ({
  schedule,
  title = 'Year-by-Year Amortization Schedule',
  isSWP = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(schedule.length / pageSize);

  const paginatedRows = schedule.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const downloadCSV = () => {
    if (!schedule.length) return;

    const headers = isSWP
      ? ['Year', 'Opening Balance', 'Annual Withdrawal', 'Interest Earned', 'Closing Balance']
      : ['Year', 'Opening Balance', 'Annual Investment', 'Interest Earned', 'Total Invested', 'Closing Balance', 'Inflation Adjusted Balance'];

    const rows = schedule.map((r) =>
      isSWP
        ? [r.periodLabel, r.openingBalance, r.withdrawal || 0, r.interestEarned, r.closingBalance]
        : [r.periodLabel, r.openingBalance, r.contribution, r.interestEarned, r.totalInvested, r.closingBalance, r.inflationAdjustedBalance || '']
    );

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fundwise_schedule_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Full annual breakdown of cash flows, compounding interest, and balances.
          </p>
        </div>
        <button
          onClick={downloadCSV}
          className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors self-start sm:self-auto"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
              <th className="py-2.5 px-3 font-semibold">Period</th>
              <th className="py-2.5 px-3 font-semibold text-right">Opening</th>
              <th className="py-2.5 px-3 font-semibold text-right">
                {isSWP ? 'Withdrawals' : 'Deposit'}
              </th>
              <th className="py-2.5 px-3 font-semibold text-right">Interest Growth</th>
              {!isSWP && (
                <th className="py-2.5 px-3 font-semibold text-right">Invested Cumul.</th>
              )}
              <th className="py-2.5 px-3 font-semibold text-right">Closing Balance</th>
              {!isSWP && (
                <th className="py-2.5 px-3 font-semibold text-right text-slate-500">
                  Real Value (Inf. Adj)
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {paginatedRows.map((row) => (
              <tr
                key={row.period}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="py-2.5 px-3 font-sans font-medium text-slate-900 dark:text-slate-200">
                  {row.periodLabel}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">
                  {formatINR(row.openingBalance)}
                </td>
                <td className="py-2.5 px-3 text-right font-medium text-slate-800 dark:text-slate-200">
                  {formatINR(isSWP ? row.withdrawal || 0 : row.contribution)}
                </td>
                <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                  +{formatINR(row.interestEarned)}
                </td>
                {!isSWP && (
                  <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">
                    {formatINR(row.totalInvested)}
                  </td>
                )}
                <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                  {formatINR(row.closingBalance)}
                </td>
                {!isSWP && (
                  <td className="py-2.5 px-3 text-right text-slate-400 dark:text-slate-500">
                    {row.inflationAdjustedBalance ? formatINR(row.inflationAdjustedBalance) : '-'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, schedule.length)} of {schedule.length} years
          </span>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-medium px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
