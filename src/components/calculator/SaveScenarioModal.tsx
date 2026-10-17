import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bookmark, X, Check } from 'lucide-react';
import { formatINR } from '../../engine/formatters';

interface SaveScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculatorId: string;
  calculatorName: string;
  inputs: Record<string, any>;
  primaryResult: {
    label: string;
    value: number;
  };
}

export const SaveScenarioModal: React.FC<SaveScenarioModalProps> = ({
  isOpen,
  onClose,
  calculatorId,
  calculatorName,
  inputs,
  primaryResult,
}) => {
  const { saveScenario } = useApp();
  const [name, setName] = useState(`${calculatorName} Plan - ${new Date().toLocaleDateString('en-IN')}`);
  const [notes, setNotes] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveScenario({
      name: name.trim() || `${calculatorName} Scenario`,
      calculatorId,
      calculatorName,
      inputs,
      primaryResult,
      notes: notes.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md rounded-xl bg-white shadow-2xl ring-1 ring-slate-900/10 dark:bg-slate-900 dark:ring-slate-700 p-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Bookmark className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Save Investment Scenario
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Scenario Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 15Y Aggressive Growth Strategy"
              className="w-full rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Calculator</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{calculatorName}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>{primaryResult.label}</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {formatINR(primaryResult.value, { compact: true })}
              </span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Personal Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Modeled for 10% annual salary step-up, allocation to Flexi Cap funds..."
              className="w-full rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savedSuccess}
              className="inline-flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>Save Locally</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
