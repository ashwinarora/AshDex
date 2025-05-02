'use client'
import React from 'react'
import Image, { StaticImageData } from 'next/image'
import { Loader2, AlertCircle } from 'lucide-react'
import metamask from '@/assets/images/metamask.svg'
import verifiedicon from '@/assets/images/verified_icon.svg'

interface WalletDisplayProps {
  name: string
  icon: StaticImageData | string
  onBack: () => void
  isWalletConnected: boolean | null
  hasAgreedToRules: boolean
  onClose: () => void
}

const WalletDisplay: React.FC<WalletDisplayProps> = ({
  name,
  icon,
  onBack,
  isWalletConnected,
  hasAgreedToRules,
  onClose
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-secondary rounded-2xl shadow-lg">
      <div className="w-full border border-[#33293B] items-center justify-center bg-[#1c1624] rounded-xl cursor-pointer">
        {hasAgreedToRules ? (
          <div className="py-4 mt-10 mb-12 text-center w-full flex flex-col items-center justify-center rounded-xl">
            <Image src={verifiedicon} alt={name} style={{ width: 100, height: 100 }} />
            <div className="text-white font-medium mt-4 text-lg">Wallet connected!</div>
            <div className="text-white w-[70%] opacity-70 font-light mt-2 text-sm">
              You&apos;re ready to deposit, trade, and manage your assets.
            </div>
          </div>
        ) : (
          <>
            <button
              className={`py-4 my-14 text-center w-full flex flex-col items-center justify-center rounded-xl
          ${isWalletConnected === false ? 'opacity-50' : 'hover:bg-[#322944]'}`}
              disabled={isWalletConnected === false}
            >
              <Image
                src={name === 'Metamask' ? metamask : icon}
                alt={name}
                style={{ width: 80, height: 80 }}
                className={`transition-all duration-300 ${
                  isWalletConnected === false ? 'grayscale' : ''
                }`}
              />
              <div className="text-[#E8E0F1] font-medium mt-4 text-md">
                {name} {['Trust Wallet', 'Rabby Wallet'].includes(name) ? '' : 'Wallet'}
              </div>
            </button>
            <div className="flex py-4 justify-center items-center border-t border-[#33293B] gap-2">
              {isWalletConnected === null && (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#E8E0F1]" />
                  <div className="text-[#E8E0F1] text-sm">Waiting for connection...</div>
                </>
              )}
              {isWalletConnected === false && (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <div className="text-[#E2464A] text-sm">Connection failed</div>
                </>
              )}
            </div>
          </>
        )}
      </div>
      {hasAgreedToRules ? (
        <button
          className="w-full py-3 mt-5 font-bold text-md rounded-xl text-white bg-primary cursor-pointer"
          onClick={onClose}
        >
          Let&apos;s Go!
        </button>
      ) : (
        <button
          onClick={onBack}
          className="w-full px-5 mt-4 text-sm font-bold py-3 text-white bg-[#1c1624] hover:bg-[#36303b] rounded-xl cursor-pointer text-center"
        >
          Choose another Wallet
        </button>
      )}
    </div>
  )
}

export { WalletDisplay }
