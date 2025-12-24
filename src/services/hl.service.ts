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
  private NEXON_USER: Address
  private httpTransport: hl.HttpTransport
  private infoClient: hl.InfoClient

  constructor() {
    this.url = isTestnet ? HYPERLIQUID_API_TESTNET : HYPERLIQUID_API_MAINNET

    const NEXON_USER = process.env.NEXON_USER_ADDRESS
    if (!NEXON_USER) {
      throw new Error('NEXON_USER_ADDRESS is not set')
    }
    this.NEXON_USER = NEXON_USER as Address

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
    const response = await this.infoClient.referral({ user: this.NEXON_USER })
    if (response.referrerState.stage === 'ready') {
      return response.referrerState.data.referralStates
    }
    return []
  }

  public async executeHyperliquidTransfer(requestBody: {
    action: unknown
    nonce: number
    signature: unknown
    isFrontend: boolean
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
