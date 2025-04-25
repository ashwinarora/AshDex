import React from 'react'
import { useToast } from '@/context/ToastContext'
import { REFERRALS_CLAIM_DESC } from '@/utils/constants'

interface ClaimProps {
  isCreateCode?: boolean
  totalClaim: number
}
function Claim({ isCreateCode, totalClaim }: ClaimProps) {
  const { showToast } = useToast()
  const handleSubmit = () => {
    setTimeout(() => {
      showToast(
        'success',
        'Claim Successful!',
        `You’ve successfully claimed $10. The funds have been added to your balance.`
      )
    }, 1000)
  }

  return (
    <div>
      {' '}
      {REFERRALS_CLAIM_DESC?.map((desc, index) => (
        <span
          key={index}
          className="font-medium mb-8 opacity-90 max-sm:text-sm text-base text-[#8B8BA0]"
        >
          {desc}
        </span>
      ))}
      <div
        className={`mt-2 flex items-center justify-between mb-2 w-full rounded-md py-2.5 focus:outline-none focus:none focus:none placeholder:text-[#8B8BA0] font-medium`}
      >
        <span className="text-base font-medium opacity-50 text-[#E8E0F1FF]">Claim in rewards</span>
        <span className="text-white font-medium text-lg">${totalClaim}</span>
      </div>
      <button
        disabled={totalClaim === 0}
        onClick={handleSubmit}
        className={`py-[10px] ${isCreateCode ? 'min-2xl:mt-22 mt-8' : 'mt-3 min-2xl:mt-8'} px[24px] tracking-[0em] disabled:opacity-50 disabled:bg-white/10 disabled:text-[#8B8BA0] font-bold rounded-xl w-full text-base bg-primary text-white cursor-pointer`}
      >
        {'Claim'}
      </button>
    </div>
  )
}

export default Claim
