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
        className={`w-full my-2 gap-5 max-2xl:px-1 ${
          isConnected && !isViewHistory
            ? 'px-10 grid grid-cols-1 lg:grid-cols-4'
            : 'flex justify-center items-center'
        }`}
      >
        <div className={`${isConnected && !isViewHistory ? 'lg:col-span-3 w-full' : 'w-1/2'}`}>
          {isViewHistory ? (
            <ViewHistory setIsViewHistory={setIsViewHistory} />
          ) : (
            <>
              <StakingCard />
              <StakingTable />
            </>
          )}
        </div>
        {isConnected && !isViewHistory && (
          <div className="lg:col-span-1 w-full">
            <StakingInfo setIsViewHistory={setIsViewHistory} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Stakes
