'use client'
import Image from 'next/image'
import { useToast } from '../../context/ToastContext'
import successicon from '../../assets/images/success_icon.svg'
import erroricon from '../../assets/images/error_icon.svg'

const Toaster = () => {
  const { toasts } = useToast()
  return (
    <div className="absolute flex justify-end top-8 right-10 space-y-3 z-50">
      {toasts?.map((toast) => (
        <div
          key={toast.id}
          className={`p-5 rounded-xl w-[65%] shadow-md backdrop-blur-[40px] border border-white/10 flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-[#2FA76629]' : 'bg-[#E2464A29]'
          }`}
        >
          {toast?.type === 'success' && (
            <Image src={successicon} width={33} height={33} className="pr-2" alt="successicon" />
          )}
          {toast?.type === 'error' && (
            <Image src={erroricon} width={33} height={33} className="pr-2" alt="erroricon" />
          )}
          <div className="">
            <p className="font-medium text-lg text-white">{toast?.title}</p>
            <p className="text-sm font-medium mt-1.5 text-[#8B8BA0]">{toast?.message}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Toaster
