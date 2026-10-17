import React from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Moon, Sun, Globe, Shield, Trash2, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    theme,
    toggleTheme,
    numberFormat,
    setNumberFormat,
  } = useApp();

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to reset all local goals, portfolio entries, and saved scenarios?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Platform Settings & Financial Assumptions
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize currency numbering, default return rates, tax regimes, and theme preferences.
        </p>
      </div>

      <div className="space-y-4">
        {/* Number Formatting */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Currency & Number Representation
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose between Indian numbering (Lakhs and Crores) or standard international comma format.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setNumberFormat('lakhs-crores')}
              className={`p-3 rounded-lg border text-left text-xs transition-all ${
                numberFormat === 'lakhs-crores'
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="font-bold">Indian Format (Lakhs & Crores)</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                ₹1,25,00,000 (₹1.25 Cr)
              </div>
            </button>

            <button
              onClick={() => setNumberFormat('standard')}
              className={`p-3 rounded-lg border text-left text-xs transition-all ${
                numberFormat === 'standard'
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="font-bold">Standard Format</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                ₹12,500,000 (₹12.5M)
              </div>
            </button>
          </div>
        </div>

        {/* Visual Appearance / Theme */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Visual Appearance
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            FundWise Pro defaults to an executive light mode with dark navy typography and neutral surfaces.
          </p>

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={toggleTheme}
              className="inline-flex items-center space-x-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span>Toggle to {theme === 'light' ? 'Dark' : 'Light'} Mode</span>
            </button>
            <span className="text-xs text-slate-400">Currently active: {theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
        </div>

        {/* Tax Year Ruleset */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Tax Framework Version
            </h3>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold">Union Budget 2024 / Finance Act 2024 Rules (Active)</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Includes Equity LTCG at 12.5% exceeding ₹1.25 Lakhs, Equity STCG at 20%, and Debt mutual funds at marginal slab rate.
          </p>
        </div>

        {/* Local Data Storage Reset */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-5 shadow-sm dark:border-rose-950 dark:bg-rose-950/10 space-y-3">
          <div className="flex items-center space-x-2">
            <Trash2 className="h-4 w-4 text-rose-600" />
            <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
              Clear Local Data & Reset State
            </h3>
          </div>
          <p className="text-xs text-rose-700/80 dark:text-rose-300/80">
            Removes all locally stored calculations, goals, and portfolio transactions from this browser.
          </p>
          <button
            onClick={handleClearData}
            className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors"
          >
            Clear All Local Data
          </button>
        </div>
      </div>
    </div>
  );
};
