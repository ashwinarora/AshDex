'use client'
import React from 'react'
// import { useComponentRendered } from '@/hooks/useComponentRendered'
import ReferralsTablesTab from './ReferralsTablesTab'
import { useScreenSize } from '@/hooks/useScreenSize'
import ReferralsHeader from './ReferralsHeader'
import FooterCompact from '../FooterCompact'
import ReferralStats from './ReferralStats'

function Referrals() {
  const { isMobile } = useScreenSize()
  // const isRendered = useComponentRendered()

  // if (!isRendered) return null

  if (isMobile)
    return (
      // <div className="min-h-screen bg-secondary my-1">
      //   <div className="px-4 py-6">
      //     {/* Mobile Header */}
      //     <div className="mb-6">
      //       <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
      //         Referrals
      //       </h1>
      //       <p className="text-gray-300 text-sm">Earn rewards by inviting friends to join Nexon</p>
      //     </div>

      //     {/* Mobile Content */}
      //     {isConnected ? (
      //       <div className="flex flex-col gap-6">
      //         {/* Mobile Stats Cards */}
      //         <div className="flex gap-4">
      //           <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
      //             <p className="text-gray-400 text-xs mb-1">Trades Referred</p>
      //             <p className="text-xl font-bold text-white">0</p>
      //           </div>
      //           <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
      //             <p className="text-gray-400 text-xs mb-1">Rewards Earned</p>
      //             <p className="text-xl font-bold text-white">
      //               {rewardsStats?.totalReferralRewardsGenerated.toString() || '0'}
      //             </p>
      //           </div>
      //         </div>

      //         {/* Mobile Steps */}
      //         <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      //           <h3 className="text-lg font-semibold text-white mb-4">How it works</h3>
      //           <div className="flex flex-col gap-4">
      //             {REFERRALSDATA?.map((item, index) => (
      //               <div key={index} className="flex items-center gap-3">
      //                 <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
      //                   {index + 1}
      //                 </div>
      //                 <div className="flex-1">
      //                   <span className={`text-white text-sm ${item?.opacityClass || ''}`}>
      //                     {item?.label}
      //                   </span>
      //                 </div>
      //               </div>
      //             ))}
      //           </div>
      //         </div>

      //         {/* Mobile CTA */}
      //         <button
      //           onClick={handleButtonClick}
      //           className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg"
      //         >
      //           {isCreateCode ? 'View Referral Table' : 'Create Referral Code'}
      //         </button>

      //         {/* Mobile Referrals Info */}
      //         {isCreateCode && (
      //           <div className="mt-6">
      //             <ReferralsActionPanel />
      //           </div>
      //         )}
      //       </div>
      //     ) : (
      //       <div className="text-center py-12">
      //         <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
      //           <svg
      //             className="w-10 h-10 text-white"
      //             fill="none"
      //             stroke="currentColor"
      //             viewBox="0 0 24 24"
      //           >
      //             <path
      //               strokeLinecap="round"
      //               strokeLinejoin="round"
      //               strokeWidth={2}
      //               d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      //             />
      //           </svg>
      //         </div>
      //         <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
      //         <p className="text-gray-400 text-sm mb-6">
      //           Connect your wallet to start earning referral rewards
      //         </p>
      //         <button
      //           onClick={handleButtonClick}
      //           className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg"
      //         >
      //           Connect Wallet
      //         </button>
      //       </div>
      //     )}
      //   </div>
      // </div>
      <div></div>
    )

  return (
    <div className="w-full h-dvh text-white/70 overflow-hidden flex items-center justify-center">
      <div className="w-4/5 h-4/5 flex flex-col overflow-hidden">
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
