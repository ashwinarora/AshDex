"use client"
import { InputHTMLAttributes } from "react";
import { cn } from "@/utils/utils";

export const Input: React.FC<InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => {
  return (
    <input
      className={cn(
        "w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none",
        className
      )}
      {...props}
    />
  );
};
