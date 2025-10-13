import { Address } from 'viem'
import * as hl from '@nktkas/hyperliquid'
import { HYPERLIQUID_API_MAINNET, HYPERLIQUID_API_TESTNET } from '@/utils/constants'

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

  constructor() {
    const isTestnet = process.env.HYPERLIQUID_NETWORK !== 'mainnet'
    this.url = isTestnet ? HYPERLIQUID_API_TESTNET : HYPERLIQUID_API_MAINNET

    const NEXON_USER = process.env.NEXON_USER_ADDRESS
    if (!NEXON_USER) {
      throw new Error('NEXON_USER_ADDRESS is not set')
    }
    this.NEXON_USER = NEXON_USER as Address
  }

  public static getInstance() {
    if (!HLService.instance) {
      HLService.instance = new HLService()
    }
    return HLService.instance
  }

  private async make_request(body: string, type: 'info' | 'exchange') {
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')

    const response = await fetch(`${this.url}/${type}`, {
      method: 'POST',
      headers: myHeaders,
      body: body
    })

    if (!response.ok) {
      throw new Error(`Hyperliquid API error: ${response.status} - ${response.statusText}`)
    }

    return response.json()
  }

  public async getUserRole(user: Address): Promise<hl.UserRole> {
    const body = JSON.stringify({ type: 'userRole', user })
    const response = await this.make_request(body, 'info')
    return response
  }

  public async getReferralStates(): Promise<IReferralStates[]> {
    const body = JSON.stringify({ type: 'referral', user: this.NEXON_USER })
    const response: hl.Referral = await this.make_request(body, 'info')
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
    const body = JSON.stringify(requestBody)
    const response = await this.make_request(body, 'exchange')
    return response
  }
}

export default HLService.getInstance()
