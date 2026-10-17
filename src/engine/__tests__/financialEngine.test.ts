import { describe, it, expect } from 'vitest';
import { calculateSIP, compareSIPFrequencies } from '../sip';
import { calculateLumpsum } from '../lumpsum';
import { calculateSWP } from '../swp';
import { calculateGoalSIP } from '../goals';
import { calculateCAGR, calculateAbsoluteReturn, calculateRealReturn } from '../returns';
import { calculateXIRR } from '../xirr';
import { calculateEquityTax, calculateDirectVsRegular } from '../tax';

describe('FundWise Pro Financial Engine', () => {
  describe('SIP Engine', () => {
    it('calculates standard monthly SIP with accurate annuity due compounding', () => {
      const result = calculateSIP({
        monthlyInvestment: 10000,
        expectedReturnRate: 12,
        timePeriodYears: 10,
      });

      // Total invested over 10 years (120 months)
      expect(result.totalInvested).toBe(1200000);
      // Expected maturity value for ₹10k/mo at 12% for 10 yrs is ~23,23,391
      expect(result.totalMaturityValue).toBeGreaterThan(2300000);
      expect(result.totalMaturityValue).toBeLessThan(2350000);
      expect(result.estimatedReturns).toBe(result.totalMaturityValue - result.totalInvested);
      expect(result.schedule.length).toBe(10);
    });

    it('handles zero return rate gracefully without division by zero', () => {
      const result = calculateSIP({
        monthlyInvestment: 5000,
        expectedReturnRate: 0,
        timePeriodYears: 5,
      });

      expect(result.totalInvested).toBe(300000);
      expect(result.totalMaturityValue).toBe(300000);
      expect(result.estimatedReturns).toBe(0);
    });

    it('calculates step-up SIP with annual increment correctly', () => {
      const flatSIP = calculateSIP({
        monthlyInvestment: 10000,
        expectedReturnRate: 12,
        timePeriodYears: 5,
        stepUpPct: 0,
      });

      const stepUpSIP = calculateSIP({
        monthlyInvestment: 10000,
        expectedReturnRate: 12,
        timePeriodYears: 5,
        stepUpPct: 10,
      });

      // Step-up must yield higher invested and terminal corpus
      expect(stepUpSIP.totalInvested).toBeGreaterThan(flatSIP.totalInvested);
      expect(stepUpSIP.totalMaturityValue).toBeGreaterThan(flatSIP.totalMaturityValue);
    });

    it('compares SIP frequencies for same annual outlay', () => {
      const comp = compareSIPFrequencies(120000, 12, 5);
      expect(comp.monthly.totalInvested).toBe(600000);
      expect(comp.weekly.totalInvested).toBe(600000);
      // Weekly compounding provides slightly earlier cash flows, yielding higher returns
      expect(comp.weekly.maturityValue).toBeGreaterThanOrEqual(comp.monthly.maturityValue);
    });
  });

  describe('Lumpsum Engine', () => {
    it('calculates lumpsum compounding correctly', () => {
      const result = calculateLumpsum({
        investmentAmount: 100000,
        expectedReturnRate: 12,
        timePeriodYears: 6,
      });

      expect(result.investedAmount).toBe(100000);
      // 100000 * (1.12)^6 = 197382.26
      expect(result.totalMaturityValue).toBe(197382);
      expect(result.doublingYears).toBeCloseTo(6.12, 1);
    });
  });

  describe('SWP Engine', () => {
    it('verifies sustainable SWP where returns outpace withdrawals', () => {
      const result = calculateSWP({
        initialCorpus: 5000000, // 50 Lakhs
        monthlyWithdrawal: 25000, // 3 Lakhs/yr (6% SWR)
        expectedReturnRate: 9, // 9% return
        timePeriodYears: 10,
      });

      expect(result.isDepleted).toBe(false);
      expect(result.totalWithdrawn).toBe(3000000);
      expect(result.finalRemainingCorpus).toBeGreaterThan(5000000);
    });

    it('detects premature corpus depletion accurately', () => {
      const result = calculateSWP({
        initialCorpus: 1000000, // 10 Lakhs
        monthlyWithdrawal: 60000, // High withdrawal: 7.2L/yr
        expectedReturnRate: 6,
        timePeriodYears: 10,
      });

      expect(result.isDepleted).toBe(true);
      expect(result.depletionYear).toBeLessThan(3);
      expect(result.finalRemainingCorpus).toBe(0);
    });
  });

  describe('Goal Intelligence Engine', () => {
    it('calculates required monthly SIP factoring in inflation and current savings', () => {
      const result = calculateGoalSIP({
        currentCost: 1000000, // 10 Lakhs today
        timePeriodYears: 10,
        inflationRate: 6,
        expectedReturnRate: 12,
        existingSavings: 200000, // 2 Lakhs already saved
      });

      // 10L inflated at 6% over 10 yrs = ~17.9L
      expect(result.futureCost).toBeGreaterThan(1700000);
      // Existing savings 2L at 12% over 10 yrs = ~6.2L
      expect(result.existingSavingsGrowth).toBeGreaterThan(600000);
      // Net corpus needed is positive
      expect(result.netCorpusNeeded).toBe(result.futureCost - result.existingSavingsGrowth);
      expect(result.requiredMonthlySIP).toBeGreaterThan(0);
      expect(result.isAlreadyFunded).toBe(false);
    });

    it('identifies already funded goals with zero required fresh SIP', () => {
      const result = calculateGoalSIP({
        currentCost: 500000,
        timePeriodYears: 5,
        inflationRate: 5,
        expectedReturnRate: 12,
        existingSavings: 1000000, // Existing savings far exceed target
      });

      expect(result.isAlreadyFunded).toBe(true);
      expect(result.netCorpusNeeded).toBe(0);
      expect(result.requiredMonthlySIP).toBe(0);
    });
  });

  describe('Returns & XIRR', () => {
    it('calculates CAGR accurately', () => {
      // 100 to 200 over 5 years
      const cagr = calculateCAGR(100, 200, 5);
      expect(cagr).toBeCloseTo(14.87, 1);
    });

    it('calculates Real Return using Fisher equation', () => {
      // 12% nominal return, 6% inflation: (1.12 / 1.06) - 1 = 5.66%
      const real = calculateRealReturn(12, 6);
      expect(real).toBeCloseTo(5.66, 1);
    });

    it('computes exact XIRR for multiple dated cash flows', () => {
      const cashFlows = [
        { date: '2020-01-01', amount: -100000 },
        { date: '2021-01-01', amount: -100000 },
        { date: '2023-01-01', amount: 260000 },
      ];

      const xirr = calculateXIRR(cashFlows);
      expect(xirr).toBeGreaterThan(8);
      expect(xirr).toBeLessThan(15);
    });
  });

  describe('Indian Mutual Fund Tax Rules (Budget 2024)', () => {
    it('applies 20% STCG for equity held <= 12 months', () => {
      const res = calculateEquityTax({
        purchasePrice: 100000,
        salePrice: 150000,
        holdingPeriodMonths: 6,
      });

      expect(res.gainType).toBe('STCG');
      expect(res.taxRatePct).toBe(20);
      expect(res.taxableGain).toBe(50000);
      expect(res.estimatedTax).toBe(10000);
    });

    it('applies 12.5% LTCG with ₹1.25 Lakh exemption threshold for holding > 12 months', () => {
      const res = calculateEquityTax({
        purchasePrice: 200000,
        salePrice: 400000, // 2 Lakhs gain
        holdingPeriodMonths: 24,
      });

      expect(res.gainType).toBe('LTCG');
      expect(res.taxRatePct).toBe(12.5);
      expect(res.totalGain).toBe(200000);
      expect(res.applicableExemption).toBe(125000);
      expect(res.taxableGain).toBe(75000);
      // 12.5% of 75,000 = 9375
      expect(res.estimatedTax).toBe(9375);
    });

    it('calculates wealth lost to Regular plan expense ratio drag', () => {
      const drag = calculateDirectVsRegular(10000, 20, 13, 0.6, 1.8);
      expect(drag.lostWealth).toBeGreaterThan(0);
      expect(drag.percentageLost).toBeGreaterThan(15);
    });
  });
});
