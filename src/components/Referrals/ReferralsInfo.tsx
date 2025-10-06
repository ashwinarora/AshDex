'use client'
import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { REFERRALSINFO_TAB } from '@/utils/constants'
import { useReferralsInfo } from '@/hooks/useReferralsInfo'
import ClaimInviteCode from '@/components/Referrals/ClaimInviteCode'
import CreateCode from '@/components/Referrals/CreateCode'
import Rewards from '@/components/Referrals/Rewards'
import referralsellipseImg from '@/assets/images/referralsellipseImg.svg'
import trophyicon from '@/assets/images/trophy_icon.svg'

type ReferralsTab = (typeof REFERRALSINFO_TAB)[number]

interface ReferralsInfoProps {
  isCreateCode?: boolean
}
function ReferralsInfo({ isCreateCode }: ReferralsInfoProps) {
  const [activeTab, setActiveTab] = useState<ReferralsTab>('Enter Code')
  const { data: referralsDetails } = useReferralsInfo()

  const totalClaim = useMemo(() => {
    return (
      parseFloat(referralsDetails?.builderRewards || '0') +
      parseFloat(referralsDetails?.claimedRewards || '0')
    )
  }, [referralsDetails])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Enter Code':
        return <ClaimInviteCode />
      case 'Create Code':
        return <CreateCode />
      case 'Rewards':
        return <Rewards isCreateCode={isCreateCode} totalClaim={totalClaim} />
      default:
        return null
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
      {/* Header Section */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-white mb-2">Referral Dashboard</h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          Track your referral performance and manage your codes
        </p>
      </div>

      {/* Stats Section */}
      <div className="px-2 flex gap-2">
        <div className="w-full flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10">
          <div>
            <p className="text-gray-400 text-sm font-medium">Trades Referred</p>
            <p className="text-2xl font-bold text-white">
              {referralsDetails?.builderRewards || '0'}
            </p>
          </div>
        </div>

        <div className="w-full flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10">
          <div>
            <p className="text-gray-400 text-sm font-medium">Rewards Earned</p>
            <p className="text-2xl font-bold text-white">
              ${referralsDetails?.claimedRewards || '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Top Referrer Section */}
      {isCreateCode && (
        <div className="lg:p-8 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2xw">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <Image
                    src={trophyicon}
                    alt="Trophy Icon"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                  <Image
                    src={referralsellipseImg}
                    alt="User Avatar"
                    width={16}
                    height={16}
                    className="w-4 h-4 rounded-full"
                  />
                </div>
              </div>
              <div>
                <p className="text-white font-semibold text-lg">HappyPotato</p>
                <p className="text-gray-400 text-sm">12d45...8we12</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm font-medium">Total Volume</p>
              <p className="text-white font-bold text-lg">$10,000</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Section */}
      <div className="mt-10 border-t border-white/10">
        <div className="flex gap-2 mb-6">
          {REFERRALSINFO_TAB?.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full p-2 text-sm font-semibold  ${
                activeTab === tab
                  ? 'border-b-2 border-primary text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="h-[200px]">{renderTabContent()}</div>
      </div>
    </div>
  )
}

export default ReferralsInfo
