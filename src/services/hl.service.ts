import { Address } from 'viem'
import * as hl from '@nktkas/hyperliquid'

export interface IRefferalStates {
  cumVlm: string
  cumRewardedFeesSinceReferred: string
  cumFeesRewardedToReferrer: string
  timeJoined: number
  user: string
}

class HLService {
  private static instance: HLService
  private static mainnetUrl = 'https://api.hyperliquid.xyz'
  private static testnetUrl = 'https://api.hyperliquid-testnet.xyz'
  private url: string

  constructor() {
    // get from env HYPERLIQUID_NETWORK variable
    const isTestnet = process.env.HYPERLIQUID_NETWORK !== 'mainnet'
    this.url = isTestnet ? HLService.testnetUrl : HLService.mainnetUrl
  }

  public static getInstance() {
    if (!HLService.instance) {
      HLService.instance = new HLService()
    }
    return HLService.instance
  }

  private async make_info_request(body: { type: string; user: Address }) {
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')

    const response = await fetch(`${this.url}/info`, {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(body)
    })
    return response.json()
  }

  public async getUserRole(user: Address): Promise<hl.UserRole> {
    const response = await this.make_info_request({ type: 'userRole', user })
    return response
  }

  public async getReferralStates(user: Address): Promise<IRefferalStates[]> {
    const response: hl.Referral = await this.make_info_request({ type: 'referral', user })
    if (response.referrerState.stage === 'ready') {
      return response.referrerState.data.referralStates
    }
    return []
  }
}

export default HLService.getInstance()
