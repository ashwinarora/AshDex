'use client'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { useWalletModal } from '@/context/WalletModalContext'
import { AGENT_NAME, BUILDER_ADDRESS, SPOT_DELTA } from '@/utils/constants'
import { getApproveAgentPayload } from '@/utils/hyperliquid/ApproveAgent'
import { getApproveBuilderFeePayload } from '@/utils/hyperliquid/ApproveBuilderFee'
import { OrderData, placeOrder } from '@/utils/hyperliquid/PlaceOrder'
import { IExtraAgent, MetaData, SpotMeta } from '@/utils/hyperliquid/hyperLiquidTypes'
import { formatPrice, getUniverseIndex, splitSignature } from '@/utils/utils'
import { useComponentRendered } from '@/hooks/useComponentRendered'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useAccount, useSignTypedData } from 'wagmi'
import { TPSLType } from './TPSL'
import useIsSpot from '@/hooks/useIsSpot'
import { AxiosInstance } from 'axios'
import { PrivateKeyAccount } from 'viem'
import { IWebData2 } from '@/utils/hyperliquid/webData2Types'

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
  const res = await sdk.exchange.updateLeverage(
    selectedAsset,
    isCross ? 'cross' : 'isolated',
    leverage
  )
  console.log(res)
  const assetIndex = getUniverseIndex(universe, selectedAsset)
  const szDecimals = universe[assetIndex].szDecimals
  const tif = isPostOnly ? 'Alo' : 'Gtc'
  const orders: OrderData[] = []
  if (stopOrder) {
    const { isMarket, triggerPx, tpsl } = stopOrder
    orders.push({
      assetIndex: assetIndex,
      isBuy: isBuy,
      price: formatPrice(limitPrice, szDecimals),
      size: amount.toFixed(szDecimals),
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
      size: amount.toFixed(szDecimals),
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
        size: amount.toFixed(szDecimals),
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
        size: amount.toFixed(szDecimals),
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
  const placeOrderRes = await placeOrder(agentWallet, isTestnet, hyperliquidAxios, {
    orders: orders,
    grouping: tpsl?.isTpsl ? 'normalTpsl' : 'na',
    builder: {
      address: BUILDER_ADDRESS,
      fee: currentFeeApproval
    }
  })
  console.log(placeOrderRes)
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
  const { data: extraAgents, refetch: refetchExtraAgents } = useQuery({
    queryKey: ['extraAgents'],
    queryFn: async () => {
      const response = await hyperliquidAxios.post('/info', {
        type: 'extraAgents',
        user: address
      })
      return response.data as IExtraAgent[]
    },
    enabled: isWalletConnected && !!hyperliquidAxios
  })

  const isAgentApproved = useMemo(() => {
    if (!extraAgents) return false
    return extraAgents.some(
      (agent) => agent.address.toLowerCase() === agentWallet?.address.toLowerCase()
    )
  }, [extraAgents, agentWallet])

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
        className={
          'py-2 rounded-2xl w-full  bg-primary hover:bg-purple-600 text-white cursor-pointer'
        }
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
        className={
          'py-2 rounded-2xl w-full  bg-primary hover:bg-purple-600 text-white cursor-pointer'
        }
        onClick={async () => {
          if (!chainId) return
          try {
            const payload = getApproveAgentPayload({
              agentAddress: agentWallet?.address || '',
              agentName: AGENT_NAME,
              chainId: chainId,
              isTestnet: isTestnet,
              nonce: Date.now()
            })
            const sign = await signTypedDataAsync(payload)
            const body = {
              action: {
                type: payload.message.type,
                agentAddress: payload.message.agentAddress,
                agentName: payload.message.agentName,
                nonce: payload.message.nonce,
                signatureChainId: payload.message.signatureChainId,
                hyperliquidChain: payload.message.hyperliquidChain
              },
              nonce: payload.message.nonce,
              signature: splitSignature(sign)
            }
            await hyperliquidAxios.post('/exchange', body)
            await refetchExtraAgents()
          } catch (error) {
            console.error('Error approving agent:', error)
          }
        }}
      >
        Approve Agent
      </button>
    )
  }
  if (currentFeeApproval === 0) {
    return (
      <button
        type="button"
        className={
          'py-2 rounded-2xl w-full  bg-primary hover:bg-purple-600 text-white cursor-pointer'
        }
        onClick={async () => {
          if (!chainId) return
          try {
            const payload = getApproveBuilderFeePayload({
              chainId: chainId,
              isTestnet: isTestnet,
              builder: BUILDER_ADDRESS,
              nonce: Date.now(),
              feePercentage: '0.1%'
            })
            const sign = await signTypedDataAsync(payload)
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
          } catch (error) {
            console.error('Error approving agent:', error)
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
