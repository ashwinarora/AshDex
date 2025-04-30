'use client'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { useWalletModal } from '@/context/WalletModalContext'
import { BUILDER_ADDRESS, SPOT_DELTA } from '@/utils/constants'
import { getApproveBuilderFeePayload } from '@/utils/hyperliquid/ApproveBuilderFee'
import { OrderData, placeOrder } from '@/utils/hyperliquid/PlaceOrder'
import { MetaData, SpotMeta } from '@/utils/hyperliquid/hyperLiquidTypes'
import { formatPrice, getUniverseIndex, splitSignature } from '@/utils/utils'
import { useComponentRendered } from '@/hooks/useComponentRendered'
import { useQuery } from '@tanstack/react-query'
import { useAccount, useSignTypedData } from 'wagmi'
import { TPSLType } from './TPSL'
import useIsSpot from '@/hooks/useIsSpot'
import { AxiosInstance } from 'axios'
import { PrivateKeyAccount } from 'viem'
import { IWebData2 } from '@/utils/hyperliquid/webData2Types'
import { toast } from 'react-toastify'
import { useAgentApproval } from '@/context/EstablishConnection'

type StopOrder = {
  isMarket: boolean
  triggerPx: number
  tpsl: 'sl' | 'tp'
}

type OrderButtonProps = {
  selectedAsset: string
  isBuy: boolean
  amount: number
  limitPrice: number
  leverage: number
  isCross: boolean
  isPostOnly: boolean
  isReduceOnly: boolean
  tpsl?: TPSLType
  stopOrder?: StopOrder
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
  amount,
  limitPrice,
  isReduceOnly,
  tpsl,
  agentWallet,
  isTestnet,
  hyperliquidAxios,
  currentFeeApproval
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sdk: any
  selectedAsset: string
  isCross: boolean
  leverage: number
  universe: MetaData[]
  isPostOnly: boolean
  isBuy: boolean
  amount: number
  limitPrice: number
  isReduceOnly: boolean
  agentWallet: PrivateKeyAccount
  isTestnet: boolean
  hyperliquidAxios: AxiosInstance
  currentFeeApproval: number
  tpsl?: TPSLType
  stopOrder?: StopOrder
}) => {
  const assetIndex = getUniverseIndex(universe, selectedAsset)
  const szDecimals = universe[assetIndex].szDecimals
  const tif = isPostOnly ? 'Alo' : 'Gtc'
  const orders: OrderData[] = []
  const formattedSize = parseFloat(amount.toFixed(szDecimals)).toString()
  if (stopOrder) {
    const { isMarket, triggerPx, tpsl } = stopOrder
    orders.push({
      assetIndex: assetIndex,
      isBuy: isBuy,
      price: formatPrice(limitPrice, szDecimals),
      size: formattedSize,
      reduceOnly: isReduceOnly,
      orderType: {
        trigger: {
          isMarket: isMarket,
          triggerPx: formatPrice(triggerPx, szDecimals),
          tpsl: tpsl
        }
      }
    })
  } else {
    orders.push({
      assetIndex: assetIndex,
      isBuy: isBuy,
      price: formatPrice(limitPrice, szDecimals),
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
    if (tpsl.stopLoss > 0) {
      orders.push({
        assetIndex: assetIndex,
        isBuy: !isBuy,
        price: formatPrice(tpsl.stopLoss, szDecimals),
        size: formattedSize,
        reduceOnly: true,
        orderType: {
          trigger: {
            isMarket: true,
            triggerPx: formatPrice(tpsl.stopLoss, szDecimals),
            tpsl: 'sl'
          }
        }
      })
    }
    if (tpsl.takeProfit > 0) {
      orders.push({
        assetIndex: assetIndex,
        isBuy: !isBuy,
        price: formatPrice(tpsl.takeProfit, szDecimals),
        size: formattedSize,
        reduceOnly: true,
        orderType: {
          trigger: {
            isMarket: true,
            triggerPx: formatPrice(tpsl.takeProfit, szDecimals),
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
      toast.update(toastId, {
        render: '✅ Order placed successfully',
        type: 'success',
        isLoading: false,
        autoClose: 2000
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
  spotMeta,
  spotAssetContext,
  agentWallet,
  isTestnet,
  hyperliquidAxios,
  selectedAsset,
  isBuy,
  limitPrice,
  amount,
  isPostOnly
}: {
  spotMeta: SpotMeta
  spotAssetContext: IWebData2['spotAssetCtxs']
  agentWallet: PrivateKeyAccount
  isTestnet: boolean
  hyperliquidAxios: AxiosInstance
  selectedAsset: string
  isBuy: boolean
  limitPrice: number
  amount: number
  isPostOnly: boolean
}) => {
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
          price: formatPrice(limitPrice, 4),
          size: formatPrice(amount, tokenData.szDecimals),
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
      toast.update(toastId, {
        render: '✅ Order placed successfully',
        type: 'success',
        isLoading: false,
        autoClose: 2000
      })
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
  amount,
  limitPrice,
  leverage,
  isCross,
  isPostOnly,
  isReduceOnly,
  tpsl,
  stopOrder
}: OrderButtonProps) => {
  const { isRendered } = useComponentRendered()
  const { address, isConnected: isWalletConnected, chainId } = useAccount()
  const { agentWallet, hyperliquidAxios, universe, sdk, isTestnet, spotAssetContext, spotMeta } =
    useHyperLiquid()
  const { toggleConnectWalletModal } = useWalletModal()
  const isSpot = useIsSpot()
  const { signTypedDataAsync } = useSignTypedData()
  const { isAgentApproved, openModal: openAgentModal } = useAgentApproval()

  const { data: currentFeeApproval, refetch: refetchCurrentFeeApproval } = useQuery({
    queryKey: ['maxBuilderFee', address, BUILDER_ADDRESS],
    queryFn: async () => {
      const response = await hyperliquidAxios.post('/info', {
        type: 'maxBuilderFee',
        user: address,
        builder: BUILDER_ADDRESS
      })
      return response.data as number
    },
    enabled: isWalletConnected && !!hyperliquidAxios && !!agentWallet && isAgentApproved
  })

  // We handle the render logic after hooks are all set up
  if (!isRendered) return null

  if (!isWalletConnected) {
    return (
      <button
        type="button"
        className="py-2 rounded-2xl w-full  bg-primary hover:bg-purple-600 text-white cursor-pointer"
        onClick={() => {
          toggleConnectWalletModal()
        }}
      >
        Connect Wallet
      </button>
    )
  }
  if (!isAgentApproved) {
    return (
      <button
        type="button"
        className="py-2 rounded-2xl w-full  bg-primary hover:bg-purple-600 text-white cursor-pointer"
        onClick={async () => openAgentModal()}
      >
        Approve Agent
      </button>
    )
  }
  if (currentFeeApproval === 0) {
    return (
      <button
        type="button"
        className="py-2 rounded-2xl w-full  bg-primary hover:bg-purple-600 text-white cursor-pointer"
        onClick={async () => {
          if (!chainId) return
          const payload = getApproveBuilderFeePayload({
            chainId: chainId,
            isTestnet: isTestnet,
            builder: BUILDER_ADDRESS,
            nonce: Date.now(),
            feePercentage: '0.1%'
          })
          const sign = await signTypedDataAsync(payload)
          const toastId = toast.loading('⏳ Approving fee…')
          try {
            const body = {
              action: {
                type: payload.message.type,
                builder: payload.message.builder,
                maxFeeRate: payload.message.maxFeeRate,
                nonce: payload.message.nonce,
                signatureChainId: payload.message.signatureChainId,
                hyperliquidChain: payload.message.hyperliquidChain
              },
              nonce: payload.message.nonce,
              signature: splitSignature(sign)
            }
            await hyperliquidAxios.post('/exchange', body)
            await refetchCurrentFeeApproval()
            toast.update(toastId, {
              render: '✅ Fee approved successfully',
              type: 'success',
              isLoading: false,
              autoClose: 2000
            })
          } catch (error) {
            console.error('Error approving agent:', error)
            toast.update(toastId, {
              render: '❌' + error,
              type: 'error',
              isLoading: false,
              autoClose: 2000
            })
          }
        }}
      >
        Approve Fee
      </button>
    )
  }
  return (
    <button
      type="button"
      className={
        'py-2 rounded-2xl w-full  bg-primary hover:bg-purple-600 text-white cursor-pointer'
      }
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
            amount,
            isPostOnly
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
            amount,
            limitPrice,
            isReduceOnly,
            tpsl,
            agentWallet,
            isTestnet,
            hyperliquidAxios,
            currentFeeApproval
          })
        }
      }}
    >
      {isBuy ? 'Buy' : 'Sell'}
    </button>
  )
}
export default OrderButton
