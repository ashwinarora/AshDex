import React, { useState } from 'react'
import { REFERRALS_CREATECODE_DESC } from '@/utils/constants'
import { useReferralsInfo } from '@/hooks/useReferralsInfo'
import { useHyperLiquid } from '@/context/HyperLiquid'

function CreateCode() {
  const [createdCode, setCreatedCode] = useState('')
  const { data: referral, refetch: refetchReferral } = useReferralsInfo()
  const { sdk } = useHyperLiquid()

  if (referral?.referrerState.stage === 'needToTrade') {
    const eligibleAmount = referral.referrerState.data.required
    return (
      <div>
        <span className="font-medium mb-8 opacity-90 max-sm:text-sm text-base text-[#8B8BA0]">
          {REFERRALS_CREATECODE_DESC}
        </span>
        <div className={`flex mt-3 flex-row w-full justify-between items-center`}>
          <p className="text-[#8B8BA0] font-medium text-base">
            Create a referral code after trading
          </p>
          <p className="text-white text-base font-bold">
            {eligibleAmount
              ? `$${Number(eligibleAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '$0.00'}
          </p>
        </div>
      </div>
    )
  } else if (referral?.referrerState.stage === 'needToCreateCode') {
    return (
      <div>
        <input
          type="text"
          value={createdCode}
          className=" text-white w-full border-2 border-[rgba(255,255,255,0.06)] py-2.5 pl-3 focus:outline-none placeholder:text-[#8B8BA0] font-medium"
          onChange={(e) => setCreatedCode(e.target.value.toUpperCase())}
          placeholder="Create a referral code"
        />
        <button
          onClick={async () => {
            try {
              const res = await sdk.exchange.setReferrer(createdCode)
              await refetchReferral()
              console.log('res', res)
            } catch (error) {
              console.log(error)
            }
          }}
          className={`py-[10px]  mt-16 min-2xl:mt-16 px[24px] tracking-[0em] disabled:text-[#8B8BA0] font-bold rounded-xl w-full text-base bg-primary text-white cursor-pointer`}
        >
          {'Create'}
        </button>
      </div>
    )
  } else if (referral?.referrerState.stage === 'ready') {
    const code = referral.referrerState.data.code
    return (
      <div className="flex flex-col items-center">
        <p className="text-[#8B8BA0] font-medium text-base mb-4">Your referral code is:</p>
        <p className="text-white text-2xl font-bold mb-6">{code}</p>
        <button
          className="py-[10px] px-[24px] tracking-[0em] font-bold rounded-xl bg-primary text-white text-base cursor-pointer"
          onClick={() => navigator.clipboard.writeText(code)}
        >
          Copy Code
        </button>
      </div>
    )
  }
}

export default CreateCode
