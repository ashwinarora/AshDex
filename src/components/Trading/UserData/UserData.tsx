"use client"

import { useState } from "react"
import Balances from "./Balances"
import Positions from "./Positions"
import OpenOrders from "./OpenOrders"

const tabs = ['Balance', 'Positions', 'Open Orders'] as const

const UserData = () => {
  const [activeTab, setActiveTab] = useState(0)
  return (
    <div className="w-full">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-x-8">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`py-4 px-1 text-center border-b-2 cursor-pointer ${
                activeTab === index
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-4">
        {activeTab === 0 && <div><Balances /></div>}
        {activeTab === 1 && <div><Positions /></div>}
        {activeTab === 2 && <div><OpenOrders /></div>}
      </div>
    </div>
  )
}

export default UserData