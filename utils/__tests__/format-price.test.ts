import { formatPrice } from '../format-price';

describe('formatPrice', () => {
  it('should format price in Argentine pesos', () => {
    expect(formatPrice(1000)).toBe('$\u00a01000');
  });

  it('should format large numbers with thousands separator', () => {
    expect(formatPrice(150000)).toBe('$\u00a0150.000');
  });

  it('should handle zero', () => {
    expect(formatPrice(0)).toBe('$\u00a00');
  });

  it('should not show decimals', () => {
    expect(formatPrice(1234.56)).toBe('$\u00a01235');
  });
});
