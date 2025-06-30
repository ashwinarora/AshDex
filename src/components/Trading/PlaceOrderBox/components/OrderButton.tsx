'use client'
import { useWalletModal } from '@/context/WalletModalContext'
import { BUILDER_ADDRESS, SPOT_DELTA } from '@/utils/constants'
import { OrderData } from '@/utils/hyperliquid/PlaceOrder'
import { formatPrice, getPerpsUniverseIndex } from '@/utils/utils'
import { useAccount } from 'wagmi'
import { TPSLType } from './TPSL'
import { toast } from 'react-toastify'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { IconWallet } from '@tabler/icons-react'
import { useMemo } from 'react'
import useIsSpot from '@/hooks/useIsSpot'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type {
  AssetPosition,
  ExchangeClient,
  FrontendOrder,
  PerpsMeta,
  SpotMeta
} from '@nktkas/hyperliquid'

type StopOrder = {
  isMarket: boolean
  triggerPx: number
  tpsl: 'sl' | 'tp'
}

type OrderButtonProps = {
  selectedAsset: string
  isBuy: boolean
  assetAmount: string
  limitPrice: string
  leverage: number
  isCross: boolean
  isPostOnly: boolean
  isReduceOnly: boolean
  tpsl?: TPSLType
  stopOrder?: StopOrder
}

const placePerpOrder = async ({
  sdkExchangeClient,
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
  currentFeeApproval,
  pushNewOpenOrders,
  pushNewPosition
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sdkExchangeClient: ExchangeClient | null
  selectedAsset: string
  isCross: boolean
  leverage: number
  perpsMeta: PerpsMeta | null
  isPostOnly: boolean
  isBuy: boolean
  assetAmount: string
  limitPrice: string
  isReduceOnly: boolean
  currentFeeApproval: number
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
    if (Number(tpsl.stopLoss) > 0) {
      orders.push({
        assetIndex: assetIndex,
        isBuy: !isBuy,
        price: formatPrice(Number(tpsl.stopLoss), szDecimals).toString(),
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
        price: formatPrice(Number(tpsl.takeProfit), szDecimals).toString(),
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
  const toastId = toast.loading('⏳ Loading…')
  try {
    if (!sdkExchangeClient) return
    const res = await sdkExchangeClient.updateLeverage({
      asset: assetIndex,
      isCross: isCross,
      leverage: leverage
    })
    console.log(res)
    const placeOrderRes = await sdkExchangeClient.order({
      grouping: tpsl?.isTpsl ? 'normalTpsl' : 'na',
      builder: {
        b: BUILDER_ADDRESS,
        f: currentFeeApproval
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
      toast.update(toastId, {
        render: '❌' + status.error,
        type: 'error',
        isLoading: false,
        autoClose: 3000
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
      toast.update(toastId, {
        render: `✅ ${filled.totalSz} ${assetName} ${action} at average price of ${filled.avgPx}`,
        type: 'success',
        isLoading: false,
        autoClose: 3000
      })
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
      toast.update(toastId, {
        render: `✅ Order Placed Successfully`,
        type: 'success',
        isLoading: false,
        autoClose: 3000
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
    console.error('Error placing perp order:', error)
    toast.update(toastId, {
      render: '❌' + error,
      type: 'error',
      isLoading: false,
      autoClose: 2000
    })
  }
}

const placeSpotOrder = async ({
  sdkExchangeClient,
  spotMeta,
  selectedAsset,
  isBuy,
  limitPrice,
  assetAmount,
  isPostOnly,
  currentFeeApproval,
  spotKeyToName,
  pushNewOpenOrders
}: {
  sdkExchangeClient: ExchangeClient | null
  spotMeta?: SpotMeta
  selectedAsset: string
  isBuy: boolean
  limitPrice: string
  assetAmount: string
  isPostOnly: boolean
  currentFeeApproval: number
  spotKeyToName: Map<string, string>
  pushNewOpenOrders: (order: FrontendOrder[]) => void
}) => {
  if (!spotMeta?.tokens.length) return
  if (!sdkExchangeClient) return
  const assetIndex = spotMeta.universe.find((asset) => asset.name === selectedAsset)?.index
  if (assetIndex === -1 || assetIndex === undefined) return
  const toastId = toast.loading('⏳ Loading…')
  try {
    const res = await sdkExchangeClient.order({
      grouping: 'na',
      builder: {
        b: BUILDER_ADDRESS,
        f: currentFeeApproval
      },
      orders: [
        {
          a: assetIndex + SPOT_DELTA,
          b: isBuy,
          p: limitPrice,
          s: assetAmount,
          r: false,
          t: {
            limit: {
              tif: isPostOnly ? 'Alo' : 'Gtc'
            }
          }
        }
      ]
    })
    console.log(res)
    const status = res.response.data.statuses[0]
    if ('error' in status) {
      toast.update(toastId, {
        render: '❌' + status.error,
        type: 'error',
        isLoading: false,
        autoClose: 3000
      })
    } else if ('filled' in status) {
      const filled = status.filled
      const action = isBuy ? 'long' : 'short'
      const assetName = selectedAsset.split('-')[0]
      toast.update(toastId, {
        render: `✅ ${filled.totalSz} ${spotKeyToName.get(assetName)} ${action} at average price of ${filled.avgPx}`,
        type: 'success',
        isLoading: false,
        autoClose: 3000
      })
    } else if ('resting' in status) {
      const resting = status.resting
      console.log('pushing open order', resting)
      pushNewOpenOrders([
        {
          oid: resting.oid,
          children: [],
          cloid: null,
          triggerPx: '',
          triggerCondition: 'N/A',
          isTrigger: false,
          isPositionTpsl: false,
          reduceOnly: false,
          limitPx: limitPrice,
          orderType: 'Limit',
          tif: isPostOnly ? 'Alo' : 'Gtc',
          coin: selectedAsset,
          side: isBuy ? 'B' : 'A',
          sz: assetAmount,
          origSz: assetAmount,
          timestamp: Date.now()
        }
      ])
      if (resting) {
        toast.update(toastId, {
          render: `✅ Order Placed Successfully`,
          type: 'success',
          isLoading: false,
          autoClose: 3000
        })
      }
    }
  } catch (error) {
    console.error('Error placing spot order:', error)
    toast.update(toastId, {
      render: '❌' + error,
      type: 'error',
      isLoading: false,
      autoClose: 2000
    })
  }
}

const OrderButton = ({
  selectedAsset,
  isBuy,
  assetAmount,
  limitPrice,
  leverage,
  isCross,
  isPostOnly,
  isReduceOnly,
  tpsl,
  stopOrder
}: OrderButtonProps) => {
  const { isConnected: isWalletConnected } = useAccount()
  const { agentWallet, sdkExchangeClient, perpsMeta, pushNewOpenOrders, pushNewPosition } =
    useHyperliquid()
  const { data: spotMeta, spotKeyToName } = useSpotMeta()
  const { toggleConnectWalletModal } = useWalletModal()
  const { isAgentApproved, openModal: openAgentModal, currentFeeApproval } = useAgentApproval()
  const isSpot = useIsSpot()

  // Validation logic moved from parent components
  const isInvalid = useMemo(() => {
    if (isSpot) {
      const formattedLimitPrice = limitPrice.replace(/\.?0+$/, '')
      const formattedAssetAmount = assetAmount.replace(/\.?0+$/, '')

      return (
        formattedLimitPrice === '0' ||
        formattedLimitPrice === '' ||
        formattedAssetAmount === '0' ||
        formattedAssetAmount === ''
      )
    } else {
      const formattedLimitPrice = limitPrice.replace(/\.?0+$/, '')
      const formattedAssetAmount = assetAmount.replace(/\.?0+$/, '')

      // Check if TPSL is enabled and both values are empty/zero
      const isTpslInvalid =
        tpsl?.isTpsl && Number(tpsl.takeProfit) === 0 && Number(tpsl.stopLoss) === 0

      return (
        formattedLimitPrice === '0' ||
        formattedLimitPrice === '' ||
        formattedAssetAmount === '0' ||
        formattedAssetAmount === '' ||
        isTpslInvalid
      )
    }
  }, [limitPrice, assetAmount, tpsl, isSpot])

  if (!isWalletConnected) {
    return (
      <Button
        onClick={() => toggleConnectWalletModal()}
        className="w-full font-semibold cursor-pointer"
      >
        <IconWallet className="w-4 h-4" /> Connect Wallet
      </Button>
    )
  }
  if (!isAgentApproved || currentFeeApproval === 0) {
    return (
      <Button
        onClick={async () => openAgentModal()}
        className="w-full font-semibold cursor-pointer"
      >
        {' '}
        Enable Trading{' '}
      </Button>
    )
  }

  const handlePlaceOrder = async () => {
    if (!agentWallet) return
    if (!currentFeeApproval) return
    if (isInvalid) {
      return
    }
    if (isSpot) {
      await placeSpotOrder({
        sdkExchangeClient,
        spotMeta,
        selectedAsset,
        isBuy,
        limitPrice,
        assetAmount,
        isPostOnly,
        currentFeeApproval,
        spotKeyToName,
        pushNewOpenOrders
      })
    } else {
      await placePerpOrder({
        sdkExchangeClient,
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
        currentFeeApproval,
        pushNewOpenOrders,
        pushNewPosition
      })
    }
  }

  return (
    <Button
      onClick={handlePlaceOrder}
      className={cn(
        'w-full font-semibold text-white cursor-pointer',
        isInvalid
          ? 'bg-white/10 hover:cursor-not-allowed '
          : isBuy
            ? 'bg-green hover:bg-green/80 '
            : 'bg-red hover:bg-red/80 '
      )}
      disabled={isInvalid}
      variant={isInvalid ? 'destructive' : 'default'}
    >
      {isSpot ? (isBuy ? 'Buy' : 'Sell') : isBuy ? 'Buy/Long' : 'Sell/Short'}
    </Button>
  )
}
export default OrderButton
