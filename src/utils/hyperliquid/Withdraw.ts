import { SignTypedDataVariables } from 'wagmi/query'

interface IWithdrawPayload {
  chainId: number
  isTestnet: boolean
  nonce: number
  amount: string
  destination: string
}

export const getWithrawalPayload = ({
  chainId,
  isTestnet,
  nonce,
  amount,
  destination
}: IWithdrawPayload): SignTypedDataVariables => {
  return {
    domain: {
      name: 'HyperliquidSignTransaction',
      version: '1',
      chainId: chainId,
      verifyingContract: '0x0000000000000000000000000000000000000000'
    },
    message: {
      type: 'withdraw3',
      signatureChainId: '0x' + chainId.toString(16),
      hyperliquidChain: isTestnet ? 'Testnet' : 'Mainnet',
      destination: destination,
      amount: amount,
      time: nonce
    },
    primaryType: 'HyperliquidTransaction:Withdraw',
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
      'HyperliquidTransaction:Withdraw': [
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
