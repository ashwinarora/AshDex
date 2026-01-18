import { PrivyClient } from '@privy-io/node'
import type { Address, Hex } from 'viem'
import type { TypedDataDefinition } from 'viem'

class PrivyWalletManager {
  private static instance: PrivyWalletManager
  private client?: PrivyClient
  private walletAddress?: Address

  private constructor() {
    // Intentionally empty - lazy initialization
  }

  public static getInstance(): PrivyWalletManager {
    if (!PrivyWalletManager.instance) {
      PrivyWalletManager.instance = new PrivyWalletManager()
    }
    return PrivyWalletManager.instance
  }

  private ensureClient(): PrivyClient {
    if (this.client) return this.client

    const appId = process.env.NEXT_PUBLIC_PRIVY_APPID
    const appSecret = process.env.PRIVY_APP_SECRET

    if (!appId || !appSecret) {
      throw new Error(
        'Missing Privy credentials. Set NEXT_PUBLIC_PRIVY_APPID and PRIVY_APP_SECRET.'
      )
    }

    this.client = new PrivyClient({ appId, appSecret })
    return this.client
  }

  private getWalletId(): string {
    const walletId = process.env.PRIVY_SERVER_WALLET_ID
    if (!walletId) {
      throw new Error('PRIVY_SERVER_WALLET_ID not configured')
    }
    return walletId
  }

  /**
   * Get Ethereum address from Privy server wallet
   */
  public async getWalletAddress(): Promise<Address> {
    if (this.walletAddress) return this.walletAddress

    const client = this.ensureClient()
    const wallet = await client.wallets().get(this.getWalletId())

    this.walletAddress = wallet.address as Address
    return this.walletAddress
  }

  /**
   * Sign EIP-712 typed data with the server wallet
   * Calls Privy API directly - no other wallet operations possible
   */
  public async signTypedData(typedData: TypedDataDefinition): Promise<Hex> {
    const client = this.ensureClient()

    const { signature } = await client
      .wallets()
      .ethereum()
      .signTypedData(this.getWalletId(), {
        params: {
          typed_data: {
            domain: typedData.domain as Record<string, unknown>,
            message: typedData.message as Record<string, unknown>,
            primary_type: typedData.primaryType as string,
            types: typedData.types as unknown as Record<
              string,
              Array<{ name: string; type: string }>
            >
          }
        }
      })

    return signature as Hex
  }
}

export default PrivyWalletManager.getInstance()
