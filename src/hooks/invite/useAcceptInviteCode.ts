import { useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Hex } from 'viem'

// Hook to claim an invite code
export const useAcceptInviteCode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ inviteCode, signature }: { inviteCode: string; signature: Hex }) => {
      const response = await fetch('/api/invite/accept', {
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
