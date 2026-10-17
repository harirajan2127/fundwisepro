export type CalculatorCategory =
  | 'investments'
  | 'withdrawals'
  | 'goals'
  | 'returns'
  | 'tax'
  | 'comparisons'
  | 'portfolio';

export interface CalculatorMeta {
  id: string;
  name: string;
  category: CalculatorCategory;
  categoryName: string;
  shortDesc: string;
  description: string;
  formula: string;
  formulaExplanation: string;
  tags: string[];
  featured?: boolean;
}

export interface AmortizationRow {
  period: number; // Year or Month
  periodLabel: string;
  openingBalance: number;
  contribution: number;
  interestEarned: number;
  totalInvested: number;
  closingBalance: number;
  withdrawal?: number;
  taxPaid?: number;
  inflationAdjustedBalance?: number;
}

export interface CalculationResult {
  primaryLabel: string;
  primaryValue: number;
  secondaryMetrics: {
    label: string;
    value: string | number;
    subtext?: string;
    isPositive?: boolean;
    isNegative?: boolean;
    badge?: string;
  }[];
  chartData: any[];
  schedule: AmortizationRow[];
  insights: Insight[];
  summaryNote?: string;
}

export interface Insight {
  id: string;
  type: 'positive' | 'warning' | 'info' | 'critical';
  title: string;
  observation: string;
  numericalComparison: string;
  assumption: string;
  actionRecommendation?: string;
}

export interface SavedScenario {
  id: string;
  name: string;
  calculatorId: string;
  calculatorName: string;
  date: string;
  inputs: Record<string, any>;
  primaryResult: {
    label: string;
    value: number;
  };
  notes?: string;
  tags?: string[];
}

export interface GoalItem {
  id: string;
  title: string;
  category: 'retirement' | 'education' | 'house' | 'marriage' | 'emergency' | 'custom';
  currentCost: number;
  targetYears: number;
  inflationRate: number;
  expectedReturnRate: number;
  existingSavings: number;
  annualStepUpPct?: number;
  priority: 'high' | 'medium' | 'low';
}

export interface PortfolioTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  schemeName: string;
  category: 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'Flexi Cap' | 'Debt' | 'Hybrid' | 'ELSS';
  type: 'BUY' | 'SELL';
  amount: number;
  units: number;
  nav: number;
}

export interface PortfolioHolding {
  schemeName: string;
  category: string;
  totalUnits: number;
  investedAmount: number;
  currentNav: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  allocationPct: number;
}

export interface LiveSchemeMeta {
  scheme_code: number;
  scheme_name: string;
  scheme_category?: string;
  fund_house?: string;
}

export interface LiveNavRecord {
  date: string;
  nav: string;
}

export interface MonteCarloPercentiles {
  p10: number[];
  p25: number[];
  p50: number[]; // median
  p75: number[];
  p90: number[];
  years: number[];
  successProbability: number;
  depletionProbability?: number;
}
