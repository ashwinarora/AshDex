import { useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from './useAuth'
import { apiServerAxios } from '@/config/axios'

type TAcceptInvitePayload = { inviteCode: string; action: 'acceptInvite' }

// Hook to claim an invite code
export const useAcceptInviteCode = () => {
  const queryClient = useQueryClient()
  const authMutation = useAuth<TAcceptInvitePayload>()

  return useMutation({
    mutationFn: async (inviteCode: string) => {
      const payload: TAcceptInvitePayload = { inviteCode, action: 'acceptInvite' }
      const body = await authMutation({ payload })
      const response = await apiServerAxios.patch('/api/invite/accept', body)

      if (!response.data) {
        const errorData = await response.data
        throw new Error(errorData.error || 'Failed to claim invite code')
      }

      return response.data
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
