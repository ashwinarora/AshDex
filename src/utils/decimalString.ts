/**
 * Normalize a decimal string the way Hyperliquid expects wire numbers.
 *
 * Hyperliquid's docs (Tick and lot size / Signing) require trailing zeroes to
 * be removed from prices and sizes, and `@nktkas/hyperliquid` applies the same
 * normalization inside its `UnsignedDecimal` schema before signing. This helper
 * mirrors that rule so the string we validate, display in toasts, and hand to
 * the SDK are all identical.
 *
 * Rules:
 *  - trailing zeros are stripped ONLY from the fractional part ("1.2000" → "1.2")
 *  - a dangling decimal point is removed ("1.0" → "1", "5." → "5")
 *  - leading zeros on the integer part collapse ("00123" → "123")
 *  - a missing integer part becomes "0" (".5" → "0.5")
 *  - integers are returned unchanged ("10" → "10", "100" → "100")
 *  - anything that is not a plain decimal is returned as-is
 *
 * The previous inline `str.replace(/\.?0+$/, '')` stripped zeros from integers
 * too ("10" → "1", "100" → "1"), which sent a tenth or a hundredth of the size
 * the user confirmed.
 */
export function normalizeDecimalString(value: string): string {
  const match = value.match(/^(-?)([0-9]*)(?:\.([0-9]*))?$/)
  if (!match) return value
  const [, sign, intRaw, fracRaw = ''] = match
  if (intRaw === '' && fracRaw === '') return value
  const int = intRaw.replace(/^0+/, '') || '0'
  let fracEnd = fracRaw.length
  while (fracEnd > 0 && fracRaw[fracEnd - 1] === '0') fracEnd--
  const frac = fracRaw.slice(0, fracEnd)
  const body = frac === '' ? int : `${int}.${frac}`
  return sign === '-' && body !== '0' ? `-${body}` : body
}
