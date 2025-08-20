import { prisma } from '@/lib/prisma'
import { getReferral } from '@/lib/referral'
import { User } from '@prisma/client'
import { Address } from 'viem'

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
          avatar_url: userData.avatar_url ? userData.avatar_url : undefined
        }
      })

      return this.findUserByWalletId(userData.wallet_id)
    } else {
      // Create new user
      return prisma.user.create({
        data: {
          wallet_id: userData.wallet_id,
          username: userData.username || '',
          avatar_url: userData.avatar_url ? userData.avatar_url : null
        }
      })
    }
  }

  async validateReferral(walletId: Address): Promise<boolean> {
    const referral = await getReferral(walletId)

    if (referral?.referrer == '0x0000000000000000000000000000000000000000') {
      this.updateUser(walletId, { is_nexon_referred: true })
      return true
    }

    this.updateUser(walletId, { is_nexon_referred: false })
    return false
  }

  async getReferralStatus(walletId: Address, validate: boolean = false) {
    if (validate) {
      return this.validateReferral(walletId)
    }

    const user = await this.findUserByWalletId(walletId)
    return user?.is_nexon_referred
  }

  async updateUser(walletId: Address, updateData: Partial<User>) {
    await prisma.user.updateMany({
      where: {
        wallet_id: walletId
      },
      data: {
        ...(updateData.username !== undefined && { username: updateData.username }),
        ...(updateData.avatar_url !== undefined && { avatar_url: updateData.avatar_url })
      }
    })

    return this.findUserByWalletId(walletId)
  }
}

export default UserManager.getInstance()
