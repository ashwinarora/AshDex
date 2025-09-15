import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export type CreateOrUpdateUserPayload = {
  wallet_id: string
  username?: string
  avatar_url?: number | string | null
}

export type UserResponse = {
  id: number
  wallet_id: string
  username: string
  avatar_url: number | null
  preferred_language_id: number | null
  created_at: string
  updated_at: string
  invited_by: number | null
  is_nexon_referred: boolean
}

export const useCreateOrUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation<UserResponse, unknown, CreateOrUpdateUserPayload>({
    mutationKey: ['createOrUpdateUser'],
    mutationFn: async (payload: CreateOrUpdateUserPayload) => {
      const { data } = await axios.post('/api/users', payload)
      return data as UserResponse
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.wallet_id] })
    }
  })
}
