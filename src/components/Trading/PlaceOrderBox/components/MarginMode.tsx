import React from 'react'

interface MarginModeProps {
  isCross: boolean
  setIsCross: React.Dispatch<React.SetStateAction<boolean>>
}

const MarginMode = ({ setIsCross, isCross }: MarginModeProps) => {
  return (
    <div className="px-4 border-b border-[#FFFFFF0F] mb-1">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-300 font-medium">Margin Mode:</span>
        <div className="flex bg-[#18122B] border border-[#2A1B3D] rounded-lg overflow-hidden">
          <button
            className={`px-4 py-1 cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none ${isCross ? 'bg-[#ffffff30] text-white' : 'bg-transparent text-[#8B8BA0]'}`}
            onClick={() => setIsCross(true)}
            type="button"
          >
            Cross
          </button>
          <button
            className={`px-4 py-1 cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none ${!isCross ? 'bg-[#ffffff30] text-white' : 'bg-transparent text-[#8B8BA0]'}`}
            onClick={() => setIsCross(false)}
            type="button"
          >
            Isolated
          </button>
        </div>
      </div>
    </div>
  )
}

export default MarginMode
