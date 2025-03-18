"use client"
import { useHyperLiquid } from "@/context/HyperLiquid";
import { getUniverseIndex } from "@/utils/utils";
import { useMemo } from "react";

interface LeverageMarginProps {
  selectedAsset: string;
  leverage: number;
  setLeverage: React.Dispatch<React.SetStateAction<number>>;
  isCross: boolean;
  setIsCross: React.Dispatch<React.SetStateAction<boolean>>;
}

const LeverageMargin = ({selectedAsset, leverage, setLeverage, isCross, setIsCross}: LeverageMarginProps) => {
  const { universe } = useHyperLiquid();

  const maxLeverage = useMemo(() => {
    if (!universe) return 1;
    const assetIndex = getUniverseIndex(universe, selectedAsset);
    return universe?.[assetIndex]?.maxLeverage || 1;
  }, [universe, selectedAsset])

  return (
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
  )
}

export default LeverageMargin