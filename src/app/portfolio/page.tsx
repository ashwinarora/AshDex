'use client'
import FooterCompact from '@/components/FooterCompact'
import WalletNotConnected from '@/components/ConnectWalletModal/DisconnectedWalletState'
import PortfolioHeader from '@/components/Portfolio/PortfolioHeader'
import PortfolioStats from '@/components/Portfolio/PortfolioStats'
import UserData from '@/components/UserData/UserData'
import { useAccount } from 'wagmi'

const PortfolioPage = () => {
  const { address } = useAccount()
  if (!address) {
    return (
      <div className="w-full h-dvh text-white/70 overflow-hidden flex flex-col items-center">
        <WalletNotConnected />
        <FooterCompact />
      </div>
    )
  }
  return (
    <div className="w-full h-dvh text-white/70 overflow-hidden flex flex-col items-center">
      <div className="w-4/5 flex-1 flex flex-col gap-1 overflow-hidden py-4">
        <div className="w-full shrink-0">
          <PortfolioHeader />
        </div>
        <div className="w-full shrink-0">
          <PortfolioStats />
        </div>
        <div className="w-full flex-1 overflow-hidden">
          <UserData />
        </div>
      </div>
      <FooterCompact />
    </div>
  )
}

export default PortfolioPage
