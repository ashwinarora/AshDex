"use client"
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount, useConnect, useSignTypedData } from 'wagmi';
import { IExtraAgent } from '@/utils/hyperLiquidTypes';
import { getApproveAgentPayload } from '@/utils/hyperliquid/ApproveAgent';
import { AGENT_NAME, BUILDER_ADDRESS } from '@/utils/constants';
import { getUniverseIndex, splitSignature } from '@/utils/utils';
import { getApproveBuilderFeePayload } from '@/utils/hyperliquid/ApproveBuilderFee';
import { placeOrder } from '@/utils/hyperliquid/PlaceOrder';
import { useHyperLiquid } from '@/context/HyperLiquid';

interface LimitOrderProps {
  selectedAsset: string;
}

const LimitOrder: React.FC<LimitOrderProps> = ({ selectedAsset }: LimitOrderProps) => {
  const { agentWallet, hyperliquidAxios, universe, clearingHouseState, sdk } = useHyperLiquid();
  const { connect, connectors } = useConnect();
  const { signTypedDataAsync } = useSignTypedData();
  const { address, isConnected: isWalletConnected, chainId, chain } = useAccount();
  const [isBuy, setIsBuy] = useState<boolean>(true);
  const [limitPrice, setLimitPrice] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [usdPercent, setUsdPercent] = useState<number>(0);
  const [isCross, setIsCross] = useState<boolean>(true);
  const [leverage, setLeverage] = useState<number>(1);
  
  const maxLeverage = useMemo(() => {
    if(!universe) return 1;
    const assetIndex = getUniverseIndex(universe, selectedAsset);
    return universe?.[assetIndex]?.maxLeverage || 1;
  }, [universe, selectedAsset])

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

  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLimitPrice = parseFloat(e.target.value) || 0;
    setLimitPrice(newLimitPrice);
    setTotal(newLimitPrice * amount);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!clearingHouseState) return;
    const newAmount = parseFloat(e.target.value) || 0;
    setAmount(newAmount);
    setTotal(limitPrice * newAmount);
    setUsdPercent(newAmount * limitPrice / clearingHouseState?.withdrawable * 100);
  };

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!clearingHouseState) return;
    const newTotal = parseFloat(e.target.value) || 0;
    setTotal(newTotal);
    setAmount(limitPrice > 0 ? newTotal / limitPrice : 0);
    setUsdPercent(newTotal / clearingHouseState?.withdrawable * 100);
  };

  const handleUsdPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!clearingHouseState) return;
    const newUsdPercent = parseFloat(e.target.value) || 0;
    setUsdPercent(newUsdPercent);
    setAmount(newUsdPercent * clearingHouseState?.withdrawable / 100 / limitPrice);
    setTotal(newUsdPercent * clearingHouseState?.withdrawable / 100);
  }

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
    if (currentFeeApproval === 0) {
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
        onClick={async () => {
          if (!agentWallet) return;
          if (!universe) return;
          if (!currentFeeApproval) return;
          const res = await sdk.exchange.updateLeverage(selectedAsset, isCross? "cross" : "isolated", leverage);
          console.log(res);
          await placeOrder(agentWallet, chain?.testnet || false, hyperliquidAxios, {
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
              USD
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
              USD
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-300">Balance = {clearingHouseState?.withdrawable}</span>
            <span className="text-gray-300">Minimum 10 USDT</span>
            <span>
              <input
                type="text"
                value={usdPercent}
                onChange={handleUsdPercentChange}
                className="w-12 text-center border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-500"
              /> {" %"}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            defaultValue={0}
            className="w-full cursor-pointer"
            value={usdPercent}
            onChange={handleUsdPercentChange}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-300">Max Leverage = {maxLeverage}x</span>
            <span>
              <input
                type="text"
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="w-12 text-center border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-500"
              />{" x"}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={maxLeverage}
            step={1}
            defaultValue={0}
            className="w-full cursor-pointer"
            value={leverage}
            onChange={(e) => setLeverage(parseInt(e.target.value))}
          />
        </div>

        <div>
            <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Margin Type
            </label>
            <select
              value={isCross ? "cross" : "isolated"}
              onChange={(e) => setIsCross(e.target.value === "cross")}
              className="w-full border border-gray-700 bg-gray-800 text-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="cross" className="bg-gray-800 text-gray-300">Cross</option>
              <option value="isolated" className="bg-gray-800 text-gray-300">Isolated</option>
            </select>
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

        {buildButton()}
      </div>
    </div>
  );
};

export default LimitOrder;
