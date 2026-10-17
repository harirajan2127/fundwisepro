/**
 * High precision Indian Rupee & Financial Formatters
 */

export function formatINR(
  val: number,
  options: {
    compact?: boolean;
    maximumFractionDigits?: number;
    showSign?: boolean;
  } = {}
): string {
  if (isNaN(val) || !isFinite(val)) return '₹0';

  const { compact = false, maximumFractionDigits = 2, showSign = false } = options;
  const isNegative = val < 0;
  const absVal = Math.abs(val);

  let prefix = isNegative ? '-₹' : showSign && val > 0 ? '+₹' : '₹';

  if (compact) {
    if (absVal >= 10000000) {
      // Crores
      const cr = absVal / 10000000;
      return `${prefix}${cr.toFixed(maximumFractionDigits)} Cr`;
    } else if (absVal >= 100000) {
      // Lakhs
      const l = absVal / 100000;
      return `${prefix}${l.toFixed(maximumFractionDigits)} L`;
    } else if (absVal >= 1000) {
      // Thousands
      const k = absVal / 1000;
      return `${prefix}${k.toFixed(1)} K`;
    }
  }

  // Standard Indian comma format (e.g., 12,34,567.89)
  const parts = absVal.toFixed(maximumFractionDigits).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Indian numbering regex: last 3 digits, then groups of 2 digits
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  const result =
    decimalPart && parseInt(decimalPart, 10) > 0 && maximumFractionDigits > 0
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;

  return `${prefix}${result}`;
}

export function formatPercent(val: number, decimals: number = 2): string {
  if (isNaN(val) || !isFinite(val)) return '0%';
  return `${val.toFixed(decimals)}%`;
}

export function formatNumber(val: number, decimals?: number): string {
  if (isNaN(val) || !isFinite(val)) return '0';
  const hasDecimals = val % 1 !== 0;
  const maxDec = decimals !== undefined ? decimals : hasDecimals ? 2 : 0;
  const minDec = decimals !== undefined ? decimals : 0;
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: maxDec,
    minimumFractionDigits: minDec,
  }).format(val);
}

export function formatYears(val: number): string {
  if (val <= 0) return '0 years';
  if (val === 1) return '1 year';
  const fullYears = Math.floor(val);
  const months = Math.round((val - fullYears) * 12);
  if (months === 0) return `${fullYears} ${fullYears === 1 ? 'yr' : 'yrs'}`;
  if (fullYears === 0) return `${months} ${months === 1 ? 'mo' : 'mos'}`;
  return `${fullYears} yrs ${months} mos`;
}
