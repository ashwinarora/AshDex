import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { REFERRALS_ENTERCODE_DESC } from '@/utils/constants'
import checkgreenicon from '@/assets/images/checkgreen_icon.svg'
import erroroutlineicon from '@/assets/images/erroroutline_icon.svg'
import successicon from '@/assets/images/success_icon.svg'

interface EnterCodeProps {
  isCreateCode?: boolean
}

function EnterCode({ isCreateCode }: EnterCodeProps) {
  const [code, setCode] = useState('')
  const [successType, setSuccessType] = useState<'success' | 'error'>()
  const [flag, setFlag] = useState(false)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

  const handleSubmit = () => {
    if (successType === 'success') {
      setFlag(true)
      const submitTimer = setTimeout(() => {
        setSuccessType(undefined)
        setCode('')
        setFlag(false)
      }, 3000)
      setTimer(submitTimer)
    }
  }

  const handleCodeChange = (value: string) => {
    setCode(value)
    setSuccessType(undefined)

    if (timer) clearTimeout(timer)
    const debounceTimer = setTimeout(() => {
      const isValid = value?.trim()?.toLowerCase() === 'abc123'
      if (isValid) {
        setSuccessType('success')
      } else if (value !== '') {
        setSuccessType('error')
      }
    }, 500)

    setTimer(debounceTimer)
  }

  useEffect(() => {
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [timer])

  return (
    <div>
      {flag ? (
        <div className="flex flex-col pt-12 gap-y-5 pb-3">
          <div className="flex justify-center">
            <Image src={successicon} alt="Success" width={48} height={48} />
          </div>
          <p className="text-white text-center text-base font-semibold">
            The code has been successfully applied
          </p>
        </div>
      ) : (
        <>
          {' '}
          {REFERRALS_ENTERCODE_DESC?.map((desc, index) => (
            <span
              key={index}
              className="font-medium mb-6 opacity-90 max-sm:text-sm text-base text-[#8B8BA0]"
            >
              {desc}
            </span>
          ))}
          <div>
            <input
              type="text"
              value={code}
              placeholder="Enter a code"
              onChange={(e) => handleCodeChange(e.target.value)}
              className={`mt-4 mb-2 w-full rounded-md text-sm bg-[rgba(255,255,255,0.06)] border-2 border-[rgba(255,255,255,0.06)] p-3 focus:outline-none focus:none focus:none placeholder:text-[#8B8BA0] font-medium`}
            />
            {successType && (
              <div
                className={`flex items-center gap-x-2 text-sm font-medium ${successType === 'success' ? 'text-[#2FA766]' : 'text-[#E2464A]'}`}
              >
                <Image
                  width={12}
                  height={12}
                  src={successType === 'success' ? checkgreenicon : erroroutlineicon}
                  alt={successType === 'success' ? 'Success' : 'Error'}
                  className="w-3 h-3"
                />
                {successType === 'success' ? 'Сode applied' : 'Code not found'}
              </div>
            )}
          </div>
          <button
            disabled={code === '' || successType === 'error'}
            onClick={handleSubmit}
            className={`py-[10px] ${isCreateCode ? 'min-2xl:mt-26 max-lg:mt-8 mt-16 max-sm:mt-6' : 'max-lg:mt-2 mt-12'} px[24px] tracking-[0em] disabled:opacity-50 disabled:bg-white/10 disabled:text-[#8B8BA0] font-bold rounded-xl w-full text-base bg-primary text-white cursor-pointer`}
          >
            {'Enter'}
          </button>
        </>
      )}
    </div>
  )
}

export default EnterCode
