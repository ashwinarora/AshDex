import { IconArrowRight, IconChevronDown, IconSearch, IconX } from '@tabler/icons-react'
import React, { useState } from 'react'
import Image from 'next/image'

function BridgeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedToChain, setSelectedToChain] = useState('Ethereum')
  const [selectedToToken, setSelectedToToken] = useState('USDT')
  const [isToChainOpen, setIsToChainOpen] = useState(false)

  const [selectedFromChain, setSelectedFromChain] = useState('Ethereum')
  const [selectedFromToken, setSelectedFromToken] = useState('USDT')

  const [isFromChainOpen, setIsFromChainOpen] = useState(false)
  const [isFromTokenOpen, setIsFromTokenOpen] = useState(false)
  const [isToTokenOpen, setIsToTokenOpen] = useState(false)
  return (
    <div
      className={`${isOpen ? 'block' : 'hidden'} absolute top-0 left-0 w-full h-full bg-black/50`}
    >
      <div className="min-h-screen flex items-center justify-center bg-secondary/50 backdrop-blur-3xl filter  p-6">
        <div className="flex flex-col bg-secondary  max-w-full min-w-lg p-6 rounded-3xl border-2 border-white/5 gap-4">
          {/* Header */}
          <div className="flex justify-between items-center ">
            <h2 className="text-white text-2xl  ">Bridging</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <IconX className="w-8 h-8 p-1.5 cursor-pointer rounded-full bg-white/5" />
            </button>
          </div>

          <div className="flex flex-col border-2 border-white/5   bg-white/5 rounded-2xl">
            {/* Pay Section */}
            <div className="  p-4">
              <div className="flex justify-between items-center">
                <p className="text-white text-sm mb-2">You Pay</p>
                <p className="text-right text-white/30 text-sm font-light">
                  Balance: 1,384.93 USDT
                </p>
              </div>

              <div className="flex items-center   mb-2 gap-2">
                <div
                  onClick={() => setIsFromChainOpen(!isFromChainOpen)}
                  className=" flex items-center gap-2 cursor-pointer p-2 rounded-md bg-white/5 border-2 border-white/5  "
                >
                  <DynamicDropdown
                    selectedValue={selectedFromChain}
                    setSelectedValue={setSelectedFromChain}
                    isOpen={isFromChainOpen}
                    setIsOpen={setIsFromChainOpen}
                    type="chain"
                  />
                  <IconChevronDown className="w-4 h-4" />
                </div>
                <div className=" flex items-center gap-2 cursor-pointer px-2 rounded-md bg-white/5 border-2 border-white/5  ">
                  <div
                    onClick={() => setIsFromTokenOpen(!isFromTokenOpen)}
                    className="flex items-center gap-2  h-full  px-2"
                  >
                    <DynamicDropdown
                      selectedValue={selectedFromToken}
                      setSelectedValue={setSelectedFromToken}
                      isOpen={isFromTokenOpen}
                      setIsOpen={setIsFromTokenOpen}
                      type="token"
                      selectedChain={selectedFromChain}
                    />
                    <IconChevronDown className="w-4 h-4" />
                  </div>

                  <input
                    type="number"
                    placeholder="0"
                    className="border-l-2 px-4 border-white/5 flex-1 outline-none  rounded-none ring-0 active:outline-none  active:ring-offset-0  text-left text-white p-2  placeholder-white/30"
                  />
                  <button className="border bg-white/5 border-white/20 rounded-md p-2 py-1 text-white/50 hover:bg-white/10 cursor-pointer text-xs text-center items-center justify-center">
                    MAX
                  </button>
                </div>
              </div>
            </div>

            <hr className="border-white/5" />
            {/* Receive Section */}
            <div className="  p-4">
              <div className="flex justify-between items-center">
                <p className="text-white text-sm mb-2">You Receive</p>
                <p className="text-right text-white/30 text-sm font-light">
                  Balance: 1,384.93 USDT
                </p>
              </div>

              <div className="flex items-center   mb-2 gap-2">
                <div
                  onClick={() => setIsToChainOpen(!isToChainOpen)}
                  className=" flex items-center gap-2 cursor-pointer p-2 rounded-md bg-white/5 border-2 border-white/5  "
                >
                  <DynamicDropdown
                    selectedValue={selectedToChain}
                    setSelectedValue={setSelectedToChain}
                    isOpen={isToChainOpen}
                    setIsOpen={setIsToChainOpen}
                    type="chain"
                  />
                  <IconChevronDown className="w-4 h-4" />
                </div>
                <div className="w-full flex items-center gap-2 cursor-pointer px-2 rounded-md bg-white/5 border-2 border-white/5  ">
                  <div
                    onClick={() => setIsToTokenOpen(!isToTokenOpen)}
                    className="flex items-center gap-2  h-full  px-2"
                  >
                    <DynamicDropdown
                      selectedValue={selectedToToken}
                      setSelectedValue={setSelectedToToken}
                      isOpen={isToTokenOpen}
                      setIsOpen={setIsToTokenOpen}
                      type="token"
                      selectedChain={selectedToChain}
                    />
                    <IconChevronDown className="w-4 h-4" />
                  </div>

                  <input
                    type="number"
                    placeholder="0"
                    className="border-l-2 px-4 border-white/5 flex-1 outline-none  rounded-none ring-0 active:outline-none  active:ring-offset-0  text-left text-white p-2  placeholder-white/30"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Info Section */}
          <div className="flex justify-between items-center text-white/30 text-sm rounded-2xl bg-white/5 border-2 border-white/5 ">
            <div className="flex  gap-2 w-full justify-around items-center align-middle p-4">
              <p className="text-white/50">ETA: –</p>
              <p className="text-white/50">Amount: –</p>
              <p className="text-white/50">Fee: –</p>
            </div>
          </div>

          {/* Confirm Button */}
          <button className="w-full  nexon-button nexon-primary text-center font-semibold flex items-center justify-center gap-2">
            Confirm <IconArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

const DynamicDropdown = ({
  selectedValue,
  setSelectedValue,
  isOpen,
  setIsOpen,
  type,
  selectedChain
}: {
  selectedValue: string
  setSelectedValue: (value: string) => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  type: 'chain' | 'token'
  selectedChain?: string
}) => {
  const chains = [
    {
      tokens: {
        USDC: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
        USDT: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
        'USDC.e': 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
      },
      chains: [
        {
          name: 'Arbitrum',
          logo: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
          supportedTokens: ['USDC', 'USDT']
        },
        {
          name: 'Avalanche',
          logo: 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
          supportedTokens: ['USDC', 'USDT']
        },
        {
          name: 'Base',
          logo: 'https://cryptologos.cc/logos/base-base-logo.png',
          supportedTokens: ['USDC']
        },
        {
          name: 'BNB Chain',
          logo: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png?v=040',
          supportedTokens: ['USDT']
        },
        {
          name: 'Celo',
          logo: 'https://cryptologos.cc/logos/celo-celo-logo.png',
          supportedTokens: ['USDT']
        },
        {
          name: 'Ethereum',
          logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
          supportedTokens: ['USDC', 'USDT']
        },
        {
          name: 'OP Mainnet',
          logo: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png',
          supportedTokens: ['USDC', 'USDT']
        },
        {
          name: 'Polygon',
          logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
          supportedTokens: ['USDC', 'USDC.e', 'USDT']
        },
        {
          name: 'Solana',
          logo: 'https://cryptologos.cc/logos/solana-sol-logo.png',
          supportedTokens: ['USDC']
        },
        {
          name: 'Stellar',
          logo: 'https://cryptologos.cc/logos/stellar-xlm-logo.png',
          supportedTokens: ['USDC']
        },
        {
          name: 'Sui',
          logo: 'https://cryptologos.cc/logos/sui-sui-logo.png',
          supportedTokens: ['USDC']
        },
        {
          name: 'Tron',
          logo: 'https://cryptologos.cc/logos/tron-trx-logo.png',
          supportedTokens: ['USDC', 'USDT']
        }
      ]
    }
  ]

  type ChainOption = {
    name: string
    logo: string
    supportedTokens: string[]
  }

  const getOptions = (): (ChainOption | string)[] => {
    if (type === 'chain') {
      return chains[0].chains
    } else {
      // For tokens, filter based on selected chain
      const selectedChainData = chains[0].chains.find((chain) => chain.name === selectedChain)
      return selectedChainData ? selectedChainData.supportedTokens : []
    }
  }

  const getTitle = () => {
    return type === 'chain' ? 'Select Source Chain' : 'Select Token'
  }

  const getDisplayValue = (option: ChainOption | string) => {
    return typeof option === 'string' ? option : option.name
  }

  return (
    <div className={`  `}>
      {selectedValue}
      {isOpen && (
        <div className="   bg-secondary/50 backdrop-blur  w-full h-full absolute top-0 left-0">
          <dialog
            open={isOpen}
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col gap-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-secondary  
            border-2 border-white/5 rounded-md p-4"
          >
            <div className="flex justify-between items-center">
              <p className="text-white  ">{getTitle()}</p>
              <IconX
                className="w-6 h-6 bg-white/5 rounded-full p-1 text-white/50 cursor-pointer"
                onClick={() => setIsOpen(false)}
              />
            </div>
            <div className="flex gap-2 items-center text-white/50 border-2 border-white/5 rounded-md p-2 bg-white/5">
              <IconSearch className="w-4 h-4 " />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent text-white outline-none"
              />
            </div>
            {getOptions().map((option) => (
              <div
                onClick={() => {
                  setSelectedValue(getDisplayValue(option))
                  setIsOpen(false)
                }}
                className="flex items-center gap-2 max-h-60 overflow-y-auto hover:bg-white/5 cursor-pointer p-2 rounded-md text-white/50 hover:text-white"
                key={getDisplayValue(option)}
              >
                {type === 'chain' ? (
                  <Image
                    src={(option as ChainOption).logo}
                    alt={(option as ChainOption).name}
                    width={24}
                    height={24}
                  />
                ) : (
                  <div className="w-6 h-6 text-sm bg-primary text-white rounded-full flex items-center justify-center">
                    {getDisplayValue(option).charAt(0)}
                  </div>
                )}
                {getDisplayValue(option)}
              </div>
            ))}
          </dialog>
        </div>
      )}
    </div>
  )
}

export default BridgeModal
