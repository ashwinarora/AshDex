'use client'
import { useWalletModal } from '@/context/WalletModalContext'
import { BUILDER_ADDRESS, SPOT_DELTA } from '@/utils/constants'
import { OrderData } from '@/utils/hyperliquid/PlaceOrder'
import { formatPrice, getUniverseIndex } from '@/utils/utils'
import { useComponentRendered } from '@/hooks/useComponentRendered'
import { useAccount } from 'wagmi'
import { TPSLType } from './TPSL'
import { toast } from 'react-toastify'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { IconWallet } from '@tabler/icons-react'
import { useMemo } from 'react'
import useIsSpot from '@/hooks/useIsSpot'
import { ExchangeClient, PerpsMeta, SpotAssetCtx, SpotMeta } from '@nktkas/hyperliquid'

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
  currentFeeApproval
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
}) => {
  const assetIndex = getUniverseIndex(perpsMeta?.universe || [], selectedAsset)
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
    // const placeOrderRes = await placeOrder(agentWallet, isTestnet, hyperliquidAxios, {
    //   orders: orders,
    //   grouping: tpsl?.isTpsl ? 'normalTpsl' : 'na',
    //   builder: {
    //     address: BUILDER_ADDRESS,
    //     fee: currentFeeApproval
    //   }
    // })
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
        render: `✅ ${filled.totalSz} ${assetName} ${action} at average price of ${filled.avgPx}`,
        type: 'success',
        isLoading: false,
        autoClose: 3000
      })
    } else if ('resting' in status) {
      toast.update(toastId, {
        render: `✅ Order Placed Successfully`,
        type: 'success',
        isLoading: false,
        autoClose: 3000
      })
    }
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
  spotAssetContext,
  selectedAsset,
  isBuy,
  limitPrice,
  assetAmount,
  isPostOnly,
  currentFeeApproval
}: {
  sdkExchangeClient: ExchangeClient | null
  spotMeta?: SpotMeta
  spotAssetContext: SpotAssetCtx[]
  selectedAsset: string
  isBuy: boolean
  limitPrice: string
  assetAmount: string
  isPostOnly: boolean
  currentFeeApproval: number
}) => {
  if (!spotMeta?.tokens) return
  if (!sdkExchangeClient) return
  const assetIndex =
    spotAssetContext.findIndex((assets) => assets.coin.includes(selectedAsset)) + SPOT_DELTA
  const tokenData = spotMeta.tokens.find((token) => token.name.includes(selectedAsset))
  if (!tokenData) return
  const toastId = toast.loading('⏳ Loading…')
  try {
    // const res = await placeOrder(agentWallet, isTestnet, hyperliquidAxios, {
    //   grouping: 'na',
    //   orders: [
    //     {
    //       assetIndex: assetIndex,
    //       isBuy: isBuy,
    //       price: limitPrice,
    //       size: assetAmount.replace(/\.?0+$/, ''),
    //       reduceOnly: false,
    //       orderType: {
    //         limit: {
    //           tif: isPostOnly ? 'Alo' : 'Gtc'
    //         }
    //       }
    //     }
    //   ]
    // })
    const res = await sdkExchangeClient.order({
      grouping: 'na',
      builder: {
        b: BUILDER_ADDRESS,
        f: currentFeeApproval
      },
      orders: [
        {
          a: assetIndex,
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
        render: `✅ ${filled.totalSz} ${assetName} ${action} at average price of ${filled.avgPx}`,
        type: 'success',
        isLoading: false,
        autoClose: 3000
      })
    } else if ('resting' in status) {
      const resting = status.resting
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
  const isRendered = useComponentRendered()
  const { isConnected: isWalletConnected } = useAccount()
  const { agentWallet, sdkExchangeClient, spotAssetContext, perpsMeta } = useHyperliquid()
  const { data: spotMeta } = useSpotMeta()
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

  // We handle the render logic after hooks are all set up
  if (!isRendered) return null

  if (!isWalletConnected) {
    return (
      <div
        className="flex justify-center items-center gap-2 bg-primary hover:bg-purple-600 py-2 rounded-md w-full text-white cursor-pointer"
        onClick={() => {
          toggleConnectWalletModal()
        }}
      >
        <IconWallet className="w-4 h-4" /> Connect Wallet
      </div>
    )
  }
  if (!isAgentApproved || currentFeeApproval === 0) {
    return (
      <div
        className="flex justify-center items-center gap-2 bg-primary hover:bg-purple-600 py-2 rounded-md w-full text-white cursor-pointer"
        onClick={async () => openAgentModal()}
      >
        Enable Trading
      </div>
    )
  }
  return (
    <button
      type="button"
      className={`py-2 rounded-md w-full  font-semibold text-white cursor-pointer ${
        isInvalid
          ? 'bg-white/10 hover:cursor-not-allowed '
          : isBuy
            ? 'bg-green hover:bg-green/80 '
            : 'bg-red hover:bg-red/80 '
      }`}
      disabled={isInvalid}
      onClick={async () => {
        if (!agentWallet) return
        if (!currentFeeApproval) return
        if (isInvalid) {
          return
        }
        if (isSpot) {
          await placeSpotOrder({
            sdkExchangeClient,
            spotMeta,
            spotAssetContext,
            selectedAsset,
            isBuy,
            limitPrice,
            assetAmount,
            isPostOnly,
            currentFeeApproval
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
            currentFeeApproval
          })
        }
      }}
    >
      {isSpot ? (isBuy ? 'Buy' : 'Sell') : isBuy ? 'Buy/Long' : 'Sell/Short'}
    </button>
  )
}
export default OrderButton
