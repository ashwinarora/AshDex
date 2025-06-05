'use client'
import { useWalletModal } from '@/context/WalletModalContext'
import { BUILDER_ADDRESS, SPOT_DELTA } from '@/utils/constants'
import { OrderData, placeOrder } from '@/utils/hyperliquid/PlaceOrder'
import { MetaData, SpotMeta } from '@/utils/hyperliquid/hyperLiquidTypes'
import { formatPrice, getUniverseIndex } from '@/utils/utils'
import { useComponentRendered } from '@/hooks/useComponentRendered'
import { useAccount } from 'wagmi'
import { TPSLType } from './TPSL'
import useIsSpot from '@/hooks/useIsSpot'
import { AxiosInstance } from 'axios'
import { PrivateKeyAccount } from 'viem'
import { IWebData2 } from '@/utils/hyperliquid/webData2Types'
import { toast } from 'react-toastify'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { hyperliquidAxios } from '@/config/axios'
import { isTestnet } from '@/utils/constants'
import { IconWallet } from '@tabler/icons-react'

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
  isInvalid: boolean
}

const placePerpOrder = async ({
  sdk,
  selectedAsset,
  isCross,
  leverage,
  universe,
  isPostOnly,
  stopOrder,
  isBuy,
  assetAmount,
  limitPrice,
  isReduceOnly,
  tpsl,
  agentWallet,
  isTestnet,
  hyperliquidAxios,
  currentFeeApproval,
  isInvalid
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sdk: any
  selectedAsset: string
  isCross: boolean
  leverage: number
  universe: MetaData[]
  isPostOnly: boolean
  isBuy: boolean
  assetAmount: string
  limitPrice: string
  isReduceOnly: boolean
  agentWallet: PrivateKeyAccount
  isTestnet: boolean
  hyperliquidAxios: AxiosInstance
  currentFeeApproval: number
  tpsl?: TPSLType
  stopOrder?: StopOrder
  isInvalid: boolean
}) => {
  const assetIndex = getUniverseIndex(universe, selectedAsset)
  const szDecimals = universe[assetIndex].szDecimals
  const tif = isPostOnly ? 'Alo' : 'Gtc'
  const orders: OrderData[] = []
  const formattedSize = assetAmount.replace(/\.?0+$/, '')

  if (isInvalid) {
    return
  }
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
    const res = await sdk.exchange.updateLeverage(
      selectedAsset,
      isCross ? 'cross' : 'isolated',
      leverage
    )
    console.log(res)
    const placeOrderRes = await placeOrder(agentWallet, isTestnet, hyperliquidAxios, {
      orders: orders,
      grouping: tpsl?.isTpsl ? 'normalTpsl' : 'na',
      builder: {
        address: BUILDER_ADDRESS,
        fee: currentFeeApproval
      }
    })
    console.log(placeOrderRes)
    const status = placeOrderRes.data.response.data.statuses[0]
    if (status.error) {
      toast.update(toastId, {
        render: '❌' + status.error,
        type: 'error',
        isLoading: false,
        autoClose: 3000
      })
    } else {
      const filled = status.filled
      if (filled) {
        const action = isBuy ? 'long' : 'short'
        const assetName = selectedAsset.split('-')[0]
        toast.update(toastId, {
          render: `✅ ${filled.totalSz} ${assetName} ${action} at average price of ${filled.avgPx}`,
          type: 'success',
          isLoading: false,
          autoClose: 3000
        })
      }
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
  spotMeta,
  spotAssetContext,
  agentWallet,
  isTestnet,
  hyperliquidAxios,
  selectedAsset,
  isBuy,
  limitPrice,
  assetAmount,
  isPostOnly,
  isInvalid
}: {
  spotMeta: SpotMeta
  spotAssetContext: IWebData2['spotAssetCtxs']
  agentWallet: PrivateKeyAccount
  isTestnet: boolean
  hyperliquidAxios: AxiosInstance
  selectedAsset: string
  isBuy: boolean
  limitPrice: string
  assetAmount: string
  isPostOnly: boolean
  isInvalid: boolean
}) => {
  if (isInvalid) {
    return
  }
  if (!spotMeta.tokens) return
  const assetIndex =
    spotAssetContext.findIndex((assets) => assets.coin.includes(selectedAsset)) + SPOT_DELTA
  const tokenData = spotMeta.tokens.find((token) => token.name.includes(selectedAsset))
  if (!tokenData) return
  const toastId = toast.loading('⏳ Loading…')
  try {
    const res = await placeOrder(agentWallet, isTestnet, hyperliquidAxios, {
      grouping: 'na',
      orders: [
        {
          assetIndex: assetIndex,
          isBuy: isBuy,
          price: limitPrice,
          size: assetAmount.replace(/\.?0+$/, ''),
          reduceOnly: false,
          orderType: {
            limit: {
              tif: isPostOnly ? 'Alo' : 'Gtc'
            }
          }
        }
      ]
    })
    console.log(res)
    const status = res.data.response.data.statuses[0]
    if (status.error) {
      toast.update(toastId, {
        render: '❌' + status.error,
        type: 'error',
        isLoading: false,
        autoClose: 3000
      })
    } else {
      const filled = status.filled
      if (filled) {
        const action = isBuy ? 'bought' : 'sold'
        const assetName = selectedAsset.split('-')[0]
        toast.update(toastId, {
          render: `✅ ${filled.totalSz} ${assetName} ${action} at average price of ${filled.avgPx}`,
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
  stopOrder,
  isInvalid
}: OrderButtonProps) => {
  const isRendered = useComponentRendered()
  const { isConnected: isWalletConnected } = useAccount()
  const { agentWallet, sdk, spotAssetContext } = useHyperliquid()
  const { data: universe } = usePerpsUniverse()
  const { data: spotMeta } = useSpotMeta()
  const { toggleConnectWalletModal } = useWalletModal()
  const isSpot = useIsSpot()
  const { isAgentApproved, openModal: openAgentModal, currentFeeApproval } = useAgentApproval()

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
        if (isSpot) {
          await placeSpotOrder({
            spotMeta,
            spotAssetContext,
            agentWallet,
            isTestnet,
            hyperliquidAxios,
            selectedAsset,
            isBuy,
            limitPrice,
            assetAmount,
            isPostOnly,
            isInvalid
          })
        } else {
          await placePerpOrder({
            sdk,
            selectedAsset,
            isCross,
            leverage,
            universe,
            isPostOnly,
            stopOrder,
            isBuy,
            assetAmount,
            limitPrice,
            isReduceOnly,
            tpsl,
            agentWallet,
            isTestnet,
            hyperliquidAxios,
            currentFeeApproval,
            isInvalid
          })
        }
      }}
    >
      {isSpot ? (isBuy ? 'Buy' : 'Sell') : isBuy ? 'Buy/Long' : 'Sell/Short'}
    </button>
  )
}
export default OrderButton
