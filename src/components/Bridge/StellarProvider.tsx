// App.tsx

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

const kit: StellarWalletsKit = new StellarWalletsKit({
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

export default function StellarProvider() {
  return kit
}
