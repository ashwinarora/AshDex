"use client";
import React from "react";
import Image, { StaticImageData } from "next/image";
import { Loader2 } from "lucide-react";

interface WalletDisplayProps {
  name: string;
  icon: StaticImageData | string;
  onBack: () => void;
}

const WalletDisplay: React.FC<WalletDisplayProps> = ({
  name,
  icon,
  onBack,
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center items-center bg-[#0F0816]  rounded-2xl shadow-lg">
      <div className="w-full border border-[#33293B] items-center justify-center bg-[#1c1624] hover:bg-[#36303b] rounded-xl cursor-pointer">
        <div className="py-6 flex flex-col items-center justify-center">
          <Image src={icon} alt={name} width={80} height={80} />
          <p className="text-[#E8E0F1] font-medium mt-4 text-lg font-medium">
            {name} Wallet
          </p>
        </div>
        <div className="flex py-4 justify-center items-center border-t border-[#33293B] gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#E8E0F1]" />
          <p className="text-[#E8E0F1] text-sm">Waiting for connection...</p>
        </div>
      </div>
      <button
        onClick={onBack}
        className="w-full px-5 mt-2 text-sm font-bold py-3 text-white bg-[#1c1624] hover:bg-[#36303b] rounded-xl cursor-pointer text-center"
      >
        Choose another Wallet
      </button>
    </div>
  );
};

export default WalletDisplay;
