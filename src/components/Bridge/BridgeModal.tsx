import { IconArrowRight, IconChevronDown, IconSearch, IconX } from '@tabler/icons-react'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { useAccount } from 'wagmi'
import { useWalletModal } from '@/context/WalletModalContext'
import { useBridge } from '@/context/BridgeContext'
import {
  Messenger,
  FeePaymentMethod,
  TokenWithChainDetails,
  ChainSymbol
} from '@allbridge/bridge-core-sdk'

// Import all logos
import ethereumLogo from '@/assets/logos/ethereum-eth-logo.svg'
import bnbLogo from '@/assets/logos/bnb-bnb-logo.svg'
import suiLogo from '@/assets/logos/sui-sui-logo.svg'
import usdcLogo from '@/assets/logos/usd-coin-usdc-logo.svg'
import tronLogo from '@/assets/logos/tron-trx-logo.svg'
import solanaLogo from '@/assets/logos/solana-sol-logo.svg'
import celoLogo from '@/assets/logos/celo-celo-logo.svg'
import stellarLogo from '@/assets/logos/stellar-xlm-logo.svg'
import avalancheLogo from '@/assets/logos/avalanche-avax-logo.svg'
import arbitrumLogo from '@/assets/logos/arbitrum-arb-logo.svg'
import optimismLogo from '@/assets/logos/optimism-ethereum-op-logo.svg'
import polygonLogo from '@/assets/logos/polygon-matic-logo.svg'
import usdtLogo from '@/assets/logos/tether-usdt-logo.svg'
import usdeLogo from '@/assets/logos/ethena-usde-usde-logo.svg'
import baseLogo from '@/assets/logos/base-logo.svg'

type ChainOption = {
  name: string
  logo: string
  supportedTokens: string[]
}

type Token = {
  symbol: string
  name: string
  decimals: number
  tokenAddress: string
  poolAddress: string
  feeShare: string
  apr: string
  apr7d: string
  apr30d: string
  lpRate: string
}

type Chain = {
  name: string
  chainSymbol: string
  chainType: string
  allbridgeChainId: number
  bridgeAddress: string
  tokens: Token[]
}

function BridgeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { address, isConnected } = useAccount()
  const { toggleConnectWalletModal } = useWalletModal()
  const {
    chains,
    sourceChain,
    destinationChain,
    sourceToken,
    destinationToken,
    setSourceToken,
    setDestinationToken,
    isLoading,
    initiateBridge,
    getGasFeeOptions,
    getAverageTransferTime
  } = useBridge()

  const [amount, setAmount] = useState('')
  const [transferTime, setTransferTime] = useState<number | null>(null)
  const [gasFee, setGasFee] = useState<string | null>(null)
  const [selectedMessenger, setSelectedMessenger] = useState<Messenger>(Messenger.ALLBRIDGE)

  // Format transfer time from milliseconds to minutes and seconds
  const formatTransferTime = (ms: number | null): string => {
    if (!ms) return '–'
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    if (minutes === 0) {
      return `${seconds}s`
    }
    return seconds === 0 ? `${minutes}m` : `${minutes}m ${seconds}s`
  }

  // Format fee with the chain's native token symbol
  const formatGasFee = (fee: string | null): string => {
    if (!fee || !sourceToken) return '–'
    // Limit to 6 decimal places
    const formattedFee = parseFloat(fee).toFixed(6)
    return formattedFee
  }

  // Function to get logo path for a chain or token
  const getLogoPath = (symbol: string): string => {
    const logoMap: Record<string, string> = {
      // Combined chain and token logos
      ETH: ethereumLogo,
      BSC: bnbLogo,
      BNB: bnbLogo,
      SUI: suiLogo,
      TRX: tronLogo,
      SOL: solanaLogo,
      CEL: celoLogo,
      XLM: stellarLogo,
      AVA: avalancheLogo,
      ARB: arbitrumLogo,
      OPT: optimismLogo,
      MATIC: polygonLogo,
      BAS: baseLogo,
      USDC: usdcLogo,
      USDT: usdtLogo,
      'USDC.e': usdeLogo,
      // Add alternative mappings for chain symbols
      POL: polygonLogo, // Polygon alternative symbol
      AVALANCHE: avalancheLogo, // Avalanche alternative symbol
      OPTIMISM: optimismLogo, // Optimism alternative symbol
      SRB: stellarLogo, // Stellar alternative symbol
      ETHENA: usdeLogo // Ethena alternative symbol
    }

    const logo = logoMap[symbol]
    return logo || ethereumLogo // Default to Ethereum logo if not found
  }

  // Fetch transfer time and gas fee when source/destination tokens or chains change
  useEffect(() => {
    const fetchTransferDetails = async () => {
      // Reset states when dependencies change
      setTransferTime(null)
      setGasFee(null)

      // Validate required parameters
      if (!sourceToken || !destinationToken || !selectedMessenger) {
        console.log('Missing required parameters:', {
          sourceToken: !!sourceToken,
          destinationToken: !!destinationToken,
          selectedMessenger: !!selectedMessenger
        })
        return
      }

      // Validate token properties
      if (!sourceToken.chainSymbol || !destinationToken.chainSymbol) {
        console.error('Missing chainSymbol in tokens:', {
          sourceToken: sourceToken.chainSymbol,
          destinationToken: destinationToken.chainSymbol
        })
        toast.error('Invalid token configuration. Missing chain information.')
        return
      }

      // Validate chain and token combinations
      if (sourceToken.chainSymbol === destinationToken.chainSymbol) {
        console.log('Source and destination chains are the same')
        return
      }

      try {
        // Convert Messenger enum to number
        const messengerValue = Number(selectedMessenger)

        console.log('Fetching transfer details with:', {
          sourceToken: {
            symbol: sourceToken.symbol,
            chainSymbol: sourceToken.chainSymbol
          },
          destinationToken: {
            symbol: destinationToken.symbol,
            chainSymbol: destinationToken.chainSymbol
          },
          messenger: messengerValue
        })

        // Get transfer time
        const time = await getAverageTransferTime(sourceToken, destinationToken, messengerValue)
        setTransferTime(time)

        // Get fee options
        const feeOptions = await getGasFeeOptions(sourceToken, destinationToken, messengerValue)

        // Set only native fee
        if (feeOptions.native) {
          setGasFee(feeOptions.native.float)
        }
      } catch (err: unknown) {
        console.error('Error fetching transfer details:', err)

        // Log detailed error information
        if (err && typeof err === 'object' && 'response' in err) {
          const errorResponse = err.response as {
            status?: number
            data?: { message?: string }
            headers?: unknown
          }
          console.error('Error response:', {
            status: errorResponse.status,
            data: errorResponse.data,
            headers: errorResponse.headers
          })

          // Show user-friendly error message
          if (errorResponse.status === 400) {
            const errorMessage = errorResponse.data?.message || 'Invalid chain or token combination'
            toast.error(`Bridge error: ${errorMessage}. Please try a different pair.`)
          } else {
            toast.error('Failed to fetch transfer details. Please try again.')
          }
        } else {
          toast.error('Failed to fetch transfer details. Please try again.')
        }
      }
    }

    fetchTransferDetails()
  }, [
    sourceToken,
    destinationToken,
    sourceChain,
    destinationChain,
    selectedMessenger,
    getAverageTransferTime,
    getGasFeeOptions
  ])

  const handleTransfer = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet')
      onClose()
      toggleConnectWalletModal()
      return
    }

    if (!sourceToken || !destinationToken || !amount) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await initiateBridge({
        amount,
        sourceToken,
        destinationToken,
        fromAccountAddress: address!,
        toAccountAddress: address!,
        gasFeePaymentMethod: FeePaymentMethod.WITH_NATIVE_CURRENCY,
        messenger: selectedMessenger
      })
      onClose()
    } catch (err) {
      console.error('Transfer failed:', err)
    }
  }

  const [selectedToChain, setSelectedToChain] = useState(destinationChain?.name || 'Ethereum')
  const [selectedToToken, setSelectedToToken] = useState(destinationToken?.symbol || 'USDC')
  const [isToChainOpen, setIsToChainOpen] = useState(false)

  const [selectedFromChain, setSelectedFromChain] = useState(sourceChain?.name || 'Polygon')
  const [selectedFromToken, setSelectedFromToken] = useState(sourceToken?.symbol || 'USDC')

  const [isFromChainOpen, setIsFromChainOpen] = useState(false)
  const [isFromTokenOpen, setIsFromTokenOpen] = useState(false)
  const [isToTokenOpen, setIsToTokenOpen] = useState(false)

  // Update sourceToken when selectedFromChain or selectedFromToken changes
  useEffect(() => {
    if (selectedFromChain && selectedFromToken) {
      const chainData = Object.values(chains).find(
        (chain: Chain) => chain.name === selectedFromChain
      )
      if (chainData) {
        const tokenData = chainData.tokens.find(
          (token: Token) => token.symbol === selectedFromToken
        )
        if (tokenData) {
          // Convert Token to TokenWithChainDetails
          const tokenWithChainDetails: TokenWithChainDetails = {
            ...tokenData,
            chainSymbol: chainData.chainSymbol as ChainSymbol,
            chainId: chainData.allbridgeChainId.toString()
          }
          setSourceToken(tokenWithChainDetails)
        }
      }
    }
  }, [selectedFromChain, selectedFromToken, chains, setSourceToken])

  // Update destinationToken when selectedToChain or selectedToToken changes
  useEffect(() => {
    if (selectedToChain && selectedToToken) {
      const chainData = Object.values(chains).find((chain: Chain) => chain.name === selectedToChain)
      if (chainData) {
        const tokenData = chainData.tokens.find((token: Token) => token.symbol === selectedToToken)
        if (tokenData) {
          // Convert Token to TokenWithChainDetails
          const tokenWithChainDetails: TokenWithChainDetails = {
            ...tokenData,
            chainSymbol: chainData.chainSymbol as ChainSymbol,
            chainId: chainData.allbridgeChainId.toString()
          }
          setDestinationToken(tokenWithChainDetails)
        }
      }
    }
  }, [selectedToChain, selectedToToken, chains, setDestinationToken])

  // Track if this is the initial load
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Show token selection popup when chain changes (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad) {
      if (selectedFromChain) {
        setIsFromTokenOpen(true)
      }
    }
  }, [selectedFromChain, isInitialLoad])

  // Show token selection popup when destination chain changes (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad) {
      if (selectedToChain) {
        setIsToTokenOpen(true)
      }
    }
  }, [selectedToChain, isInitialLoad])

  // Set isInitialLoad to false after the first render
  useEffect(() => {
    setIsInitialLoad(false)
  }, [])

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
                  Balance: 0 {sourceToken?.symbol}
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
                    getLogoPath={getLogoPath}
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
                      getLogoPath={getLogoPath}
                    />
                    <IconChevronDown className="w-4 h-4" />
                  </div>

                  <input
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
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
                  Balance: 0 {destinationToken?.symbol}
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
                    getLogoPath={getLogoPath}
                  />
                  <IconChevronDown className="w-4 h-4" />
                </div>
                <div className=" flex items-center gap-2 cursor-pointer px-2 rounded-md bg-white/5 border-2 border-white/5  ">
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
                      getLogoPath={getLogoPath}
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
            <div className="flex gap-2 w-full justify-around items-center align-middle p-4">
              <p className="text-white/50">ETA: {formatTransferTime(transferTime)}</p>
              <p className="text-white/50">Amount: {amount || '–'}</p>
              <div className="flex items-center gap-2">
                <p className="text-white/50">Native Fee: {formatGasFee(gasFee)}</p>
                {selectedFromChain && (
                  <Image
                    src={getLogoPath(
                      Object.values(chains).find((chain: Chain) => chain.name === selectedFromChain)
                        ?.chainSymbol || 'ETH'
                    )}
                    alt={selectedFromChain}
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Messenger Selection */}
          <div className="flex gap-2 items-center text-white/50 border-2 border-white/5 rounded-md p-2 bg-white/5">
            <select
              value={selectedMessenger}
              onChange={(e) => {
                const value = e.target.value
                setSelectedMessenger(value ? (value as unknown as Messenger) : Messenger.ALLBRIDGE)
              }}
              className="  text-white outline-none font-proxima-nova bg-secondary/50"
            >
              <option value={Messenger.ALLBRIDGE}>Allbridge</option>
              <option value={Messenger.WORMHOLE}>Wormhole</option>
            </select>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleTransfer}
            disabled={isLoading}
            className="w-full nexon-button nexon-primary text-center font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : isConnected ? 'Confirm' : 'Connect Wallet'}
            <IconArrowRight className="w-4 h-4" />
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
  selectedChain,
  getLogoPath
}: {
  selectedValue: string
  setSelectedValue: (value: string) => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  type: 'chain' | 'token'
  selectedChain?: string
  getLogoPath: (symbol: string) => string
}) => {
  const { chains } = useBridge()

  const getOptions = (): (ChainOption | string)[] => {
    if (type === 'chain') {
      // Convert chains object to array of chain options
      const options = Object.values(chains).map((chain: Chain) => {
        console.log('Chain details:', {
          name: chain.name,
          symbol: chain.chainSymbol,
          chainType: chain.chainType
        })
        return {
          name: chain.name,
          logo: getLogoPath(chain.chainSymbol),
          supportedTokens: chain.tokens.map((token: Token) => token.symbol)
        }
      })
      return options
    } else {
      // For tokens, filter based on selected chain
      const selectedChainData = Object.values(chains).find(
        (chain: Chain) => chain.name === selectedChain
      )
      return selectedChainData ? selectedChainData.tokens.map((token: Token) => token.symbol) : []
    }
  }

  const getTitle = () => {
    return type === 'chain' ? 'Select Source Chain' : 'Select Token'
  }

  const getDisplayValue = (option: ChainOption | string) => {
    return typeof option === 'string' ? option : option.name
  }

  // Get chain symbol for the selected chain
  const getSelectedChainSymbol = () => {
    if (type === 'chain') {
      const selectedChainData = Object.values(chains).find(
        (chain: Chain) => chain.name === selectedValue
      )
      return selectedChainData?.chainSymbol || 'ETH'
    }
    return selectedValue
  }

  return (
    <div className={` `}>
      <div className="flex items-center gap-2">
        <Image
          src={getLogoPath(getSelectedChainSymbol())}
          alt={selectedValue}
          className=" w-4 h-4"
          width={16}
          height={16}
        />{' '}
        {selectedValue}
      </div>
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
                className="bg-transparent text-white outline-none font-proxima-nova"
              />
            </div>
            {getOptions().map((option) => (
              <div
                onClick={() => {
                  setSelectedValue(getDisplayValue(option))
                  setIsOpen(false)
                }}
                className="flex items-center gap-2 max-h-60 overflow-y-auto text-nowrap hover:bg-white/5 cursor-pointer p-2 rounded-md text-white/50 hover:text-white  "
                key={getDisplayValue(option)}
              >
                {type === 'chain' ? (
                  <Image
                    src={(option as ChainOption).logo}
                    alt={(option as ChainOption).name}
                    width={24}
                    height={24}
                    className=" w-4 h-4"
                  />
                ) : (
                  <Image
                    src={getLogoPath(getDisplayValue(option))}
                    alt={getDisplayValue(option)}
                    width={24}
                    height={24}
                    className=" w-4 h-4"
                  />
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
