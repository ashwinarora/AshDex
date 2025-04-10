'use client'
import React from 'react'
import UserData from '../Trading/UserData/UserData'

function TabsVaultsDetails() {
  return (
    <div
      className="border-2 bg-[#1A0B35] mt-4 border-white/10 rounded-xl backdrop-blur-[40px]"
      style={{
        background:
          'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
      }}
    >
      <UserData />
    </div>
  )
}

export default TabsVaultsDetails
