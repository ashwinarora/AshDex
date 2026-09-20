import type { ExchangeClient } from '@nktkas/hyperliquid'
import type { FrontendOpenOrdersResponse } from '@nktkas/hyperliquid/api/info'
import { toast } from 'sonner'
import { toastSdkError } from '@/lib/toastSdkError'
import { BUILDER_ADDRESS } from '@/utils/constants'
import { buildOutcomeOrder, type OutcomeTif, type OutcomeWireOrder } from './order'

export type OutcomeOrderLeg = { price: string; size: string; tif: OutcomeTif }

/**
 * Submit one or more limit legs on a single outcome side. Outcome orders never
 * use TP/SL, reduce-only or priority grouping — `grouping` is always `na`.
 * Mirrors `placeSpotOrder` (optimistic open-order push, HL error surfacing).
 */
export const placeOutcomeOrder = async ({
  sdkL1ActionClient,
  assetId,
  coin,
  sideLabel,
  isBuy,
  legs,
  adjustedBuilderFee,
  pushNewOpenOrders
}: {
  sdkL1ActionClient: ExchangeClient | null
  assetId: number
  /** `#enc` coin, used for the optimistic open-orders row. */
  coin: string
  /** "Yes" / "No" / "Long"… for toasts. */
  sideLabel: string
  isBuy: boolean
  legs: OutcomeOrderLeg[]
  adjustedBuilderFee: number
  pushNewOpenOrders: (order: FrontendOpenOrdersResponse) => void
}): Promise<boolean> => {
  if (!sdkL1ActionClient || legs.length === 0) return false
  const toastId = toast.loading('Placing order...')
  const orders: OutcomeWireOrder[] = legs.map((leg) =>
    buildOutcomeOrder({ assetId, isBuy, price: leg.price, size: leg.size, tif: leg.tif })
  )
  try {
    const res = await sdkL1ActionClient.order({
      grouping: 'na',
      builder: adjustedBuilderFee > 0 ? { b: BUILDER_ADDRESS, f: adjustedBuilderFee } : undefined,
      orders
    })
    const statuses = res.response.data.statuses ?? []
    const resting: FrontendOpenOrdersResponse = []
    let filledTotal = 0
    let filledNotional = 0
    let firstError: string | null = null
    statuses.forEach((st, i) => {
      const leg = legs[i]
      if (!leg || typeof st !== 'object') return
      if ('resting' in st) {
        resting.push({
          oid: st.resting.oid,
          children: [],
          cloid: null,
          triggerPx: '',
          triggerCondition: 'N/A',
          isTrigger: false,
          isPositionTpsl: false,
          reduceOnly: false,
          limitPx: leg.price,
          orderType: 'Limit',
          tif: leg.tif,
          coin,
          side: isBuy ? 'B' : 'A',
          sz: leg.size,
          origSz: leg.size,
          timestamp: Date.now()
        })
      } else if ('filled' in st) {
        filledTotal += Number(st.filled.totalSz)
        filledNotional += Number(st.filled.totalSz) * Number(st.filled.avgPx)
      } else if ('error' in st && !firstError) {
        firstError = (st as { error: string }).error
      }
    })
    if (resting.length > 0) pushNewOpenOrders(resting)
    if (firstError && resting.length === 0 && filledTotal === 0) {
      toastSdkError(firstError, 'Order failed', { id: toastId })
      return false
    }
    if (filledTotal > 0) {
      const avg = filledNotional / filledTotal
      toast.success(
        `${isBuy ? 'Bought' : 'Sold'} ${filledTotal} ${sideLabel} at avg ${avg.toFixed(4)}${
          resting.length > 0 ? ` · ${resting.length} resting` : ''
        }`,
        { id: toastId }
      )
    } else {
      toast.success(
        resting.length > 1 ? `${resting.length} orders placed` : 'Order placed successfully',
        { id: toastId }
      )
    }
    if (firstError) toast.warning(`Some legs were rejected: ${firstError}`)
    return true
  } catch (error) {
    toastSdkError(error, 'Error placing outcome order', { id: toastId })
    return false
  }
}
