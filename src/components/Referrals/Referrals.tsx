'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import { useWalletModal } from '@/context/WalletModalContext'
import { useComponentRendered } from '@/hooks/useComponentRendered'
import { REFERRALSDATA, REFERRALS_DESC } from '@/utils/constants'
import ReferralsInfo from './ReferralsInfo'
import ReferralsTablesTab from './ReferralsTablesTab'
import { useScreenSize } from '@/hooks/useScreenSize'

function Referrals() {
  const { isConnected } = useAccount()
  const { isMobile } = useScreenSize()
  const { toggleConnectWalletModal } = useWalletModal()
  const [isCreateCode, setIsCreateCode] = useState(false)
  const isRendered = useComponentRendered()
  const handleButtonClick = () => {
    if (isConnected) {
      setIsCreateCode((p) => !p)
    } else {
      toggleConnectWalletModal()
      setIsCreateCode(false)
    }
  }

  if (!isRendered) return null

  if (isMobile)
    return (
      <div className="min-h-screen bg-secondary my-1">
        <div className="px-4 py-6">
          {/* Mobile Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Referrals
            </h1>
            <p className="text-gray-300 text-sm">Earn rewards by inviting friends to join Nexon</p>
          </div>

          {/* Mobile Content */}
          {isConnected ? (
            <div className="flex flex-col gap-6">
              {/* Mobile Stats Cards */}
              <div className="flex gap-4">
                <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                  <p className="text-gray-400 text-xs mb-1">Trades Referred</p>
                  <p className="text-xl font-bold text-white">0</p>
                </div>
                <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                  <p className="text-gray-400 text-xs mb-1">Rewards Earned</p>
                  <p className="text-xl font-bold text-white">$0</p>
                </div>
              </div>

              {/* Mobile Steps */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">How it works</h3>
                <div className="flex flex-col gap-4">
                  {REFERRALSDATA?.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <span className={`text-white text-sm ${item?.opacityClass || ''}`}>
                          {item?.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile CTA */}
              <button
                onClick={handleButtonClick}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg"
              >
                {isCreateCode ? 'View Referral Table' : 'Create Referral Code'}
              </button>

              {/* Mobile Referrals Info */}
              {isCreateCode && (
                <div className="mt-6">
                  <ReferralsInfo isCreateCode={isCreateCode} />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
              <p className="text-gray-400 text-sm mb-6">
                Connect your wallet to start earning referral rewards
              </p>
              <button
                onClick={handleButtonClick}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg"
              >
                Connect Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-secondary my-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Referral Program
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            Earn rewards by inviting friends to join Nexon. Share your referral code and start
            earning today.
          </p>
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          {/* Main Content */}
          <div className={`${isConnected ? 'xl:flex-[8]' : 'xl:flex-[12]'} w-full`}>
            {isConnected && isCreateCode ? (
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
                <ReferralsTablesTab />
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Hero Section with Steps */}
                <div className="bg-white/5 rounded-3xl border border-white/10 flex-1 p-8 lg:p-10 flex flex-col gap-6">
                  {REFERRALSDATA?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                        <Image
                          src={item.src}
                          alt={item.alt}
                          width={24}
                          height={24}
                          className="w-6 h-6"
                        />
                      </div>
                      <div className="flex-1">
                        <span
                          className={`text-lg font-semibold text-white ${item?.opacityClass || ''}`}
                        >
                          {item?.label}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-purple-400">{index + 1}</div>
                    </div>
                  ))}
                </div>

                {/* Description and CTA Section */}
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 lg:p-10 flex flex-col justify-between flex-1">
                  <div className="flex flex-col gap-6">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-4">
                        Earn Rewards and Unlock Discounts
                      </h2>
                      {REFERRALS_DESC?.map((desc, index) => (
                        <p key={index} className="text-gray-300 text-lg leading-relaxed mb-4">
                          {desc}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      onClick={handleButtonClick}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      {isConnected ? 'Create Referral Code' : 'Connect Wallet to Start'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          {isConnected && (
            <div className="xl:flex-[4]">
              <ReferralsInfo isCreateCode={isCreateCode} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Referrals
