import React from 'react'
import Image from 'next/image'
import Modal from './Modal'
import erroricon from '@/assets/images/error_icon.svg'
import successicon from '@/assets/images/success_icon.svg'
import menuClose from '@/assets/images/close_icon.svg'

interface SuccessAndErrorModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  buttonLabel: string
  type?: string
  onButtonClick: () => void
  statusType?: 'success' | 'error'
  renderSuccessDetails?: () => React.ReactNode
}

const SuccessAndErrorModal: React.FC<SuccessAndErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  buttonLabel,
  onButtonClick,
  statusType,
  renderSuccessDetails,
  type
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        className="w-full max-w-md max-md:max-w-sm border-white/10 border-[2px] bg-[#0F0816] max-md:p-3 p-6 rounded-2xl shadow-lg 
      relative lg:static max-lg:fixed max-lg:bottom-4 max-lg:left-1/2 max-lg:-translate-x-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col">
          <div className="flex justify-end mb-8">
            <button
              onClick={onClose}
              className="p-2 bg-[#322944] rounded-3xl text-white/70 hover:text-white cursor-pointer"
            >
              <Image
                width={20}
                height={20}
                src={menuClose}
                alt="menuclose"
                className="w-[13px] h-[13px]"
              />
            </button>
          </div>
          <div className="flex flex-col items-center text-center">
            <Image
              src={statusType === 'success' ? successicon : erroricon}
              alt="status"
              style={{ width: 60, height: 'auto' }}
              className="mb-4"
            />
            <h2 className="text-white tracking-normal text-base font-semibold mb-1">{title}</h2>
            <p className="text-[#8B8BA0] font-normal text-sm mb-6">{description}</p>
            {statusType === 'success' && renderSuccessDetails ? (
              <>{renderSuccessDetails()}</>
            ) : statusType === 'error' && type === 'distribution' ? (
              <div className="flex items-center w-full gap-x-4">
                <button
                  onClick={onButtonClick}
                  className="text-[#8B8BA0] w-1/2 cursor-pointer hover:text-white font-medium text-sm"
                >
                  {buttonLabel}
                </button>
                <button
                  onClick={onButtonClick}
                  className="bg-[#5F46F9] w-1/2 text-white text-sm font-semibold p-2.5 rounded-lg md:rounded-xl cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <button
                onClick={onButtonClick}
                className="text-[#8B8BA0] cursor-pointer hover:text-white font-medium text-sm"
              >
                {buttonLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default SuccessAndErrorModal
