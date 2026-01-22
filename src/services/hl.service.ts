import { Address } from 'viem'
import * as hl from '@nktkas/hyperliquid'
import type { UserRoleResponse } from '@nktkas/hyperliquid/api/info'
import { HYPERLIQUID_API_MAINNET, HYPERLIQUID_API_TESTNET, isTestnet } from '@/utils/constants'

export interface IReferralStates {
  cumVlm: string
  cumRewardedFeesSinceReferred: string
  cumFeesRewardedToReferrer: string
  timeJoined: number
  user: string
}

class HLService {
  private static instance: HLService
  private url: string
  private REFERRAL_CODE_OWNER: Address
  private httpTransport: hl.HttpTransport
  private infoClient: hl.InfoClient

  constructor() {
    this.url = isTestnet ? HYPERLIQUID_API_TESTNET : HYPERLIQUID_API_MAINNET

    const REFERRAL_CODE_OWNER = process.env.REFERRAL_CODE_OWNER
    if (!REFERRAL_CODE_OWNER) {
      throw new Error('REFERRAL_CODE_OWNER is not set')
    }
    this.REFERRAL_CODE_OWNER = REFERRAL_CODE_OWNER as Address

    this.httpTransport = new hl.HttpTransport({ isTestnet, fetchOptions: { keepalive: false } })
    this.infoClient = new hl.InfoClient({ transport: this.httpTransport })
  }

  public static getInstance() {
    if (!HLService.instance) {
      HLService.instance = new HLService()
    }
    return HLService.instance
  }

  public async getUserRole(user: Address): Promise<UserRoleResponse> {
    const response = await this.infoClient.userRole({ user })
    return response
  }

  public async getReferralStates(): Promise<IReferralStates[]> {
    const response = await this.infoClient.referral({ user: this.REFERRAL_CODE_OWNER })
    if (response.referrerState.stage === 'ready') {
      return response.referrerState.data.referralStates
    }
    return []
  }

  public async executeHyperliquidTransfer(requestBody: {
    action: unknown
    nonce: number
    signature: unknown
  }): Promise<hl.SuccessResponse> {
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')

    const response = await fetch(`${this.url}/exchange`, {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`Hyperliquid API error: ${response.status} - ${response.statusText}`)
    }

    return response.json()
  }
}

export default HLService.getInstance()
