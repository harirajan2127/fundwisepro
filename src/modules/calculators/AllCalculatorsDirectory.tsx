import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CALCULATORS, CATEGORIES } from '../../data/calculators';
import { Search, ChevronRight, Calculator, Sparkles, Filter } from 'lucide-react';

export const AllCalculatorsDirectory: React.FC = () => {
  const { setActiveCalculatorId, setActiveSection } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = CALCULATORS.filter((calc) => {
    const matchesCategory = selectedCategory === 'all' || calc.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      searchQuery === '' ||
      calc.name.toLowerCase().includes(q) ||
      calc.shortDesc.toLowerCase().includes(q) ||
      calc.tags.some((t) => t.toLowerCase().includes(q));

    return matchesCategory && matchesQuery;
  });

  const handleLaunch = (calcId: string, category: string) => {
    setActiveCalculatorId(calcId);
    setActiveSection(category as any);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Complete Financial Calculator Library
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse and launch all 53 quantitative mutual fund and wealth planning instruments.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all 53 calculators..."
            className="w-full rounded-lg border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          All Calculators ({CALCULATORS.length})
        </button>

        {CATEGORIES.map((cat) => {
          const count = CALCULATORS.filter((c) => c.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Calculators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((calc) => (
          <div
            key={calc.id}
            onClick={() => handleLaunch(calc.id, calc.category)}
            className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-500 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {calc.categoryName}
                </span>
                {calc.featured && (
                  <span className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="h-3 w-3" />
                    <span>Popular</span>
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {calc.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {calc.shortDesc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Launch Tool</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
