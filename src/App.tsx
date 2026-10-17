import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/common/TopBar';
import { Sidebar } from './components/common/Sidebar';
import { SearchModal } from './components/common/SearchModal';
import { MethodologyModal } from './components/common/MethodologyModal';
import { OverviewDashboard } from './modules/overview/OverviewDashboard';
import { AllCalculatorsDirectory } from './modules/calculators/AllCalculatorsDirectory';
import { CalculatorView } from './modules/calculators/CalculatorView';
import { ScenarioLab } from './modules/scenarioLab/ScenarioLab';
import { GoalWorkspace } from './modules/goals/GoalWorkspace';
import { PortfolioWorkspace } from './modules/portfolio/PortfolioWorkspace';
import { LiveNavExplorer } from './modules/liveNav/LiveNavExplorer';
import { SavedScenariosManager } from './modules/savedScenarios/SavedScenariosManager';
import { ReportGenerator } from './modules/reports/ReportGenerator';
import { SettingsPage } from './modules/settings/SettingsPage';

const MainLayout: React.FC = () => {
  const { activeSection } = useApp();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewDashboard />;
      case 'all-calculators':
        return <AllCalculatorsDirectory />;
      case 'scenario-lab':
        return <ScenarioLab />;
      case 'goals':
        return <GoalWorkspace />;
      case 'portfolio':
        return <PortfolioWorkspace />;
      case 'live-nav':
        return <LiveNavExplorer />;
      case 'saved':
        return <SavedScenariosManager />;
      case 'reports':
        return <ReportGenerator />;
      case 'settings':
        return <SettingsPage />;
      case 'investments':
      case 'withdrawals':
      case 'returns':
      case 'tax':
      case 'comparisons':
      default:
        return <CalculatorView />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      <TopBar onToggleMobileNav={() => setIsMobileNavOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Persistent Desktop Sidebar & Mobile Drawer */}
        <Sidebar
          isOpenMobile={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        {/* Dynamic Main Workspace Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-7xl">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <SearchModal />
      <MethodologyModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
