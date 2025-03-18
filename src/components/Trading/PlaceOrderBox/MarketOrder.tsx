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
      />
      <LeverageMargin
        selectedAsset={selectedAsset}
        leverage={leverage}
        setLeverage={setLeverage}
        isCross={isCross}
        setIsCross={setIsCross}
      />
      <OrderButton
        isBuy={isBuy}
        selectedAsset={selectedAsset}
        limitPrice={allMids[selectedAsset]}
        amount={amount}
        leverage={leverage}
        isCross={isCross}
      />
    </div>
  )
}

export default MarketOrder