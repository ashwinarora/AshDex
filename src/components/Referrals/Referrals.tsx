'use client'
import React from 'react'
// import { useComponentRendered } from '@/hooks/useComponentRendered'
import ReferralsTablesTab from './ReferralsTablesTab'
import { useScreenSize } from '@/hooks/useScreenSize'
import ReferralsHeader from './ReferralsHeader'
import FooterCompact from '../FooterCompact'
import ReferralStats from './ReferralStats'
import WalletNotConnected from '../ConnectWalletModal/DisconnectedWalletState'
import { useAccount } from 'wagmi'

function Referrals() {
  const { isMobile } = useScreenSize()
  // const isRendered = useComponentRendered()
  const { address } = useAccount()
  // if (!isRendered) return null

  if (!address) {
    return (
      <div className="w-full h-dvh text-white/70 overflow-hidden flex flex-col items-center">
        <WalletNotConnected />
        <FooterCompact />
      </div>
    )
  }

  if (isMobile) return <div></div>

  return (
    <div className="w-full h-dvh text-white/70 overflow-hidden flex items-center justify-center">
      <div className="w-4/5 h-11/12 flex flex-col overflow-hidden">
        <div className="w-full shrink-0">
          <ReferralsHeader />
        </div>
        <div className="w-full flex-1 flex items-start gap-1 overflow-hidden">
          <ReferralStats />
          <ReferralsTablesTab />
        </div>
      </div>
      <FooterCompact />
    </div>
  )
}

export default Referrals
