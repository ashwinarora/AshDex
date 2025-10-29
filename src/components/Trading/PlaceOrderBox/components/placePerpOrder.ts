import { AssetPosition, ExchangeClient, FrontendOrder, PerpsMeta } from '@nktkas/hyperliquid'
import { TPSLType } from './TPSL'
import { formatPrice, getPerpsUniverseIndex } from '@/utils/utils'
import { OrderData } from '@/utils/hyperliquid/PlaceOrder'
import { StopOrder } from './OrderButton'
import { toast } from 'sonner'
import { BUILDER_ADDRESS } from '@/utils/constants'

export const placePerpOrder = async ({
  sdkL1ActionClient,
  selectedAsset,
  isCross,
  leverage,
  perpsMeta,
  isPostOnly,
  stopOrder,
  isBuy,
  assetAmount,
  limitPrice,
  isReduceOnly,
  tpsl,
  adjustedBuilderFee,
  pushNewOpenOrders,
  pushNewPosition
}: {
  sdkL1ActionClient: ExchangeClient | null
  selectedAsset: string
  isCross: boolean
  leverage: number
  perpsMeta: PerpsMeta | null
  isPostOnly: boolean
  isBuy: boolean
  assetAmount: string
  limitPrice: string
  isReduceOnly: boolean
  adjustedBuilderFee: number
  tpsl?: TPSLType
  stopOrder?: StopOrder
  pushNewOpenOrders: (order: FrontendOrder[]) => void
  pushNewPosition: (postion: AssetPosition) => void
}) => {
  const assetIndex = getPerpsUniverseIndex(perpsMeta?.universe || [], selectedAsset)
  const szDecimals = perpsMeta?.universe[assetIndex].szDecimals || 0
  const tif = isPostOnly ? 'Alo' : 'Gtc'
  const orders: OrderData[] = []
  const formattedSize = assetAmount.replace(/\.?0+$/, '')

  if (stopOrder) {
    const { isMarket, triggerPx, tpsl } = stopOrder
    orders.push({
      assetIndex: assetIndex,
      isBuy: isBuy,
      price: limitPrice,
      size: formattedSize,
      reduceOnly: isReduceOnly,
      orderType: {
        trigger: {
          isMarket: isMarket,
          triggerPx: formatPrice(triggerPx, szDecimals).toString(),
          tpsl: tpsl
        }
      }
    })
  } else {
    orders.push({
      assetIndex: assetIndex,
      isBuy: isBuy,
      price: limitPrice,
      size: formattedSize,
      reduceOnly: isReduceOnly,
      orderType: {
        limit: {
          tif: tif
        }
      }
    })
  }
  if (tpsl?.isTpsl) {
    // Use an 8% worst-case buffer for TP/SL market orders, matching Hyperliquid behavior
    const tpslLimitPxMultiplier = isBuy ? 0.92 : 1.08
    if (Number(tpsl.stopLoss) > 0) {
      orders.push({
        assetIndex: assetIndex,
        isBuy: !isBuy,
        price: formatPrice(Number(tpsl.stopLoss) * tpslLimitPxMultiplier, szDecimals).toString(),
        size: formattedSize,
        reduceOnly: true,
        orderType: {
          trigger: {
            isMarket: true,
            triggerPx: formatPrice(Number(tpsl.stopLoss), szDecimals).toString(),
            tpsl: 'sl'
          }
        }
      })
    }
    if (Number(tpsl.takeProfit) > 0) {
      orders.push({
        assetIndex: assetIndex,
        isBuy: !isBuy,
        price: formatPrice(Number(tpsl.takeProfit) * tpslLimitPxMultiplier, szDecimals).toString(),
        size: formattedSize,
        reduceOnly: true,
        orderType: {
          trigger: {
            isMarket: true,
            triggerPx: formatPrice(Number(tpsl.takeProfit), szDecimals).toString(),
            tpsl: 'tp'
          }
        }
      })
    }
  }
  const toastId = toast.loading('Loading...')
  try {
    if (!sdkL1ActionClient) return
    const res = await sdkL1ActionClient.updateLeverage({
      asset: assetIndex,
      isCross: isCross,
      leverage: leverage
    })
    console.log(res)
    const placeOrderRes = await sdkL1ActionClient.order({
      grouping: tpsl?.isTpsl ? 'normalTpsl' : 'na',
      builder: {
        b: BUILDER_ADDRESS,
        f: adjustedBuilderFee
      },
      orders: orders.map((order) => ({
        a: order.assetIndex,
        b: order.isBuy,
        p: order.price,
        s: order.size,
        r: order.reduceOnly,
        t: order.orderType
      }))
    })
    console.log(placeOrderRes)
    // TODO: Handle the status of all Orders
    const status = placeOrderRes.response.data.statuses[0]
    const openOrders: FrontendOrder[] = []
    if ('error' in status) {
      console.log('Error placing perp order:', status.error)
      toast.error(status.error, {
        id: toastId
      })
    } else if ('filled' in status) {
      const filled = status.filled
      const action = isBuy ? 'long' : 'short'
      const assetName = selectedAsset.split('-')[0]
      pushNewPosition({
        type: 'oneWay',
        position: {
          coin: selectedAsset,
          entryPx: filled.avgPx,
          leverage: isCross
            ? { type: 'cross', value: leverage }
            : { type: 'isolated', value: leverage, rawUsd: '0' },
          liquidationPx: '',
          marginUsed: '',
          maxLeverage: 0,
          positionValue: (Number(filled.totalSz) * Number(filled.avgPx)).toString(),
          szi: (Number(formattedSize) * (isBuy ? 1 : -1)).toString(),
          unrealizedPnl: '',
          returnOnEquity: '',
          cumFunding: {
            allTime: '',
            sinceOpen: '',
            sinceChange: ''
          }
        }
      })
      toast.success(
        `${filled.totalSz} ${assetName} ${action} at average price of ${filled.avgPx}`,
        {
          id: toastId
        }
      )
    } else if ('resting' in status) {
      openOrders.push({
        oid: status.resting.oid,
        children: [],
        cloid: null,
        triggerPx: '',
        triggerCondition: 'N/A',
        isTrigger: false,
        isPositionTpsl: false,
        reduceOnly: isReduceOnly,
        tif: tif,
        coin: selectedAsset,
        side: isBuy ? 'B' : 'A',
        sz: formattedSize,
        origSz: formattedSize,
        limitPx: limitPrice,
        orderType: 'Limit',
        timestamp: Date.now()
      })
      toast.success('Order Placed Successfully', {
        id: toastId
      })
    }
    if ('resting' in status || 'filled' in status) {
      const orderId = 'resting' in status ? status.resting.oid : status.filled.oid
      if (tpsl?.isTpsl) {
        const limitPxmultiplier = isBuy ? 0.92 : 1.08 // 8% buffer. Hyperliquid also uses 8% buffer for market orders.
        if (tpsl.takeProfit > 0) {
          openOrders.push({
            oid: orderId + 1, // adds 1 when no SL and 2 when SL is set.
            children: [],
            cloid: null,
            triggerPx: tpsl.takeProfit.toString(),
            triggerCondition: 'Price Above ' + tpsl.takeProfit,
            isTrigger: true,
            isPositionTpsl: false,
            reduceOnly: true,
            tif: null,
            sz: formattedSize,
            origSz: formattedSize,
            limitPx: (tpsl.takeProfit * limitPxmultiplier).toString(),
            coin: selectedAsset,
            orderType: 'Take Profit Market',
            side: isBuy ? 'A' : 'B',
            timestamp: Date.now()
          })
        }
        if (tpsl.stopLoss > 0) {
          openOrders.push({
            oid: orderId + openOrders.length, // adds 1 when no SL and 2 when SL is set.
            children: [],
            cloid: null,
            triggerPx: tpsl.stopLoss.toString(),
            triggerCondition: 'Price Below ' + tpsl.stopLoss,
            isTrigger: true,
            isPositionTpsl: false,
            reduceOnly: true,
            tif: null,
            sz: formattedSize,
            origSz: formattedSize,
            limitPx: (tpsl.stopLoss * limitPxmultiplier).toString(),
            coin: selectedAsset,
            orderType: 'Stop Market',
            side: isBuy ? 'A' : 'B',
            timestamp: Date.now()
          })
        }
      }
    }
    console.log('pushing open orders', openOrders)
    pushNewOpenOrders(openOrders)
  } catch (error) {
    console.log(error)
    toast.error(JSON.stringify(error) as string, {
      id: toastId
    })
  }
}
