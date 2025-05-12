import { prisma } from '@/lib/prisma'
import { User, Prisma } from '@prisma/client'

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

  async createOrUpdateUser(userData: User) {
    const existingUser = await this.findUserByWalletId(userData.wallet_id)

    if (existingUser) {
      // Update existing user
      await prisma.user.updateMany({
        where: {
          wallet_id: userData.wallet_id
        },
        data: {
          username: userData.username,
          avatar_url: userData.avatar_url ? userData.avatar_url : undefined,
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
          avatar_url: userData.avatar_url ? userData.avatar_url : null,
          user_preferences: userData.user_preferences as Prisma.InputJsonValue
        }
      })
    }
  }

  async updateUser(walletId: string, updateData: Partial<User>) {
    await prisma.user.updateMany({
      where: {
        wallet_id: walletId
      },
      data: {
        ...(updateData.username !== undefined && { username: updateData.username }),
        ...(updateData.avatar_url !== undefined && { avatar_url: updateData.avatar_url }),
        ...(updateData.user_preferences !== undefined && {
          user_preferences: updateData.user_preferences as Prisma.InputJsonValue
        })
      }
    })

    return this.findUserByWalletId(walletId)
  }
}

export default UserManager.getInstance()
