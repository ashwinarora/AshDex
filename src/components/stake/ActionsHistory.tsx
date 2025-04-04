import Image from 'next/image'
import React, { useState } from 'react'
import SearchIcon from '@/assets/images/search_normal.svg'
import CheckBox from '../common/CheckBox'

const ActionsHistory = () => {
  const [show, setShow] = useState<boolean>(false)

  return (
    <div className="space-y-4">
      <div>
        <div
          className="flex  rounded-2xl border-2 border-white/10 justify-between
                    p-4
                    bg-[linear-gradient(179.1deg,rgba(255,255,255,0.05)_-10.66%,rgba(153,153,153,0.05)_67.22%)]
                    backdrop-blur-[48.3px] items-center"
        >
          <div className="flex gap-x-3 items-center w-full">
            <Image src={SearchIcon} alt="" />
            <input
              type="text"
              placeholder="Search..."
              className="w-[100%] focus:outline-none focus:ring-0"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <CheckBox label="Show auto-compounding" setIsChecked={setShow} isChecked={show} />
        <button className="text-sm text-[#7D67FF] font-medium">Export as CSV</button>
      </div>
    </div>
  )
}

export default ActionsHistory
