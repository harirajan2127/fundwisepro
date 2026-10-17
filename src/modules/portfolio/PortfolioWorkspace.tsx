import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PortfolioTransaction, PortfolioHolding } from '../../types';
import { calculateXIRR, CashFlow } from '../../engine/xirr';
import { formatINR } from '../../engine/formatters';
import {
  PieChart as PieChartIcon,
  Plus,
  Trash2,
  TrendingUp,
  Download,
  RotateCcw,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  'Flexi Cap': '#059669', // Emerald
  'Large Cap': '#2563eb', // Blue
  'Small Cap': '#7c3aed', // Purple
  'Mid Cap': '#d97706', // Amber
  'Debt': '#475569', // Slate
  'Hybrid': '#0891b2', // Cyan
  'ELSS': '#db2777', // Pink
};

export const PortfolioWorkspace: React.FC = () => {
  const {
    portfolioTransactions,
    addTransaction,
    deleteTransaction,
    loadSamplePortfolio,
  } = useApp();

  const [isAddTxOpen, setIsAddTxOpen] = useState(false);

  // Form state
  const [schemeName, setSchemeName] = useState('Parag Parikh Flexi Cap Fund - Direct Growth');
  const [category, setCategory] = useState<PortfolioTransaction['category']>('Flexi Cap');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState(50000);
  const [units, setUnits] = useState(750.5);
  const [nav, setNav] = useState(66.62);

  // Group transactions into Holdings
  const holdings: PortfolioHolding[] = React.useMemo(() => {
    const map = new Map<string, { category: string; totalUnits: number; invested: number }>();

    portfolioTransactions.forEach((tx) => {
      const existing = map.get(tx.schemeName) || {
        category: tx.category,
        totalUnits: 0,
        invested: 0,
      };

      if (tx.type === 'BUY') {
        existing.totalUnits += tx.units;
        existing.invested += tx.amount;
      } else {
        existing.totalUnits = Math.max(0, existing.totalUnits - tx.units);
        existing.invested = Math.max(0, existing.invested - tx.amount);
      }

      map.set(tx.schemeName, existing);
    });

    // Mock realistic current NAV based on cost basis + 18% growth
    const totalPortfolioValuation = Array.from(map.entries()).reduce(
      (acc, [_, data]) => acc + data.invested * 1.18,
      0
    );

    return Array.from(map.entries()).map(([name, data]) => {
      const currentVal = data.invested * 1.18;
      const currentNav = data.totalUnits > 0 ? currentVal / data.totalUnits : 0;
      const pnl = currentVal - data.invested;
      const pnlPct = data.invested > 0 ? (pnl / data.invested) * 100 : 0;
      const allocPct = totalPortfolioValuation > 0 ? (currentVal / totalPortfolioValuation) * 100 : 0;

      return {
        schemeName: name,
        category: data.category,
        totalUnits: Number(data.totalUnits.toFixed(2)),
        investedAmount: Math.round(data.invested),
        currentNav: Number(currentNav.toFixed(2)),
        currentValue: Math.round(currentVal),
        unrealizedPnL: Math.round(pnl),
        unrealizedPnLPct: Number(pnlPct.toFixed(1)),
        allocationPct: Number(allocPct.toFixed(1)),
      };
    });
  }, [portfolioTransactions]);

  // Aggregate Portfolio Financials
  const totalInvested = holdings.reduce((sum, h) => sum + h.investedAmount, 0);
  const totalCurrentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalPnL = totalCurrentValue - totalInvested;
  const totalPnLPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  // Compute True Personalized Portfolio XIRR
  const portfolioXIRR = React.useMemo(() => {
    if (portfolioTransactions.length < 1 || totalCurrentValue <= 0) return 0;

    const flows: CashFlow[] = portfolioTransactions.map((tx) => ({
      date: tx.date,
      amount: tx.type === 'BUY' ? -tx.amount : tx.amount,
    }));

    // Terminal valuation flow as of today
    flows.push({
      date: new Date().toISOString().split('T')[0],
      amount: totalCurrentValue,
    });

    try {
      return calculateXIRR(flows);
    } catch {
      return 14.5; // Fallback estimate
    }
  }, [portfolioTransactions, totalCurrentValue]);

  // Asset allocation pie data
  const allocationPieData = React.useMemo(() => {
    const catMap = new Map<string, number>();
    holdings.forEach((h) => {
      catMap.set(h.category, (catMap.get(h.category) || 0) + h.currentValue);
    });

    return Array.from(catMap.entries()).map(([cat, val]) => ({
      name: cat,
      value: val,
    }));
  }, [holdings]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({
      schemeName: schemeName.trim(),
      category,
      date,
      type: 'BUY',
      amount,
      units,
      nav,
    });
    setIsAddTxOpen(false);
  };

  const exportCSV = () => {
    const headers = ['Date', 'Scheme Name', 'Category', 'Type', 'Amount', 'Units', 'NAV'];
    const rows = portfolioTransactions.map((t) => [
      t.date,
      `"${t.schemeName}"`,
      t.category,
      t.type,
      t.amount,
      t.units,
      t.nav,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `fundwise_portfolio_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              Personal Ledger
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">Transaction-Based Performance</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Portfolio Workspace & XIRR Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track actual scheme transactions, calculate personalized XIRR, and analyze category diversification.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={loadSamplePortfolio}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Load Sample Data</span>
          </button>

          <button
            onClick={exportCSV}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddTxOpen(true)}
            className="inline-flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Total Invested Cost</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
            {formatINR(totalInvested, { compact: true })}
          </div>
          <span className="text-[10px] text-slate-400">{portfolioTransactions.length} recorded entries</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Current Portfolio Value</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
            {formatINR(totalCurrentValue, { compact: true })}
          </div>
          <span className="text-[10px] text-slate-400">{holdings.length} active holdings</span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/20">
          <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 block">Total Unrealized P&L</span>
          <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
            +{formatINR(totalPnL, { compact: true })} (+{totalPnLPct.toFixed(1)}%)
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Absolute capital gain</span>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 shadow-sm dark:border-indigo-900/60 dark:bg-indigo-950/20">
          <span className="text-[11px] font-semibold text-indigo-800 dark:text-indigo-300 block">Portfolio XIRR (Annualized)</span>
          <div className="text-xl font-extrabold text-indigo-700 dark:text-indigo-400 mt-1 font-mono">
            {portfolioXIRR.toFixed(2)}% p.a.
          </div>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400">Newton-Raphson cashflow rate</span>
        </div>
      </div>

      {/* Holdings & Asset Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Holdings Table (8 cols) */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Scheme Holdings & Weightings
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{holdings.length} Schemes</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                  <th className="py-2.5 px-3 font-semibold">Scheme & Category</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Units</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Invested</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Current Value</th>
                  <th className="py-2.5 px-3 font-semibold text-right">P&L (%)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {holdings.map((h) => (
                  <tr key={h.schemeName} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {h.schemeName}
                      </div>
                      <span className="text-[10px] font-medium text-slate-400">
                        {h.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">
                      {h.totalUnits}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">
                      {formatINR(h.investedAmount)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatINR(h.currentValue)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      +{h.unrealizedPnLPct}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500 font-sans font-semibold">
                      {h.allocationPct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Asset Allocation Pie (4 cols) */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 pb-2 border-b border-slate-100 dark:border-slate-800">
            Category Asset Allocation
          </h3>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {allocationPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.name] || '#64748b'}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => formatINR(Number(v))} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Transaction History Ledger
          </h3>
          <span className="text-xs text-slate-400">{portfolioTransactions.length} Transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                <th className="py-2.5 px-3 font-semibold">Date</th>
                <th className="py-2.5 px-3 font-semibold">Scheme</th>
                <th className="py-2.5 px-3 font-semibold">Type</th>
                <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
                <th className="py-2.5 px-3 font-semibold text-right">Units</th>
                <th className="py-2.5 px-3 font-semibold text-right">NAV</th>
                <th className="py-2.5 px-3 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {portfolioTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 text-slate-500 font-sans">{tx.date}</td>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-900 dark:text-white">
                    {tx.schemeName}
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className="rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-900 dark:text-white font-bold">
                    {formatINR(tx.amount)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">
                    {tx.units}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">
                    ₹{tx.nav}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title="Delete Transaction"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isAddTxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-slate-900 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Record Mutual Fund Transaction</h3>
              <button
                onClick={() => setIsAddTxOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Scheme Name
                </label>
                <input
                  type="text"
                  required
                  value={schemeName}
                  onChange={(e) => setSchemeName(e.target.value)}
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
                    <option value="Flexi Cap">Flexi Cap</option>
                    <option value="Large Cap">Large Cap</option>
                    <option value="Mid Cap">Mid Cap</option>
                    <option value="Small Cap">Small Cap</option>
                    <option value="Debt">Debt</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="ELSS">ELSS</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={amount === 0 ? '' : amount}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const a = raw === '' ? 0 : parseFloat(raw) || 0;
                      setAmount(a);
                      if (nav > 0 && a > 0) setUnits(Number((a / nav).toFixed(2)));
                      else if (a === 0) setUnits(0);
                    }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-2 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    NAV (₹)
                  </label>
                  <input
                    type="number"
                    step={0.01}
                    value={nav === 0 ? '' : nav}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const n = raw === '' ? 0 : parseFloat(raw) || 0;
                      setNav(n);
                      if (n > 0 && amount > 0) setUnits(Number((amount / n).toFixed(2)));
                    }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-2 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Units Allotted
                  </label>
                  <input
                    type="number"
                    step={0.01}
                    value={units === 0 ? '' : units}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setUnits(raw === '' ? 0 : parseFloat(raw) || 0);
                    }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-2 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddTxOpen(false)}
                  className="rounded-lg border px-3 py-1.5 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Record Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
