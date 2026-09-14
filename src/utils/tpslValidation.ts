/**
 * Direction guard for the position-level Set-TP/SL dialog.
 *
 * For a long: take-profit must be **above** entry, stop-loss must be **below**.
 * For a short: mirror.
 *
 * Empty inputs (undefined / empty string / non-finite) are treated as
 * "not set" and pass — the caller decides whether at least one leg must be
 * present before enabling Confirm.
 */
export type TpslDirectionInput = {
  /** True for a long position (szi > 0). False for a short. */
  isLong: boolean
  entryPrice: number
  tpTriggerPrice?: string | number
  slTriggerPrice?: string | number
}

export type TpslDirectionValidity = {
  tpValid: boolean
  slValid: boolean
  bothEmpty: boolean
}

export function validateTpslDirection(input: TpslDirectionInput): TpslDirectionValidity {
  const { isLong, entryPrice } = input
  const tpRaw = input.tpTriggerPrice
  const slRaw = input.slTriggerPrice
  const tpNum = tpRaw === undefined || tpRaw === '' ? NaN : Number(tpRaw)
  const slNum = slRaw === undefined || slRaw === '' ? NaN : Number(slRaw)

  const tpValid =
    !Number.isFinite(tpNum) || (isLong ? tpNum > entryPrice : tpNum < entryPrice)
  const slValid =
    !Number.isFinite(slNum) || (isLong ? slNum < entryPrice : slNum > entryPrice)
  const bothEmpty = !Number.isFinite(tpNum) && !Number.isFinite(slNum)

  return { tpValid, slValid, bothEmpty }
}
