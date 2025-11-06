/**
 * Currency formatting utilities for Philippine Peso (₱)
 */

/**
 * Formats a number as Philippine Peso currency
 * @param amount - The amount to format
 * @param options - Additional formatting options
 * @returns Formatted currency string with ₱ symbol
 */
export function formatCurrency(
  amount: number | null | undefined,
  options?: {
    minimumFractionDigits?: number
    maximumFractionDigits?: number
    showSymbol?: boolean
  }
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '-'
  }

  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true,
  } = options || {}

  // Format using Philippine locale (en-PH) with PHP currency
  const formatted = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)

  // If showSymbol is false, remove the ₱ symbol
  if (!showSymbol) {
    return formatted.replace('₱', '').trim()
  }

  return formatted
}

/**
 * Formats a number as currency without the currency symbol
 * @param amount - The amount to format
 * @returns Formatted number string without currency symbol
 */
export function formatAmount(amount: number | null | undefined): string {
  return formatCurrency(amount, { showSymbol: false })
}

/**
 * Formats a number as compact currency (e.g., ₱1.2K, ₱1.5M)
 * @param amount - The amount to format
 * @returns Compact formatted currency string
 */
export function formatCompactCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '-'
  }

  const formatted = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount)

  return formatted
}

/**
 * Parse a currency string to number
 * @param currencyString - Currency string to parse (e.g., "₱1,234.56")
 * @returns Parsed number or null if invalid
 */
export function parseCurrency(currencyString: string): number | null {
  if (!currencyString) return null
  
  // Remove currency symbol, spaces, and commas
  const cleanString = currencyString
    .replace(/₱|PHP|,|\s/g, '')
    .trim()
  
  const number = parseFloat(cleanString)
  return isNaN(number) ? null : number
}

/**
 * Currency symbol constant
 */
export const PESO_SYMBOL = '₱'

/**
 * Currency code constant
 */
export const CURRENCY_CODE = 'PHP'