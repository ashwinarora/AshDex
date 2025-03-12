"use client"
import { cn } from "@/utils/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return <div className={cn("p-4 rounded-lg bg-gray-800 shadow-lg", className)}>{children}</div>;
};
