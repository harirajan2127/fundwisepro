import React from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Sun, Moon, BookOpen, Plus, ChevronRight, BarChart3, Menu } from 'lucide-react';
import { CALCULATORS } from '../../data/calculators';

export const TopBar: React.FC<{ onToggleMobileNav?: () => void }> = ({ onToggleMobileNav }) => {
  const {
    activeSection,
    activeCalculatorId,
    setIsSearchOpen,
    setIsMethodologyOpen,
    theme,
    toggleTheme,
    setActiveSection,
    setActiveCalculatorId,
  } = useApp();

  const currentCalc = CALCULATORS.find((c) => c.id === activeCalculatorId);

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'overview': return 'Overview';
      case 'all-calculators': return 'All Calculators';
      case 'investments': return 'Investments';
      case 'withdrawals': return 'Withdrawals';
      case 'goals': return 'Goal Planning';
      case 'returns': return 'Returns & Growth';
      case 'tax': return 'Tax & Charges';
      case 'comparisons': return 'Comparisons';
      case 'portfolio': return 'Portfolio & XIRR';
      case 'reports': return 'Financial Reports';
      case 'saved': return 'Saved Scenarios';
      case 'settings': return 'Settings';
      case 'scenario-lab': return 'Scenario Lab';
      case 'live-nav': return 'Live NAV Explorer';
      default: return 'FundWise Pro';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 md:px-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
      <div className="flex items-center space-x-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleMobileNav}
          className="inline-flex md:hidden items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand Logo (visible on mobile / desktop breadcrumb) */}
        <div
          onClick={() => setActiveSection('overview')}
          className="flex cursor-pointer items-center space-x-2.5 font-semibold"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              FundWise<span className="text-emerald-600 dark:text-emerald-400">Pro</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
              Fintech Platform
            </span>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 pl-4 border-l border-slate-200 dark:border-slate-800">
          <span className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer" onClick={() => setActiveSection('overview')}>
            Home
          </span>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {getSectionTitle()}
          </span>
          {activeSection !== 'overview' && activeSection !== 'all-calculators' && currentCalc && (
            <>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold truncate max-w-[200px]">
                {currentCalc.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Search trigger button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center space-x-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
        >
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden sm:inline">Search 53+ calculators...</span>
          <span className="sm:hidden">Search</span>
          <kbd className="hidden sm:inline-block rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 shadow-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300">
            ⌘K
          </kbd>
        </button>

        {/* Methodology & Financial Assumptions Modal */}
        <button
          onClick={() => setIsMethodologyOpen(true)}
          className="hidden md:inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          title="Methodology, Math Formulas & Tax Assumptions"
        >
          <BookOpen className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          <span>Formulas</span>
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        {/* Primary Action Button: New Calculation */}
        <button
          onClick={() => {
            setActiveCalculatorId('sip');
            setActiveSection('investments');
          }}
          className="inline-flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Calculation</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>
    </header>
  );
};
