import type { TradingAccount } from '@/utils/tradingAccount'

/** The `builder` field of an order action; `undefined` sends none. */
export type OrderBuilder = { b: `0x${string}`; f: number } | undefined

/**
 * The one place that decides whether an order carries AshDex's builder fee.
 * Treasury orders never do: a treasury has not approved AshDex's builder, and
 * an unapproved builder field gets the whole order rejected. Wallet orders are
 * unchanged: always the builder, except outcome orders, which skip a zero fee.
 */
export const orderBuilder = ({
  mode,
  builderAddress,
  fee,
  omitZeroFee = false
}: {
  mode: TradingAccount['mode']
  builderAddress: string
  fee: number
  omitZeroFee?: boolean
}): OrderBuilder => {
  if (mode === 'treasury') return undefined
  if (omitZeroFee && fee <= 0) return undefined
  return { b: builderAddress as `0x${string}`, f: fee }
}
