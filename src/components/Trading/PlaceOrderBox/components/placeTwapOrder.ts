import type { ExchangeClient } from '@nktkas/hyperliquid'
import { toast } from 'sonner'
import { toastSdkError } from '@/lib/toastSdkError'

// Hyperliquid rejects `twapOrder` payloads that include a builder object —
// unlike the regular `order` action, TWAPs are not eligible for builder fees.
// Do NOT add builder here; the SDK omits it by construction. Verified by
// diffing testnet wire payloads against Hyperliquid's own app.hyperliquid.xyz.

type TwapDetails = {
  trigger?: { price: string; above: boolean }
  stopPrice?: string
}

export type PlaceTwapOrderArgs = {
  sdkL1ActionClient: ExchangeClient | null
  assetIndex: number
  isBuy: boolean
  size: string
  reduceOnly: boolean
  minutes: number
  randomize: boolean
  details?: TwapDetails
  displayName: string
}

export const placeTwapOrder = async ({
  sdkL1ActionClient,
  assetIndex,
  isBuy,
  size,
  reduceOnly,
  minutes,
  randomize,
  details,
  displayName
}: PlaceTwapOrderArgs) => {
  if (!sdkL1ActionClient) return
  const toastId = toast.loading('Placing TWAP…')
  try {
    const detailsPayload =
      details && (details.trigger || details.stopPrice)
        ? {
            details: {
              t: details.trigger ? { p: details.trigger.price, a: details.trigger.above } : null,
              s: details.stopPrice ?? null
            }
          }
        : {}

    const res = await sdkL1ActionClient.twapOrder({
      twap: {
        a: assetIndex,
        b: isBuy,
        s: size,
        r: reduceOnly,
        m: minutes,
        t: randomize
      },
      ...detailsPayload
    })

    const status = res.response.data.status
    if (typeof status === 'object' && 'error' in status) {
      toastSdkError(status.error, 'TWAP order failed', { id: toastId })
      return null
    }
    if (typeof status === 'object' && 'running' in status) {
      const action = isBuy ? 'Buy' : 'Sell'
      toast.success(
        `TWAP ${action} ${size} ${displayName} · ${minutes}m · #${status.running.twapId}`,
        {
          id: toastId
        }
      )
      return status.running.twapId
    }
    toast.dismiss(toastId)
    return null
  } catch (error) {
    toastSdkError(error, 'Error placing TWAP order', { id: toastId })
    return null
  }
}
