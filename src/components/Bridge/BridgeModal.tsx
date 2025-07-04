import {
  IconArrowRight,
  IconChevronDown,
  IconLoader2,
  IconSearch,
  IconX
} from '@tabler/icons-react'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { useAccount, useWalletClient, useBalance } from 'wagmi'
import { switchChain } from 'wagmi/actions'
import { useDisconnect } from 'wagmi'
import { config } from '@/config/wagmi'
import { useWalletModal } from '@/context/WalletModalContext'
import { useBridge } from '@/context/BridgeContext'
import { Messenger, FeePaymentMethod, RawEvmTransaction } from '@allbridge/bridge-core-sdk'
import Switch from '@/components/common/Switch'
import { formatSolanaAddress } from '@/utils/format'
import { useTronTransfer } from './TronProvider'
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
import ConnectTronWallet from '../ConnectWalletModal/TronWallet'

import { useTronWallet } from '@/utils/tronWalletAdapter'

import { useSolanaWallet } from './SolanaButton'
import { useHandleSolanaTransfer } from './SolanaButton'

import { ISupportedWallet } from '@creit.tech/stellar-wallets-kit'
import { useWallet as useSuiWallet, ConnectModal as SuiConnectModal } from '@suiet/wallet-kit'
import Avatar from '../common/Avatar'
import StellarProvider from './StellarProvider'
import BridgeWalletModal from './BridgeWalletModal'
import Accordion from '../common/Accordion'
import TransactionsCard from './TransactionsCard'
// Remove the Transaction interface since we're using BridgeTransaction from context
interface ChainOption {
  name: string
  logo: string
  supportedTokens: string[]
}

interface Token {
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

interface Chain {
  name: string
  chainSymbol: string
  chainType: string
  allbridgeChainId: number
  bridgeAddress: string
  tokens: Token[]
}

function BridgeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // Wallet hooks
  const {
    publicKey: solanaAddress,
    connected: isSolanaConnected,
    disconnect: disconnectSolana
  } = useSolanaWallet()
  const { address, isConnected } = useAccount()
  const { toggleConnectWalletModal } = useWalletModal()
  const { isTronConnected, tronAddress, disconnectTron } = useTronWallet()
  const { data: walletClient } = useWalletClient()
  const { disconnect } = useDisconnect()
  const {
    connected: isSuiConnected,
    account: suiAddress,
    disconnect: disconnectSui
  } = useSuiWallet()
  const { handleTronTransfer, checkTronAllowance } = useTronTransfer()

  // Bridge context
  const {
    chains,
    sourceChain,
    destinationChain,
    sourceToken,
    destinationToken,
    setSourceChain,
    setDestinationChain,
    setSourceToken,
    setDestinationToken,
    isLoading,
    setIsLoading,
    getGasFeeOptions,
    getAverageTransferTime,
    setAmount,
    amount,
    sdk,
    setUseNativeTokenForGas,
    useNativeTokenForGas,
    isTronAllowanceApproved,
    selectedMessenger,
    setSelectedMessenger,
    showWalletsModal,
    setShowWalletsModal,
    transactions,
    nativeBalance,
    addTransaction
  } = useBridge()

  const stellarKit = StellarProvider()

  // Refs
  const swappingRef = useRef(false)
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // UI state
  const [isFromChainOpen, setIsFromChainOpen] = useState(false)
  const [isToChainOpen, setIsToChainOpen] = useState(false)
  const [isFromTokenOpen, setIsFromTokenOpen] = useState(false)
  const [isToTokenOpen, setIsToTokenOpen] = useState(false)
  const [isMessengerOpen, setIsMessengerOpen] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [gasFee, setGasFee] = useState<string | null>(null)
  const [supportedMessengers, setSupportedMessengers] = useState<Set<Messenger>>(new Set())
  const [sourceTokenBalance, setSourceTokenBalance] = useState<string>('0')
  const [estimatedReceiveAmount, setEstimatedReceiveAmount] = useState<string>('0')
  const [isLoadingEstimate, setIsLoadingEstimate] = useState(false)

  const [stellarAddress, setStellarAddress] = useState<string | null>(null)
  const [showSuiModal, setShowSuiModal] = useState(false)

  // Chain and token selection state
  const [selectedFromChain, setSelectedFromChain] = useState(sourceChain?.name || '')
  const [selectedToChain, setSelectedToChain] = useState(destinationChain?.name || '')
  const [selectedFromToken, setSelectedFromToken] = useState(sourceToken?.symbol || '')
  const [selectedToToken, setSelectedToToken] = useState(destinationToken?.symbol || '')

  // Update local state when context values change
  useEffect(() => {
    if (sourceChain) {
      setSelectedFromChain(sourceChain.name)
    }
    if (destinationChain) {
      setSelectedToChain(destinationChain.name)
    }
    if (sourceToken) {
      setSelectedFromToken(sourceToken.symbol)
    }
    if (destinationToken) {
      setSelectedToToken(destinationToken.symbol)
    }
  }, [sourceChain, destinationChain, sourceToken, destinationToken])

  // Update context when local chain selection changes
  const handleFromChainChange = async (chainName: string) => {
    // Prevent duplicate updates
    if (chainName === selectedFromChain) return

    setSelectedFromChain(chainName)
    const newChain = Object.values(chains).find((chain) => chain.name === chainName)
    if (newChain) {
      setSourceChain(newChain)
      // Reset token if it's not supported in the new chain
      if (sourceToken && !newChain.tokens.some((t) => t.symbol === sourceToken.symbol)) {
        setSourceToken(null)
        setSelectedFromToken('')
      }

      // If Arbitrum is selected as source chain, set Nexon as destination
      if (chainName === 'Arbitrum') {
        // Find Arbitrum chain from the chains object
        const arbitrumChain = Object.values(chains).find((chain) => chain.name === 'Arbitrum')
        if (arbitrumChain) {
          // Set Arbitrum as the actual destination chain for bridge operations
          setDestinationChain(arbitrumChain)
          // Set Nexon as the display name in UI
          setSelectedToChain('Nexon')
          // Set USDC as the destination token
          const usdcToken = arbitrumChain.tokens.find((token) => token.symbol === 'USDC')
          if (usdcToken) {
            setDestinationToken(usdcToken)
            setSelectedToToken('USDC')
          }
        }
      }

      // Handle network switching
      if (isConnected && !['Tron', 'Solana', 'Sui', 'Stellar'].includes(chainName)) {
        await switchToNetwork(chainName)
      }

      // Handle Tron allowance check
      if (chainName === 'Tron' && sourceToken && amount && tronAddress) {
        checkTronAllowance(sourceToken, amount, tronAddress)
      }
    }
  }

  const handleToChainChange = (chainName: string) => {
    setSelectedToChain(chainName)
    const newChain = Object.values(chains).find((chain) => chain.name === chainName)
    if (newChain) {
      setDestinationChain(newChain)
      // Reset token if it's not supported in the new chain
      if (destinationToken && !newChain.tokens.some((t) => t.symbol === destinationToken.symbol)) {
        setDestinationToken(null)
        setSelectedToToken('')
      }
    }
  }

  // Update context when local token selection changes
  const handleFromTokenChange = (tokenSymbol: string) => {
    setSelectedFromToken(tokenSymbol)
    if (sourceChain) {
      const newToken = sourceChain.tokens.find((t) => t.symbol === tokenSymbol)
      if (newToken) {
        setSourceToken(newToken)
      }
    }
  }

  const handleToTokenChange = (tokenSymbol: string) => {
    setSelectedToToken(tokenSymbol)
    if (destinationChain) {
      const newToken = destinationChain.tokens.find((t) => t.symbol === tokenSymbol)
      if (newToken) {
        setDestinationToken(newToken)
      }
    }
  }

  // Reset swap state after chain updates
  useEffect(() => {
    if (isSwapping) {
      setIsSwapping(false)
    }
  }, [selectedFromChain, selectedToChain])

  // Get token balances using wagmi's useBalance hook
  const { data: sourceTokenBalanceData } = useBalance({
    address,
    token: sourceToken?.tokenAddress as `0x${string}`,
    query: {
      refetchInterval: 10000 // Refetch every 5 seconds
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
    // Add the token symbol based on the payment method
    const tokenSymbol = useNativeTokenForGas ? sourceToken.chainSymbol : sourceToken.symbol
    return `${formattedFee} ${tokenSymbol}`
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
      const feeOptions = await getGasFeeOptions(sourceToken, destinationToken, selectedMessenger)

      if (!feeOptions) {
        setGasFee(null)
        return
      }

      // Update gas fee based on the selected payment method
      if (useNativeTokenForGas) {
        if (feeOptions.native) {
          setGasFee(feeOptions.native.float)
        } else {
          setGasFee(null)
          toast.error('Native token payment not available for this transfer')
        }
      } else {
        if (feeOptions.stablecoin) {
          setGasFee(feeOptions.stablecoin.float)
        } else {
          setGasFee(null)
          toast.error('Stablecoin payment not available for this transfer')
        }
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

  // Calculate estimated receive amount when relevant values change
  useEffect(() => {
    // Add a small delay to ensure gas fee is updated before calculating receive amount
    const timer = setTimeout(() => {
      calculateEstimatedReceiveAmount()
    }, 100)
    return () => clearTimeout(timer)
  }, [amount, sourceToken, destinationToken, useNativeTokenForGas, selectedMessenger, gasFee])

  // Function to calculate estimated receive amount
  const calculateEstimatedReceiveAmount = async () => {
    if (!sdk || !sourceToken || !destinationToken || !amount) {
      setEstimatedReceiveAmount('0')
      return
    }

    try {
      setIsLoadingEstimate(true)

      if (Number(amount) <= 0) {
        setEstimatedReceiveAmount('0')
        setIsLoadingEstimate(false)
        return
      }

      // Calculate total amount to be sent (including gas fee)
      let totalAmountToSend = amount
      if (gasFee) {
        if (!useNativeTokenForGas) {
          // If using stablecoin for gas, subtract the gas fee from the amount
          const amountFloat = parseFloat(amount)
          const gasFeeFloat = parseFloat(gasFee)
          // Ensure we don't go below 0 and limit to 6 decimal places for USDC
          const result = Math.max(0, amountFloat - gasFeeFloat)
          totalAmountToSend = result.toFixed(6)

          // If the amount after gas fee is 0, return early
          if (totalAmountToSend === '0.000000') {
            setEstimatedReceiveAmount('0')
            setIsLoadingEstimate(false)
            return
          }
        }
      }

      // Get the amount to be received
      const amountToBeReceived = await sdk.getAmountToBeReceived(
        totalAmountToSend,
        sourceToken,
        destinationToken
      )

      // Only update if we got a valid response
      if (amountToBeReceived) {
        setEstimatedReceiveAmount(amountToBeReceived)
      } else {
        setEstimatedReceiveAmount('0')
      }
    } catch (error) {
      console.error('Error calculating estimated receive amount:', error)
      setEstimatedReceiveAmount('0')
    } finally {
      setIsLoadingEstimate(false)
    }
  }

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
  // Modify handleTransfer to check status periodically
  const handleTransfer = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
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
      setIsLoading(true)
      // Get fee options to validate payment method
      const feeOptions = await getGasFeeOptions(sourceToken, destinationToken, selectedMessenger)

      if (!feeOptions) {
        toast.error('Failed to get fee options')
        return
      }

      // Validate that the selected payment method is available
      if (useNativeTokenForGas && !feeOptions.native) {
        toast.error('Native token payment not available for this transfer')
        return
      }
      if (!useNativeTokenForGas && !feeOptions.stablecoin) {
        toast.error('Stablecoin payment not available for this transfer')
        return
      }

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

      const owner = address
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
        const hash = await walletClient?.sendTransaction(rawTx)

        if (hash) {
          // Add transaction to list using context function
          addTransaction({
            hash,
            messenger: selectedMessenger,
            timestamp: Date.now(),
            amount,
            sourceToken: sourceToken.symbol,
            destinationToken: destinationToken.symbol,
            sourceChain: sourceToken.chainSymbol,
            destinationChain: destinationToken.chainSymbol,
            transferTime: messengerTransferTimes.get(selectedMessenger) || null
          })

          console.log('Bridge transaction hash:', hash)

          toast.success('Transaction initiated successfully!')
        }
      }
    } catch (err) {
      console.error('Transfer failed:', err)
      toast.error('Transaction failed. Please try again.')
      setIsLoading(false)
      // Clear interval on error
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current)
        statusCheckIntervalRef.current = null
      }
    }
  }

  // const { connection } = useAppKitConnection()

  //Stellar
  const handleStellarTransfer = async () => {
    if (!stellarKit) {
      toast.error('Stellar SDK not initialized')
      return
    }
    await stellarKit.openModal({
      onWalletSelected: async (option: ISupportedWallet) => {
        stellarKit.setWallet(option.id)
        const { address } = await stellarKit.getAddress()
        // Do something else
        console.log('Stellar address:', address)
        setStellarAddress(address)
      }
    })
  }

  // Track if this is the initial load
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Modify token dropdown open useEffects
  useEffect(() => {
    // Only open dropdown if not swapping and not initial load
    if (!isInitialLoad && !swappingRef.current && !isSwapping && selectedFromChain) {
      setIsFromTokenOpen(true)
    }
  }, [selectedFromChain, isSwapping, swappingRef.current])

  useEffect(() => {
    // Only open dropdown if not swapping and not initial load
    if (!isInitialLoad && !swappingRef.current && !isSwapping && selectedToChain) {
      setIsToTokenOpen(true)
    }
  }, [selectedToChain, isSwapping, swappingRef.current])

  // Set isInitialLoad to false after the first render
  useEffect(() => {
    setIsInitialLoad(false)
  }, [])

  const handleSolanaTransfer = useHandleSolanaTransfer()

  return (
    <div
      className={`${isOpen ? 'block' : 'hidden'} absolute top-0 left-0 w-full h-full bg-black/50`}
    >
      <div className="flex justify-center items-center bg-secondary/50 backdrop-blur-3xl p-6 min-h-screen filter">
        <div className="flex flex-col gap-4 bg-secondary p-6 border-2 border-white/5 rounded-3xl min-w-lg max-w-full">
          {/* Header */}
          <BridgeWalletModal isOpen={showWalletsModal} onClose={() => setShowWalletsModal(false)} />
          <div className="flex justify-between items-center">
            <h2 className="text-white text-2xl">Bridging</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <IconX className="bg-white/5 p-1.5 rounded-full w-8 h-8 cursor-pointer" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-2">
            <Image
              src={getLogoPath(
                Object.values(chains).find((chain: Chain) => chain.name === selectedFromChain)
                  ?.chainSymbol || 'ARB'
              )}
              alt="Logo"
              width={20}
              height={20}
            />
            {(() => {
              switch (sourceToken?.chainSymbol) {
                case 'TRX':
                  if (isTronConnected) {
                    return (
                      <div className="flex items-center gap-2 p-2 border-2 border-white/5 rounded-full hover:text-white text-sm">
                        <Avatar avatar={'1'} className="w-4 h-4" /> {tronAddress?.slice(0, 6)}...
                        {tronAddress?.slice(-4)}
                        <button
                          onClick={disconnectTron}
                          className="text-gray-400 hover:text-red-300 cursor-pointer"
                        >
                          <IconX className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  }
                  return 'Not Connected'

                case 'SOL':
                  if (isSolanaConnected) {
                    return (
                      <div className="flex items-center gap-2 p-2 border-2 border-white/5 rounded-full hover:text-white text-sm">
                        <Avatar avatar={'1'} className="w-4 h-4" />
                        {solanaAddress && formatSolanaAddress(solanaAddress.toString())}
                        <button
                          onClick={() => disconnectSolana()}
                          className="text-gray-400 hover:text-red-300 cursor-pointer"
                        >
                          <IconX className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  }
                  return 'Not Connected'
                case 'SUI':
                  if (isSuiConnected) {
                    return (
                      <div className="flex items-center gap-2 p-2 border-2 border-white/5 rounded-full hover:text-white text-sm">
                        <Avatar avatar={'1'} className="w-4 h-4" />{' '}
                        {suiAddress?.address.slice(0, 6)}...{suiAddress?.address.slice(-4)}
                        <button
                          onClick={() => disconnectSui()}
                          className="text-gray-400 hover:text-red-300 cursor-pointer"
                        >
                          <IconX className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  }
                  return 'Not Connected'

                case 'SRB':
                  return (
                    <div className="flex items-center gap-2 p-2 border-2 border-white/5 rounded-full hover:text-white text-sm">
                      {stellarAddress ? (
                        <>
                          <Avatar avatar={'1'} className="w-4 h-4" />
                          {stellarAddress?.slice(0, 6)}...{stellarAddress?.slice(-4)}
                          <button className="text-gray-400 hover:text-red-300 cursor-pointer">
                            <IconX className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        'Not Connected'
                      )}
                    </div>
                  )
                default:
                  return (
                    <div className="flex items-center gap-2 p-2 border-2 border-white/5 rounded-full hover:text-white text-sm">
                      {isConnected ? (
                        <>
                          <Avatar avatar={'1'} className="w-4 h-4" /> {address?.slice(0, 6)}...
                          {address?.slice(-4)}
                          <button
                            onClick={() => disconnect()}
                            className="text-gray-400 hover:text-red-300 cursor-pointer"
                          >
                            <IconX className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span>Not Connected</span>
                      )}
                    </div>
                  )
              }
            })()}
            {nativeBalance &&
              useNativeTokenForGas &&
              Number(nativeBalance) < Number(gasFee) &&
              isConnected &&
              !['TRX', 'SOL', 'SRB', 'SUI'].includes(sourceToken?.chainSymbol as string) && (
                <div
                  className={`flex   items-center gap-2 p-2 border    rounded-md text-sm text-center bg-red-800/10 border-red-900 visible' `}
                >
                  Not enough Gas Fees
                </div>
              )}
          </div>
          <div className="flex flex-col bg-white/5 border-2 border-white/5 rounded-2xl">
            {/* Pay Section */}
            <div className="p-4">
              <div className="flex justify-between items-center">
                <p className="mb-2 text-white text-sm">You Pay</p>
                <p className="font-light text-white/30 text-sm text-right">
                  Balance: {sourceTokenBalance} {sourceToken?.symbol}
                </p>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <div
                  onClick={() => setIsFromChainOpen(!isFromChainOpen)}
                  className="flex items-center gap-2 bg-white/5 p-2 border-2 border-white/5 rounded-md cursor-pointer"
                >
                  <DynamicDropdown
                    selectedValue={selectedFromChain}
                    setSelectedValue={handleFromChainChange}
                    isOpen={isFromChainOpen}
                    setIsOpen={setIsFromChainOpen}
                    type="chain"
                    getLogoPath={getLogoPath}
                    selectedChain={selectedToChain}
                    isSource={true}
                  />
                  <IconChevronDown className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-2 border-2 border-white/5 rounded-md cursor-pointer">
                  <div
                    onClick={() => setIsFromTokenOpen(!isFromTokenOpen)}
                    className="flex items-center gap-2 px-2 h-full"
                  >
                    <DynamicDropdown
                      selectedValue={selectedFromToken}
                      setSelectedValue={handleFromTokenChange}
                      isOpen={isFromTokenOpen}
                      setIsOpen={setIsFromTokenOpen}
                      type="token"
                      selectedChain={selectedFromChain}
                      getLogoPath={getLogoPath}
                      isSource={true}
                    />
                    <IconChevronDown className="w-4 h-4" />
                  </div>

                  <input
                    type="number"
                    placeholder="0"
                    value={amount || ''}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 p-2 px-4 border-white/5 border-l-2 rounded-none outline-none active:outline-none ring-0 active:ring-offset-0 text-white text-left placeholder-white/30"
                  />
                  <button
                    onClick={handleMaxClick}
                    className="justify-center items-center bg-white/5 hover:bg-white/10 p-2 py-1 border border-white/20 rounded-md text-white/50 text-xs text-center cursor-pointer"
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>

            <div className="relative">
              <hr className="border-white/5" />
              {/* Swap button commented out
              <button
                onClick={handleChainSwap}
                className="left-1/2 absolute bg-secondary hover:bg-white/5 p-2 border-2 border-white/5 rounded-full active:rotate-180 transition-all -translate-x-1/2 -translate-y-1/2 duration-300 cursor-pointer transform"
              >
                <IconTransferVertical className={`w-4 h-4 transition-transform`} />
              </button>
              */}
            </div>
            {/* Receive Section */}
            <div className="p-4">
              <div className="flex justify-between items-center">
                <p className="mb-2 text-white text-sm">You Receive</p>
              </div>

              <div className="flex items-center gap-2 mb-2 w-full">
                <div
                  onClick={() => setIsToChainOpen(!isToChainOpen)}
                  className="flex items-center gap-2 bg-white/5 p-2 border-2 border-white/5 rounded-md cursor-pointer"
                >
                  <DynamicDropdown
                    selectedValue={selectedToChain}
                    setSelectedValue={handleToChainChange}
                    isOpen={isToChainOpen}
                    setIsOpen={setIsToChainOpen}
                    type="chain"
                    getLogoPath={getLogoPath}
                    selectedChain={selectedFromChain}
                    isSource={false}
                  />
                  <IconChevronDown className="w-4 h-4" />
                </div>
                <div className="flex flex-1 items-center gap-2 bg-white/5 px-2 border-2 border-white/5 rounded-md w-max cursor-pointer">
                  <div
                    onClick={() => setIsToTokenOpen(!isToTokenOpen)}
                    className="flex items-center gap-2 px-2 h-full"
                  >
                    <DynamicDropdown
                      selectedValue={selectedToToken}
                      setSelectedValue={handleToTokenChange}
                      isOpen={isToTokenOpen}
                      setIsOpen={setIsToTokenOpen}
                      type="token"
                      selectedChain={selectedToChain}
                      getLogoPath={getLogoPath}
                      isSource={false}
                    />
                    <IconChevronDown className="w-4 h-4" />
                  </div>

                  <input
                    type="number"
                    placeholder="0"
                    value={isLoadingEstimate ? 'Calculating...' : estimatedReceiveAmount}
                    readOnly
                    className="flex-1 p-2 px-4 border-white/5 border-l-2 rounded-none outline-none active:outline-none ring-0 active:ring-offset-0 font-dm-mono text-white text-left placeholder-white/30"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Info Section */}
          <div className="flex justify-between items-center bg-white/5 border-2 border-white/5 rounded-2xl text-white/30 text-sm">
            <div className="flex justify-around items-center gap-2 p-4 w-full align-middle">
              {/* Messenger Selection */}
              <div className="relative flex items-center gap-2 p-2 w-max text-white/50">
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
                      <span className="text-white/50 text-xs">
                        ≈{' '}
                        {formatTransferTime(messengerTransferTimes.get(selectedMessenger) || null)}
                      </span>
                    )}
                  <IconChevronDown className="w-4 h-4" />
                </div>

                {isMessengerOpen && (
                  <div className="top-full right-0 left-0 z-50 absolute flex flex-col gap-2 bg-secondary mt-1 p-2 border-2 border-white/5 rounded-2xl w-max overflow-hidden">
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
                            <span className="text-white/50 text-xs">
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
                    className="w-4 h-4"
                  />
                  <Switch
                    isChecked={!useNativeTokenForGas}
                    setIsChecked={(isChecked) => {
                      setUseNativeTokenForGas(!isChecked)
                      // Immediately fetch new gas fee options when switch changes
                      setTimeout(fetchGasFeeOptions, 0)
                    }}
                    label=""
                  />
                  <Image
                    src={getLogoPath(sourceToken?.symbol || 'USDC')}
                    alt={sourceToken?.symbol || 'USDC'}
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <div
            onClick={(e) => {
              if (isLoading) {
                e.preventDefault()
                return
              }
              if (sourceToken?.chainSymbol === 'TRX' && !isTronConnected) {
                e.preventDefault()
                return
              }
              if (sourceToken?.chainSymbol === 'SOL' && !isSolanaConnected) {
                e.preventDefault()
                setShowWalletsModal(true)
                return
              }

              if (sourceToken?.chainSymbol === 'TRX' && isTronConnected) {
                handleTronTransfer()
              } else if (sourceToken?.chainSymbol === 'SOL') {
                handleSolanaTransfer()
              } else if (sourceToken?.chainSymbol === 'SRB') {
                handleStellarTransfer()
              } else if (sourceToken?.chainSymbol === 'SUI' && isSuiConnected) {
                // handleSuiTransfer()
              } else if (sourceToken?.chainSymbol === 'SUI' && !isSuiConnected) {
                return
              } else if (
                !['TRX', 'SOL', 'SRB', 'SUI'].includes(sourceToken?.chainSymbol as string) &&
                isConnected
              ) {
                handleTransfer()
              } else {
                toggleConnectWalletModal()
                onClose()
              }
            }}
            className="flex justify-center items-center gap-2 disabled:opacity-50 w-full text-center nexon-button nexon-primary"
          >
            {(() => {
              switch (sourceToken?.chainSymbol) {
                case 'TRX':
                  if (!isTronConnected) {
                    return <ConnectTronWallet />
                  }
                  if (isLoading) {
                    return (
                      <>
                        Processing <IconLoader2 className="w-4 h-4 animate-spin" />
                      </>
                    )
                  }
                  return isTronAllowanceApproved ? (
                    <>
                      Send <IconArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Approve {sourceToken?.symbol} <IconArrowRight className="w-4 h-4" />
                    </>
                  )

                case 'SOL':
                  if (!isSolanaConnected) {
                    return 'Connect Solana Wallet'
                  }
                  if (isLoading) {
                    return (
                      <>
                        Processing <IconLoader2 className="w-4 h-4 animate-spin" />
                      </>
                    )
                  }
                  return (
                    <>
                      Send <IconArrowRight className="w-4 h-4" />
                    </>
                  )

                case 'SRB':
                  if (!stellarAddress) {
                    return `Connect ${sourceToken?.chainSymbol} Wallet`
                  }
                  if (isLoading) {
                    return (
                      <>
                        Processing <IconLoader2 className="w-4 h-4 animate-spin" />
                      </>
                    )
                  }
                  return (
                    <>
                      Send <IconArrowRight className="w-4 h-4" />
                    </>
                  )

                case 'SUI':
                  if (!isSuiConnected)
                    return (
                      <SuiConnectModal
                        open={showSuiModal}
                        onOpenChange={(open) => setShowSuiModal(open)}
                      >
                        <button>Connect Wallet</button>
                      </SuiConnectModal>
                    )

                  if (isLoading) {
                    return (
                      <>
                        Processing <IconLoader2 className="w-4 h-4 animate-spin" />
                      </>
                    )
                  }
                  return (
                    <>
                      Send <IconArrowRight className="w-4 h-4" />
                    </>
                  )
                default:
                  if (!isConnected) {
                    return 'Connect Wallet'
                  }
                  if (isLoading) {
                    return (
                      <>
                        Processing <IconLoader2 className="w-4 h-4 animate-spin" />
                      </>
                    )
                  }
                  return (
                    <>
                      Send <IconArrowRight className="w-4 h-4" />
                    </>
                  )
              }
            })()}
          </div>

          {/* Transaction List */}
          {transactions.length > 0 && (
            <Accordion title="Recent Transactions" defaultOpen={true}>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {transactions.map((tx) => (
                  <TransactionsCard key={tx.hash} transaction={tx} getLogoPath={getLogoPath} />
                ))}
              </div>
            </Accordion>
          )}
        </div>
      </div>
    </div>
  )
}

const DynamicDropdown: React.FC<{
  selectedValue: string
  setSelectedValue: (value: string) => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  type: 'chain' | 'token'
  selectedChain?: string
  getLogoPath: (symbol: string) => string
  isSource: boolean
}> = ({
  selectedValue,
  setSelectedValue,
  isOpen,
  setIsOpen,
  type,
  selectedChain,
  getLogoPath,
  isSource
}) => {
  const { chains } = useBridge()

  const getOptions = (): (ChainOption | string)[] => {
    if (type === 'chain') {
      // If this is the destination chain dropdown, only show Nexon
      if (!isSource) {
        return [
          {
            name: 'Nexon',
            logo: getLogoPath('Nexon'),
            supportedTokens: ['USDC']
          }
        ]
      }
      // Convert chains object to array of chain options
      const options = Object.values(chains).map((chain: Chain) => {
        return {
          name: chain.name,
          logo: getLogoPath(chain.chainSymbol),
          supportedTokens: chain.tokens.map((token: Token) => token.symbol)
        }
      })

      // Filter out the currently selected chain from the other dropdown
      if (selectedChain) {
        return options.filter(
          (option) => typeof option === 'object' && option.name !== selectedChain
        )
      }

      return options
    } else {
      // For tokens, if it's the destination, only return USDC
      if (!isSource) {
        return ['USDC']
      }

      // For source tokens, filter based on selected chain
      const selectedChainData = Object.values(chains).find(
        (chain: Chain) => chain.name === selectedChain
      )

      return selectedChainData ? selectedChainData.tokens.map((token: Token) => token.symbol) : []
    }
  }

  const getTitle = () => {
    const prefix = isSource ? 'Source' : 'Destination'
    return type === 'chain' ? `Select ${prefix} Chain` : `Select ${prefix} Token`
  }

  const getDisplayValue = (option: ChainOption | string) => {
    return typeof option === 'string' ? option : option.name
  }

  // Get chain symbol for the selected chain
  const getSelectedChainSymbol = () => {
    if (type === 'chain') {
      // Always return Nexon for destination chain
      if (!isSource) {
        return 'Nexon'
      }
      const selectedChainData = Object.values(chains).find(
        (chain: Chain) => chain.name === selectedValue
      )
      return selectedChainData?.chainSymbol || 'ETH'
    }
    return selectedValue
  }

  // Get display name for the selected chain
  const getSelectedChainName = () => {
    if (type === 'chain') {
      // Always return Nexon for destination chain
      if (!isSource) {
        return 'Nexon'
      }
      return selectedValue
    }
    return selectedValue
  }

  return (
    <div className={` `}>
      <div className="flex items-center gap-2">
        <Image
          src={getLogoPath(getSelectedChainSymbol())}
          alt={getSelectedChainName()}
          className="w-4 h-4"
          width={16}
          height={16}
        />{' '}
        {getSelectedChainName()}
      </div>
      {isOpen && (
        <div className="top-0 left-0 z-50 absolute bg-secondary/50 backdrop-blur w-full h-full">
          <dialog
            open={isOpen}
            onClick={(e) => e.stopPropagation()}
            className="top-1/2 left-1/2 absolute flex flex-col gap-2 bg-secondary p-4 border-2 border-white/5 rounded-md -translate-x-1/2 -translate-y-1/2"
          >
            <div className="flex justify-between items-center">
              <p className="text-white">{getTitle()}</p>
              <IconX
                className="bg-white/5 p-1 rounded-full w-6 h-6 text-white/50 cursor-pointer"
                onClick={() => setIsOpen(false)}
              />
            </div>
            <div className="flex items-center gap-2 bg-white/5 p-2 border-2 border-white/5 rounded-md text-white/50">
              <IconSearch className="w-4 h-4" />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent outline-none font-proxima-nova text-white"
              />
            </div>
            {getOptions().map((option) => (
              <div
                onClick={() => {
                  const newValue = getDisplayValue(option)
                  // Prevent selecting the same chain
                  if (type === 'chain' && selectedChain === newValue) {
                    return
                  }
                  // If selecting Nexon as destination, actually set Arbitrum
                  if (!isSource && newValue === 'Nexon') {
                    setSelectedValue('Arbitrum')
                  } else {
                    setSelectedValue(newValue)
                  }
                  setIsOpen(false)
                }}
                className="flex items-center gap-2 hover:bg-white/5 p-2 rounded-md max-h-60 overflow-y-auto text-white/50 hover:text-white text-nowrap cursor-pointer"
                key={getDisplayValue(option)}
              >
                {type === 'chain' ? (
                  <Image
                    src={!isSource ? getLogoPath('Nexon') : (option as ChainOption).logo}
                    alt={!isSource ? 'Nexon' : (option as ChainOption).name}
                    width={24}
                    height={24}
                    className="w-4 h-4"
                  />
                ) : (
                  <Image
                    src={getLogoPath(getDisplayValue(option))}
                    alt={getDisplayValue(option)}
                    width={24}
                    height={24}
                    className="w-4 h-4"
                  />
                )}
                {type === 'chain'
                  ? !isSource
                    ? 'Nexon'
                    : getDisplayValue(option)
                  : getDisplayValue(option)}
              </div>
            ))}
          </dialog>
        </div>
      )}
    </div>
  )
}

export default BridgeModal
