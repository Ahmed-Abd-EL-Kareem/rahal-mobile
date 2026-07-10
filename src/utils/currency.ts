// src/utils/currency.ts
export function formatCurrency(amount: number, currency = 'EGP', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'EGP' ? 0 : 2,
    maximumFractionDigits: currency === 'EGP' ? 0 : 2,
  }).format(amount);
}

export function formatNumber(num: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(num);
}

export function parseCurrency(str: string): number {
  return parseFloat(str.replace(/[^0-9.-]/g, '')) || 0;
}