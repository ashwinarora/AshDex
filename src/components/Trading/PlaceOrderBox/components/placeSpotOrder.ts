import { ExchangeClient } from '@nktkas/hyperliquid'
import type { FrontendOpenOrdersResponse } from '@nktkas/hyperliquid/api/info'
import type { SpotMetaResponse } from '@nktkas/hyperliquid/api/info'
import { toast } from 'sonner'
import { toastSdkError } from '@/lib/toastSdkError'
import { BUILDER_ADDRESS, SPOT_DELTA } from '@/utils/constants'
import type { TPSLType } from './TPSL'
import { formatPrice } from '@/utils/utils'
import { normalizeDecimalString } from '@/utils/decimalString'

export const placeSpotOrder = async ({
  sdkL1ActionClient,
  spotMeta,
  selectedAsset,
  isBuy,
  limitPrice,
  assetAmount,
  isPostOnly,
  tpsl,
  adjustedBuilderFee,
  spotKeyToName,
  pushNewOpenOrders
}: {
  sdkL1ActionClient: ExchangeClient | null
  spotMeta: SpotMetaResponse
  selectedAsset: string
  isBuy: boolean
  limitPrice: string
  assetAmount: string
  isPostOnly: boolean
  tpsl?: TPSLType
  adjustedBuilderFee: number
  spotKeyToName: Map<string, string>
  pushNewOpenOrders: (order: FrontendOpenOrdersResponse) => void
}) => {
  if (!(spotMeta as SpotMetaResponse | undefined)?.tokens?.length) return
  if (!sdkL1ActionClient) return
  const assetMeta = spotMeta.universe.find((asset) => asset.name === selectedAsset)
  const assetIndex = assetMeta?.index
  if (assetIndex === -1 || assetIndex === undefined || !assetMeta) return

  const baseToken = spotMeta.tokens[assetMeta.tokens[0]]
  const szDecimals = Number(baseToken?.szDecimals ?? 0)
  const toastId = toast.loading('Loading...')

  const tif = isPostOnly ? 'Alo' : 'Gtc'
  const formattedLimitPrice = normalizeDecimalString(limitPrice)
  const formattedSize = normalizeDecimalString(assetAmount)
  const normalizedLimitPrice = Number.isFinite(Number(formattedLimitPrice))
    ? formatPrice(Number(formattedLimitPrice), szDecimals, true).toString()
    : formattedLimitPrice

  const hasTpslOrders = !!tpsl?.isTpsl && (Number(tpsl.takeProfit) > 0 || Number(tpsl.stopLoss) > 0)

  // Build the order batch. If TP/SL is enabled, we place the main order + TP/SL triggers
  // in a single request with `grouping: normalTpsl` (same strategy as perps).
  const orderPayload: Array<{
    kind: 'main' | 'tp' | 'sl'
    a: number
    b: boolean
    p: string
    s: string
    r: boolean
    t:
      | { limit: { tif: 'Alo' | 'Gtc' } }
      | { trigger: { isMarket: boolean; triggerPx: string; tpsl: 'tp' | 'sl' } }
  }> = [
    {
      kind: 'main',
      a: assetIndex + SPOT_DELTA,
      b: isBuy,
      p: normalizedLimitPrice,
      s: formattedSize,
      r: false,
      t: { limit: { tif } }
    }
  ]

  if (hasTpslOrders) {
    // Use an 8% worst-case buffer for TP/SL market trigger orders, matching Hyperliquid behavior.
    // For buys, TP/SL closes via sell, so we use a lower limitPx; for sells, the close is buy, so we use a higher limitPx.
    const tpslLimitPxMultiplier = isBuy ? 0.92 : 1.08
    if (Number(tpsl.stopLoss) > 0) {
      const triggerPx = formatPrice(Number(tpsl.stopLoss), szDecimals, true).toString()
      orderPayload.push({
        kind: 'sl',
        a: assetIndex + SPOT_DELTA,
        b: !isBuy,
        p: formatPrice(Number(triggerPx) * tpslLimitPxMultiplier, szDecimals, true).toString(),
        s: formattedSize,
        r: false,
        t: {
          trigger: {
            isMarket: true,
            triggerPx,
            tpsl: 'sl'
          }
        }
      })
    }
    if (Number(tpsl.takeProfit) > 0) {
      const triggerPx = formatPrice(Number(tpsl.takeProfit), szDecimals, true).toString()
      orderPayload.push({
        kind: 'tp',
        a: assetIndex + SPOT_DELTA,
        b: !isBuy,
        p: formatPrice(Number(triggerPx) * tpslLimitPxMultiplier, szDecimals, true).toString(),
        s: formattedSize,
        r: false,
        t: {
          trigger: {
            isMarket: true,
            triggerPx,
            tpsl: 'tp'
          }
        }
      })
    }
  }

  try {
    const res = await sdkL1ActionClient.order({
      grouping: hasTpslOrders ? 'normalTpsl' : 'na',
      builder: {
        b: BUILDER_ADDRESS,
        f: adjustedBuilderFee
      },
      orders: orderPayload.map(({ a, b, p, s, r, t }) => ({ a, b, p, s, r, t }))
    })

    const statuses = res.response.data.statuses ?? []
    const mainStatus = statuses[0]
    if (!mainStatus) return

    // Optimistic push: add any resting orders (main and TP/SL triggers) to the Open Orders table.
    const openOrders: FrontendOpenOrdersResponse = []
    for (let i = 0; i < statuses.length; i++) {
      const st = statuses[i]
      const meta = orderPayload[i]
      if (!st || !meta) continue
      if (typeof st !== 'object' || !('resting' in st)) continue

      const isTrigger = meta.kind !== 'main'
      const triggerPx =
        isTrigger && meta.t && 'trigger' in meta.t ? (meta.t.trigger.triggerPx ?? '') : ''
      const triggerCondition =
        meta.kind === 'tp'
          ? `Price Above ${triggerPx}`
          : meta.kind === 'sl'
            ? `Price Below ${triggerPx}`
            : 'N/A'
      const orderType =
        meta.kind === 'tp' ? 'Take Profit Market' : meta.kind === 'sl' ? 'Stop Market' : 'Limit'

      openOrders.push({
        oid: st.resting.oid,
        children: [],
        cloid: null,
        triggerPx: isTrigger ? triggerPx : '',
        triggerCondition: isTrigger ? triggerCondition : 'N/A',
        isTrigger,
        isPositionTpsl: false,
        reduceOnly: false,
        limitPx: meta.p,
        orderType,
        tif: isTrigger ? null : tif,
        coin: selectedAsset,
        side: meta.b ? 'B' : 'A',
        sz: meta.s,
        origSz: meta.s,
        timestamp: Date.now()
      })
    }

    if (openOrders.length > 0) {
      pushNewOpenOrders(openOrders)
    }

    // BUG-008 (spot): surface an HL `{ error: '...' }` main status instead of
    // silently succeeding. Same reasoning as the perps counterpart.
    if (typeof mainStatus === 'object' && 'error' in mainStatus) {
      toastSdkError((mainStatus as { error: string }).error, 'Order failed', { id: toastId })
      return
    }
    if (typeof mainStatus === 'object' && 'filled' in mainStatus) {
      const filled = mainStatus.filled
      const action = isBuy ? 'bought' : 'sold'
      const assetName = selectedAsset.split('-')[0]
      toast.success(
        `${filled.totalSz} ${spotKeyToName.get(assetName)} ${action} at average price of ${filled.avgPx}`,
        {
          id: toastId
        }
      )
    } else if (typeof mainStatus === 'object' && 'resting' in mainStatus) {
      toast.success(
        hasTpslOrders ? 'Order + TP/SL Placed Successfully' : 'Order Placed Successfully',
        {
          id: toastId
        }
      )
    }
  } catch (error) {
    toastSdkError(error, 'Error placing Spot order', { id: toastId })
  }
}
