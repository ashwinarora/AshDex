'use client'
import { useState } from 'react'
import Image from 'next/image'
import successicon from '@/assets/images/success_icon.svg'
import { useReferralsInfo } from '@/hooks/useReferralsInfo'
import { useMutation } from '@tanstack/react-query'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useHyperliquid } from '@/store/HyperliquidStore'

function EnterCode() {
  const [code, setCode] = useState('')
  const { data: referral } = useReferralsInfo()
  const { sdkExchangeClient } = useHyperliquid()

  const { isAgentApproved, currentFeeApproval, openModal: openAgentModal } = useAgentApproval()

  const { mutate, isSuccess } = useMutation({
    mutationFn: async () => {
      if (!sdkExchangeClient) return
      const res = await sdkExchangeClient.setReferrer({
        code: code
      })
      if ('error' in res) {
        console.error(res.error)
      } else if ('ok' in res) {
        return res.ok
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
        <p className="font-medium text-white text-base text-center">
          You cannot enter a code after exceeding $10,000 in volume.
        </p>
      </div>
    )
  } else {
    if (isSuccess) {
      return (
        <div className="flex flex-col gap-y-5 pt-12 pb-3">
          <div className="flex justify-center">
            <Image src={successicon} alt="Success" style={{ width: 48, height: 'auto' }} />
          </div>
          <p className="font-semibold text-white text-base text-center">
            The code has been successfully applied
          </p>
        </div>
      )
    } else {
      return (
        <div>
          <span className="opacity-90 mb-6 font-medium text-[#8B8BA0] max-sm:text-sm text-base">
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
          {!isAgentApproved || currentFeeApproval === 0 ? (
            <button
              onClick={openAgentModal}
              className={`py-[10px] mt-12 px[24px] tracking-[0em] disabled:opacity-50 disabled:bg-white/10 disabled:text-[#8B8BA0] font-bold rounded-xl w-full text-base bg-primary text-white cursor-pointer`}
            >
              Establish Connection
            </button>
          ) : (
            <button
              disabled={code === ''}
              onClick={() => {
                if (!code.length) return
                mutate()
              }}
              className={`py-[10px] max-lg:mt-2 mt-12 px[24px] tracking-[0em] disabled:opacity-50 disabled:bg-white/10 disabled:text-[#8B8BA0] font-bold rounded-xl w-full text-base bg-primary text-white cursor-pointer`}
            >
              Enter
            </button>
          )}
        </div>
      )
    }
  }
}

export default EnterCode
