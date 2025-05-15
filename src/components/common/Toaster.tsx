'use client'
import Image from 'next/image'
import { useToast } from '../../context/ToastContext'
import successicon from '../../assets/images/success_icon.svg'
import erroricon from '../../assets/images/error_icon.svg'

const Toaster = () => {
  const { toasts } = useToast()

  return (
    <div className="fixed z-[999] sm:top-8 sm:right-10 sm:space-y-3 sm:flex sm:flex-col max-sm:bottom-5 max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:w-full max-sm:px-4 max-sm:space-y-3 flex flex-col items-end sm:items-end max-sm:items-center">
      {toasts?.map((toast) => (
        <div
          key={toast.id}
          className={`p-5 rounded-xl shadow-md backdrop-blur-[40px] border border-white/10 flex items-center gap-2
            ${toast.type === 'success' ? 'bg-[#2FA76629]' : 'bg-[#E2464A29]'}
            sm:w-[65%] max-sm:w-full
          `}
        >
          {toast?.type === 'success' && (
            <Image
              src={successicon}
              style={{ width: 33, height: 'auto' }}
              className="pr-2"
              alt="successicon"
            />
          )}
          {toast?.type === 'error' && (
            <Image
              src={erroricon}
              style={{ width: 33, height: 'auto' }}
              className="pr-2"
              alt="erroricon"
            />
          )}
          <div>
            <p className="font-medium text-lg text-white">{toast?.title}</p>
            <p className="text-sm font-medium mt-1.5 text-[#8B8BA0]">{toast?.message}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Toaster
