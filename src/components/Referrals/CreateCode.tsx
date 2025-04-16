import React, { useRef, useState } from 'react'
import Image from 'next/image'
import { REFERRALS_CREATECODE_DESC } from '@/utils/constants'
import copyicon from '@/assets/images/copy_icon.svg'

interface CreateCodeProps {
  isCreateCode?: boolean
}

function CreateCode({ isCreateCode }: CreateCodeProps) {
  const [flag, setFlag] = useState(false)
  const [copiedRef, setCopiedRef] = useState<string | null>(null)
  const codeRef = useRef<HTMLSpanElement | null>(null)
  const handleSubmit = () => {
    setFlag(true)
  }

  const handleCopy = (ref: React.RefObject<HTMLSpanElement | null>, refName: string) => {
    if (ref.current) {
      const text = ref.current.innerText
      navigator.clipboard.writeText(text)
      setCopiedRef(refName)
      setTimeout(() => {
        setFlag(false)
        setCopiedRef(null)
      }, 2000)
    }
  }

  return (
    <div>
      {REFERRALS_CREATECODE_DESC?.map((desc, index) => (
        <span
          key={index}
          className="font-medium mb-8 opacity-90 max-sm:text-sm text-base text-[#8B8BA0]"
        >
          {desc}
        </span>
      ))}
      {flag ? (
        <div
          className={`mt-4 flex items-center justify-between mb-2 w-full rounded-md text-sm bg-[rgba(255,255,255,0.06)] border-2 border-[rgba(255,255,255,0.06)] py-2.5 pl-3 focus:outline-none focus:none focus:none placeholder:text-[#8B8BA0] font-medium`}
        >
          <span ref={codeRef}>43y5yuh3f34875jf</span>
          <button
            onClick={() => handleCopy(codeRef, 'code')}
            className="px-3 py-1 opacity-70 cursor-pointer"
          >
            <Image
              className={copiedRef === 'code' ? 'filter-green' : ''}
              height={16}
              width={16}
              src={copyicon}
              alt="Copy"
            />
          </button>
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          className={`py-[10px] ${isCreateCode ? 'min-2xl:mt-38 mt-22' : 'mt-16 min-2xl:mt-24'} px[24px] tracking-[0em] disabled:text-[#8B8BA0] font-bold rounded-xl w-full text-base bg-primary text-white cursor-pointer`}
        >
          {'Create'}
        </button>
      )}
    </div>
  )
}

export default CreateCode
