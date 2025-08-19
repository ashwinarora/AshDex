import { Invite, PrismaClient } from '@prisma/client'
import { Address } from 'viem'

interface UseInviteResult {
  success: boolean
  invite?: Invite
  error?: string
}

interface User {
  id: number
  username: string
  wallet_id: Address
  avatar_url: string | null
  created_at: Date
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

    const existingInvite = await this.prisma.invite.findUnique({
      where: { code: code }
    })
    if (existingInvite) {
      return new Error('Invite code already exists')
    }

    if (!code || code.trim().length === 0) {
      return new Error('Invite code cannot be empty')
    }

    if (code.trim().length > 6) {
      return new Error('Invite code cannot be longer than 6 characters')
    }

    const alphanumericRegex = /^[A-Za-z0-9]+$/
    if (!alphanumericRegex.test(code.trim())) {
      return new Error('Invite code can only contain letters and numbers')
    }
    return null
  }

  /*
  Creates an invite code for a user
  */
  public async createInvite(wallet_id: Address, inviteCode: string): Promise<Invite> {
    const error = await this.validateInviteCode(inviteCode)
    if (error) {
      throw new Error(error.message)
    }

    const user = await this.prisma.user.findUnique({ where: { wallet_id } })
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
  Uses an invite code for a user
  */
  public async useInviteCode(wallet_id: Address, inviteCode: string): Promise<UseInviteResult> {
    const normalizedCode = this.normalizeCode(inviteCode)

    const invite = await this.getInvite(normalizedCode)
    if (!invite) {
      return { success: false, error: 'Invalid invite code' }
    }

    const user = await this.prisma.user.findUnique({ where: { wallet_id } })
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    if (user.invited_by) {
      return { success: false, error: 'User already used an invite code' }
    }

    if (!user.is_nexon_referred) {
      return { success: false, error: 'User is not a Nexon Referred User' }
    }

    if (invite.user_id === user.id) {
      return { success: false, error: 'Cannot use your own invite code' }
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { invited_by: invite.id }
    })

    console.log(`User ${wallet_id} used invite code: ${normalizedCode}`)
    return { success: true, invite }
  }

  // returns all users who have used a given invite code
  public async getUserInvites(wallet_id: Address, inviteCode: string): Promise<User[]> {
    const invite = await this.getInvite(inviteCode)
    if (!invite) {
      throw new Error('Invite not found')
    }

    const user = await this.prisma.user.findUnique({ where: { wallet_id } })
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
