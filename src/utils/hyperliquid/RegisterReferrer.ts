import { SignTypedDataVariables } from 'wagmi/query'

interface IRegisterReferrerData {
  code: string
  chainId: number
}

export const getRegisterReferrerPayload = ({
  code,
  chainId
}: IRegisterReferrerData): SignTypedDataVariables => {
  return {
    domain: {
      name: 'HyperliquidSignTransaction',
      version: '1',
      chainId: chainId,
      verifyingContract: '0x0000000000000000000000000000000000000000'
    },
    message: {
      code: code,
      type: 'registerReferrer'
    },
    primaryType: 'HyperliquidTransaction:registerReferrer',
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
      'HyperliquidTransaction:registerReferrer': [
        {
          name: 'code',
          type: 'string'
        }
      ]
    }
  }
}
