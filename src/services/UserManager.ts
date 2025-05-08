import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

interface UserPreferences {
  popup_position?: number
  sound_enabled?: boolean
  order_updates?: boolean
  liquidation_alerts?: boolean
  new_feature_updates?: boolean
  new_token_listings?: boolean
  vaults_distribution_updates?: boolean
  rewards_referrals_updates?: boolean
  security_alerts?: boolean
}

interface UserData {
  username?: string
  avatar_url?: string
  wallet_id: string
  user_preferences?: UserPreferences
}

class UserManager {
  private static instance: UserManager

  private constructor() {}

  public static getInstance(): UserManager {
    if (!UserManager.instance) {
      UserManager.instance = new UserManager()
    }
    return UserManager.instance
  }

  async findUserByWalletId(walletId: string) {
    return prisma.user.findFirst({
      where: {
        wallet_id: walletId
      }
    })
  }

  async createOrUpdateUser(userData: UserData) {
    const existingUser = await this.findUserByWalletId(userData.wallet_id)

    if (existingUser) {
      // Update existing user
      await prisma.user.updateMany({
        where: {
          wallet_id: userData.wallet_id
        },
        data: {
          username: userData.username,
          avatar_url: userData.avatar_url ? parseInt(userData.avatar_url) : undefined,
          user_preferences: userData.user_preferences as Prisma.InputJsonValue
        }
      })

      return this.findUserByWalletId(userData.wallet_id)
    } else {
      // Create new user
      return prisma.user.create({
        data: {
          wallet_id: userData.wallet_id,
          username: userData.username || '',
          avatar_url: userData.avatar_url ? parseInt(userData.avatar_url) : null,
          user_preferences: userData.user_preferences as Prisma.InputJsonValue
        }
      })
    }
  }

  async updateUser(walletId: string, updateData: Partial<UserData>) {
    await prisma.user.updateMany({
      where: {
        wallet_id: walletId
      },
      data: {
        ...(updateData.username !== undefined && { username: updateData.username }),
        ...(updateData.avatar_url !== undefined && { avatar_url: parseInt(updateData.avatar_url) }),
        ...(updateData.user_preferences !== undefined && {
          user_preferences: updateData.user_preferences as Prisma.InputJsonValue
        })
      }
    })

    return this.findUserByWalletId(walletId)
  }
}

export default UserManager.getInstance()
