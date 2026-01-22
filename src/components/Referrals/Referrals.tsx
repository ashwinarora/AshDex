'use client'
import React from 'react'
// import { useComponentRendered } from '@/hooks/useComponentRendered'
import ReferralsTablesTab from './ReferralsTablesTab'
import { useScreenSize } from '@/hooks/useScreenSize'
import ReferralsHeader from './ReferralsHeader'
import FooterCompact from '../FooterCompact'
import ReferralStats from './ReferralStats'
import WalletNotConnected from '../ConnectWalletModal/DisconnectedWalletState'
import { useConnection } from 'wagmi'
import { cn } from '@/lib/utils'
import useUserStore from '@/store/userStore'

function Referrals() {
  const { isMobile, isTablet } = useScreenSize()
  // const isRendered = useComponentRendered()
  const { address } = useConnection()
  // if (!isRendered) return null
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')
  if (!address) {
    return (
      <div className="w-full h-dvh text-white/70 overflow-hidden flex flex-col items-center">
        <WalletNotConnected />
        <FooterCompact />
      </div>
    )
  }

  if (isTablet || isMobile)
    return (
      <div className="w-full min-h-dvh text-white/70 overflow-hidden flex items-start justify-center">
        <div className="w-11/12 h-11/12 flex flex-col overflow-hidden">
          <div className="w-full shrink-0">
            <ReferralsHeader />
          </div>
          <div className={cn('w-full flex-1 flex flex-col items-start gap-1 overflow-hidden')}>
            <ReferralStats />
            <ReferralsTablesTab />
          </div>
        </div>
        <FooterCompact />
      </div>
    )

  return (
    <div className="w-full h-dvh text-white/70 overflow-hidden flex items-center justify-center">
      <div className="w-4/5 h-11/12 flex flex-col overflow-hidden">
        <div className="w-full shrink-0">
          <ReferralsHeader />
        </div>
        <div
          className={cn(
            'w-full flex-1 flex items-start gap-1 overflow-hidden',
            isRTL && 'flex-row-reverse'
          )}
        >
          <ReferralStats />
          <ReferralsTablesTab />
        </div>
      </div>
      <FooterCompact />
    </div>
  )
}

export default Referrals
