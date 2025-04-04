'use client'
import React from 'react'
import { useAccount } from 'wagmi'
import StakingCard from '../stake/StakingCard'
import StakingTable from '../stake/StakingTable'
import StakingInfo from '../stake/StakingInfo'

function Stakes() {
  const { isConnected } = useAccount()
  return (
    <div className="bg-[#0d021f] p-4 overflow-x-hidden">
      <div
        className={`w-full my-2 gap-5 max-[1315px]:px-1 ${
          isConnected ? 'px-10 grid grid-cols-1 lg:grid-cols-4' : 'flex justify-center items-center'
        }`}
      >
        <div className={`${isConnected ? 'lg:col-span-3 w-full' : 'w-1/2'}`}>
          <StakingCard />
          <StakingTable />
        </div>

        {isConnected && (
          <div className="lg:col-span-1 w-full">
            <StakingInfo />
          </div>
        )}
      </div>
    </div>
  )
}

export default Stakes
