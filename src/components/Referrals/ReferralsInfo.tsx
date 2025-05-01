'use client'
import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { REFERRALSINFO_TAB } from '@/utils/constants'
import { useReferralsInfo } from '@/hooks/useReferralsInfo'
import EnterCode from '@/components/Referrals/EnterCode'
import CreateCode from '@/components/Referrals/CreateCode'
import Claim from '@/components/Referrals/Claim'
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
        return <EnterCode />
      case 'Create Code':
        return <CreateCode />
      case 'Claim':
        return <Claim isCreateCode={isCreateCode} totalClaim={totalClaim} />
      default:
        return null
    }
  }

  return (
    <div className="rounded-2xl border-2 border-[rgba(255,255,255,0.06)] backdrop-blur-[40px] bg-[linear-gradient(179.1deg,rgba(255,255,255,0.05)_-10.66%,rgba(153,153,153,0.05)_67.22%)]">
      <div className="py-5 px-4 min-2xl:px-8">
        <p className="text-[rgba(255, 255, 255, 1)] mb-1 text-2xl font-medium tracking-normal">
          Referrals
        </p>
        <span className="text-[#8B8BA0] text-sm font-medium tracking-normal">
          Refer users to earn rewards, and affiliates can earn even greater rewards.
        </span>
      </div>
      <div className="border-t font-medium tracking-normal border-b border-white/10 py-4 px-4 min-2xl:px-8">
        <div className="flex justify-between gap-x-2">
          <span className="text-base opacity-50 text-[#E8E0F1] ">Trades Referred</span>
          <span className="text-white text-lg">{referralsDetails?.builderRewards || '0'}</span>
        </div>
        <div className="flex justify-between gap-x-2">
          <span className="text-base opacity-50 text-[#E8E0F1]">Rewards Earned</span>
          <span className="text-white text-lg">${referralsDetails?.claimedRewards || '0'}</span>
        </div>
      </div>
      {isCreateCode && (
        <div className="flex items-center justify-between px-4 min-2xl:px-8 py-4 bg-[rgba(255,169,10,0.08)]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg">
              <Image
                style={{ width: 20, height: 'auto' }}
                src={trophyicon}
                alt="Trophy Icon"
                className="w-9 h-9"
              />
            </div>
            <Image
              style={{ width: 15, height: 'auto' }}
              src={referralsellipseImg}
              alt="User Avatar"
              className="w-9 h-9 rounded-full"
            />
            <div className="">
              <p className="text-white mb-1 text-base font-medium">HappyPotato</p>
              <p className="text-[#8B8BA0] font-medium text-sm">12d45...8we12</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white mb-1 text-base font-medium">Total Volume</p>
            <p className="text-[#8B8BA0] font-medium text-sm">10 000$</p>
          </div>
        </div>
      )}
      <div className="py-4 px-4 min-2xl:px-8">
        <div className="flex mb-5 items-center justify-between space-x-2  ">
          {REFERRALSINFO_TAB?.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 min-2xl:px-8 py-1.5 cursor-pointer rounded-full text-sm font-medium
                ${activeTab === tab ? 'bg-[rgba(255,255,255,0.06)] font-semibold backdrop-blur-[40px] text-white' : 'text-[#8B8BA0] hover:text-white'}
              `}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="">{renderTabContent()}</div>
      </div>
    </div>
  )
}

export default ReferralsInfo
