'use client'
import { SignTypedDataVariables } from 'wagmi/query'

export interface IApproveAgentData {
  chainId: number
  isTestnet: boolean
  nonce: number
  agentAddress: string
  agentName: string
}

export const getApproveAgentPayload = ({
  chainId,
  isTestnet,
  nonce,
  agentAddress,
  agentName
}: IApproveAgentData): SignTypedDataVariables => {
  return {
    domain: {
      name: 'HyperliquidSignTransaction',
      version: '1',
      chainId: chainId,
      verifyingContract: '0x0000000000000000000000000000000000000000'
    },
    message: {
      hyperliquidChain: isTestnet ? 'Testnet' : 'Mainnet',
      signatureChainId: '0x' + chainId.toString(16),
      agentAddress: agentAddress,
      agentName: agentName,
      nonce: nonce,
      type: 'approveAgent'
    },
    primaryType: 'HyperliquidTransaction:ApproveAgent',
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
      'HyperliquidTransaction:ApproveAgent': [
        {
          name: 'hyperliquidChain',
          type: 'string'
        },
        {
          name: 'agentAddress',
          type: 'address'
        },
        {
          name: 'agentName',
          type: 'string'
        },
        {
          name: 'nonce',
          type: 'uint64'
        }
      ]
    }
  }
}
