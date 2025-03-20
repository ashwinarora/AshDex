"use client"

import { useState } from "react";
import BuyOrSell from "./components/BuyOrSell";
import AmountInput from "./components/AmountInput";
import { useHyperLiquid } from "@/context/HyperLiquid";
import LeverageMargin from "./components/LeverageMargin";
import OrderButton from "./components/OrderButton";

interface MarketOrderProps {
  selectedAsset: string;
}

const MarketOrder = ({ selectedAsset }: MarketOrderProps) => {
  const { allMids } = useHyperLiquid();
  const [isBuy, setIsBuy] = useState<boolean>(true);
  const [amount, setAmount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [isCross, setIsCross] = useState<boolean>(true);
  const [leverage, setLeverage] = useState<number>(1);
  const [isPostOnly, setIsPostOnly] = useState<boolean>(false);
  const [isReduceOnly, setIsReduceOnly] = useState<boolean>(false);


  return (
    <div className="w-full h-auto p-4">
      <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />
      <AmountInput
        selectedAsset={selectedAsset}
        amount={amount}
        setAmount={setAmount}
        total={total}
        setTotal={setTotal}
        limitPrice={allMids[selectedAsset]}
        isReduceOnly={isReduceOnly}
        isBuy={isBuy}
      />
      <LeverageMargin
        selectedAsset={selectedAsset}
        leverage={leverage}
        setLeverage={setLeverage}
        isCross={isCross}
        setIsCross={setIsCross}
      />
      <div className="flex flex-wrap items-center gap-4">
        <label className="inline-flex items-center text-sm text-gray-300">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-blue-500"
            checked={isPostOnly}
            onChange={() => setIsPostOnly(!isPostOnly)}
          />
          <span className="ml-2">Post-Only</span>
        </label>
        <label className="inline-flex items-center text-sm text-gray-300">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-blue-500"
            checked={isReduceOnly}
            onChange={() => setIsReduceOnly(!isReduceOnly)}
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
      <OrderButton
        isBuy={isBuy}
        selectedAsset={selectedAsset}
        limitPrice={allMids[selectedAsset] * 1.1} // 10% higher than the current price
        amount={amount}
        leverage={leverage}
        isCross={isCross}
        isPostOnly={isPostOnly}
      />
    </div>
  )
}

export default MarketOrder