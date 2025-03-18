"use client"
import React, { useState } from 'react';
import BuyOrSell from './components/BuyOrSell';
import AmountInput from './components/AmountInput';
import LeverageMargin from './components/LeverageMargin';
import OrderButton from './components/OrderButton';

interface LimitOrderProps {
  selectedAsset: string;
}

const LimitOrder: React.FC<LimitOrderProps> = ({ selectedAsset }: LimitOrderProps) => {
  const [isBuy, setIsBuy] = useState<boolean>(true);
  const [limitPrice, setLimitPrice] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [isCross, setIsCross] = useState<boolean>(true);
  const [leverage, setLeverage] = useState<number>(1);

  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLimitPrice = parseFloat(e.target.value) || 0;
    setLimitPrice(newLimitPrice);
    setTotal(newLimitPrice * amount);
  };

  return (
    <div className="w-full h-auto p-4">
      <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} />

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
        <AmountInput
          selectedAsset={selectedAsset}
          amount={amount}
          setAmount={setAmount}
          total={total}
          setTotal={setTotal}
          limitPrice={limitPrice}
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

        <OrderButton
          isBuy={isBuy}
          selectedAsset={selectedAsset}
          limitPrice={limitPrice}
          amount={amount}
          leverage={leverage}
          isCross={isCross}
        />
      </div>
    </div>
  );
};

export default LimitOrder;
