/**
 * Format a bigint or number value as US currency
 * @param value - The value to format (bigint or number)
 * @returns Formatted currency string (e.g., "$1,234.00")
 */
export function formatCurrency(value: bigint | number): string {
  const numValue = typeof value === 'bigint' ? Number(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
}
