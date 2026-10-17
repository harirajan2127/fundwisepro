import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../engine/formatters';
import {
  Bookmark,
  Trash2,
  ExternalLink,
  Download,
  Upload,
  Calendar,
  FileText,
  Search,
} from 'lucide-react';

export const SavedScenariosManager: React.FC = () => {
  const { savedScenarios, deleteScenario, setActiveCalculatorId, setActiveSection } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = savedScenarios.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.calculatorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLaunch = (calcId: string) => {
    setActiveCalculatorId(calcId);
    setActiveSection('investments');
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedScenarios, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `fundwise_saved_scenarios_${Date.now()}.json`);
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
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              Workspace Memory
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">Local Browser Storage</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Saved Scenarios & Calculations ({savedScenarios.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Your saved investment plans are stored securely in your local browser storage. No account or cloud sync required.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {savedScenarios.length > 0 && (
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 shadow-sm transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export JSON Backup</span>
            </button>
          )}
        </div>
      </div>

      {savedScenarios.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
            <Bookmark className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Saved Scenarios Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            When you run any calculation, click the "Save Scenario" button in the top right to bookmark your custom numbers and notes here.
          </p>
          <button
            onClick={() => {
              setActiveCalculatorId('sip');
              setActiveSection('investments');
            }}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Launch SIP Calculator
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved scenarios..."
              className="w-full rounded-lg border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((scen) => (
              <div
                key={scen.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {scen.calculatorName}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                        {scen.name}
                      </h3>
                      <span className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        <span>Saved on: {scen.date}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => deleteScenario(scen.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Scenario"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Primary result */}
                  <div className="mt-3 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/60">
                    <span className="text-[10px] uppercase font-semibold text-emerald-800 dark:text-emerald-300 block">
                      {scen.primaryResult.label}
                    </span>
                    <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-mono">
                      {formatINR(scen.primaryResult.value, { compact: true })}
                    </div>
                  </div>

                  {scen.notes && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                      "{scen.notes}"
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleLaunch(scen.calculatorId)}
                  className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center space-x-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Resume Calculation</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
