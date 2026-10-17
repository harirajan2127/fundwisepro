import React, { createContext, useContext, useState, useEffect } from 'react';
import { SavedScenario, GoalItem, PortfolioTransaction } from '../types';

export type NavigationSection =
  | 'overview'
  | 'all-calculators'
  | 'investments'
  | 'withdrawals'
  | 'goals'
  | 'returns'
  | 'tax'
  | 'comparisons'
  | 'portfolio'
  | 'reports'
  | 'saved'
  | 'settings'
  | 'scenario-lab'
  | 'live-nav';

interface AppContextType {
  activeSection: NavigationSection;
  setActiveSection: (sec: NavigationSection) => void;
  activeCalculatorId: string;
  setActiveCalculatorId: (id: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isMethodologyOpen: boolean;
  setIsMethodologyOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  savedScenarios: SavedScenario[];
  saveScenario: (scenario: Omit<SavedScenario, 'id' | 'date'>) => void;
  deleteScenario: (id: string) => void;
  goals: GoalItem[];
  addGoal: (goal: Omit<GoalItem, 'id'>) => void;
  deleteGoal: (id: string) => void;
  updateGoal: (id: string, goal: Partial<GoalItem>) => void;
  portfolioTransactions: PortfolioTransaction[];
  addTransaction: (tx: Omit<PortfolioTransaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  loadSamplePortfolio: () => void;
  numberFormat: 'lakhs-crores' | 'standard';
  setNumberFormat: (fmt: 'lakhs-crores' | 'standard') => void;
  openCalculator: (calcId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SAMPLE_GOALS: GoalItem[] = [
  {
    id: 'g-1',
    title: 'Comfortable Retirement Nest Egg',
    category: 'retirement',
    currentCost: 35000000, // 3.5 Cr today
    targetYears: 20,
    inflationRate: 6,
    expectedReturnRate: 12,
    existingSavings: 2500000, // 25L
    annualStepUpPct: 10,
    priority: 'high',
  },
  {
    id: 'g-2',
    title: 'Child Higher Education / College',
    category: 'education',
    currentCost: 3000000, // 30L today
    targetYears: 12,
    inflationRate: 8,
    expectedReturnRate: 12,
    existingSavings: 500000, // 5L
    annualStepUpPct: 10,
    priority: 'high',
  },
  {
    id: 'g-3',
    title: 'Dream Villa Down Payment',
    category: 'house',
    currentCost: 4000000, // 40L
    targetYears: 5,
    inflationRate: 6,
    expectedReturnRate: 11,
    existingSavings: 1000000,
    priority: 'medium',
  },
];

const SAMPLE_TRANSACTIONS: PortfolioTransaction[] = [
  {
    id: 'tx-1',
    date: '2022-01-15',
    schemeName: 'Parag Parikh Flexi Cap Fund - Direct Growth',
    category: 'Flexi Cap',
    type: 'BUY',
    amount: 100000,
    units: 1980.19,
    nav: 50.5,
  },
  {
    id: 'tx-2',
    date: '2022-07-15',
    schemeName: 'HDFC Top 100 Fund - Direct Growth',
    category: 'Large Cap',
    type: 'BUY',
    amount: 150000,
    units: 200.0,
    nav: 750.0,
  },
  {
    id: 'tx-3',
    date: '2023-03-20',
    schemeName: 'Nippon India Small Cap Fund - Direct Growth',
    category: 'Small Cap',
    type: 'BUY',
    amount: 100000,
    units: 800.0,
    nav: 125.0,
  },
  {
    id: 'tx-4',
    date: '2023-11-10',
    schemeName: 'ICICI Prudential Corporate Bond Fund - Direct Growth',
    category: 'Debt',
    type: 'BUY',
    amount: 150000,
    units: 5769.23,
    nav: 26.0,
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<NavigationSection>('overview');
  const [activeCalculatorId, setActiveCalculatorId] = useState<string>('sip');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);
  const [numberFormat, setNumberFormat] = useState<'lakhs-crores' | 'standard'>('lakhs-crores');

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('fw_theme') as 'light' | 'dark') || 'light';
  });

  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>(() => {
    try {
      const saved = localStorage.getItem('fw_scenarios');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [goals, setGoals] = useState<GoalItem[]>(() => {
    try {
      const saved = localStorage.getItem('fw_goals');
      return saved ? JSON.parse(saved) : SAMPLE_GOALS;
    } catch {
      return SAMPLE_GOALS;
    }
  });

  const [portfolioTransactions, setPortfolioTransactions] = useState<PortfolioTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('fw_portfolio');
      return saved ? JSON.parse(saved) : SAMPLE_TRANSACTIONS;
    } catch {
      return SAMPLE_TRANSACTIONS;
    }
  });

  useEffect(() => {
    localStorage.setItem('fw_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('fw_scenarios', JSON.stringify(savedScenarios));
  }, [savedScenarios]);

  useEffect(() => {
    localStorage.setItem('fw_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('fw_portfolio', JSON.stringify(portfolioTransactions));
  }, [portfolioTransactions]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const saveScenario = (scenario: Omit<SavedScenario, 'id' | 'date'>) => {
    const newScenario: SavedScenario = {
      ...scenario,
      id: `scen-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setSavedScenarios((prev) => [newScenario, ...prev]);
  };

  const deleteScenario = (id: string) => {
    setSavedScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  const addGoal = (goal: Omit<GoalItem, 'id'>) => {
    const newGoal: GoalItem = {
      ...goal,
      id: `goal-${Date.now()}`,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const updateGoal = (id: string, updated: Partial<GoalItem>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updated } : g)));
  };

  const addTransaction = (tx: Omit<PortfolioTransaction, 'id'>) => {
    const newTx: PortfolioTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
    };
    setPortfolioTransactions((prev) => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setPortfolioTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const loadSamplePortfolio = () => {
    setPortfolioTransactions(SAMPLE_TRANSACTIONS);
  };

  const openCalculator = (calcId: string) => {
    setActiveCalculatorId(calcId);
    setActiveSection('investments'); // Or relevant category
  };

  return (
    <AppContext.Provider
      value={{
        activeSection,
        setActiveSection,
        activeCalculatorId,
        setActiveCalculatorId,
        isSearchOpen,
        setIsSearchOpen,
        isMethodologyOpen,
        setIsMethodologyOpen,
        theme,
        toggleTheme,
        savedScenarios,
        saveScenario,
        deleteScenario,
        goals,
        addGoal,
        deleteGoal,
        updateGoal,
        portfolioTransactions,
        addTransaction,
        deleteTransaction,
        loadSamplePortfolio,
        numberFormat,
        setNumberFormat,
        openCalculator,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
