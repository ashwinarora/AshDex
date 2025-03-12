"use client"
import { encode } from "@msgpack/msgpack";
import { AxiosInstance } from "axios";
import { Hex, keccak256, PrivateKeyAccount, toBytes } from "viem";
import { splitSignature } from "../utils";

type LimitOrder = {
  type: "limit",
  assetIndex: number,
  isBuy: boolean,
  price: number,
  size: number,
  reduceOnly: boolean,
  tif: "Alo" | "Ioc" | "Gtc",
  grouping: "na" | "normalTpsl" | "positionTpsl",
  cloid?: string
  builder?: {
    address: string,
    fee: number
  }
}

type orderData = LimitOrder

const phantomDomain = {
  name: "Exchange",
  version: "1",
  chainId: 1337,
  verifyingContract: "0x0000000000000000000000000000000000000000",
} as const;

const agentTypes = {
  Agent: [
    { name: 'source', type: 'string' },
    { name: 'connectionId', type: 'bytes32' },
  ],
} as const;

export const placeOrder = async (agentWallet: PrivateKeyAccount, isTestnet: boolean, hyperliquidAxios: AxiosInstance, orderData: orderData) => {
  // const action = { "type": "order", "orders": [{ "a": 0, "b": true, "p": "180", "s": "15", "r": false, "t": { "limit": { "tif": "Gtc" } }, "c": "0x1234567890abcdef1234567890abcdef" }], "grouping": "na" }
  const action = getAction(orderData);
  const nonce = Date.now();
  const hash = actionHash(action, null, nonce) as Hex;
  const sign = await agentWallet.signTypedData({
    domain: phantomDomain,
    types: agentTypes,
    primaryType: "Agent",
    message: {
      source: isTestnet ? "b" : "a",
      connectionId: hash,
    }
  });
  const splitSig = splitSignature(sign)
  const res = await hyperliquidAxios.post("/exchange", { action, nonce, signature: splitSig });
  console.log(res)
  return res;
}

const getAction = (orderData: orderData) => {
  return {
    type: "order",
    orders: [{
      a: orderData.assetIndex,
      b: orderData.isBuy,
      p: orderData.price.toString(),
      s: orderData.size.toString(),
      r: orderData.reduceOnly,
      t: {
        limit: {
          tif: orderData.tif
        }
      },
    }],
    grouping: orderData.grouping,
    ...(orderData.builder !== undefined && { builder: { b: orderData.builder.address, f: orderData.builder.fee } }),
    ...(orderData.cloid !== undefined && { cloid: orderData.cloid }),
  }
}

const actionHash = (action: unknown, vaultAddress: string | null, nonce: number): string => {
  const msgPackBytes = encode(action);
  const additionalBytesLength = vaultAddress === null ? 9 : 29;
  const data = new Uint8Array(msgPackBytes.length + additionalBytesLength);
  data.set(msgPackBytes);
  const view = new DataView(data.buffer);
  view.setBigUint64(msgPackBytes.length, BigInt(nonce), false);
  if (vaultAddress === null) {
    view.setUint8(msgPackBytes.length + 8, 0);
  } else {
    view.setUint8(msgPackBytes.length + 8, 1);
    data.set(toBytes(vaultAddress), msgPackBytes.length + 9);
  }
  return keccak256(data);
}

