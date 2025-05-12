import CheckBox from '@/components/common/CheckBox'

interface TPSLProps {
  tpsl: TPSLType
  setTpsl: (tpsl: TPSLType) => void
}

export type TPSLType = {
  isTpsl: boolean
  takeProfit: number
  stopLoss: number
}

const TPSL = ({ tpsl, setTpsl }: TPSLProps) => {
  const setIsTpsl = (isTpsl: boolean) => {
    setTpsl({ ...tpsl, isTpsl })
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <CheckBox
          label="Take Profit / Stop loss"
          isChecked={tpsl.isTpsl}
          setIsChecked={setIsTpsl}
        />
      </div>
      {tpsl.isTpsl && (
        <div className="flex flex-col gap-2 w-full">
          {/* Take Profit Row */}
          <div className="flex items-center gap-2 px-2 rounded-md w-full border border-white/10 bg-white/10 ">
            <span className="flex-1 text-xs text-[#8B8BA0] font-medium">Take Profit</span>
            <input
              type="number"
              className="w-[45%] py-1 text-right text-white text-sm font-semibold focus:outline-none"
              value={tpsl.takeProfit}
              onChange={(e) => setTpsl({ ...tpsl, takeProfit: Number(e.target.value) })}
              placeholder="0.00"
            />
          </div>
          <div className="flex items-center gap-2 px-2 rounded-md w-full border border-white/10 bg-white/10 ">
            <span className="flex-1 text-xs text-[#8B8BA0] font-medium">Stop Loss</span>
            <input
              type="number"
              className="w-[45%] py-1 text-right text-white text-sm font-semibold focus:outline-none"
              value={tpsl.stopLoss}
              onChange={(e) => setTpsl({ ...tpsl, stopLoss: Number(e.target.value) })}
              placeholder="0.00"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default TPSL
