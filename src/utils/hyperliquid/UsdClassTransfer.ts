import { SignTypedDataVariables } from 'wagmi/query'

interface IUsdClassTransferPayload {
  chainId: number
  isTestnet: boolean
  nonce: number
  amount: string
  toPerp: boolean
}

export const getUsdClassTransferPayload = ({
  chainId,
  isTestnet,
  nonce,
  amount,
  toPerp
}: IUsdClassTransferPayload): SignTypedDataVariables => {
  return {
    domain: {
      name: 'HyperliquidSignTransaction',
      version: '1',
      chainId: chainId,
      verifyingContract: '0x0000000000000000000000000000000000000000'
    },
    message: {
      type: 'usdClassTransfer',
      signatureChainId: '0x' + chainId.toString(16),
      hyperliquidChain: isTestnet ? 'Testnet' : 'Mainnet',
      amount: amount,
      toPerp: toPerp,
      nonce: nonce
    },
    primaryType: 'HyperliquidTransaction:UsdClassTransfer',
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
      'HyperliquidTransaction:UsdClassTransfer': [
        {
          name: 'hyperliquidChain',
          type: 'string'
        },
        {
          name: 'amount',
          type: 'string'
        },
        {
          name: "toPerp",
          type: "bool"
        },
        {
          name: 'nonce',
          type: 'uint64'
        }
      ]
    }
  }
}
