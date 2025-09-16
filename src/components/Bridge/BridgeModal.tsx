import {
  IconArrowRight,
  IconBuildingBridge,
  IconChevronDown,
  IconLoader2,
  IconWallet,
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
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../ui/dialog'
import { Separator } from '../ui/separator'
import { Button } from '../ui/button'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import { Input } from '../ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useScreenSize } from '@/hooks/useScreenSize'
import { Badge } from '../ui/badge'
import { useTranslate } from '@tolgee/react'
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

function BridgeModal({ onClose }: { onClose: () => void }) {
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
  const { t } = useTranslate()
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
    // setUseNativeTokenForGas,
    useNativeTokenForGas,
    isTronAllowanceApproved,
    selectedMessenger,
    setSelectedMessenger,
    // showWalletsModal,
    setShowWalletsModal,
    // transactions,
    // nativeBalance,
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
    if (!ms) return t('–')
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    if (minutes === 0) {
      return `${seconds}s`
    }
    return seconds === 0 ? `${minutes}min` : `${minutes}min ${seconds}s`
  }

  // Format fee with the chain's native token symbol
  const formatGasFee = (fee: string | null): string => {
    if (!fee || !sourceToken) return t('–')
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
          toast.error(t('Native token payment not available for this transfer'))
        }
      } else {
        if (feeOptions.stablecoin) {
          setGasFee(feeOptions.stablecoin.float)
        } else {
          setGasFee(null)
          toast.error(t('Stablecoin payment not available for this transfer'))
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
      toast.error(t('Please connect your wallet first'))
      return false
    }

    // Find the chain details from our chains object
    const selectedChain = Object.values(chains).find((chain) => chain.name === chainName)

    if (!selectedChain) {
      toast.error(`${t('Chain')} ${chainName} ${t(`not found`)} }`)
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
      toast.error(`${t('Chain')} ${chainName} ${t('is not supported for network switching')}`)
      return false
    }

    try {
      // Request network switch using the supported chain ID
      console.log('Switching to network:', supportedChainId)
      await switchChain(config, { chainId: supportedChainId })
      toast.success(`${t('Switched to')} ${chainName} ${t('network')}`)
      return true
    } catch (error) {
      console.error('Failed to switch network:', error)
      toast.error(`${t('Failed to switch to')} ${chainName} ${t('network')}`)
      return false
    }
  }
  // Modify handleTransfer to check status periodically
  const handleTransfer = async () => {
    if (!isConnected) {
      toast.error(t('Please connect your wallet first'))
      return
    }

    if (!sourceToken || !destinationToken || !amount) {
      toast.error(t('Please fill in all required fields'))
      return
    }

    if (!sdk) {
      toast.error(t('Bridge SDK not initialized'))
      return
    }

    // Ensure we're on the correct network before proceeding
    const sourceChainName = Object.values(chains).find(
      (chain) => chain.allbridgeChainId.toString() === sourceToken.chainId
    )?.name

    if (sourceChainName) {
      const networkSwitched = await switchToNetwork(sourceChainName)
      if (!networkSwitched) {
        toast.error(t(`${t('Please switch to')} ${sourceChainName} ${t('network to proceed')}`))
        return
      }
    }

    try {
      setIsLoading(true)
      // Get fee options to validate payment method
      const feeOptions = await getGasFeeOptions(sourceToken, destinationToken, selectedMessenger)

      if (!feeOptions) {
        toast.error(t('Failed to get fee options'))
        return
      }

      // Validate that the selected payment method is available
      if (useNativeTokenForGas && !feeOptions.native) {
        toast.error(t('Native token payment not available for this transfer'))
        return
      }
      if (!useNativeTokenForGas && !feeOptions.stablecoin) {
        toast.error(t('Stablecoin payment not available for this transfer'))
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

          toast.success(t('Transaction initiated successfully!'))
        }
      }
    } catch (err) {
      console.error('Transfer failed:', err)
      toast.error(t('Transaction failed. Please try again.'))
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
  const { isMobile } = useScreenSize()

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
    <>
      <DialogHeader className="!h-fit items-start !w-full">
        <div className="flex items-center gap-2 !h-fit !w-full text-white text-sm">
          <IconBuildingBridge className="size-4" />
          {t('Bridge')}
        </div>
      </DialogHeader>
      <Separator />
      <div className="w-full h-fit pt-2 flex flex-col items-start justify-start gap-2">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-between gap-2 items-center">
            <p className="text-white text-sm">{t('You Pay')}</p>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleMaxClick}
                variant={'link'}
                size={'sm'}
                className="flex !p-0 h-fit w-fit items-center gap-2 text-xs"
              >
                {t('Use Max')} ({sourceTokenBalance} {sourceToken?.symbol})
              </Button>
            </div>
          </div>
          <div className="flex justify-between gap-2 w-full items-center">
            {!isMobile && (
              <Input
                type="number"
                placeholder="0"
                className="text-start text-white text-xs flex-2 w-full"
                value={amount || ''}
                onChange={(e) => setAmount(e.target.value)}
              />
            )}
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
          </div>
          {isMobile && (
            <div className="flex justify-between gap-2 w-full items-center">
              <Input
                type="number"
                placeholder="0"
                className="text-start text-white text-xs"
                value={amount || ''}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
      <div className="w-full h-fit pt-2 flex flex-col items-start justify-start gap-2">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-between gap-2 items-center">
            <p className="text-white text-sm">{t('You Receive')}</p>
          </div>
          <div className="flex justify-between gap-2 w-full items-center">
            {!isMobile && (
              <Input
                type="number"
                placeholder="0"
                className={cn(
                  'text-start placeholder:text-accent-foreground text-accent-foreground bg-accent text-xs w-full flex-2',
                  isLoadingEstimate && 'animate-pulse'
                )}
                value={isLoadingEstimate ? t('Calculating...') : estimatedReceiveAmount}
                readOnly
              />
            )}
            <DynamicDropdown
              selectedValue={selectedToChain}
              setSelectedValue={handleToChainChange}
              isOpen={isToChainOpen}
              setIsOpen={setIsToChainOpen}
              type="chain"
              getLogoPath={getLogoPath}
              selectedChain={selectedToChain}
              isSource={true}
            />
            <DynamicDropdown
              selectedValue={selectedToToken}
              setSelectedValue={handleToTokenChange}
              isOpen={isToTokenOpen}
              setIsOpen={setIsToTokenOpen}
              type="token"
              selectedChain={selectedToChain}
              getLogoPath={getLogoPath}
              isSource={true}
            />
          </div>
          {isMobile && (
            <div className="flex justify-between gap-2 w-full items-center">
              <Input
                type="number"
                placeholder="0"
                className={cn(
                  'text-start placeholder:text-accent-foreground text-accent-foreground bg-accent text-xs',
                  isLoadingEstimate && 'animate-pulse'
                )}
                value={isLoadingEstimate ? t('Calculating...') : estimatedReceiveAmount}
                readOnly
              />
            </div>
          )}
        </div>
      </div>
      <div className="w-full h-fit pt-2 flex flex-col items-start justify-start gap-2">
        <div className="flex text-xs text-white/50 justify-between gap-2 w-full items-center">
          <p>{t('Messenger Used:')}</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={'outline'}
                size={'sm'}
                className="flex !p-1 h-fit w-fit items-center gap-2 text-xs"
              >
                <Image
                  src={
                    messengerOptions.find((option) => option.messenger === selectedMessenger)
                      ?.logo || allbridgeLogo
                  }
                  alt={t('Messenger Logo')}
                  width={20}
                  height={20}
                  className="size-4"
                />
                <span className="text-white">
                  {messengerOptions.find((option) => option.messenger === selectedMessenger)
                    ?.name || t('Allbridge')}
                </span>
                {supportedMessengers.has(selectedMessenger) &&
                  messengerTransferTimes.get(selectedMessenger) && (
                    <span className="text-white/50 text-xs">
                      ≈ {formatTransferTime(messengerTransferTimes.get(selectedMessenger) || null)}
                    </span>
                  )}
                <IconChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {messengerOptions.map((option) => (
                <DropdownMenuItem
                  className={cn(
                    'py-2 flex items-center gap-4 justify-between',
                    selectedMessenger === option.messenger && 'bg-accent'
                  )}
                  onClick={() => {
                    if (supportedMessengers.has(option.messenger)) {
                      setSelectedMessenger(option.messenger)
                    }
                  }}
                  key={option.messenger}
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src={option.logo}
                      alt={option.name}
                      width={20}
                      height={20}
                      className="size-4"
                    />
                    <p
                      className={cn(
                        'text-white text-xs',
                        selectedMessenger === option.messenger && 'text-accent-foreground'
                      )}
                    >
                      {option.name}
                    </p>
                  </div>
                  {supportedMessengers.has(option.messenger) &&
                    messengerTransferTimes.get(option.messenger) && (
                      <span className="text-white/50 text-xs">
                        ≈ {formatTransferTime(messengerTransferTimes.get(option.messenger) || null)}
                      </span>
                    )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex text-xs text-white/50 justify-between gap-2 w-full items-center">
          <p>{t('Relayer Fee:')}</p>
          <p className="text-white">≈ {formatGasFee(gasFee)}</p>
        </div>
        <div className="flex text-xs text-white/50 justify-between gap-2 w-full items-center">
          <p>{t('Current Account:')}</p>
          {(() => {
            switch (sourceToken?.chainSymbol) {
              case 'TRX':
                if (isTronConnected) {
                  return (
                    <Badge>
                      <Avatar avatar={'1'} className="w-4 h-4" /> {tronAddress?.slice(0, 6)}...
                      {tronAddress?.slice(-4)}
                      <button
                        onClick={disconnectTron}
                        className="text-gray-400 hover:text-red-300 cursor-pointer"
                      >
                        <IconX className="w-4 h-4" />
                      </button>
                    </Badge>
                  )
                }
                return t('Not Connected')
              case 'SOL':
                if (isSolanaConnected) {
                  return (
                    <Badge>
                      <Avatar avatar={'1'} className="w-4 h-4" />
                      {solanaAddress && formatSolanaAddress(solanaAddress.toString())}
                      <button
                        onClick={() => disconnectSolana()}
                        className="text-gray-400 hover:text-red-300 cursor-pointer"
                      >
                        <IconX className="w-4 h-4" />
                      </button>
                    </Badge>
                  )
                }
                return t('Not Connected')
              case 'SUI':
                if (isSuiConnected) {
                  return (
                    <Badge>
                      <Avatar avatar={'1'} className="w-4 h-4" /> {suiAddress?.address.slice(0, 6)}
                      ...{suiAddress?.address.slice(-4)}
                      <button
                        onClick={() => disconnectSui()}
                        className="text-gray-400 hover:text-red-300 cursor-pointer"
                      >
                        <IconX className="w-4 h-4" />
                      </button>
                    </Badge>
                  )
                }
                return t('Not Connected')
              case 'SRB':
                return (
                  <Badge>
                    {stellarAddress ? (
                      <>
                        <Avatar avatar={'1'} className="w-4 h-4" />
                        {stellarAddress?.slice(0, 6)}...{stellarAddress?.slice(-4)}
                        <button className="text-gray-400 hover:text-red-300 cursor-pointer">
                          <IconX className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      t('Not Connected')
                    )}
                  </Badge>
                )
              default:
                return isConnected ? (
                  <Badge
                    onClick={() => disconnect()}
                    className="bg-background hover:bg-red/10 cursor-pointer hover:text-red flex items-center gap-2 !p-1 rounded-md text-white/50 !text-xs"
                  >
                    <Avatar avatar={'1'} className="w-4 h-4" />
                    {address?.slice(0, 6)}...
                    {address?.slice(-4)}
                    <IconX className="size-3" />
                  </Badge>
                ) : (
                  <Badge
                    onClick={() => toggleConnectWalletModal()}
                    className="bg-background hover:bg-accent cursor-pointer hover:text-accent-foreground flex items-center gap-2 !p-1 rounded-md text-white/50 !text-xs"
                  >
                    <IconWallet className="size-3" />
                    {t('Connect Wallet')}
                  </Badge>
                )
            }
          })()}
        </div>
        <Button
          className="w-full mt-2"
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
                      {t('Processing')} <IconLoader2 className="w-4 h-4 animate-spin" />
                    </>
                  )
                }
                return isTronAllowanceApproved ? (
                  <>{t('Send')}</>
                ) : (
                  <>
                    {t('Approve')} {sourceToken?.symbol}
                  </>
                )

              case 'SOL':
                if (!isSolanaConnected) {
                  return t('Connect Solana Wallet')
                }
                if (isLoading) {
                  return (
                    <>
                      {t('Processing')} <IconLoader2 className="w-4 h-4 animate-spin" />
                    </>
                  )
                }
                return <>{t('Send')}</>

              case 'SRB':
                if (!stellarAddress) {
                  return t(`Connect ${sourceToken?.chainSymbol} Wallet`)
                }
                if (isLoading) {
                  return (
                    <>
                      {t('Processing')} <IconLoader2 className="w-4 h-4 animate-spin" />
                    </>
                  )
                }
                return (
                  <>
                    {t('Send')} <IconArrowRight className="w-4 h-4" />
                  </>
                )

              case 'SUI':
                if (!isSuiConnected)
                  return (
                    <SuiConnectModal
                      open={showSuiModal}
                      onOpenChange={(open) => setShowSuiModal(open)}
                    >
                      <button>{t('Connect Wallet')}</button>
                    </SuiConnectModal>
                  )

                if (isLoading) {
                  return (
                    <>
                      {t('Processing')} <IconLoader2 className="w-4 h-4 animate-spin" />
                    </>
                  )
                }
                return <>{t('Send')}</>
              default:
                if (!isConnected) {
                  return t('Connect Wallet')
                }
                if (isLoading) {
                  return (
                    <>
                      {t('Processing')} <IconLoader2 className="w-4 h-4 animate-spin" />
                    </>
                  )
                }
                return <>{t('Send')}</>
            }
          })()}
        </Button>
      </div>
    </>
    //       {/* Transaction List */}
    //       {transactions.length > 0 && (
    //         <Accordion title="Recent Transactions" defaultOpen={true}>
    //           <div className="space-y-2 max-h-60 overflow-y-auto">
    //             {transactions.map((tx) => (
    //               <TransactionsCard key={tx.hash} transaction={tx} getLogoPath={getLogoPath} />
    //             ))}
    //           </div>
    //         </Accordion>
    //       )}
    //     </div>
    //   </div>
    // </div>
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
  const { t } = useTranslate()

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
        return t('Nexon')
      }
      return selectedValue
    }
    return selectedValue
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={'outline'}
          size={'sm'}
          className="flex h-fit w-full flex-1 !p-2 md:!px-2 shrink-0 items-center gap-2 text-white text-xs"
        >
          <Image
            src={getLogoPath(getSelectedChainSymbol())}
            alt={getSelectedChainName()}
            className="size-3"
            width={12}
            height={12}
          />{' '}
          {getSelectedChainName()}
          <IconChevronDown className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[80vw] max-w-xl h-fit flex flex-col items-center justify-start gap-2">
        <DialogHeader className="!h-fit !w-full !items-start">
          {type === 'chain' ? t('Choose Network') : t('Choose Token')}
        </DialogHeader>
        <Separator />
        <ToggleGroup
          type="single"
          className="flex flex-col items-center justify-start gap-2 w-full"
          value={selectedValue}
          onValueChange={(value) => {
            const newValue = getDisplayValue(value)
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
        >
          {getOptions().map((option, index) => (
            <ToggleGroupItem
              value={getDisplayValue(option)}
              key={index}
              className="flex h-fit w-full rounded-md flex-1 !shrink-0 !p-2 items-center gap-2 text-white text-xs"
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
                  ? t('Nexon')
                  : getDisplayValue(option)
                : getDisplayValue(option)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </DialogContent>
    </Dialog>
  )
}

export default BridgeModal
