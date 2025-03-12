
import { cn } from "../../utils/utils";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export const Button: React.FC<ButtonProps> = ({ variant = "primary", className, ...props }) => {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded text-white font-medium transition",
        variant === "primary" ? "bg-blue-600 hover:bg-blue-500" : "bg-gray-700 hover:bg-gray-600",
        className
      )}
      {...props}
    />
  );
};
