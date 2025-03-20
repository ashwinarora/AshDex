'use client'
import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAccount, useConnect, useSignTypedData } from 'wagmi'
import { IExtraAgent } from '@/utils/hyperLiquidTypes'
import { getApproveAgentPayload } from '@/utils/hyperliquid/ApproveAgent'
import { AGENT_NAME, BUILDER_ADDRESS } from '@/utils/constants'
import { getUniverseIndex, splitSignature } from '@/utils/utils'
import { getApproveBuilderFeePayload } from '@/utils/hyperliquid/ApproveBuilderFee'
import { placeOrder } from '@/utils/hyperliquid/PlaceOrder'
import { useHyperLiquid } from '@/context/HyperLiquid'
import Slider1 from '@/assets/images/slider_value.svg'
// import BitCoin from '@/assets/images/bitcoin-btc-logo.svg'
import Image from 'next/image'
import CheckBox from '@/components/common/CheckBox'

interface LimitOrderProps {
  selectedAsset: string
}

const LimitOrder: React.FC<LimitOrderProps> = ({ selectedAsset }: LimitOrderProps) => {
  const { agentWallet, hyperliquidAxios, universe } = useHyperLiquid()
  const { connect, connectors } = useConnect()
  const { signTypedDataAsync } = useSignTypedData()
  const { address, isConnected: isWalletConnected, chainId, chain } = useAccount()
  const [isBuy, setIsBuy] = useState<boolean>(true)
  const [limitPrice, setLimitPrice] = useState<number>(0)
  const [amount, setAmount] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)
  const [leverage, setLeverage] = useState(50)
  const [takeShowInputs, setTakeShowInputs] = useState(false)
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

  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLimitPrice = parseFloat(e.target.value) || 0
    setLimitPrice(newLimitPrice)
    setTotal(newLimitPrice * amount)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = parseFloat(e.target.value) || 0
    setAmount(newAmount)
    setTotal(limitPrice * newAmount)
  }

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTotal = parseFloat(e.target.value) || 0
    setTotal(newTotal)
    setAmount(limitPrice > 0 ? newTotal / limitPrice : 0)
  }

  const buildButton = () => {
    if (!isWalletConnected) {
      return (
        <button
          type="button"
          className={
            'py-2 rounded-2xl w-full mt-4 bg-[#5F46F9] hover:bg-purple-600 text-white cursor-pointer'
          }
          onClick={() => {
            connect({ connector: connectors[0] })
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
            'py-2 rounded-2xl w-full mt-4 bg-[#5F46F9] hover:bg-purple-600 text-white cursor-pointer'
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
            'py-2 rounded-2xl w-full mt-4 bg-[#5F46F9] hover:bg-purple-600 text-white cursor-pointer'
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
          'py-2 rounded-2xl w-full mt-4 bg-[#5F46F9] hover:bg-purple-600 text-white cursor-pointer'
        }
        onClick={() => {
          if (!agentWallet) return
          if (!universe) return
          if (!currentFeeApproval) return
          placeOrder(agentWallet, chain?.testnet || false, hyperliquidAxios, {
            type: 'limit',
            assetIndex: getUniverseIndex(universe, selectedAsset),
            isBuy: isBuy,
            price: limitPrice,
            size: amount,
            reduceOnly: false,
            tif: 'Gtc',
            grouping: 'na',
            builder: {
              address: BUILDER_ADDRESS,
              fee: currentFeeApproval
            }
          })
        }}
      >
        {isBuy ? 'Buy' : 'Sell'}
      </button>
    )
  }

  return (
    <div className="w-full py-4 text-white rounded-lg">
      <div className="flex border-b border-t border-[#FFFFFF0F] mb-4 px-4">
        <button
          className={`flex-1 text-center py-2 font-medium transition-colors ${
            isBuy ? 'text-white border-b-4 border-[#5F46F9]' : 'text-gray-300'
          }`}
          onClick={() => setIsBuy(true)}
        >
          BUY
        </button>
        <button
          className={`flex-1 text-center py-2 font-medium transition-colors ${
            !isBuy ? 'text-white border-b-4 border-[#5F46F9]' : 'text-gray-300 '
          }`}
          onClick={() => setIsBuy(false)}
        >
          SELL
        </button>
      </div>

      <div className="space-y-4">
        <div className="px-4 border-b border-[#FFFFFF0F]">
          <label className="block text-sm font-medium text-gray-300 mb-1">Limit price</label>
          <div className="relative">
            <input
              type="text"
              placeholder="0.0000"
              value={limitPrice}
              onChange={handleLimitPriceChange}
              className="w-full rounded-md p-2 focus:outline-none focus:none focus:none text-xl font-medium"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-sm font-medium">
              USD
            </span>
          </div>
        </div>

        <div className="px-4 border-b border-[#FFFFFF0F] pb-3">
          <label className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
          <div className="relative">
            <input
              type="text"
              placeholder="0.0000"
              value={amount}
              onChange={handleAmountChange}
              className="w-full rounded-md p-2 focus:outline-none focus:none focus:none text-xl font-medium"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 text-sm">
              <div className="flex w-auto items-center gap-1 text-sm">
                <select className="w-full py-2 px-2 rounded text-[#8B8BA0] border-2 border-[#FFFFFF0F] focus:outline-none focus:none focus:none">
                  <option value="BTC">BTC</option>
                  <option value="USDT"> USDT</option>
                </select>
              </div>
            </span>
          </div>
        </div>

        <div className="flex w-full px-4 border-b border-[#FFFFFF0F] pb-3">
          <div className="w-5/6">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={total}
              onChange={handleTotalChange}
              className="w-full cursor-pointer appearance-none"
              style={{
                background:
                  'linear-gradient(to right, #702DF5 0%, #702DF5 ' +
                  total +
                  '%, #2A1B3D ' +
                  total +
                  '%, #2A1B3D 100%)',
                height: '8px',
                borderRadius: '10px',
                outline: 'none',
                WebkitAppearance: 'none'
              }}
            />
            <Image src={Slider1} alt="" width={20} height={20} className="w-full mt-1" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
          <div className="relative pl-4">
            <input
              type="string"
              className="w-20 h-11 rounded-md border border-white/10 bg-white/10 outline-none px-4 py-2 flex justify-between"
              value={total}
              onChange={handleTotalChange}
            />
            <span className="absolute right-2 top-2.5 text-gray-500">%</span>
          </div>
        </div>

        <div className="my-4 px-4">
          <label className="block text-sm font-medium text-gray-400">Leverage</label>
          <div className="flex justify-between items-center">
            <div className="w-4/6">
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value, 10))}
                className="w-full cursor-pointer appearance-none"
                style={{
                  background:
                    'linear-gradient(to right, #702DF5 0%, #702DF5 ' +
                    leverage +
                    '%, #2A1B3D ' +
                    leverage +
                    '%, #2A1B3D 100%)',
                  height: '8px',
                  borderRadius: '10px',
                  outline: 'none',
                  WebkitAppearance: 'none'
                }}
              />
              <Image src={Slider1} alt="" width={20} height={20} className="w-full mt-1" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="flex items-center pl-4 space-x-3">
              <button
                onClick={() => setLeverage((prev) => Math.max(prev - 1, 1))}
                className="w-8 h-[58px] rounded-lg border border-white/10 bg-white/10 p-2 flex items-center justify-center text-white"
              >
                -
              </button>
              <span className="text-xl font-medium">{leverage}x</span>
              <button
                onClick={() => setLeverage((prev) => Math.max(prev - 1, 1))}
                className="w-8 h-[58px] rounded-lg border border-white/10 bg-white/10 p-2 flex items-center justify-center text-white"
              >
                +
              </button>
            </div>
          </div>
        </div>
        <div className="px-4 border-b border-[#FFFFFF0F]">
          <div className="flex w-full justify-between items-center mb-4 px-4 border border-white/10 bg-white/10 rounded-md  py-2">
            <p className="text-[#8B8BA0]">Margin Mode</p>
            <select className="bg-transparent text-white outline-none">
              <option value="STOP_LIMIT">Cross</option>
              <option value="LIMIT">Limit</option>
              <option value="MARKET">Market</option>
            </select>
          </div>
        </div>

        {takeShowInputs ? (
          <div className="gap-3 text-sm text-gray-400 border-b border-[#FFFFFF0F] pb-3 px-4">
            <CheckBox
              label="Take Profit / Stop Loss"
              onChange={(checked) => setTakeShowInputs(checked)}
            />
            <div className="mt-3 gap-3 px-4">
              <div>
                <input
                  type="number"
                  className="w-full mt-1 p-2 bg-[#0F081680] border border-[#FFFFFF0F] rounded text-white outline-none"
                  placeholder="Take Profit"
                />
                <div className="flex justify-between mt-2 text-gray-400 text-sm font-medium">
                  <label>Potential Return</label>
                  <p>-</p>
                </div>
              </div>
              <div>
                <input
                  type="number"
                  className="w-full mt-1 p-2 bg-[#0F081680] border border-[#FFFFFF0F] rounded text-white outline-none"
                  placeholder="Take Profit"
                />
                <div className="flex justify-between mt-2 text-gray-400 text-sm font-medium">
                  <label>Potential Return</label>
                  <p>-</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 mt-3">
              <CheckBox label="Post-Only" />
              <CheckBox label="Reduce Only" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-400 border-b border-[#FFFFFF0F] pb-3 px-4">
            <CheckBox
              label="Take Profit / Stop Loss"
              onChange={(checked) => setTakeShowInputs(checked)}
            />
            <CheckBox label="Post-Only" />
            <CheckBox label="Reduce Only" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 text-sm px-4 text-gray-400 border-b border-[#FFFFFF0F] py-3">
          <CheckBox label="TWAP" />
          <CheckBox label="Scale" />
        </div>

        <div className="px-4">
          <div className="text-sm text-gray-400 flex justify-between mt-4 ">
            <span>Available</span> <span className="text-white font-medium">-- USD</span>
          </div>
          <div className="text-sm text-gray-400 flex justify-between">
            <span>Max Buy</span> <span className="text-white font-medium">1.38474 BTC</span>
          </div>
        </div>
        <div className="px-4">{buildButton()}</div>
      </div>
    </div>
  )
}

export default LimitOrder
