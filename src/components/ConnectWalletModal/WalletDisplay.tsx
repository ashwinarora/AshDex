'use client'
import React from 'react'
import Image, { StaticImageData } from 'next/image'
import metamask from '@/assets/images/metamask.svg'
import verifiedicon from '@/assets/images/verified_icon.svg'
import { IconAlertCircle, IconLoader } from '@tabler/icons-react'
import { useAccount } from 'wagmi'

interface WalletDisplayProps {
  name: string
  icon: StaticImageData | string
  onBack: () => void
  hasAgreedToRules: boolean
  onClose: () => void
}

const WalletDisplay: React.FC<WalletDisplayProps> = ({
  name,
  icon,
  onBack,
  hasAgreedToRules,
  onClose
}) => {
  const { status } = useAccount()
  const isConnecting = status === 'connecting'
  const isDisconnected = status === 'disconnected'
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
          ${isDisconnected ? 'opacity-50' : 'hover:bg-[#322944]'}`}
              disabled={isDisconnected}
            >
              <Image
                src={name === 'Metamask' ? metamask : icon}
                alt={name}
                style={{ width: 80, height: 80 }}
                className={`transition-all duration-300 ${isDisconnected ? 'grayscale' : ''}`}
              />
              <div className="text-white/50 font-medium mt-4 text-md">
                {name} {['Trust Wallet', 'Rabby Wallet'].includes(name) ? '' : 'Wallet'}
              </div>
            </button>
            <div className="flex py-4 justify-center items-center border-t border-[#33293B] gap-2">
              {isConnecting && (
                <>
                  <IconLoader className="w-5 h-5 animate-spin text-white/50" />
                  <div className="text-white/50 text-sm">Waiting for connection...</div>
                </>
              )}
              {isDisconnected && (
                <>
                  <IconAlertCircle className="w-5 h-5 text-red" />
                  <div className="text-red text-sm">Connection failed</div>
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
