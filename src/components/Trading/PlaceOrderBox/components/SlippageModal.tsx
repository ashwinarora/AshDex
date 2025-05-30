import React from 'react'
import SmallModal from '@/components/common/SmallModal'

interface SlippageModalProps {
  isOpen: boolean
  onClose: () => void
  slippage: number
  setSlippage: (value: number) => void
}

const SlippageModal: React.FC<SlippageModalProps> = ({
  isOpen,
  onClose,
  slippage,
  setSlippage
}) => {
  return (
    <SmallModal isOpen={isOpen} onClose={onClose} heading="Slippage Tolerance">
      <div className="text-white">
        <p className="mb-4 text-sm text-[#E8E0F1]">
          Max slippage only affects market orders placed from the order form. Closing positions will
          use max slippage of 8% and market TP/SL orders will use max slippage of 10%.
        </p>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.1"
              max="100"
              step="0.1"
              value={slippage}
              onChange={(e) => setSlippage(Number(e.target.value))}
              className="flex-1 h-2 bg-[#251B3A] rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #5F46F9 0%, #5F46F9 ${(slippage / 100) * 100}%, #251B3A ${(slippage / 100) * 100}%, #251B3A 100%)`
              }}
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0.1"
                max="100"
                step="0.1"
                value={slippage}
                onChange={(e) => setSlippage(Number(e.target.value))}
                className="w-20 bg-[#322944] text-white rounded px-2 py-1 text-right"
              />
              <span className="text-[#E8E0F1]">%</span>
            </div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 5, 10, 20].map((value) => (
              <button
                key={value}
                onClick={() => setSlippage(value)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  slippage === value
                    ? 'bg-[#5F46F9] text-white'
                    : 'bg-[#322944] text-[#E8E0F1] hover:bg-[#3D2F5A]'
                }`}
              >
                {value}%
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg text-sm font-medium bg-[#5F46F9] text-white hover:bg-[#4F3BC9] transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </SmallModal>
  )
}

export default SlippageModal
