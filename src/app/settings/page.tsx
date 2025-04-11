'use client'
import React from 'react'
import Tabs from '@/components/common/Tabs'

const SettingsPage = () => {
  return (
    <div className="p-4 sm:p-8 min-h-screen text-white">
      <div className="max-w-4xl mx-auto nexon-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-8">
          <Tabs tabs={['Account', 'Security', 'Sessions']} onTabSelect={() => {}} />
          <button className="bg-primary text-white rounded-xl px-3 py-2 mt-4 sm:mt-0 hover:bg-opacity-90">
            Save Changes
          </button>
        </div>
        <div className="py-4">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 mr-4"></div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">nickname</h2>
              <p className="text-xs sm:text-sm text-gray-400">0x5d8219...8AeE7</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="nexon-rounded-xl nexon-card p-4">
              <p className="text-sm text-gray-400">IP</p>
              <p className="text-lg font-bold">123456789</p>
            </div>
            <div className="nexon-rounded-xl nexon-card p-4">
              <p className="text-sm text-gray-400">Last login time</p>
              <p className="text-lg font-bold">PC | 2025-04-03 09:07</p>
            </div>
            <div className="nexon-rounded-xl nexon-card p-4">
              <p className="text-sm text-gray-400">Security Level</p>
              <p className="text-lg font-bold text-red-500">Low</p>
            </div>
          </div>
          <div className="mb-6 w-full sm:w-max">
            <p className="text-sm text-gray-400">Language</p>
            <select className="nexon-rounded-sm nexon-card p-2 w-full sm:w-max mt-2">
              <option>English</option>
            </select>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Session Management</h3>
            <div className="nexon-rounded-xl nexon-card p-4 flex justify-between items-center mb-2">
              <p>PC | 2025-04-03 09:07</p>
              <button className="nexon-button nexon-rounded-xl py-1 px-3 hover:bg-opacity-90">
                End session
              </button>
            </div>
            <div className="nexon-rounded-xl nexon-card p-4 flex justify-between items-center mb-2">
              <p>PC | 2025-04-03 09:07</p>
              <button className="nexon-button nexon-rounded-xl py-1 px-3 hover:bg-opacity-90">
                End session
              </button>
            </div>
            <div className="nexon-rounded-xl nexon-card p-4 flex justify-between items-center">
              <p>PC | 2025-04-03 09:07</p>
              <button className="nexon-button nexon-rounded-xl py-1 px-3 hover:bg-opacity-90">
                End session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
