import { prisma } from '@/lib/prisma'
import { getReferral } from '@/lib/referral'
import { User, Prisma } from '@prisma/client'
import { Address } from 'viem'

type InviteWithUsers = Prisma.InviteGetPayload<{
  include: { used_by: true }
}>

class UserManager {
  private static instance: UserManager

  private constructor() {}

  public static getInstance(): UserManager {
    if (!UserManager.instance) {
      UserManager.instance = new UserManager()
    }
    return UserManager.instance
  }

  async findUserByWalletId(walletId: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { wallet_id: { equals: walletId, mode: 'insensitive' } }
    })
  }

  async getUserInvites(walletId: string): Promise<InviteWithUsers[]> {
    return prisma.invite.findMany({
      where: { user: { wallet_id: { equals: walletId, mode: 'insensitive' } } },
      include: { used_by: true }
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
          username: userData.username || 'user_' + userData.wallet_id,
          avatar_url: userData.avatar_url ? userData.avatar_url : null
        }
      })
    }
  }

  async validateReferral(walletId: Address): Promise<boolean> {
    const referral = await getReferral(walletId)

    if (
      referral?.referrer == '0x1710022f671b4032d6c7262107ba231f41f84ce8' &&
      referral.code == 'ASHWIN'
    ) {
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
