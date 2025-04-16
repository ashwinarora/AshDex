'use client'
import React from 'react'
import { useAccount } from 'wagmi'
import ReferralsInfo from './ReferralsInfo'
import ReferralsTablesTab from './ReferralsTablesTab'

function Referrals() {
  const { isConnected } = useAccount()

  return (
    <div className="w-full my-6 px-4 md:px-9 gap-5 max-2xl:px-1 grid grid-cols-1 lg:grid-cols-4">
      <div
        style={{
          background:
            'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
        }}
        className={`${isConnected ? 'lg:col-span-3' : 'lg:col-span-4'} rounded-xl backdrop-blur-[48.3px] w-full`}
      >
        <ReferralsTablesTab />
      </div>
      {isConnected && (
        <div className="lg:col-span-1 w-full">
          <ReferralsInfo />
        </div>
      )}
    </div>
  )
}

export default Referrals
