'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import bridgingbtnlogo from '@/assets/images/bridge_icon.svg'
import BridgeModal from '../Bridge/BridgeModal'

const BridgeButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="nexon-button nexon-ghost flex items-center gap-2"
      >
        <Image
          height={20}
          width={20}
          src={bridgingbtnlogo}
          alt="bridgingbtnlogo"
          className="w-5 h-5"
        />
        Bridge
      </button>

      <BridgeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

export default BridgeButton
