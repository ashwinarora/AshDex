"use client";
import React from "react";
import { WALLET_RULES } from "@/utils/constants";

interface WalletRulesProps {
  onClose: () => void;
  onAgree: () => void;
}

const WalletRules: React.FC<WalletRulesProps> = ({ onAgree, onClose }) => {
  return (
    <div className="mt-2 max-w-md w-full rounded-2xl">
      {/* Scrollable Content */}
      <div className="max-h-60 overflow-y-auto text-sm text-[#E8E0F1] space-y-4 pr-2">
        {WALLET_RULES?.split("\n").map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>

      <div className="mt-6 flex flex-col space-y-3">
        <button
          className={
            "w-full py-3 text-sm rounded-xl text-white font-bold bg-[#5F46F9] cursor-pointer"
          }
          onClick={onAgree}
        >
          I agree to the Rules
        </button>
        <button
          className="w-full py-2 font-medium rounded-xl bg-[#0F0816] hover:bg-[#36303B] text-[#8B8BA0] cursor-pointer"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default WalletRules;
