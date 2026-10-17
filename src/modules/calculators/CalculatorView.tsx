import React from 'react';
import { useApp } from '../../context/AppContext';
import { CALCULATORS } from '../../data/calculators';
import { SIPRunner } from './SIPRunner';
import { LumpsumRunner } from './LumpsumRunner';
import { SWPRunner } from './SWPRunner';
import { GoalRunner } from './GoalRunner';
import { TaxRunner } from './TaxRunner';
import { ReturnsRunner } from './ReturnsRunner';

export const CalculatorView: React.FC = () => {
  const { activeCalculatorId } = useApp();

  const meta = CALCULATORS.find((c) => c.id === activeCalculatorId) || CALCULATORS[0];

  // Route to the appropriate specialized mathematical runner
  if (meta.category === 'withdrawals') {
    return <SWPRunner meta={meta} />;
  }

  if (meta.category === 'goals') {
    return (
      <GoalRunner
        meta={meta}
        defaultCost={
          meta.id === 'retirement-planner'
            ? 35000000
            : meta.id === 'education-planner'
            ? 3000000
            : meta.id === 'home-purchase-planner'
            ? 4000000
            : meta.id === 'marriage-planner'
            ? 2500000
            : meta.id === 'emergency-fund'
            ? 600000
            : 2000000
        }
        defaultYears={
          meta.id === 'retirement-planner'
            ? 20
            : meta.id === 'education-planner'
            ? 12
            : meta.id === 'home-purchase-planner'
            ? 5
            : 10
        }
        defaultInflation={
          meta.id === 'education-planner' ? 8 : 6
        }
      />
    );
  }

  if (meta.category === 'tax') {
    return <TaxRunner meta={meta} />;
  }

  if (meta.category === 'returns') {
    return <ReturnsRunner meta={meta} />;
  }

  if (meta.id === 'lumpsum' || meta.id === 'sip-vs-lumpsum') {
    return <LumpsumRunner meta={meta} />;
  }

  if (meta.id === 'step-up-sip' || meta.id === 'step-up-rate-comparison') {
    return <SIPRunner meta={meta} initialStepUp={true} />;
  }

  // Default for investments, comparisons, portfolio calculators
  return <SIPRunner meta={meta} />;
};
