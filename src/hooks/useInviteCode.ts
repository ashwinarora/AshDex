'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { splitSignature } from '@/utils/utils'
import { useSignMessage } from 'wagmi'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { hyperliquidAxios } from '@/config/axios'
import { isTestnet } from '@/utils/constants'
import { useShallow } from 'zustand/react/shallow'
import { toast } from 'sonner'
import { Hex, Signature } from 'viem'

export interface IInvite {
  id: number
  user_id: number
  code: string
  created_at: string
  updated_at: string
}

export interface IInviteResponse {
  invite: IInvite[]
}

// Hook to get existing invite code
export const useInviteCode = () => {
  const { isConnected, address } = useAccount()

  return useQuery({
    queryKey: ['inviteCode', address],
    queryFn: async () => {
      if (!address) return null

      const response = await fetch(`/api/invite?wallet_id=${address}`)
      if (!response.ok) {
        throw new Error('Failed to fetch invite code')
      }

      const data: IInviteResponse = await response.json()
      console.log('data for existing invite code', data)
      return data.invite[0].code
    },
    enabled: isConnected && !!address,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  })
}

// Hook to create new invite code
export const useCreateInviteCode = () => {
  const { address, chainId } = useAccount()

  const { agentWallet } = useHyperliquidStore(
    useShallow((state) => ({
      agentWallet: state.agentWallet
    }))
  )
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ inviteCode, signature }: { inviteCode: string; signature: Hex }) => {
      if (!address || !chainId || !agentWallet) {
        throw new Error('Missing required parameters')
      }

      console.log('🚀 ~ useCreateInviteCode ~ signature:', signature)

      // Create invite in our database
      const response = await fetch('/api/invite/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          signature,
          payload: { inviteCode }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create invite code')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch invite code
      queryClient.invalidateQueries({ queryKey: ['inviteCode', address] })
      toast.success('Invite code created successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to create invite code: ${error.message}`)
    }
  })
}

// Hook to claim an invite code
export const useClaimInviteCode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ inviteCode, signature }: { inviteCode: string; signature: Hex }) => {
      const response = await fetch('/api/invite/claim', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          signature,
          payload: { inviteCode }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to claim invite code')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch referrals info
      queryClient.invalidateQueries({ queryKey: ['referralsInfo'] })
      toast.success('Invite code claimed successfully')
    },
    onError: (error: Error) => {
      console.log('error', error)
      toast.error(`Failed to claim invite code: ${error.message}`)
    }
  })
}
