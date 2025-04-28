'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import successicon from '@/assets/images/success_icon.svg'
import { useReferralsInfo } from '@/hooks/useReferralsInfo'
import { useMutation } from '@tanstack/react-query'
import { useHyperLiquid } from '@/context/HyperLiquid'

function EnterCode() {
  const [code, setCode] = useState('')
  const { data: referral } = useReferralsInfo()
  const { sdk } = useHyperLiquid()

  const { mutate, isSuccess } = useMutation({
    mutationFn: async () => {
      const res = await sdk.exchange.setReferrer(code)
      console.log(res)
      if (res.status === 'err') {
        throw new Error(res)
      }
      return res
    }
  })

  if (
    referral?.referrerState.stage === 'needToCreateCode' ||
    referral?.referrerState.stage === 'ready'
  ) {
    return (
      <div className="flex flex-col justify-center gap-y-4 py-12">
        <p className="text-white text-center text-base font-medium">
          You cannot enter a code after exceeding $10,000 in volume.
        </p>
      </div>
    )
  } else {
    if (isSuccess) {
      return (
        <div className="flex flex-col pt-12 gap-y-5 pb-3">
          <div className="flex justify-center">
            <Image src={successicon} alt="Success" width={48} height={48} />
          </div>
          <p className="text-white text-center text-base font-semibold">
            The code has been successfully applied
          </p>
        </div>
      )
    } else {
      return (
        <div>
          <span className="font-medium mb-6 opacity-90 max-sm:text-sm text-base text-[#8B8BA0]">
            This will allow you to earn bonuses or other rewards offered by the program. Simply copy
            and paste the code into this field.
          </span>
          <div>
            <input
              type="text"
              value={code}
              placeholder="Enter a code"
              onChange={(e) => setCode(e.target.value)}
              className={`mt-4 mb-2 w-full rounded-md text-sm bg-[rgba(255,255,255,0.06)] border-2 border-[rgba(255,255,255,0.06)] p-3 focus:outline-none focus:none focus:none placeholder:text-[#8B8BA0] font-medium`}
            />
          </div>
          <button
            disabled={code === ''}
            onClick={() => {
              if (!code.length) return
              mutate()
            }}
            className={`py-[10px] max-lg:mt-2 mt-12 px[24px] tracking-[0em] disabled:opacity-50 disabled:bg-white/10 disabled:text-[#8B8BA0] font-bold rounded-xl w-full text-base bg-primary text-white cursor-pointer`}
          >
            {'Enter'}
          </button>
        </div>
      )
    }
  }
}

export default EnterCode
