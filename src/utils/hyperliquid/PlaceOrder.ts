'use client'
import { encode } from '@msgpack/msgpack'
import { AxiosInstance } from 'axios'
import { Hex, keccak256, PrivateKeyAccount, toBytes } from 'viem'
import { splitSignature } from '../utils'

type orderData = {
  orders: OrderData[]
  grouping: 'na' | 'normalTpsl' | 'positionTpsl'
  builder?: {
    address: string
    fee: number
  }
}

export type OrderData = {
  assetIndex: number
  isBuy: boolean
  price: string
  size: string
  reduceOnly: boolean
  orderType: LimitOrder | TriggerOrder
  cloid?: string
}

type LimitOrder = {
  limit: {
    tif: 'Alo' | 'Ioc' | 'Gtc'
  }
}

type TriggerOrder = {
  trigger: {
    isMarket: boolean,
    triggerPx: string,
    tpsl: "tp" | "sl"
  }
}

const phantomDomain = {
  name: 'Exchange',
  version: '1',
  chainId: 1337,
  verifyingContract: '0x0000000000000000000000000000000000000000'
} as const

const agentTypes = {
  Agent: [
    { name: 'source', type: 'string' },
    { name: 'connectionId', type: 'bytes32' }
  ]
} as const

export const placeOrder = async (
  agentWallet: PrivateKeyAccount,
  isTestnet: boolean,
  hyperliquidAxios: AxiosInstance,
  orderData: orderData
) => {
  const action = getAction(orderData)
  const nonce = Date.now()
  const hash = actionHash(action, null, nonce) as Hex
  const sign = await agentWallet.signTypedData({
    domain: phantomDomain,
    types: agentTypes,
    primaryType: 'Agent',
    message: {
      source: isTestnet ? 'b' : 'a',
      connectionId: hash
    }
  })
  const splitSig = splitSignature(sign)
  const res = await hyperliquidAxios.post('/exchange', {
    action,
    nonce,
    signature: splitSig,
    isFrontend: true
  })
  return res
}

const getAction = (orderData: orderData) => {
  return {
    type: 'order',
    orders: orderData.orders.map((order) => {
      return {
        a: order.assetIndex,
        b: order.isBuy,
        p: order.price,
        s: order.size,
        r: order.reduceOnly,
        t: order.orderType,
        ...(order.cloid !== undefined && { c: order.cloid })
      }
    }),
    grouping: orderData.grouping,
    ...(orderData.builder !== undefined && {
      builder: { b: orderData.builder.address, f: orderData.builder.fee }
    }),
  }
}

const actionHash = (action: unknown, vaultAddress: string | null, nonce: number): string => {
  const msgPackBytes = encode(action)
  const additionalBytesLength = vaultAddress === null ? 9 : 29
  const data = new Uint8Array(msgPackBytes.length + additionalBytesLength)
  data.set(msgPackBytes)
  const view = new DataView(data.buffer)
  view.setBigUint64(msgPackBytes.length, BigInt(nonce), false)
  if (vaultAddress === null) {
    view.setUint8(msgPackBytes.length + 8, 0)
  } else {
    view.setUint8(msgPackBytes.length + 8, 1)
    data.set(toBytes(vaultAddress), msgPackBytes.length + 9)
  }
  return keccak256(data)
}
