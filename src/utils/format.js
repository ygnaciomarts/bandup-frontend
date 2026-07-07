/**
 * Format a numeric value as MXN currency
 */
export function formatPrice(value) {
  return Number(value || 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

/**
 * Calculate discount percentage
 */
export function discountPercent(original, final) {
  if (!original || original <= final) return 0
  return Math.round((1 - final / original) * 100)
}
