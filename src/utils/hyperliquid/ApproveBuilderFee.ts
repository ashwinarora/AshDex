"use client"
import { SignTypedDataVariables } from "wagmi/query";

interface IApproveBuilderFeeData {
  chainId: number;
  isTestnet: boolean;
  nonce: number;
  builder: string;
  feePercentage: string;
}

export const getApproveBuilderFeePayload = ({
  chainId,
  isTestnet,
  nonce,
  builder,
  feePercentage,
}: IApproveBuilderFeeData): SignTypedDataVariables => {
  return {
    "domain": {
      "name": "HyperliquidSignTransaction",
      "version": "1",
      "chainId": chainId,
      "verifyingContract": "0x0000000000000000000000000000000000000000"
    },
    "message": {
      "type": "approveBuilderFee",
      "hyperliquidChain": isTestnet ? "Testnet" : "Mainnet",
      "signatureChainId": "0x" + chainId.toString(16),
      "maxFeeRate": feePercentage,
      "builder": builder,
      "nonce": nonce,
    },
    "primaryType": "HyperliquidTransaction:ApproveBuilderFee",
    "types": {
      "EIP712Domain": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "version",
          "type": "string"
        },
        {
          "name": "chainId",
          "type": "uint256"
        },
        {
          "name": "verifyingContract",
          "type": "address"
        }
      ],
      "HyperliquidTransaction:ApproveBuilderFee": [
        {
          "name": "hyperliquidChain",
          "type": "string"
        },
        {
          "name": "maxFeeRate",
          "type": "string"
        },
        {
          "name": "builder",
          "type": "address"
        },
        {
          "name": "nonce",
          "type": "uint64"
        }
      ]
    }
  }
}