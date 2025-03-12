import { HYPERLIQUID_API_MAINNET, HYPERLIQUID_API_TESTNET } from "@/utils/constants";
import axios from "axios";

export const testnetAxios = axios.create({
  baseURL: HYPERLIQUID_API_TESTNET,
  headers: {
    "Content-Type": "application/json",
  },
})

export const mainnetAxios = axios.create({
  baseURL: HYPERLIQUID_API_MAINNET,
  headers: {
    "Content-Type": "application/json",
  },
})