export const formatSolanaAddress = (address: string) => {
  if (!address) return ''
  const addressStr = address.toString()
  return `${addressStr.slice(0, 6)}...${addressStr.slice(-4)}`
}

export const formatWithKMB = (input: string | number): string => {
  const suffixes = ['', 'k', 'M', 'B', 'T']
  let value: number

  // Parse number
  if (typeof input === 'string') {
    value = parseFloat(input.replace(/[^0-9.]/g, ''))
  } else {
    value = input
  }

  // If value is under 10,000 – format with commas and return without suffix
  if (value < 10000) {
    const formatted = value.toLocaleString('en-US', {
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    })
    return `${formatted}`
  }

  // Else apply suffix logic
  let suffixIndex = 0
  while (value >= 1000 && suffixIndex < suffixes.length - 1) {
    value /= 1000
    suffixIndex++
  }

  const formatted = value.toFixed(2).replace(/\.00$/, '')
  return `${formatted}${suffixes[suffixIndex]}`
}

export const formatWithCommas = (input: string | number, toFixed: number = 2): string => {
  let value: number

  // Parse number
  if (typeof input === 'string') {
    value = parseFloat(input.replace(/[^0-9.]/g, ''))
  } else {
    value = input
  }

  // Non-finite inputs (NaN, Infinity from divide-by-zero, Number('-'), etc.)
  // shouldn't leak the string "NaN" into the UI.
  if (!Number.isFinite(value)) return '--'

  // Format with commas and remove trailing .00
  const formatted = value.toFixed(toFixed)
  const withoutTrailingZeros = formatted.replace(/\.?0+$/, '')

  return parseFloat(withoutTrailingZeros).toLocaleString('en-US')
}
