'use client'
import React, { useState } from 'react'

interface TabsProps {
  tabs: string[]
  onTabSelect: (selectedTab: string) => void
}

const Tabs: React.FC<TabsProps> = ({ tabs, onTabSelect }) => {
  const [selectedTab, setSelectedTab] = useState(tabs[0])

  const handleTabClick = (tab: string) => {
    setSelectedTab(tab)
    onTabSelect(tab)
  }

  return (
    <div className="relative  ">
      <div className="flex space-x-8 justify-center items-center ">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`flex text-md font-medium cursor-pointer text-center  ${
              selectedTab === tab ? 'text-white border-b-2 py-2  border-primary' : 'text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Tabs
