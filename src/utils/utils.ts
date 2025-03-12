import { bytesToHex, Hex, hexToBytes } from "viem";
import { MetaData } from "./hyperLiquidTypes";

export const toHumanNumber = (
  value?: bigint | null,
  decimals: number = 18,
  toFixed?: number
): string | null => {
  if (value === undefined || value === null) {
    return null;
  }
  const divisor = BigInt(10) ** BigInt(decimals);
  const num = value / divisor;
  const remainder = value % divisor;

  const numString =
    toFixed === undefined
      ? `${num}.${remainder.toString().padStart(decimals, "0")}`
      : `${num}.${remainder
        .toString()
        .padStart(decimals, "0")
        .slice(0, toFixed)}`;

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: toFixed ?? decimals,
  }).format(parseFloat(numString));
};


export const toRealNumber = (value: string, decimals: number = 18): bigint => {
  const [integerPart, fractionalPart = ""] = value.split(".");
  const paddedFraction = fractionalPart.padEnd(decimals, "0");
  return (
    BigInt(integerPart) * BigInt(10) ** BigInt(decimals) +
    BigInt(paddedFraction)
  );
};

export const truncateAddress = (address: string): string => {
  if (!address || address.length < 10) {
    return address;
  }
  const firstPart = address.slice(0, 6);
  const lastPart = address.slice(-4);
  return `${firstPart}...${lastPart}`;
};

export function splitSignature(signature: Hex) {
  const signatureBytes = hexToBytes(signature);

  if (signatureBytes.length !== 65) {
    throw new Error('Invalid signature length: must be 65 bytes.');
  }

  const rBytes = signatureBytes.slice(0, 32);
  const sBytes = signatureBytes.slice(32, 64);
  const v = signatureBytes[64];

  const r = bytesToHex(rBytes);
  const s = bytesToHex(sBytes);

  return { r, s, v };
}

export function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}
export const getUniverseIndex = (universe: MetaData[], asset: string): number => {
  return universe.findIndex((item) => item.name === asset);
};
