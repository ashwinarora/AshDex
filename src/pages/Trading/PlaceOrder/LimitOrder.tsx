"use client"
import React, { useMemo, useState } from 'react';
import { useHyperLiquid } from '@/context/HyperLiquid';
import { useQuery } from '@tanstack/react-query';
import { useAccount, useConnect, useSignTypedData } from 'wagmi';
import { IExtraAgent } from '@/utils/hyperLiquidTypes';
import { getApproveAgentPayload } from '@/utils/hyperliquid/ApproveAgent';
import { AGENT_NAME, BUILDER_ADDRESS } from '@/utils/constants';
import { getUniverseIndex, splitSignature } from '@/utils/utils';
import { getApproveBuilderFeePayload } from '@/utils/hyperliquid/ApproveBuilderFee';
import { placeOrder } from '@/utils/hyperliquid/PlaceOrder';

interface LimitOrderProps { 
  selectedAsset: string;
}

const LimitOrder: React.FC<LimitOrderProps> = ({selectedAsset} : LimitOrderProps) => {
  const { agentWallet, hyperliquidAxios, universe } = useHyperLiquid();
  const { connect, connectors } = useConnect();
  const { signTypedDataAsync } = useSignTypedData();
  const { address, isConnected: isWalletConnected, chainId, chain } = useAccount();
  const [isBuy, setIsBuy] = useState<boolean>(true);
  const [limitPrice, setLimitPrice] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const { data: extraAgents, refetch: refetchExtraAgents } = useQuery({
    queryKey: ['extraAgents'],
    queryFn: async () => {
      const response = await hyperliquidAxios.post('/info', {
        type: "extraAgents",
        user: address
      });
      return response.data as IExtraAgent[];
    },
    enabled: isWalletConnected && !!hyperliquidAxios
  })

  const isAgentApproved = useMemo(() => {
    if (!extraAgents) return false;
    return extraAgents.some(agent => agent.address.toLowerCase() === agentWallet?.address.toLowerCase())
  }, [extraAgents, agentWallet])

  const { data: currentFeeApproval, refetch: refetchCurrentFeeApproval } = useQuery({
    queryKey: ['maxBuilderFee', address, BUILDER_ADDRESS],
    queryFn: async () => {
      const response = await hyperliquidAxios.post('/info', {
        type: "maxBuilderFee",
        user: address,
        builder: BUILDER_ADDRESS
      })
      return response.data as number;
    },
    enabled: isWalletConnected && !!hyperliquidAxios && !!agentWallet && isAgentApproved
  })

  // useEffect(() => {
  //   console.log('Current Fee Approval:', currentFeeApproval);
  //   console.log("AgentWallet", agentWallet?.address)
  // }, [currentFeeApproval]);

  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLimitPrice = parseFloat(e.target.value) || 0;
    setLimitPrice(newLimitPrice);
    setTotal(newLimitPrice * amount);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = parseFloat(e.target.value) || 0;
    setAmount(newAmount);
    setTotal(limitPrice * newAmount);
  };

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTotal = parseFloat(e.target.value) || 0;
    setTotal(newTotal);
    setAmount(limitPrice > 0 ? newTotal / limitPrice : 0);
  };

  const buildButton = () => {
    if (!isWalletConnected) {
      return (
        <button
          type="button"
          className="tradeButton"
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
          className="tradeButton"
          onClick={async () => {
            if (!chainId) return;
            try {
              const payload = getApproveAgentPayload({
                agentAddress: agentWallet?.address || '',
                agentName: AGENT_NAME,
                chainId: chainId,
                isTestnet: chain?.testnet || false,
                nonce: Date.now()
              });
              console.log(payload);
              const sign = await signTypedDataAsync(payload);
              console.log("sigining");
              const body = {
                action: {
                  type: payload.message.type,
                  agentAddress: payload.message.agentAddress,
                  agentName: payload.message.agentName,
                  nonce: payload.message.nonce,
                  signatureChainId: payload.message.signatureChainId,
                  hyperliquidChain: payload.message.hyperliquidChain,
                },
                nonce: payload.message.nonce,
                signature: splitSignature(sign),
              };
              const res = await hyperliquidAxios.post("/exchange", body);
              console.log(res);
              await refetchExtraAgents();
            } catch (error) {
              console.error("Error approving agent:", error);
            }
          }}
        >
          Approve Agent
        </button>
      )
    }
    if(currentFeeApproval === 0 ) {
      return (
        <button
          type="button"
          className="tradeButton"
          onClick={async () => {
            if (!chainId) return;
            try {
              const payload = getApproveBuilderFeePayload({
                chainId: chainId,
                isTestnet: chain?.testnet || false,
                builder: BUILDER_ADDRESS,
                nonce: Date.now(),
                feePercentage: "0.1%"
              });
              console.log(payload);
              const sign = await signTypedDataAsync(payload);
              console.log("sigining");
              const body = {
                action: {
                  type: payload.message.type,
                  builder: payload.message.builder,
                  maxFeeRate: payload.message.maxFeeRate,
                  nonce: payload.message.nonce,
                  signatureChainId: payload.message.signatureChainId,
                  hyperliquidChain: payload.message.hyperliquidChain,
                },
                nonce: payload.message.nonce,
                signature: splitSignature(sign),
              };
              const res = await hyperliquidAxios.post("/exchange", body);
              console.log(res);
              await refetchCurrentFeeApproval();
            } catch (error) {
              console.error("Error approving agent:", error);
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
        className="tradeButton"
        onClick={() => {
          if(!agentWallet) return;
          if(!universe) return;
          if(!currentFeeApproval) return;
          placeOrder(agentWallet, chain?.testnet || false, hyperliquidAxios,  {
            type: "limit",
            assetIndex: getUniverseIndex(universe, selectedAsset),
            isBuy: isBuy,
            price: limitPrice,
            size: amount,
            reduceOnly: false,
            tif: "Gtc",
            grouping: "na",
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
    <div className="w-full h-auto p-4">
      <div className="flex border-b border-gray-300 mb-4">
        <button
          className={`flex-1 text-center py-2 font-medium transition-colors ${isBuy
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-300 hover:text-blue-500'
            }`}
          onClick={() => setIsBuy(true)}
        >
          BUY
        </button>
        <button
          className={`flex-1 text-center py-2 font-medium transition-colors ${!isBuy
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-300 hover:text-blue-500'
            }`}
          onClick={() => setIsBuy(false)}
        >
          SELL
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Limit price
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="0.0000"
              value={limitPrice}
              onChange={handleLimitPriceChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 text-sm">
              USDT
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Amount
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="0.0000"
              value={amount}
              onChange={handleAmountChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 text-sm">
              BTC
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            TOTAL
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="0.0000"
              value={total}
              onChange={handleTotalChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 text-sm">
              USDT
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-300">Minimum 5 USDT</span>
            <span className="text-gray-500">0 %</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            defaultValue={0}
            className="w-full cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center text-sm text-gray-300">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-500"
            />
            <span className="ml-2">Post-Only</span>
          </label>
          <label className="inline-flex items-center text-sm text-gray-300">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-500"
            />
            <span className="ml-2">Reduce Only</span>
          </label>
          <label className="inline-flex items-center text-sm text-gray-300">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-500"
            />
            <span className="ml-2">Set TP for all</span>
          </label>
        </div>

        <div className="text-sm text-gray-300 space-y-1">
          <div>Available --- USDT</div>
          <div>Max. Buy --- BTC</div>
          <div>Fee --- USDT</div>
        </div>

        {buildButton()}
      </div>
    </div>
  );
};

export default LimitOrder;
