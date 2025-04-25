import { useReadContracts } from 'wagmi'
import { erc20Abi, Hex } from 'viem'

export const useERC20Data = (tokenAddress: Hex) => {
  const { data, isLoading, error } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'name'
      },
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'symbol'
      },
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'decimals'
      },
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'totalSupply'
      }
    ]
  })

  if (isLoading) return { isLoading, data: null, error: null }
  if (error) return { isLoading: false, data: null, error }

  return {
    isLoading: false,
    data: {
      name: data?.[0],
      symbol: data?.[1],
      decimals: data?.[2],
      totalSupply: data?.[3],
      address: tokenAddress
    },
    error: null
  }
}
