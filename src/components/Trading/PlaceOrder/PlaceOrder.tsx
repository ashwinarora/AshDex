"use client";
import { useState } from "react";
import LimitOrder from "./LimitOrder";

/** Define the possible tab options */
type OrderTab = "LIMIT" | "MARKET" | "STOP_LIMIT";

interface IPlaceOrderProps {
  selectedAsset: string;
}

const PlaceOrder = ({ selectedAsset }: IPlaceOrderProps) => {
  const [activeTab, setActiveTab] = useState<OrderTab>("LIMIT");

  const renderTabContent = () => {
    switch (activeTab) {
      case "LIMIT":
        return <LimitOrder selectedAsset={selectedAsset} />;
      case "MARKET":
        return <MarketComponent />;
      case "STOP_LIMIT":
        return <StopLimitComponent />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full text-white p-2 bg-opacity-30 backdrop-blur-md rounded-xl">
      <div className="flex items-center justify-evenly space-x-2 p-2 rounded-xl">
        <button
          onClick={() => setActiveTab("LIMIT")}
          className={`w-full  py-2 rounded-full transition-colors duration-200 ${
            activeTab === "LIMIT"
              ? "bg-[#FFFFFF0F] text-white"
              : " text-[#8B8BA0]"
          }`}
        >
          Limit
        </button>

        <button
          onClick={() => setActiveTab("MARKET")}
          className={`w-full  py-2 rounded transition-colors duration-200 ${
            activeTab === "MARKET"
              ? "bg-blue-600 text-white"
              : " text-[#8B8BA0]"
          }`}
        >
          Market
        </button>

        <button
          onClick={() => setActiveTab("STOP_LIMIT")}
          className={`w-full  py-2 rounded inline-flex items-center justify-center gap-x-2 transition-colors duration-200 ${
            activeTab === "STOP_LIMIT"
              ? "bg-blue-600 text-white"
              : " text-[#8B8BA0]"
          }`}
        >
          Advanced
        </button>
      </div>

      <div className="">{renderTabContent()}</div>
    </div>
  );
};

const MarketComponent: React.FC = () => (
  <div className="p-4 border border-gray-700 rounded-md bg-gray-800">
    <h2 className="font-semibold text-lg">Market Order</h2>
    <p className="text-gray-300">Content for Market order goes here.</p>
  </div>
);

const StopLimitComponent: React.FC = () => (
  <div className="p-4 border border-gray-700 rounded-md bg-gray-800">
    <h2 className="font-semibold text-lg">Stop Limit Order</h2>
    <p className="text-gray-300">Content for Stop Limit order goes here.</p>
  </div>
);

export default PlaceOrder;
