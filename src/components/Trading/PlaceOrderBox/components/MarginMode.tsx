import React from 'react'

interface MarginModeProps {
  isCross: boolean
  setIsCross: React.Dispatch<React.SetStateAction<boolean>>
}

const MarginMode = ({ setIsCross, isCross }: MarginModeProps) => {
  return (
    <div className="flex items-center justify-between px-3 py-1 mx-3 border rounded-md border-white/10">
      <p className="text-xs font-medium text-white/50">Margin Mode</p>
      <div className="flex rounded-lg">
        <button
          className={`px-4 py-1 rounded-md cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none ${isCross ? 'bg-primary text-white' : 'bg-transparent text-[#8B8BA0]'}`}
          onClick={() => setIsCross(true)}
          type="button"
        >
          Cross
        </button>
        <button
          className={`px-4 py-1 cursor-pointer rounded-md text-xs font-semibold transition-colors duration-150 focus:outline-none ${!isCross ? 'bg-primary text-white' : 'bg-transparent text-[#8B8BA0]'}`}
          onClick={() => setIsCross(false)}
          type="button"
        >
          Isolated
        </button>
      </div>
    </div>
  )
}

export default MarginMode
