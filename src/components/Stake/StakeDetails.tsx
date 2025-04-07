'use client'
import Image from 'next/image'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import LaftArrow from '@/assets/images/arrow_laft.svg'
import InfoIcon from '@/assets/images/info_icon.svg'
import VectorIcon from '@/assets/images/vector_icon.svg'
import stake from '@/utils/stake.json'
import CustomSelector from '../Trading/PlaceOrderBox/CustomSelector'
import { useAccount } from 'wagmi'
import { useWalletModal } from '@/context/WalletModalContext'
import UnstakeQueue from './UnstakeQueue'
import RewardHistory from './RewardHistory'
import ActionsHistory from './ActionsHistory'

const StakeDetails = () => {
  const router = useRouter()
  const [isCross, setIsCross] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState('Unstake Queue')
  const { isConnected: isWalletConnected } = useAccount()
  const { stakingData, unstakeItems, rewardHistoryData, actionHistoryData } = stake
  const tabs = ['Reward History', 'Unstake Queue', 'Actions History']

  const RightSideSection = () => {
    const { toggleConnectWalletModal } = useWalletModal()
    if (!isWalletConnected) {
      return (
        <>
          <p className="text-2xl font-medium">Start Staking</p>
          <p className="text-[#8B8BA0] text-base font-medium">
            Connect your wallet to start earning passive income with competitive rewards and staking
            options.{' '}
          </p>
          <button
            type="button"
            className={
              'py-2 rounded-2xl w-full  bg-[#5F46F9] hover:bg-purple-600 text-white cursor-pointer'
            }
            onClick={() => {
              toggleConnectWalletModal()
            }}
          >
            Connect Wallet
          </button>
        </>
      )
    } else {
      return (
        <>
          <div className="flex flex-col">
            <span className="text-[#8B8BA0] mb-1 text-base font-medium">My Active Stake</span>
            <span className="text-2xl font-medium">1,593.32</span>
          </div>
          <div className="flex gap-x-2 font-semibold text-base">
            <button className="bg-[#5F46F9] px-4.5 py-2.5 rounded-xl cursor-pointer">
              Stake Tokens
            </button>
            <button className="bg-[#FFFFFF0F] px-4.5 py-2.5 rounded-xl cursor-pointer">
              Unstake
            </button>
          </div>
        </>
      )
    }
  }

  const handleBackClick = () => {
    router.push(`/stake`)
  }

  return (
    <>
      <div className="bg-[#0d021f] text-white flex justify-center py-10 w-full">
        <div className="flex flex-col md:flex-row justify-center w-full xl:w-3/5 gap-10 lg:px-0 px-4">
          <div className="space-y-4 w-full lg:w-[65%] max-w-[600px]">
            <div
              onClick={() => handleBackClick()}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <Image src={LaftArrow} alt="Back" />
              <span className="text-base font-medium">Back</span>
            </div>

            <div className="space-y-4">
              <p className="font-medium text-2xl">Nansen x HypurrCollective</p>
              <p className="text-[#8B8BA0] font-medium text-base">
                HypurrCollective is a cornerstone of the Hyperliquid community, bringing together
                founders, builders, traders, and power users to drive meaningful impact. Since its
                inception in July, it has spearheaded numerous initiatives, from governance
                proposals to community-funded projects.
              </p>
              <p className="text-[#8B8BA0] font-medium text-base">
                HypurrCollective’s dedication to fostering growth and innovation makes it a vital
                partner in the Hyperliquid ecosystem.
              </p>
            </div>
            {stakingData.map((item, index) => (
              <div
                className="rounded-2xl border-2 border-white/10 
                px-[20px] py-[16px] gap-4 flex justify-between
                bg-[linear-gradient(179.1deg,rgba(255,255,255,0.05)_-10.66%,rgba(153,153,153,0.05)_67.22%)]
                backdrop-blur-[48.3px]"
                key={index}
              >
                <div className="flex">
                  <span>{item.label}</span>
                  <Image src={InfoIcon} alt="" className="px-2" />
                </div>
                <p>{item.value}</p>
              </div>
            ))}
            <div className="flex space-x-3 w-full">
              <div
                className="rounded-2xl border-2 border-white/10 
                px-5 py-5 gap-4 
                bg-[linear-gradient(179.1deg,rgba(255,255,255,0.05)_-10.66%,rgba(153,153,153,0.05)_67.22%)]
                backdrop-blur-[48.3px] min-w-[75%]"
              >
                <p className="text-[#8B8BA0] text-base font-medium">Total staked</p>
                <div className="flex space-x-3 items-center">
                  <div className="bg-[#072723] p-1 rounded-full">
                    <Image src={VectorIcon} alt="" />
                  </div>
                  <p className="text-[28px] font-medium">1,498,283.92 HYPE</p>
                </div>
              </div>
              <div
                className="rounded-2xl border-2 border-white/10 
                px-5 py-5 gap-4 
                bg-[linear-gradient(179.1deg,rgba(255,255,255,0.05)_-10.66%,rgba(153,153,153,0.05)_67.22%)]
                backdrop-blur-[48.3px] min-w-[22.7%]"
              >
                <p className="text-[#8B8BA0] text-base font-medium mb-2">Status</p>
                <p className="text-base font-medium text-[#2FA766] bg-[#1F1F30] p-1 rounded-[8px] w-fit">
                  Active
                </p>
              </div>
            </div>

            <div
              className="rounded-2xl border-2 border-white/10 space-y-4
                px-[20px] py-[16px] gap-4
                bg-[linear-gradient(179.1deg,rgba(255,255,255,0.05)_-10.66%,rgba(153,153,153,0.05)_67.22%)]
                backdrop-blur-[48.3px]"
            >
              <div className="flex justify-between">
                <p className="text-[#8B8BA0] text-base font-medium">Statistics</p>
                <div className="flex gap-x-2 items-center">
                  <span className="text-[#8B8BA0] text-base font-medium text-center">Period:</span>
                  <CustomSelector
                    options={[
                      { value: '30d', label: '30 d' },
                      { value: '90d', label: '90 d' }
                    ]}
                    selectedValue={isCross ? '30d' : '90d'}
                    onChange={(value) => setIsCross(value === '30d')}
                    className="border border-[#FFFFFF0F] rounded-md px-2 py-1"
                  />
                </div>
              </div>
              <div className="flex items-center gap-x-3 w-full">
                <div
                  className="grid grid-cols-3 gap-3 rounded-2xl border-2 border-white/10 w-[70%]
                p-4
                bg-[linear-gradient(179.1deg,rgba(255,255,255,0.05)_-10.66%,rgba(153,153,153,0.05)_67.22%)]
                backdrop-blur-[48.3px]"
                >
                  <div className="flex flex-col ">
                    <span>Uptime</span>
                    <span>99.98%</span>
                  </div>
                  <div className="flex flex-col">
                    <span>Global APR</span>
                    <span>3.11%</span>
                  </div>
                  <div className="flex flex-col ">
                    <span>Fee</span>
                    <span>0.05%</span>
                  </div>
                </div>
                =
                <div
                  className="gap-3 rounded-2xl border-2 border-white/10
                p-4 w-[25%]
                bg-[linear-gradient(179.1deg,rgba(255,255,255,0.05)_-10.66%,rgba(153,153,153,0.05)_67.22%)]
                backdrop-blur-[48.3px]"
                >
                  <div className="flex flex-col">
                    <span className="flex gap-x-1 text-base font-medium text-[#8B8BA0]">
                      Est. APY <Image src={InfoIcon} alt="" />
                    </span>
                    <span className="text-2xl font-medium">2.99%</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl border-2 border-white/10 text-base font-medium
                px-5 py-5 gap-4 
                bg-[linear-gradient(179.1deg,rgba(255,255,255,0.05)_-10.66%,rgba(153,153,153,0.05)_67.22%)]
                backdrop-blur-[48.3px]"
            >
              Rewards are accrued every minute and automatically added to your staked amount every
              day.
            </div>
            {isWalletConnected && (
              <>
                <div
                  className="rounded-2xl border-2 border-white/10 
                px-[20px] py-[16px] gap-4
                bg-[linear-gradient(179.1deg,rgba(255,255,255,0.05)_-10.66%,rgba(153,153,153,0.05)_67.22%)]
                backdrop-blur-[48.3px]"
                >
                  {/* Tabs */}
                  <div className="flex justify-between text-gray-400 text-[15px] font-medium mb-4 lg:px-10 px-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3.5 py-2 rounded-full transition-all duration-300 cursor-pointer ${
                          activeTab === tab
                            ? 'bg-[#FFFFFF0F] text-white font-semibold'
                            : 'text-[#8B8BA0] font-medium hover:text-white'
                        }`}
                      >
                        {tab}{' '}
                        {tab === 'Unstake Queue' &&
                          `${unstakeItems.length > 0 ? `(${unstakeItems.length})` : ''}`}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-md">
                    {activeTab === 'Reward History' && (
                      <RewardHistory rewardHistoryData={rewardHistoryData} />
                    )}
                    {activeTab === 'Unstake Queue' && <UnstakeQueue unstakeItems={unstakeItems} />}
                    {activeTab === 'Actions History' && (
                      <ActionsHistory actionHistoryData={actionHistoryData} />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <div
            className="rounded-2xl border-2 border-white/10 text-base font-medium w-full lg:w-[35%] max-w-[400px] 
                px-5 py-5 gap-4 space-y-4
                bg-[linear-gradient(179.1deg,rgba(255,255,255,0.05)_-10.66%,rgba(153,153,153,0.05)_67.22%)]
                backdrop-blur-[48.3px] h-fit"
          >
            {RightSideSection()}
          </div>
        </div>
      </div>
    </>
  )
}

export default StakeDetails
