import axios from 'axios'
import { toast } from 'sonner'
export interface User {
  id: number
  wallet_id: string
  username: string
  avatar_url?: number
  preferred_language_id?: number
  user_preferences?: {
    popup_position?: number
    sound_enabled?: boolean
    security_alerts?: boolean
    order_updates?: boolean
    liquidation_alerts?: boolean
    new_feature_updates?: boolean
    new_token_listings?: boolean
    vaults_distribution_updates?: boolean
    rewards_referrals_updates?: boolean
  }
  created_at: string
  updated_at: string
}

export interface Language {
  id: number
  country_code: string
  label: string
  name: string
  created_at: string
  updated_at: string
}

/**
 * Fetches a user by wallet ID
 * @param walletId The wallet address to search for
 * @returns The user object if found, null otherwise
 */
export async function getUserByWalletId(walletId: string): Promise<User | null> {
  try {
    const response = await axios.get(`/api/users?wallet_id=${walletId}`)
    // Check if the response has a data property that might be null
    if (response?.data && 'data' in response?.data) {
      return response?.data?.data
    }

    // Otherwise return the response data directly
    return response?.data ? response?.data : null
  } catch (error) {
    // Check if the error is a 404 response (user not found)
    if (axios.isAxiosError(error) && error?.response?.status === 404) {
      // This is expected when a user doesn't exist yet, so we don't need to log an error
      return null
    }

    // For other errors, log and show toast
    console.error('Error fetching user by wallet ID:', error)
    toast.error('Error fetching user by wallet ID:' + error)
    return null
  }
}

/**
 * Creates a new user with the given wallet ID and username
 * @param walletId The wallet address
 * @param username The username for the new user
 * @param avatarUrl Optional avatar URL
 * @param preferredLanguageId Optional preferred language ID
 * @returns The created user object
 */
export async function createUser(
  walletId: string,
  username: string,
  avatarUrl?: string,
  preferredLanguageId?: number
): Promise<User | null> {
  try {
    const response = await axios.post('/api/users', {
      wallet_id: walletId,
      username,
      avatar_url: avatarUrl,
      preferred_language_id: preferredLanguageId
    })
    return response.data
  } catch (error) {
    console.error('Error creating user:', error)
    toast.error('Error creating user:' + error)
    return null
  }
}

/**
 * Updates an existing user
 * @param userId The ID of the user to update
 * @param updates Object containing the fields to update
 * @returns The updated user object
 */
export async function updateUser(
  walletId: string,
  updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
): Promise<User | null> {
  try {
    const response = await axios.patch('/api/users', {
      wallet_id: walletId,
      ...updates
    })
    toast.success('User updated successfully')
    return response.data
  } catch (error) {
    console.error('Error updating user:', error)
    toast.error('Error updating user:' + error)
    return null
  }
}
