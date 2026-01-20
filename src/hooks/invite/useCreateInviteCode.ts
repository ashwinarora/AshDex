import { useAccount } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from './useAuth'
import { apiServerAxios } from '@/config/axios'

type TCreateInvitePayload = { inviteCode: string; action: 'createInvite' }

// Hook to create new invite code
export const useCreateInviteCode = () => {
  const { address } = useAccount()
  const queryClient = useQueryClient()
  const authMutation = useAuth<TCreateInvitePayload>()

  return useMutation({
    mutationFn: async (inviteCode: string) => {
      const payload: TCreateInvitePayload = { inviteCode, action: 'createInvite' }
      const body = await authMutation({ payload })
      const response = await apiServerAxios.post('/api/invite/create', body)
      if (!response.data) {
        throw new Error('Failed to create invite code')
      }
      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch invite code
      queryClient.invalidateQueries({ queryKey: ['inviteCode', address] })
      toast.success('Invite code created successfully')
    },
    onError: (error: Error) => {
      console.error('Error creating invite code:', error)
    }
  })
}
