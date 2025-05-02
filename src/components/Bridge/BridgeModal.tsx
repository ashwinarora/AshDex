import {
  IconArrowRight,
  IconChevronDown,
  IconLoader2,
  IconSearch,
  IconX,
  IconExternalLink,
  IconTransferVertical,
  IconWallet,
  IconCheck
} from '@tabler/icons-react'
import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { useAccount, useWalletClient, useBalance, useWriteContract } from 'wagmi'
import { switchChain } from 'wagmi/actions'
import { config } from '@/config/wagmi'
import { useWalletModal } from '@/context/WalletModalContext'
import { useBridge } from '@/context/BridgeContext'
import {
  Messenger,
  FeePaymentMethod,
  TokenWithChainDetails,
  ChainSymbol,
  RawEvmTransaction
} from '@allbridge/bridge-core-sdk'
import Switch from '@/components/common/Switch'
import { erc20Abi } from 'viem'
import { USDC_ARBITRUM, HYPERLIQUID_DEPOSIT } from '@/utils/constants'

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
import nexonLogo from '@/assets/images/logo.svg'

// Import messenger logos
import allbridgeLogo from '@/assets/logos/allbridge-logo.svg'
import wormholeLogo from '@/assets/logos/wormhole-w-logo.svg'
import cctpLogo from '@/assets/logos/circle-icon.svg'
// CCTP logo is missing, we'll use a placeholder for now

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

interface Transaction {
  hash: string
  messenger: Messenger
  timestamp: number
  amount: string
  sourceToken: string
  destinationToken: string
  sourceChain: string
  destinationChain: string
  status?: 'pending' | 'source_complete' | 'complete'
}

// Add ProgressBar component
const ProgressBar = ({
  sourceChain,
  destinationChain,
  status,
  getLogoPath
}: {
  sourceChain: string
  destinationChain: string
  status: 'pending' | 'source_complete' | 'complete'
  getLogoPath: (symbol: string) => string
}) => {
  return (
    <div className="flex items-center justify-between w-full mt-3 align-middle px-2">
      {/* Source Chain Step */}
      <div className="flex flex-col items-center">
        <div
          className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300  bg-white/5`}
        >
          <Image
            src={getLogoPath(sourceChain)}
            alt={sourceChain}
            width={16}
            height={16}
            className="w-4 h-4"
          />
        </div>
        <span
          className={`text-xs mt-1 transition-colors duration-300 relative items-center gap-1 ${
            status === 'pending' ? 'text-white' : 'text-white/50'
          }`}
        >
          Source{' '}
          <IconCheck
            className={`w-4 h-4 transition-colors duration-300  absolute  -translate-y-[100%]  -right-4 rounded-full p-0.5 ${
              status === 'source_complete' || status === 'complete'
                ? 'text-green-500 block'
                : 'hidden'
            }`}
          />
          <IconLoader2
            className={`w-4 h-4 transition-colors duration-300  absolute  -translate-y-[100%]  -right-4 rounded-full p-0.5 animate-spin ${
              status === 'pending' ? 'text-white block' : 'hidden'
            }`}
          />
        </span>
      </div>
      <div className="flex-1 h-1 mx-2 relative mb-4">
        <div className="absolute top-0 left-0 h-full bg-white/5 w-full rounded-full" />
        <div
          className={`absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500 ${
            status === 'pending'
              ? 'w-0'
              : (status === 'source_complete' || status === 'complete') && 'w-full'
          }`}
        />
      </div>
      {/* Destination Chain Step */}
      <div className="flex flex-col items-center">
        <div
          className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300  bg-white/5`}
        >
          <Image
            src={getLogoPath(destinationChain)}
            alt={destinationChain}
            width={16}
            height={16}
            className="w-4 h-4"
          />
        </div>
        <span
          className={`text-xs mt-1 transition-colors duration-300 relative items-center gap-1 ${
            status === 'source_complete' ? 'text-white' : 'text-white/50'
          }`}
        >
          Destination{' '}
          <IconCheck
            className={`w-4 h-4 transition-colors duration-300  absolute  -translate-y-[100%]  -right-4 rounded-full p-0.5 ${
              status === 'complete' ? 'text-green-500 block' : 'hidden'
            }`}
          />
          <IconLoader2
            className={`w-4 h-4 transition-colors duration-300  absolute  -translate-y-[100%]  -right-4 rounded-full p-0.5 animate-spin ${
              status === 'source_complete' ? 'text-white block' : 'hidden'
            }`}
          />
        </span>
      </div>
      <div className="flex-1 h-1 mx-2 relative mb-4">
        <div className="absolute top-0 left-0 h-full bg-white/5 w-full rounded-full" />
        <div
          className={`absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500 ${
            status === 'complete' ? 'w-full' : 'w-0'
          }`}
        />
      </div>
      {/* Wallet Step */}
      <div className="flex flex-col items-center">
        <div
          className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300  bg-white/5`}
        >
          <IconWallet
            className={`w-4 h-4 transition-colors duration-300 ${
              status === 'complete' ? 'text-white' : 'text-white/50'
            }`}
          />
        </div>
        <span
          className={`text-xs mt-1 transition-colors duration-300 relative items-center gap-1 ${
            status === 'complete' ? 'text-primary' : 'text-white/50'
          }`}
        >
          Wallet
          <IconCheck
            className={`w-4 h-4 transition-colors duration-300  absolute  -translate-y-[100%]  -right-4 rounded-full p-0.5 ${
              status === 'complete' ? 'text-green-500 block' : 'hidden'
            }`}
          />
        </span>
      </div>
    </div>
  )
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
    getAverageTransferTime,
    sdk
  } = useBridge()
  const [amount, setAmount] = useState('')
  const [useNativeTokenForGas, setUseNativeTokenForGas] = useState(true)
  const [gasFee, setGasFee] = useState<string | null>(null)
  const [selectedMessenger, setSelectedMessenger] = useState<Messenger>(Messenger.ALLBRIDGE)
  const [supportedMessengers, setSupportedMessengers] = useState<Set<Messenger>>(new Set())
  const { data: walletClient } = useWalletClient()
  const [sourceTokenBalance, setSourceTokenBalance] = useState<string>('0')
  const [estimatedReceiveAmount, setEstimatedReceiveAmount] = useState<string>('0')

  const [isLoadingEstimate, setIsLoadingEstimate] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const { writeContractAsync } = useWriteContract()
  const [selectedToChain, setSelectedToChain] = useState(destinationChain?.name || 'Ethereum')

  const [isSwapping, setIsSwapping] = useState(false)
  // Inside your component
  const swappingRef = useRef(false)
  // Add transaction receipt hook
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Get token balances using wagmi's useBalance hook
  const { data: sourceTokenBalanceData } = useBalance({
    address,
    token: sourceToken?.tokenAddress as `0x${string}`,
    query: {
      refetchInterval: 5000 // Refetch every 5 seconds
    }
  })

  // Update source token balance when data changes
  useEffect(() => {
    if (sourceTokenBalanceData) {
      setSourceTokenBalance(sourceTokenBalanceData.formatted)
    } else {
      setSourceTokenBalance('0')
    }
  }, [sourceTokenBalanceData])

  // Update the MAX button click handler
  const handleMaxClick = () => {
    if (sourceTokenBalance) {
      setAmount(sourceTokenBalance)
    }
  }

  // Format transfer time from milliseconds to minutes and seconds
  const formatTransferTime = (ms: number | null): string => {
    if (!ms) return '–'
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    if (minutes === 0) {
      return `${seconds}s`
    }
    return seconds === 0 ? `${minutes}min` : `${minutes}min ${seconds}s`
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
      NEXON: nexonLogo,
      USDC: usdcLogo,
      USDT: usdtLogo,
      'USDC.e': usdeLogo,
      // Add alternative mappings for chain symbols
      POL: polygonLogo, // Polygon alternative symbol
      AVALANCHE: avalancheLogo, // Avalanche alternative symbol
      OPTIMISM: optimismLogo, // Optimism alternative symbol
      SRB: stellarLogo, // Stellar alternative symbol
      ETHENA: usdeLogo, // Ethena alternative symbol
      // Messenger logos
      ALLBRIDGE: allbridgeLogo,
      WORMHOLE: wormholeLogo
    }

    // Special handling for Nexon chain
    if (symbol === 'Nexon') {
      return nexonLogo
    }

    const logo = logoMap[symbol]
    return logo || ethereumLogo // Default to Ethereum logo if not found
  }

  // Messenger mapping for easy reference
  const messengerOptions = [
    {
      messenger: Messenger.ALLBRIDGE,
      name: 'Allbridge',
      logo: allbridgeLogo
    },
    {
      messenger: Messenger.WORMHOLE,
      name: 'Wormhole',
      logo: wormholeLogo
    },
    {
      messenger: Messenger.CCTP,
      name: 'CCTP',
      logo: cctpLogo
    }
  ]

  // Function to check messenger support
  const checkMessengerSupport = async () => {
    // Reset supported messengers when tokens change
    setSupportedMessengers(new Set())

    // Check if we have valid tokens
    if (!sourceToken || !destinationToken) {
      return
    }

    const messengers = [Messenger.ALLBRIDGE, Messenger.WORMHOLE, Messenger.CCTP]
    const supported = new Set<Messenger>()
    const transferTimes = new Map<Messenger, number>()

    for (const messenger of messengers) {
      try {
        // Check if SDK is initialized
        if (!sdk) {
          console.log('SDK not initialized')
          return
        }

        const transferTime = await getAverageTransferTime(sourceToken, destinationToken, messenger)

        // If transfer time is not null, the messenger is supported
        if (transferTime !== null) {
          supported.add(messenger)
          transferTimes.set(messenger, transferTime)
        } else {
          console.log(`Messenger ${messenger} is not supported for this token pair`)
        }
      } catch (error) {
        // Log error but don't throw it
        console.log(`Error checking messenger ${messenger}:`, error)
      }
    }

    // Update supported messengers
    setSupportedMessengers(supported)

    // Find the fastest messenger
    let fastestMessenger: Messenger | null = null
    let fastestTime = Infinity

    for (const [messenger, time] of transferTimes.entries()) {
      if (time < fastestTime) {
        fastestTime = time
        fastestMessenger = messenger
      }
    }

    // If we found a fastest messenger and it's different from current selection, update it
    if (fastestMessenger !== null && fastestMessenger !== selectedMessenger) {
      setSelectedMessenger(fastestMessenger)
    } else if (!supported.has(selectedMessenger) && supported.size > 0) {
      // If current messenger is not supported, switch to first supported messenger
      const firstSupported = Array.from(supported)[0]
      setSelectedMessenger(firstSupported)
    }
  }

  // State to store transfer times for each messenger
  const [messengerTransferTimes, setMessengerTransferTimes] = useState<
    Map<Messenger, number | null>
  >(new Map())

  // Function to fetch transfer times for all messengers
  const fetchMessengerTransferTimes = async () => {
    if (!sourceToken || !destinationToken || !sdk) return

    const times = new Map<Messenger, number | null>()

    for (const messenger of [Messenger.ALLBRIDGE, Messenger.WORMHOLE, Messenger.CCTP]) {
      try {
        const time = await getAverageTransferTime(sourceToken, destinationToken, messenger)
        times.set(messenger, time)
      } catch (error) {
        console.log(`Error fetching transfer time for ${messenger}:`, error)
      }
    }

    setMessengerTransferTimes(times)
  }

  // Fetch transfer times when source or destination tokens change
  useEffect(() => {
    fetchMessengerTransferTimes()
  }, [sourceToken, destinationToken])

  // Check messenger support when source or destination tokens change
  useEffect(() => {
    checkMessengerSupport()
  }, [sourceToken, destinationToken])

  // Function to fetch gas fee options
  const fetchGasFeeOptions = async () => {
    if (!sdk || !sourceToken || !destinationToken || !selectedMessenger) {
      setGasFee(null)

      return
    }

    try {
      const feeOptions = await sdk.getGasFeeOptions(
        sourceToken,
        destinationToken,
        selectedMessenger
      )

      if (useNativeTokenForGas && feeOptions?.native) {
        setGasFee(feeOptions.native.float)
      } else if (!useNativeTokenForGas && feeOptions?.stablecoin) {
        setGasFee(feeOptions.stablecoin.float)
      } else {
        setGasFee(null)
      }
    } catch (error) {
      console.error('Error fetching gas fee options:', error)
      setGasFee(null)
    }
  }

  // Update gas fee when relevant values change
  useEffect(() => {
    fetchGasFeeOptions()
  }, [sourceToken, destinationToken, selectedMessenger, useNativeTokenForGas])

  // Fetch transfer time and gas fee when source/destination tokens or chains change
  useEffect(() => {
    const fetchTransferDetails = async () => {
      // Reset states when dependencies change
      setGasFee(null)

      // Validate required parameters
      if (!sourceToken || !destinationToken || !selectedMessenger) {
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

        // Get fee options
        const feeOptions = await getGasFeeOptions(sourceToken, destinationToken, messengerValue)

        // Set only native fee
        if (feeOptions?.native) {
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

  // Function to switch to the selected network
  const switchToNetwork = async (chainName: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return false
    }

    // Find the chain details from our chains object
    const selectedChain = Object.values(chains).find((chain) => chain.name === chainName)

    if (!selectedChain) {
      toast.error(`Chain ${chainName} not found`)
      return false
    }

    // Map of supported chain IDs with correct types
    const supportedChainIds: Record<
      string,
      10 | 42161 | 421614 | 1 | 137 | 42220 | 43114 | 56 | 8453
    > = {
      Arbitrum: 42161,
      'Arbitrum Sepolia': 421614,
      Ethereum: 1,
      Polygon: 137,
      Celo: 42220,
      Avalanche: 43114,
      Optimism: 10,
      BSC: 56,
      Base: 8453
    }

    // Get the supported chain ID for the selected chain
    const supportedChainId = supportedChainIds[chainName]

    if (!supportedChainId) {
      toast.error(`Chain ${chainName} is not supported for network switching`)
      return false
    }

    try {
      // Request network switch using the supported chain ID
      console.log('Switching to network:', supportedChainId)
      await switchChain(config, { chainId: supportedChainId })
      toast.success(`Switched to ${chainName} network`)
      return true
    } catch (error) {
      console.error('Failed to switch network:', error)
      toast.error(`Failed to switch to ${chainName} network`)
      return false
    }
  }

  // Add a ref to track if deposit has been initiated
  const depositInitiatedRef = useRef<boolean>(false)

  const checkTransferStatus = async (txId: string, chainSymbol: ChainSymbol) => {
    if (!sdk) {
      console.error('SDK not initialized')
      return
    }

    try {
      const transferStatus = await sdk.getTransferStatus(chainSymbol, txId)
      console.log('Transfer Status:', transferStatus)

      // Handle different stages of the transaction
      if (!transferStatus) {
        // Stage 1: Transaction not found yet
        return 'pending'
      } else if (typeof transferStatus === 'object') {
        if (transferStatus.receive === null) {
          // Stage 2: Transaction completed on source chain
          return 'source_complete'
        } else if (transferStatus.receive) {
          // Stage 3: Transaction completed on destination chain
          // If destination is Nexon, initiate deposit
          if (selectedToChain === 'Nexon' && !depositInitiatedRef.current) {
            depositInitiatedRef.current = true
            const handleNexonDeposit = async () => {
              try {
                // Switch to Arbitrum network
                await switchChain(config, { chainId: 42161 })

                toast.success('Switched to Arbitrum network')
                // Convert amount to bigint for the contract call
                const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 1e6)) // Assuming 6 decimals for USDC

                // Deposit to Hyperliquid using writeContractAsync
                const depositHash = await writeContractAsync({
                  address: USDC_ARBITRUM,
                  abi: erc20Abi,
                  functionName: 'transfer',
                  args: [HYPERLIQUID_DEPOSIT, amountBigInt]
                })

                console.log('Deposit to Hyperliquid hash:', depositHash)

                // Add deposit transaction to list
                const depositTransaction: Transaction = {
                  hash: depositHash,
                  messenger: Messenger.ALLBRIDGE,
                  timestamp: Date.now(),
                  amount,
                  sourceToken: 'USDC',
                  destinationToken: 'USDC',
                  sourceChain: 'ARB',
                  destinationChain: 'NEXON',
                  status: 'complete'
                }

                setTransactions((prev) => [depositTransaction, ...prev])
                toast.success('Deposit to Nexon completed!')
              } catch (error) {
                console.error('Deposit to Nexon failed:', error)
                toast.error('Failed to deposit to Nexon. Please try again.')
              }
            }

            await handleNexonDeposit()
          }

          toast.success('Transaction completed successfully!')
          // Clear the interval since transaction is complete
          if (statusCheckIntervalRef.current) {
            clearInterval(statusCheckIntervalRef.current)
            statusCheckIntervalRef.current = null
          }
          return 'complete'
        }
      }
      return null
    } catch (error) {
      console.error('Error checking transfer status:', error)
      return null
    }
  }

  // Add cleanup for depositInitiatedRef when component unmounts
  useEffect(() => {
    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current)
        statusCheckIntervalRef.current = null
      }
      depositInitiatedRef.current = false
    }
  }, [])

  // Modify handleTransfer to check status periodically
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

    if (!sdk) {
      toast.error('Bridge SDK not initialized')
      return
    }

    // Ensure we're on the correct network before proceeding
    const sourceChainName = Object.values(chains).find(
      (chain) => chain.allbridgeChainId.toString() === sourceToken.chainId
    )?.name

    if (sourceChainName) {
      const networkSwitched = await switchToNetwork(sourceChainName)
      if (!networkSwitched) {
        toast.error(`Please switch to ${sourceChainName} network to proceed`)
        return
      }
    }

    try {
      // Create sendParams object
      const sendParams = {
        amount,
        sourceToken,
        destinationToken,
        fromAccountAddress: address!,
        toAccountAddress: address!,
        gasFeePaymentMethod: useNativeTokenForGas
          ? FeePaymentMethod.WITH_NATIVE_CURRENCY
          : FeePaymentMethod.WITH_STABLECOIN,
        messenger: selectedMessenger
      }

      const owner = address?.split('0x')[1].toString()
      //check if sending tokens already approved
      if (owner) {
        if (
          !(await sdk.bridge.checkAllowance({ token: sourceToken, owner: owner, amount: amount }))
        ) {
          // authorize the bridge to transfer tokens from sender's address
          const rawTransactionApprove = (await sdk.bridge.rawTxBuilder.approve({
            token: sourceToken,
            owner: owner
          })) as RawEvmTransaction

          const approveTxReceipt = await walletClient?.sendTransaction({
            account: owner as `0x${string}`,
            to: rawTransactionApprove.to as `0x${string}`,
            data: rawTransactionApprove.data as `0x${string}`,
            value: BigInt(rawTransactionApprove.value ?? '0')
          })
          console.log('Approve tx id:', approveTxReceipt)
        }

        // Log the sendParams for debugging
        console.log('Bridge sendParams:', sendParams)

        // Get the raw transaction
        const rawTx = await sdk.bridge.rawTxBuilder.send(sendParams)

        // Log the raw transaction for debugging
        console.log('Bridge rawTx:', rawTx)

        // Continue with the bridge transaction
        const hash = await initiateBridge(sendParams)

        // Add transaction to list
        const newTransaction: Transaction = {
          hash,
          messenger: selectedMessenger,
          timestamp: Date.now(),
          amount,
          sourceToken: sourceToken.symbol,
          destinationToken: destinationToken.symbol,
          sourceChain: sourceToken.chainSymbol,
          destinationChain: destinationToken.chainSymbol,
          status: 'pending'
        }

        console.log('New transaction:', newTransaction)
        setTransactions((prev) => [newTransaction, ...prev])
        console.log('Bridge transaction hash:', hash)

        // Start checking status every 5 seconds
        statusCheckIntervalRef.current = setInterval(async () => {
          const status = await checkTransferStatus(hash, sourceToken.chainSymbol as ChainSymbol)
          if (status) {
            // Update transaction status in the list
            setTransactions((prev) => prev.map((tx) => (tx.hash === hash ? { ...tx, status } : tx)))
            if (status === 'complete') {
              return
            }
          }
        }, 1000)

        toast.success('Transaction initiated successfully!')
      }
    } catch (err) {
      console.error('Transfer failed:', err)
      toast.error('Transaction failed. Please try again.')
      // Clear interval on error
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current)
        statusCheckIntervalRef.current = null
      }
    }
  }

  const getExplorerUrl = (hash: string, messenger: Messenger) => {
    switch (messenger) {
      case Messenger.ALLBRIDGE:
        return `https://core.allbridge.io/explorer/transfer/${hash}`
      case Messenger.WORMHOLE:
        return `https://wormholescan.io/#/tx/${hash}`
      default:
        return `https://core.allbridge.io/explorer/transfer/${hash}`
    }
  }

  const [selectedToToken, setSelectedToToken] = useState(destinationToken?.symbol || 'USDC')
  const [isToChainOpen, setIsToChainOpen] = useState(false)

  const [selectedFromChain, setSelectedFromChain] = useState(sourceChain?.name || 'Polygon')
  const [selectedFromToken, setSelectedFromToken] = useState(sourceToken?.symbol || 'USDC')

  const [isFromChainOpen, setIsFromChainOpen] = useState(false)
  const [isFromTokenOpen, setIsFromTokenOpen] = useState(false)
  const [isToTokenOpen, setIsToTokenOpen] = useState(false)
  const [isMessengerOpen, setIsMessengerOpen] = useState(false)

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

          // If user is connected, try to switch to the selected network
        }
      }
    }
  }, [selectedFromChain, selectedFromToken, chains, setSourceToken, isConnected])

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
            chainSymbol:
              selectedToChain === 'Nexon'
                ? ChainSymbol.ARB
                : (chainData.chainSymbol as ChainSymbol),
            chainId: selectedToChain === 'Nexon' ? '42161' : chainData.allbridgeChainId.toString()
          }
          setDestinationToken(tokenWithChainDetails)
        }
      }
    }
  }, [selectedToChain, selectedToToken, chains, setDestinationToken])

  // Track if this is the initial load
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Modify token dropdown open useEffects
  useEffect(() => {
    if (!isInitialLoad && !swappingRef.current) {
      if (selectedFromChain) {
        setIsFromTokenOpen(true)
      }
    }
    if (isConnected) {
      switchToNetwork(selectedFromChain)
    }
  }, [selectedFromChain])

  useEffect(() => {
    if (!isInitialLoad && !swappingRef.current) {
      if (selectedToChain) {
        setIsToTokenOpen(true)
      }
    }
  }, [selectedToChain])

  // Reset swap ref after chain updates
  useEffect(() => {
    if (isSwapping) {
      swappingRef.current = false
      setIsSwapping(false)
    }
  }, [selectedFromChain, selectedToChain])

  // Set isInitialLoad to false after the first render
  useEffect(() => {
    setIsInitialLoad(false)
  }, [])

  // Function to calculate estimated receive amount
  const calculateEstimatedReceiveAmount = async () => {
    if (!sdk || !sourceToken || !destinationToken || !amount) {
      setEstimatedReceiveAmount('0')
      return
    }

    try {
      setIsLoadingEstimate(true)
      // Get gas fee options first
      const feeOptions = await sdk.getGasFeeOptions(
        sourceToken,
        destinationToken,
        selectedMessenger
      )

      // Calculate total amount to be sent (including gas fee)
      let totalAmountToSend = amount
      if (feeOptions) {
        if (useNativeTokenForGas && feeOptions.native) {
          // If using native token for gas, the amount stays the same
          totalAmountToSend = amount
        } else if (!useNativeTokenForGas && feeOptions.stablecoin) {
          // If using stablecoin for gas, subtract the gas fee from the amount
          const amountFloat = parseFloat(amount)
          const gasFeeFloat = parseFloat(feeOptions.stablecoin.float)
          totalAmountToSend = Math.max(0, amountFloat - gasFeeFloat).toString()
        }
      }

      const amountToBeReceived = await sdk.getAmountToBeReceived(
        totalAmountToSend,
        sourceToken,
        destinationToken
      )
      setEstimatedReceiveAmount(amountToBeReceived)
    } catch (error) {
      console.error('Error calculating estimated receive amount:', error)
      setEstimatedReceiveAmount('0')
    } finally {
      setIsLoadingEstimate(false)
    }
  }

  // Calculate estimated amount when relevant values change
  useEffect(() => {
    calculateEstimatedReceiveAmount()
  }, [amount, sourceToken, destinationToken, useNativeTokenForGas, selectedMessenger])

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

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
                  Balance: {sourceTokenBalance} {sourceToken?.symbol}
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
                  <button
                    onClick={handleMaxClick}
                    className="border bg-white/5 border-white/20 rounded-md p-2 py-1 text-white/50 hover:bg-white/10 cursor-pointer text-xs text-center items-center justify-center"
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>

            <div className="relative">
              <hr className="border-white/5" />
              <button
                onClick={() => {
                  swappingRef.current = true

                  // Swap chains
                  const tempChain = selectedFromChain
                  setSelectedFromChain(selectedToChain)
                  setSelectedToChain(tempChain)

                  // Swap tokens
                  const tempToken = selectedFromToken
                  setSelectedFromToken(selectedToToken)
                  setSelectedToToken(tempToken)

                  // Optional for UI effect
                  setIsSwapping(true)
                }}
                className="active:rotate-180  transform absolute cursor-pointer left-1/2 -translate-x-1/2 -translate-y-1/2 bg-secondary border-2 border-white/5 rounded-full p-2 hover:bg-white/5 transition-all duration-300"
              >
                <IconTransferVertical className={`w-4 h-4 transition-transform  `} />
              </button>
            </div>
            {/* Receive Section */}
            <div className="  p-4">
              <div className="flex justify-between items-center">
                <p className="text-white text-sm mb-2">You Receive</p>
              </div>

              <div className="flex items-center   mb-2 gap-2 w-full">
                <div
                  onClick={() => setIsToChainOpen(!isToChainOpen)}
                  className=" flex items-center gap-2 cursor-pointer p-2 rounded-md bg-white/5 border-2 border-white/5   "
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
                <div className=" flex items-center gap-2 cursor-pointer px-2 rounded-md bg-white/5 border-2 border-white/5  flex-1 w-max">
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
                    value={isLoadingEstimate ? 'Calculating...' : estimatedReceiveAmount}
                    readOnly
                    className="border-l-2 px-4 border-white/5 flex-1 outline-none font-dm-mono  rounded-none ring-0 active:outline-none  active:ring-offset-0  text-left text-white p-2  placeholder-white/30"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Info Section */}
          <div className="flex justify-between items-center text-white/30 text-sm rounded-2xl bg-white/5 border-2 border-white/5 ">
            <div className="flex gap-2 w-full justify-around items-center align-middle p-4">
              {/* Messenger Selection */}
              <div className="flex w-max gap-2 items-center text-white/50   p-2   relative">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setIsMessengerOpen(!isMessengerOpen)}
                >
                  <Image
                    src={
                      messengerOptions.find((option) => option.messenger === selectedMessenger)
                        ?.logo || allbridgeLogo
                    }
                    alt="Messenger Logo"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  <span className="text-white">
                    {messengerOptions.find((option) => option.messenger === selectedMessenger)
                      ?.name || 'Allbridge'}
                  </span>
                  {supportedMessengers.has(selectedMessenger) &&
                    messengerTransferTimes.get(selectedMessenger) && (
                      <span className="text-xs text-white/50">
                        ≈{' '}
                        {formatTransferTime(messengerTransferTimes.get(selectedMessenger) || null)}
                      </span>
                    )}
                  <IconChevronDown className="w-4 h-4" />
                </div>

                {isMessengerOpen && (
                  <div className="absolute w-max top-full left-0 right-0 mt-1 p-2 gap-2 flex flex-col bg-secondary border-2 border-white/5 rounded-2xl overflow-hidden z-50">
                    {messengerOptions.map((option) => (
                      <div
                        key={option.messenger}
                        onClick={() => {
                          if (supportedMessengers.has(option.messenger)) {
                            setSelectedMessenger(option.messenger)
                            setIsMessengerOpen(false)
                          }
                        }}
                        className={`flex items-center gap-2 justify-between cursor-pointer p-2 rounded-md ${
                          supportedMessengers.has(option.messenger)
                            ? selectedMessenger === option.messenger
                              ? 'text-white bg-white/10'
                              : 'text-white/50 hover:text-white hover:bg-white/5'
                            : 'text-white/20 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Image
                            src={option.logo}
                            alt={option.name}
                            width={20}
                            height={20}
                            className="w-5 h-5"
                          />
                          {option.name}
                        </div>
                        {supportedMessengers.has(option.messenger) &&
                          messengerTransferTimes.get(option.messenger) && (
                            <span className="text-xs text-white/50">
                              ≈{' '}
                              {formatTransferTime(
                                messengerTransferTimes.get(option.messenger) || null
                              )}
                            </span>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <p className="text-white/50">Relayer Fee ≈ {formatGasFee(gasFee)}</p>

                <div className="flex items-center gap-2">
                  <Image
                    src={getLogoPath(sourceToken?.chainSymbol || 'ETH')}
                    alt={sourceToken?.chainSymbol || 'ETH'}
                    width={16}
                    height={16}
                    className="w-4 h-4 "
                  />
                  <Switch
                    isChecked={!useNativeTokenForGas}
                    setIsChecked={(isChecked) => setUseNativeTokenForGas(!isChecked)}
                    label=""
                  />
                  <Image
                    src={getLogoPath(sourceToken?.symbol || 'USDC')}
                    alt={sourceToken?.symbol || 'USDC'}
                    width={16}
                    height={16}
                    className="w-4 h-4 "
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={() => {
              if (isConnected) {
                handleTransfer()
              } else {
                toggleConnectWalletModal()
                onClose()
              }
            }}
            disabled={isLoading && isConnected}
            className="w-full nexon-button nexon-primary text-center flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {!isConnected ? (
              'Connect Wallet'
            ) : isLoading ? (
              <>
                Processing <IconLoader2 className="w-4 h-4 animate-spin" />
              </>
            ) : (
              <>
                Send <IconArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Transaction List */}
          {transactions.length > 0 && (
            <div className="mt-4 border-t border-white/5 pt-4">
              <h3 className="text-white text-sm mb-2">Recent Transactions</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {transactions.map((tx) => (
                  <a
                    key={tx.hash}
                    href={getExplorerUrl(tx.hash, tx.messenger)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Image
                          src={getLogoPath(tx.sourceToken)}
                          alt={tx.sourceToken}
                          width={24}
                          height={24}
                          className="w-6 h-6"
                        />
                        <div className="flex flex-col">
                          <span className="text-white text-sm">
                            {tx.amount} {tx.sourceToken} → {tx.destinationToken}
                          </span>
                          <span className="text-white/50 text-xs">
                            {tx.sourceChain} → {tx.destinationChain}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/50 text-xs">{formatTime(tx.timestamp)}</span>
                        <IconExternalLink className="w-4 h-4 text-white/50" />
                      </div>
                    </div>
                    <ProgressBar
                      sourceChain={tx.sourceChain}
                      destinationChain={tx.destinationChain}
                      status={tx.status || 'pending'}
                      getLogoPath={getLogoPath}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
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
        return {
          name: chain.name,
          logo: getLogoPath(chain.chainSymbol),
          supportedTokens: chain.tokens.map((token: Token) => token.symbol)
        }
      })

      // Add Nexon as a destination chain option
      options.push({
        name: 'Nexon',
        logo: getLogoPath('Nexon'),
        supportedTokens: ['USDC']
      })

      return options
    } else {
      // For tokens, filter based on selected chain
      const selectedChainData = Object.values(chains).find(
        (chain: Chain) => chain.name === selectedChain
      )

      // If the selected chain is Nexon, only return USDC
      if (selectedChain === 'Nexon') {
        return ['USDC']
      }

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
      // Special handling for Nexon
      if (selectedValue === 'Nexon') {
        return 'Nexon'
      }

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
        <div className="  z-50 bg-secondary/50 backdrop-blur  w-full h-full absolute top-0 left-0">
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
