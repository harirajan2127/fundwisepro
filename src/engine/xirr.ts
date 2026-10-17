export interface CashFlow {
  date: Date | string;
  amount: number; // Negative for outflow/investment, Positive for redemption/current value
}

/**
 * Robust numerical XIRR solver combining Newton-Raphson with Bisection fallback
 */
export function calculateXIRR(cashFlows: CashFlow[], guess: number = 0.1): number {
  if (!cashFlows || cashFlows.length < 2) {
    throw new Error('At least two cash flows (investment and valuation) are required.');
  }

  // Parse and sort dates
  const flows = cashFlows.map((cf) => ({
    date: new Date(cf.date).getTime(),
    amount: cf.amount,
  }));

  flows.sort((a, b) => a.date - b.date);

  const startDate = flows[0].date;
  const hasNegative = flows.some((f) => f.amount < 0);
  const hasPositive = flows.some((f) => f.amount > 0);

  if (!hasNegative || !hasPositive) {
    throw new Error('Cash flows must include both negative outflows and positive valuations.');
  }

  // Transform into (yearFraction, amount)
  const items = flows.map((f) => ({
    years: (f.date - startDate) / (1000 * 60 * 60 * 24 * 365),
    amount: f.amount,
  }));

  const npv = (rate: number): number => {
    let sum = 0;
    for (const item of items) {
      sum += item.amount / Math.pow(1 + rate, item.years);
    }
    return sum;
  };

  const derivativeNpv = (rate: number): number => {
    let sum = 0;
    for (const item of items) {
      if (item.years === 0) continue;
      sum -= (item.years * item.amount) / Math.pow(1 + rate, item.years + 1);
    }
    return sum;
  };

  // 1. Try Newton-Raphson
  let rate = guess;
  const maxIterations = 100;
  const tolerance = 1e-6;

  for (let i = 0; i < maxIterations; i++) {
    const val = npv(rate);
    if (Math.abs(val) < tolerance) {
      return Number((rate * 100).toFixed(2));
    }

    const deriv = derivativeNpv(rate);
    if (Math.abs(deriv) < 1e-9) {
      break; // Derivative too small, switch to bisection
    }

    const nextRate = rate - val / deriv;

    // Guard against negative rate < -0.99
    if (nextRate <= -0.99 || isNaN(nextRate) || !isFinite(nextRate)) {
      break;
    }

    if (Math.abs(nextRate - rate) < tolerance) {
      return Number((nextRate * 100).toFixed(2));
    }

    rate = nextRate;
  }

  // 2. Bisection Fallback
  let low = -0.95;
  let high = 5.0; // 500%

  let npvLow = npv(low);
  let npvHigh = npv(high);

  if (npvLow * npvHigh > 0) {
    // If same sign, try broader bracket
    high = 15.0;
    npvHigh = npv(high);
    if (npvLow * npvHigh > 0) {
      return 0; // Could not find zero crossing
    }
  }

  for (let i = 0; i < 80; i++) {
    const mid = (low + high) / 2;
    const midNpv = npv(mid);

    if (Math.abs(midNpv) < tolerance || (high - low) / 2 < tolerance) {
      return Number((mid * 100).toFixed(2));
    }

    if (npvLow * midNpv < 0) {
      high = mid;
      npvHigh = midNpv;
    } else {
      low = mid;
      npvLow = midNpv;
    }
  }

  return Number((((low + high) / 2) * 100).toFixed(2));
}
