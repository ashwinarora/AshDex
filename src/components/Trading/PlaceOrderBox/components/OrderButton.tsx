'use client'
import { useHyperLiquid } from '@/context/HyperLiquid'
import { useWalletModal } from '@/context/WalletModalContext'
import { AGENT_NAME, BUILDER_ADDRESS, MAX_DECIMALS_PERP } from '@/utils/constants'
import { getApproveAgentPayload } from '@/utils/hyperliquid/ApproveAgent'
import { getApproveBuilderFeePayload } from '@/utils/hyperliquid/ApproveBuilderFee'
import { OrderData, placeOrder } from '@/utils/hyperliquid/PlaceOrder'
import { IExtraAgent } from '@/utils/hyperLiquidTypes'
import { getUniverseIndex, splitSignature } from '@/utils/utils'
import { useComponentRendered } from '@/hooks/useComponentRendered'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useAccount, useSignTypedData } from 'wagmi'
import { TPSLType } from './TPSL'

interface OrderButtonProps {
  selectedAsset: string
  isBuy: boolean
  amount: number
  limitPrice: number
  leverage: number
  isCross: boolean
  isPostOnly: boolean
  tpsl?: TPSLType
}

const OrderButton = ({
  selectedAsset,
  isBuy,
  amount,
  limitPrice,
  leverage,
  isCross,
  isPostOnly,
  tpsl
}: OrderButtonProps) => {
  const { isRendered } = useComponentRendered()
  const { address, isConnected: isWalletConnected, chainId, chain } = useAccount()
  const { agentWallet, hyperliquidAxios, universe, sdk } = useHyperLiquid()
  const { toggleConnectWalletModal } = useWalletModal()

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
          'py-2 rounded-2xl w-full  bg-[#5F46F9] hover:bg-purple-600 text-white cursor-pointer'
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
          'py-2 rounded-2xl w-full  bg-[#5F46F9] hover:bg-purple-600 text-white cursor-pointer'
        }
        onClick={async () => {
          if (!chainId) return
          try {
            const payload = getApproveAgentPayload({
              agentAddress: agentWallet?.address || '',
              agentName: AGENT_NAME,
              chainId: chainId,
              isTestnet: chain?.testnet || false,
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
          'py-2 rounded-2xl w-full  bg-[#5F46F9] hover:bg-purple-600 text-white cursor-pointer'
        }
        onClick={async () => {
          if (!chainId) return
          try {
            const payload = getApproveBuilderFeePayload({
              chainId: chainId,
              isTestnet: chain?.testnet || false,
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
        'py-2 rounded-2xl w-full  bg-[#5F46F9] hover:bg-purple-600 text-white cursor-pointer'
      }
      onClick={async () => {
        if (!agentWallet) return
        if (!universe) return
        if (!currentFeeApproval) return
        const res = await sdk.exchange.updateLeverage(
          selectedAsset,
          isCross ? 'cross' : 'isolated',
          leverage
        )
        console.log(res)
        const assetIndex = getUniverseIndex(universe, selectedAsset)
        const szDecimals = universe[assetIndex].szDecimals
        const decimals = MAX_DECIMALS_PERP - szDecimals - 1
        const tif = isPostOnly ? 'Alo' : 'Gtc'
        const orders: OrderData[] = [{
          assetIndex: assetIndex,
          isBuy: isBuy,
          price: limitPrice.toFixed(decimals),
          size: amount.toFixed(szDecimals),
          reduceOnly: false,
          orderType: {
            limit: {
              tif: tif
            }
          }
        }]
        if(tpsl?.isTpsl) {
          if(tpsl.stopLoss > 0) {
            orders.push({
              assetIndex: assetIndex,
              isBuy: !isBuy,
              price: tpsl.stopLoss.toFixed(decimals),
              size: amount.toFixed(szDecimals),
              reduceOnly: true,
              orderType: {
                trigger: {
                  isMarket: true,
                  triggerPx: tpsl.stopLoss.toFixed(decimals),
                  tpsl: "sl"
                }
              }
            })
          }
          if(tpsl.takeProfit > 0) {
            orders.push({
              assetIndex: assetIndex,
              isBuy: !isBuy,
              price: tpsl.takeProfit.toFixed(decimals),
              size: amount.toFixed(szDecimals),
              reduceOnly: true,
              orderType: {
                trigger: {
                  isMarket: true,
                  triggerPx: tpsl.takeProfit.toFixed(decimals),
                  tpsl: 'tp'
                }
              }
            })
          }
        }
        const placeOrderRes = await placeOrder(agentWallet, chain?.testnet || false, hyperliquidAxios, {
          orders: orders,
          grouping: tpsl?.isTpsl ? 'normalTpsl' : 'na',
          builder: {
            address: BUILDER_ADDRESS,
            fee: currentFeeApproval
          }
        })
        console.log(placeOrderRes)
      }}
    >
      {isBuy ? 'Buy' : 'Sell'}
    </button>
  )
}
export default OrderButton
