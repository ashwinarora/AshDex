import { prisma } from '@/lib/prisma'
import { Address } from 'viem'
import { getUsdSendPayload } from '@/utils/hyperliquid/UsdSend'
import { splitSignature } from '@/utils/utils'
import { isTestnet } from '@/utils/constants'
import { arbitrum } from 'viem/chains'
import UserManager from './User.manager'
import PrivyWalletManager from './Privy.service'
import HLService from './hl.service'
import { Decimal } from '@prisma/client/runtime/library'
import * as hl from '@nktkas/hyperliquid'

export interface ReferralRewards {
  inviteCode: string
  rewardsGenerated: number
  cumulativeVolumeTraded: number
}

export interface ReferralStats {
  inviteCodes: ReferralRewards[]
  totalReferralRewardsGenerated: number
  totalVolumeTradedByReferral: number
  totalReferralRewardsClaimed: number
  availableReferralRewards: number
  claimCount: number
}

export interface RewardsAvailableToClaim {
  totalReferralRewards: number
  totalRewardsClaimed: number
  availableToClaim: number
}

export interface RewardsHistoryParams {
  wallet_id: Address
  limit?: number
  offset?: number
}

export interface RewardsHistoryItem {
  id: number
  rewards_claimed: number
  created_at: Date
}

export interface RewardsHistoryResult {
  rewardsHistory: RewardsHistoryItem[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  summary: {
    totalRewardsClaimed: number
    totalClaims: number
  }
}

export interface ClaimRewardsResult {
  success: boolean
  result: hl.SuccessResponse
  rewards_claimed: string
  address: string
}

class RewardsManager {
  private static instance: RewardsManager

  private constructor() {}

  public static getInstance(): RewardsManager {
    if (!RewardsManager.instance) {
      RewardsManager.instance = new RewardsManager()
    }
    return RewardsManager.instance
  }

  public async getReferralRewards(wallet_id: Address): Promise<ReferralRewards[]> {
    try {
      const invites = await UserManager.getUserInvites(wallet_id)
      if (!invites) {
        throw new Error('Invites not found')
      }

      // Map each invite to calculate its specific rewards and volume
      const resp = invites.map((invite) => {
        const rewardsGenerated = invite.used_by.reduce(
          (sum, user) => sum + Number(user.rewards_generated),
          0
        )

        const cumulativeVolumeTraded = invite.used_by.reduce(
          (sum, user) => sum + Number(user.volume_traded),
          0
        )

        return {
          inviteCode: invite.code,
          rewardsGenerated: Number(rewardsGenerated),
          cumulativeVolumeTraded: Number(cumulativeVolumeTraded)
        }
      })

      return resp
    } catch (error) {
      console.error('Error getting referral rewards:', error)
      throw error
    }
  }

  public async getRewardsHistory(params: RewardsHistoryParams): Promise<RewardsHistoryResult> {
    try {
      const { wallet_id, limit = 50, offset = 0 } = params

      const cappedLimit = Math.min(limit, 100) // Cap at 100 records

      // Get rewards history with pagination
      // Use a join to fetch rewards history by user wallet_id
      const rewardsHistory_promise = prisma.userRewardsClaims.findMany({
        where: {
          user: {
            wallet_id: { equals: wallet_id, mode: 'insensitive' }
          }
        },
        orderBy: { created_at: 'desc' },
        take: cappedLimit,
        skip: offset,
        select: {
          id: true,
          rewards_claimed: true,
          created_at: true
        }
      })

      // Get total count for pagination
      const totalCount_promise = prisma.userRewardsClaims.count({
        where: { user: { wallet_id: { equals: wallet_id, mode: 'insensitive' } } }
      })

      // Calculate total rewards claimed
      const totalRewardsClaimed_promise = prisma.userRewardsClaims.aggregate({
        where: { user: { wallet_id: { equals: wallet_id, mode: 'insensitive' } } },
        _sum: { rewards_claimed: true }
      })

      const [rewardsHistory, totalCount, totalRewardsClaimed] = await Promise.all([
        rewardsHistory_promise,
        totalCount_promise,
        totalRewardsClaimed_promise
      ])

      // Convert Decimal values to numbers for JSON serialization
      const rewardsHistoryWithNumbers: RewardsHistoryItem[] = rewardsHistory.map((item) => ({
        id: item.id,
        rewards_claimed: Number(item.rewards_claimed),
        created_at: item.created_at
      }))

      return {
        rewardsHistory: rewardsHistoryWithNumbers,
        pagination: {
          total: totalCount,
          limit: cappedLimit,
          offset,
          hasMore: offset + cappedLimit < totalCount
        },
        summary: {
          totalRewardsClaimed: Number(totalRewardsClaimed._sum.rewards_claimed || 0),
          totalClaims: totalCount
        }
      }
    } catch (error) {
      console.error('Error getting rewards history:', error)
      throw error
    }
  }

  public async getMaxClaimAmount(wallet_id: Address): Promise<number> {
    try {
      const referralRewards = await this.getReferralRewards(wallet_id)
      const totalReferralRewards = referralRewards.reduce(
        (sum, invite) => sum + invite.rewardsGenerated,
        0
      )

      const rewardsHistory = await this.getRewardsHistory({ wallet_id })
      const totalRewardsClaimed = rewardsHistory.summary.totalRewardsClaimed

      const valid = totalReferralRewards - totalRewardsClaimed

      return valid
    } catch (error) {
      console.error('Error validating claim amount:', error)
      throw error
    }
  }

  private async prepareSignedTransaction(wallet_id: Address, claimAmount: string) {
    const address = await PrivyWalletManager.getWalletAddress()
    const nonce = Date.now()
    const chainId = arbitrum.id

    // Prepare action for Hyperliquid
    const action = {
      type: 'usdSend',
      destination: wallet_id,
      amount: claimAmount,
      signatureChainId: '0x' + chainId.toString(16),
      hyperliquidChain: isTestnet ? 'Testnet' : 'Mainnet',
      time: nonce
    }

    // Generate typed data for signature
    const typedData = getUsdSendPayload({
      chainId,
      isTestnet,
      nonce,
      destination: wallet_id,
      amount: claimAmount
    })

    // Sign EIP-712 typed data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signature = await PrivyWalletManager.signTypedData(typedData as any)
    const splitSig = splitSignature(signature)

    return {
      action,
      nonce,
      signature: splitSig,
      walletAddress: address
    }
  }

  public async claimRewards(wallet_id: Address): Promise<ClaimRewardsResult> {
    try {
      const user = await UserManager.findUserByWalletId(wallet_id)
      if (!user) {
        throw new Error('User not found')
      }

      const claimAmount = (await this.getMaxClaimAmount(wallet_id)).toString()

      const { action, nonce, signature, walletAddress } = await this.prepareSignedTransaction(
        wallet_id,
        claimAmount
      )
      console.log('🚀 ~ RewardsManager ~ claimRewards ~ walletAddress:', walletAddress)
      console.log('🚀 ~ RewardsManager ~ claimRewards ~ signature:', signature)
      console.log('🚀 ~ RewardsManager ~ claimRewards ~ nonce:', nonce)
      console.log('🚀 ~ RewardsManager ~ claimRewards ~ action:', action)

      const requestBody = {
        action,
        nonce,
        signature
      }
      const result = await HLService.executeHyperliquidTransfer(requestBody)
      console.log('🚀 ~ RewardsManager ~ claimRewards ~ result:', result)

      if (result.status !== 'ok') {
        throw new Error('Failed to claim rewards: ' + JSON.stringify(result))
      }

      // Step 4: Record the claim in database
      await this.recordRewardClaim(user.id, claimAmount)

      return {
        success: true,
        result,
        rewards_claimed: claimAmount,
        address: walletAddress
      }
    } catch (error) {
      console.error('Error claiming rewards:', error)
      throw error
    }
  }

  private async recordRewardClaim(userId: number, claimAmount: string): Promise<void> {
    // Create claim record
    await prisma.userRewardsClaims.create({
      data: {
        user_id: userId,
        rewards_claimed: new Decimal(claimAmount)
      }
    })

    console.log(`Recorded reward claim for user ${userId}: ${claimAmount} USDC`)
  }

  public async getRewardsStats(wallet_id: Address): Promise<ReferralStats> {
    try {
      const claimCount = await prisma.userRewardsClaims.count({
        where: { user: { wallet_id: { equals: wallet_id, mode: 'insensitive' } } }
      })

      const referralRewards = await this.getReferralRewards(wallet_id)

      // Sum up rewards and volume from all invite codes
      const totalReferralRewardsGenerated = referralRewards.reduce(
        (sum, invite) => sum + invite.rewardsGenerated,
        0
      )
      const totalVolumeTradedByReferral = referralRewards.reduce(
        (sum, invite) => sum + invite.cumulativeVolumeTraded,
        0
      )

      const rewardHistory = await this.getRewardsHistory({ wallet_id })
      const totalReferralRewardsClaimed = rewardHistory.summary.totalRewardsClaimed
      const availableReferralRewards = totalReferralRewardsGenerated - totalReferralRewardsClaimed

      return {
        inviteCodes: referralRewards,
        totalReferralRewardsGenerated,
        totalReferralRewardsClaimed,
        availableReferralRewards,
        totalVolumeTradedByReferral,
        claimCount
      }
    } catch (error) {
      console.error('Error getting rewards stats:', error)
      throw error
    }
  }

  public async syncRewardsFromHyperliquid(
    referralStates: Array<{
      user: string
      cumFeesRewardedToReferrer: string
      cumVlm: string
    }>
  ): Promise<{ updated: number }> {
    try {
      const all_rewards = referralStates.map((state) => ({
        address: state.user as Address,
        rewards: parseFloat(state.cumFeesRewardedToReferrer) / 2,
        clmVol: parseFloat(state.cumVlm)
      }))

      // Update all users with their respective reward values in a transaction
      await prisma.$transaction(
        all_rewards.map((reward) =>
          prisma.user.updateMany({
            where: {
              wallet_id: {
                equals: reward.address,
                mode: 'insensitive'
              }
            },
            data: {
              rewards_generated: reward.rewards,
              volume_traded: reward.clmVol,
              rewards_updated_at: new Date()
            }
          })
        )
      )

      console.log(`Synced rewards for ${all_rewards.length} users from Hyperliquid`)

      return { updated: all_rewards.length }
    } catch (error) {
      console.error('Error syncing rewards from Hyperliquid:', error)
      throw error
    }
  }
}

export default RewardsManager.getInstance()
