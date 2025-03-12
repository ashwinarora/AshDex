import { InputHTMLAttributes } from "react";
import { cn } from "../../utils/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
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
