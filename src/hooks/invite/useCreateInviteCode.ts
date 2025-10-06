import { useAccount } from 'wagmi'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Hex } from 'viem'

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
