// App.tsx
'use client'

import {
  StellarWalletsKit,
  WalletNetwork,
  XBULL_ID,
  AlbedoModule,
  FreighterModule,
  xBullModule
} from '@creit.tech/stellar-wallets-kit'
import {
  WalletConnectAllowedMethods,
  WalletConnectModule
} from '@creit.tech/stellar-wallets-kit/modules/walletconnect.module'

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || ''

let kit: StellarWalletsKit | null = null

function getStellarKit(): StellarWalletsKit | null {
  // Only initialize on client side
  if (typeof window === 'undefined') {
    return null
  }

  if (!kit) {
    kit = new StellarWalletsKit({
      network: WalletNetwork.PUBLIC,
      modules: [
        new xBullModule(),
        new FreighterModule(),
        new AlbedoModule(),
        new WalletConnectModule({
          url: 'https://nexon.com',
          projectId: projectId,
          method: WalletConnectAllowedMethods.SIGN,
          description: `A DESCRIPTION TO SHOW USERS`,
          name: 'Nexon',
          icons: ['https://nexon.com/icon.png'],
          network: WalletNetwork.PUBLIC
        })
      ],
      selectedWalletId: XBULL_ID
    })
  }

  return kit
}

export default function StellarProvider() {
  return getStellarKit()
}