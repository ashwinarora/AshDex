import CheckBox from "@/components/common/CheckBox"

interface TPSLProps {
  tpsl: TPSLType,
  setTpsl: (tpsl: TPSLType) => void,
}

export type TPSLType = {
  isTpsl: boolean,
  takeProfit: number,
  stopLoss: number,
}

const TPSL = ({ tpsl, setTpsl }: TPSLProps) => {

  const setIsTpsl = (isTpsl: boolean) => {
    setTpsl({ ...tpsl, isTpsl })
  }

  return (
    <div>
      <CheckBox label="Take Profit / Stop Loss" isChecked={tpsl.isTpsl} setIsChecked={setIsTpsl} />
      {tpsl.isTpsl && (
        <div className="space-y-4 mt-4">
          <div className="flex flex-col">
            <label className="text-gray-300">Take Profit</label>
            <input
              type="number"
              className="mt-1 p-2 bg-gray-800 text-white border border-gray-600 rounded"
              value={tpsl.takeProfit}
              onChange={(e) => setTpsl({ ...tpsl, takeProfit: Number(e.target.value) })}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-300">Stop Loss</label>
            <input
              type="number"
              className="mt-1 p-2 bg-gray-800 text-white border border-gray-600 rounded"
              value={tpsl.stopLoss}
              onChange={(e) => setTpsl({ ...tpsl, stopLoss: Number(e.target.value) })}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default TPSL