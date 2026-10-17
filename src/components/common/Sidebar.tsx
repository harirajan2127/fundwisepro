import React from 'react';
import { useApp, NavigationSection } from '../../context/AppContext';
import {
  LayoutDashboard,
  Calculator,
  TrendingUp,
  ArrowDownRight,
  Target,
  LineChart,
  Receipt,
  Scale,
  PieChart,
  FileText,
  Bookmark,
  Settings,
  GitCompare,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { CALCULATORS } from '../../data/calculators';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const { activeSection, setActiveSection, savedScenarios, goals } = useApp();

  const navItems: {
    id: NavigationSection;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'all-calculators', label: 'All Calculators', icon: Calculator, badge: CALCULATORS.length },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
    { id: 'withdrawals', label: 'Withdrawals (SWP)', icon: ArrowDownRight },
    { id: 'goals', label: 'Goal Planning', icon: Target, badge: goals.length > 0 ? goals.length : undefined },
    { id: 'returns', label: 'Returns & Growth', icon: LineChart },
    { id: 'tax', label: 'Tax & Charges', icon: Receipt },
    { id: 'comparisons', label: 'Comparisons', icon: Scale },
    { id: 'portfolio', label: 'Portfolio & XIRR', icon: PieChart },
    { id: 'reports', label: 'Financial Reports', icon: FileText },
    { id: 'saved', label: 'Saved Scenarios', icon: Bookmark, badge: savedScenarios.length > 0 ? savedScenarios.length : undefined },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id: NavigationSection) => {
    setActiveSection(id);
    if (onCloseMobile) onCloseMobile();
  };

  const content = (
    <div className="flex h-full flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex flex-col py-4">
        {/* Sidebar Header Brand (desktop) */}
        <div className="px-5 pb-4 border-b border-slate-100 dark:border-slate-800 hidden md:block">
          <div className="flex items-center space-x-2.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              Workspace
            </span>
          </div>
        </div>

        {/* Main Navigation List */}
        <nav className="mt-2 space-y-0.5 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      isActive
                        ? 'bg-emerald-200/80 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Dedicated Advanced Labs */}
        <div className="mt-4 px-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Advanced Modules
          </span>
          <div className="mt-1 space-y-0.5">
            <button
              onClick={() => handleNavClick('scenario-lab')}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                activeSection === 'scenario-lab'
                  ? 'bg-indigo-50 text-indigo-800 font-semibold dark:bg-indigo-950/60 dark:text-indigo-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <GitCompare className="h-4 w-4 text-indigo-500" />
                <span>Scenario Lab (3-Way)</span>
              </div>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 rounded px-1.5 py-0.2">
                Lab
              </span>
            </button>

            <button
              onClick={() => handleNavClick('live-nav')}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                activeSection === 'live-nav'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Activity className="h-4 w-4 text-emerald-500" />
                <span>Live NAV Explorer</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 rounded px-1.5 py-0.2">
                AMFI
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Compliance / Disclaimer Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Educational & Analytical. No SEBI advisory advice.</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 flex-col shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex w-72 max-w-xs flex-1 flex-col shadow-xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
