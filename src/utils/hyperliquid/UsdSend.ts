import { SignTypedDataVariables } from 'wagmi/query'

export interface IUsdSendData {
  chainId: number
  isTestnet: boolean
  nonce: number
  destination: string
  amount: string
}

export const getUsdSendPayload = ({
  chainId,
  isTestnet,
  nonce,
  destination,
  amount
}: IUsdSendData): SignTypedDataVariables => {
  return {
    domain: {
      name: 'HyperliquidSignTransaction',
      version: '1',
      chainId: chainId,
      verifyingContract: '0x0000000000000000000000000000000000000000'
    },
    message: {
      type: 'usdSend',
      hyperliquidChain: isTestnet ? 'Testnet' : 'Mainnet',
      signatureChainId: '0x' + chainId.toString(16),
      destination: destination,
      amount: amount,
      time: nonce
    },
    primaryType: 'HyperliquidTransaction:UsdSend',
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
      'HyperliquidTransaction:UsdSend': [
        {
          name: 'hyperliquidChain',
          type: 'string'
        },
        {
          name: 'destination',
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
