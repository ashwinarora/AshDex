'use client'
import React from 'react'
import Image from 'next/image'
import bridgingbtnlogo from '@/assets/images/bridge_icon.svg'

const BridgeButton = () => {
  return (
    <button
      onClick={() =>
        window.open(
          'https://app.debridge.finance/?inputChain=1&outputChain=998&inputCurrency=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48&outputCurrency=0xaf88d065e77c8cc2239327c5edb3a432268e5831&dlnMode=simple',
          '_blank'
        )
      }
      className="nexon-button nexon-ghost   "
    >
      <Image
        height={20}
        width={20}
        src={bridgingbtnlogo}
        alt="bridgingbtnlogo"
        className="w-5 h-5 2xl:mr-2"
      />
      Bridge
    </button>
  )
}

export default BridgeButton
