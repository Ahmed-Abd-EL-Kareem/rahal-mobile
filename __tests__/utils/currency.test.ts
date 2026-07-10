// __tests__/utils/currency.test.ts
import { formatCurrency, formatNumber, parseCurrency } from '@/utils/currency';

describe('Currency Utils', () => {
  describe('formatCurrency', () => {
    it('formats EGP correctly', () => {
      expect(formatCurrency(15000, 'EGP')).toContain('EGP');
      expect(formatCurrency(15000, 'EGP')).toContain('15,000');
    });

    it('formats USD correctly', () => {
      expect(formatCurrency(1500.5, 'USD')).toContain('USD');
      expect(formatCurrency(1500.5, 'USD')).toContain('1,500.50');
    });

    it('handles zero', () => {
      expect(formatCurrency(0, 'EGP')).toContain('0');
    });

    it('handles negative values', () => {
      expect(formatCurrency(-100, 'USD')).toContain('-');
    });

    it('uses locale', () => {
      const formatted = formatCurrency(1234567, 'EGP', 'ar-EG');
      expect(formatted).toBeTruthy();
    });
  });

  describe('formatNumber', () => {
    it('formats with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('handles decimals', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56');
    });

    it('handles negative', () => {
      expect(formatNumber(-1000)).toBe('-1,000');
    });
  });

  describe('parseCurrency', () => {
    it('parses formatted currency', () => {
      expect(parseCurrency('$1,500.50')).toBe(1500.5);
      expect(parseCurrency('EGP 15,000')).toBe(15000);
      expect(parseCurrency('€1,234.56')).toBe(1234.56);
    });

    it('handles invalid input', () => {
      expect(parseCurrency('invalid')).toBe(0);
      expect(parseCurrency('')).toBe(0);
      expect(parseCurrency(null as any)).toBe(0);
    });

    it('handles negative', () => {
      expect(parseCurrency('-$100')).toBe(-100);
    });
  });
});