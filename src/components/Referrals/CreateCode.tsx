import React, { useState } from 'react'
import { REFERRALS_CREATECODE_DESC } from '@/utils/constants'
import { useReferralsInfo } from '@/hooks/useReferralsInfo'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useAccount } from 'wagmi'
import { splitSignature } from '@/utils/utils'
import { toast } from 'react-toastify'
import { agentTypes, getActionHash, phantomDomain } from '@/utils/hyperliquid/PlaceOrder'
import { Hex } from 'viem'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { hyperliquidAxios } from '@/config/axios'
import { isTestnet } from '@/utils/constants'
import { useShallow } from 'zustand/react/shallow'

function CreateCode() {
  const [createdCode, setCreatedCode] = useState('')
  const { data: referral } = useReferralsInfo()
  const { isAgentApproved, currentFeeApproval, openModal: openAgentModal } = useAgentApproval()
  const { chainId } = useAccount()
  const { agentWallet } = useHyperliquidStore(
    useShallow((state) => ({
      agentWallet: state.agentWallet
    }))
  )

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
              ? `$${Number(eligibleAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '$0.00'}
          </p>
        </div>
      </div>
    )
  } else if (referral?.referrerState.stage === 'needToCreateCode') {
    return (
      <div>
        <div className={`flex mt-3 flex-row w-full justify-between items-center`}>
          <p className="text-[#8B8BA0] font-medium text-base">
            This referral code is permanent and unique to you. Choose wisely.
          </p>
        </div>
        <input
          type="text"
          value={createdCode}
          className=" text-white w-full border-2 border-[rgba(255,255,255,0.06)] py-2.5 pl-3 focus:outline-none placeholder:text-[#8B8BA0] font-medium"
          onChange={(e) => setCreatedCode(e.target.value.toUpperCase())}
          placeholder="Create a referral code"
        />
        {!isAgentApproved || currentFeeApproval === 0 ? (
          <button
            onClick={openAgentModal}
            className={`py-[10px] mt-12 px[24px] tracking-[0em] disabled:opacity-50 disabled:bg-white/10 disabled:text-[#8B8BA0] font-bold rounded-xl w-full text-base bg-primary text-white cursor-pointer`}
          >
            Establish Connection
          </button>
        ) : (
          <button
            onClick={async () => {
              const toastId = toast.loading('Registering Referral…')
              try {
                if (!chainId) return
                if (!createdCode.length) return
                if (!agentWallet) return
                const action = {
                  code: createdCode,
                  type: 'registerReferrer'
                }
                const nonce = Date.now()
                const hash = getActionHash(action, null, nonce) as Hex
                const sign = await agentWallet.signTypedData({
                  domain: phantomDomain,
                  types: agentTypes,
                  primaryType: 'Agent',
                  message: {
                    source: isTestnet ? 'b' : 'a',
                    connectionId: hash
                  }
                })
                const splitSig = splitSignature(sign)
                const res = await hyperliquidAxios.post('/exchange', {
                  action,
                  nonce,
                  signature: splitSig,
                  isFrontend: true
                })
                if (res.data.status === 'err') {
                  toast.update(toastId, {
                    render: '❌' + res.data.response,
                    type: 'error',
                    isLoading: false,
                    autoClose: 2000
                  })
                } else {
                  toast.update(toastId, {
                    render: '✅ Referral code created successfully',
                    type: 'success',
                    isLoading: false,
                    autoClose: 2000
                  })
                  setCreatedCode('')
                }
              } catch (error) {
                console.log(error)
                toast.update(toastId, {
                  render: '❌' + error,
                  type: 'error',
                  isLoading: false,
                  autoClose: 2000
                })
              }
            }}
            className={`py-[10px]  mt-16 min-2xl:mt-16 px[24px] tracking-[0em] disabled:text-[#8B8BA0] font-bold rounded-xl w-full text-base bg-primary text-white cursor-pointer`}
          >
            {'Create'}
          </button>
        )}
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
