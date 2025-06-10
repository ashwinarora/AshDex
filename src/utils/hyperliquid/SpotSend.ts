'use client'
import { SignTypedDataVariables } from 'wagmi/query'

export interface ISpotSendData {
  chainId: number
  isTestnet: boolean
  nonce: number
  destination: string
  amount: string
  tokenName: string
  tokenId: string
}

export const getSpotSendPayload = ({
  chainId,
  isTestnet,
  nonce,
  destination,
  amount,
  tokenName,
  tokenId
}: ISpotSendData): SignTypedDataVariables => {
  return {
    domain: {
      name: 'HyperliquidSignTransaction',
      version: '1',
      chainId: chainId,
      verifyingContract: '0x0000000000000000000000000000000000000000'
    },
    message: {
      type: 'spotSend',
      hyperliquidChain: isTestnet ? 'Testnet' : 'Mainnet',
      signatureChainId: '0x' + chainId.toString(16),
      destination: destination,
      amount: amount,
      time: nonce,
      token: tokenName + ':' + tokenId
    },
    primaryType: 'HyperliquidTransaction:SpotSend',
    types: {
      EIP712Domain: [
        {
          name: 'name',
          type: 'string'
        },
        {
          name: 'version',
          type: 'string'
        },
        {
          name: 'chainId',
          type: 'uint256'
        },
        {
          name: 'verifyingContract',
          type: 'address'
        }
      ],
      'HyperliquidTransaction:SpotSend': [
        {
          name: 'hyperliquidChain',
          type: 'string'
        },
        {
          name: 'destination',
          type: 'string'
        },
        {
          name: 'token',
          type: 'string'
        },
        {
          name: 'amount',
          type: 'string'
        },
        {
          name: 'time',
          type: 'uint64'
        }
      ]
    }
  }
}
