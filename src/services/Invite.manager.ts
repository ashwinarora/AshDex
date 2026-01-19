import { Invite, PrismaClient, User } from '@prisma/client'
import { Address } from 'viem'
import UserManager from './User.manager'
import { Decimal } from '@prisma/client/runtime/library'

export interface IInviteWithUsedBy extends Invite {
  used_by: User[]
}

class InviteService {
  private static instance: InviteService
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  public static getInstance(): InviteService {
    if (!InviteService.instance) {
      InviteService.instance = new InviteService()
    }
    return InviteService.instance
  }

  private normalizeCode(code: string): string {
    return code.toUpperCase().trim()
  }

  /*
  Validates an invite code
  */
  public async validateInviteCode(code: string): Promise<Error | null> {
    code = this.normalizeCode(code)

    if (!code || code.trim().length < 4 || code.trim().length > 8) {
      return new Error('Invite code must be between 4 and 8 characters')
    }

    const alphanumericRegex = /^[A-Za-z0-9]+$/
    if (!alphanumericRegex.test(code.trim())) {
      return new Error('Invite code can only contain letters and numbers')
    }

    const existingInvite = await this.prisma.invite.findUnique({
      where: { code: code }
    })
    if (existingInvite) {
      return new Error('Invite code already exists')
    }
    return null
  }

  /*
  Creates an invite code for a user
  */
  public async createInvite(wallet_id: Address, inviteCode: string): Promise<Invite> {
    const error = await this.validateInviteCode(inviteCode)
    if (error) {
      console.error('Error creating invite code:', error)
      throw new Error(error.message)
    }

    const user = await UserManager.findUserByWalletId(wallet_id)
    if (!user) {
      throw new Error('User not found')
    }

    const newInvite = await this.prisma.invite.create({
      data: {
        user_id: user.id,
        code: this.normalizeCode(inviteCode)
      }
    })

    console.log(`Created invite code: ${inviteCode} for user: ${wallet_id}`)
    return newInvite
  }

  /*
  Returns InviteObject for a given InviteCode
  */
  public async getInvite(code: string): Promise<Invite | null> {
    const normalizedCode = this.normalizeCode(code)

    const invite = await this.prisma.invite.findUnique({
      where: { code: normalizedCode },
      include: {
        user: true,
        used_by: true
      }
    })

    return invite
  }

  /*
  Returns all invite codes for a user
  */
  public async getInviteByUser(wallet_id: Address): Promise<Invite[] | null> {
    const invites = await this.prisma.invite.findMany({
      where: {
        user: {
          wallet_id: wallet_id
        }
      }
    })
    if (!invites || invites.length === 0) {
      return null
    }
    return invites
  }

  /*
  Retuns all invite codes for a user with the used_by field
  */
  public async getInviteByUserWithUsedBy(wallet_id: Address): Promise<IInviteWithUsedBy[]> {
    const invites = await this.prisma.invite.findMany({
      where: {
        user: {
          wallet_id: wallet_id
        }
      },
      include: {
        used_by: true
      }
    })
    if (!invites || invites.length === 0) {
      return []
    }
    return invites
  }

  /*
  Uses an invite code for a user
  */
  public async claimInviteCode(wallet_id: Address, inviteCode: string) {
    const normalizedCode = this.normalizeCode(inviteCode)

    const invite = await this.getInvite(normalizedCode)

    console.log('🚀 ~ InviteService ~ claimInviteCode ~ invite:', invite)

    if (!invite) {
      throw new Error('Invalid invite code')
    }

    const user = await UserManager.findUserByWalletId(wallet_id)

    console.log('🚀 ~ InviteService ~ claimInviteCode ~ user:', user)

    if (!user) {
      throw new Error('User not found')
    }

    if (user.invited_by) {
      throw new Error('User already used an invite code')
    }

    if (invite.user_id === user.id) {
      console.log('🚀 ~ InviteService ~ claimInviteCode ~ Cannot use your own invite code')
      throw new Error('Cannot use your own invite code')
    }

    if (!user.is_nexon_referred) {
      throw new Error('User is not nexon referred')
    }

    if (user.rewards_generated.greaterThan(Decimal(0))) {
      throw new Error('User has already started trading')
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { invited_by: invite.id }
    })

    console.log('🚀 ~ InviteService ~ claimInviteCode ~ user updated:', user)
  }

  // returns all users who have used a given invite code
  public async getUserInvites(wallet_id: Address, inviteCode: string): Promise<User[]> {
    const invite = await this.getInvite(inviteCode)
    if (!invite) {
      throw new Error('Invite not found')
    }

    const user = await UserManager.findUserByWalletId(wallet_id)
    if (!user) {
      throw new Error('User not found')
    }

    if (invite.user_id !== user.id) {
      throw new Error('Invalid User for this invite')
    }

    const successfulInvites = await this.prisma.user.findMany({
      where: { invited_by: invite.id },
      orderBy: { created_at: 'desc' }
    })

    return successfulInvites as unknown as User[]
  }
}

export default InviteService.getInstance()
