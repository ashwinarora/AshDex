'use client'
import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import StakingCard from '../Stake/StakingCard'
import StakingTable from '../Stake/StakingTable'
import StakingInfo from '../Stake/StakingInfo'
import ViewHistory from '../Stake/ViewHistory'

function Stakes() {
  const { isConnected } = useAccount()
  const [isViewHistory, setIsViewHistory] = useState(false)

  return (
    <div className="bg-[#0d021f] p-4 overflow-x-hidden">
      <div
        className={`w-full my-2 gap-5 max-[1315px]:px-1 ${
          isConnected && !isViewHistory
            ? 'px-10 grid grid-cols-1 lg:grid-cols-4'
            : 'flex justify-center items-center'
        }`}
      >
        {isViewHistory ? (
          <div className="w-1/2">
            <ViewHistory setIsViewHistory={setIsViewHistory} />
          </div>
        ) : (
          <>
            <div className={`${isConnected ? 'lg:col-span-3 w-full' : 'w-1/2'}`}>
              <StakingCard />
              <StakingTable />
            </div>

            {isConnected && (
              <div className="lg:col-span-1 w-full">
                <StakingInfo setIsViewHistory={setIsViewHistory} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Stakes
