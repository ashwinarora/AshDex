"use client"

import { useHyperLiquid } from "@/context/HyperLiquid";
import { getCoinName } from "@/utils/utils";
import { useState } from "react";

interface AmountInputProps {
  selectedAsset: string;
  amount: number;
  setAmount: React.Dispatch<React.SetStateAction<number>>;
  total: number;
  setTotal: React.Dispatch<React.SetStateAction<number>>;
  limitPrice: number;
}

const AmountInput = ({ selectedAsset, amount, setAmount, total, setTotal, limitPrice }: AmountInputProps) => {
  const { clearingHouseState } = useHyperLiquid();
  const [usdPercent, setUsdPercent] = useState(0);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!clearingHouseState) return;
    const newAmount = parseFloat(e.target.value) || 0;
    setAmount(newAmount);
    setTotal(limitPrice * newAmount);
    setUsdPercent((newAmount * limitPrice) / clearingHouseState?.withdrawable * 100);
  };

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!clearingHouseState) return;
    const newTotal = parseFloat(e.target.value) || 0;
    setTotal(newTotal);
    setAmount(limitPrice > 0 ? newTotal / limitPrice : 0);
    setUsdPercent((newTotal / clearingHouseState?.withdrawable) * 100);
  };

  const handleUsdPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!clearingHouseState) return;
    const newUsdPercent = parseFloat(e.target.value) || 0;
    setUsdPercent(newUsdPercent);
    setAmount((newUsdPercent * clearingHouseState?.withdrawable) / 100 / limitPrice);
    setTotal((newUsdPercent * clearingHouseState?.withdrawable) / 100);
  };

  return (
    <>
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
            {getCoinName(selectedAsset)}
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
          <span className="text-gray-300">Balance = {clearingHouseState?.withdrawable.toFixed(2)}</span>
          <span className="text-gray-300">Minimum 10 USDT</span>
          <span>
            <input
              type="text"
              value={usdPercent}
              onChange={handleUsdPercentChange}
              className="w-12 text-center border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-500"
            />{" "}
            {" %"}
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
    </>
  );
};

export default AmountInput