'use client'
import {
  AllbridgeCoreSdk,
  nodeRpcUrlsDefault,
  ChainSymbol,
  TokenWithChainDetails,
  FeePaymentMethod,
  Messenger,
  GasFeeOptions
} from '@allbridge/bridge-core-sdk'
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useAccount, useBalance } from 'wagmi'
import { WalletProvider as SuiWalletProvider } from '@suiet/wallet-kit'
import '@suiet/wallet-kit/style.css'
import { SuietWallet, SuiWallet, EthosWallet } from '@suiet/wallet-kit'
import { USDC_ARBITRUM } from '@/utils/constants'
import { HYPERLIQUID_DEPOSIT } from '@/utils/constants'
import { erc20Abi } from 'viem'
import { switchChain } from 'wagmi/actions'
//Stellar
import { useWriteContract } from 'wagmi'
import { wagmiConfig } from '@/app/WagmiProvider'
interface Chain {
  name: string
  chainSymbol: string
  chainType: string
  allbridgeChainId: number
  chainId?: string
  bridgeAddress: string
  tokens: TokenWithChainDetails[]
}

export interface BridgeTransaction {
  hash: string
  messenger: Messenger | string
  timestamp: number
  amount: string
  sourceToken: string
  destinationToken: string
  sourceChain: string
  destinationChain: string
  status: 'pending' | 'source_complete' | 'complete'
  transferTime: number | null
}

interface BridgeContextProps {
  sdk: AllbridgeCoreSdk | null
  chains: Record<string, Chain>
  tokens: TokenWithChainDetails[]
  sourceChain: Chain | null
  destinationChain: Chain | null
  sourceToken: TokenWithChainDetails | null
  destinationToken: TokenWithChainDetails | null
  setSourceChain: (chain: Chain) => void
  setDestinationChain: (chain: Chain) => void
  setSourceToken: (token: TokenWithChainDetails | null) => void
  setDestinationToken: (token: TokenWithChainDetails | null) => void
  isLoading: boolean
  error: string | null
  transactions: BridgeTransaction[]
  getTransactionStatus: (transactionId: string) => Promise<BridgeTransaction['status']>
  getGasFeeOptions: (
    sourceToken: TokenWithChainDetails,
    destinationToken: TokenWithChainDetails,
    messenger: Messenger
  ) => Promise<GasFeeOptions | null>
  getAverageTransferTime: (
    sourceToken: TokenWithChainDetails,
    destinationToken: TokenWithChainDetails,
    messenger: Messenger
  ) => Promise<number | null>
  setIsLoading: (isLoading: boolean) => void
  setAmount: (amount: string) => void
  setUseNativeTokenForGas: (useNativeTokenForGas: boolean) => void
  useNativeTokenForGas: boolean
  amount: string | null
  feePaymentMethod: FeePaymentMethod
  sourceAddress: string | null
  setSourceAddress: (address: string | null) => void
  selectedMessenger: Messenger
  setSelectedMessenger: (selectedMessenger: Messenger) => void
  showWalletsModal: boolean
  setShowWalletsModal: (showWalletsModal: boolean) => void
  addTransaction: (transaction: Omit<BridgeTransaction, 'status'>) => void
  updateTransactionStatus: (hash: string, status: BridgeTransaction['status']) => void
  isTronAllowanceApproved: boolean
  setIsTronAllowanceApproved: (approved: boolean) => void
  getExplorerUrl: (hash: string, messenger: Messenger | string) => string
  formatTime: (timestamp: number) => string
  pendingDeposits: Map<string, { hash: string; destinationChain: string }>
  nativeBalance: string | null
}

const BridgeContext = createContext<BridgeContextProps | undefined>(undefined)

// Custom hook to track transaction receipt

export const BridgeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sdk, setSdk] = useState<AllbridgeCoreSdk | null>(null)
  const [chains, setChains] = useState<Record<string, Chain>>({})
  const [tokens, setTokens] = useState<TokenWithChainDetails[]>([])
  const [sourceChain, setSourceChain] = useState<Chain | null>(null)
  const [destinationChain, setDestinationChain] = useState<Chain | null>(null)
  const [sourceToken, setSourceToken] = useState<TokenWithChainDetails | null>(null)
  const [destinationToken, setDestinationToken] = useState<TokenWithChainDetails | null>(null)
  const [amount, setAmount] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<BridgeTransaction[]>(() => {
    // Load transactions from localStorage on initial render
    if (typeof window !== 'undefined') {
      const savedTransactions = localStorage.getItem('bridgeTransactions')
      return savedTransactions ? JSON.parse(savedTransactions) : []
    }
    return []
  })
  const [sourceAddress, setSourceAddress] = useState<string | null>(null)
  const [useNativeTokenForGas, setUseNativeTokenForGas] = useState<boolean>(true)
  const [feePaymentMethod, setFeePaymentMethod] = useState<FeePaymentMethod>(
    FeePaymentMethod.WITH_NATIVE_CURRENCY
  )
  const [selectedMessenger, setSelectedMessenger] = useState<Messenger>(Messenger.ALLBRIDGE)
  const { address } = useAccount()
  const [showWalletsModal, setShowWalletsModal] = useState(false)
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isTronAllowanceApproved, setIsTronAllowanceApproved] = useState(false)
  const { writeContractAsync } = useWriteContract()
  const [depositInitiatedTransactions] = useState<Set<string>>(new Set())
  const [pendingDeposits, setPendingDeposits] = useState<
    Map<string, { hash: string; destinationChain: string }>
  >(new Map())
  const [nativeBalance, setNativeBalance] = useState<string | null>(null)

  const { data: balanceData } = useBalance({
    address
  })

  useEffect(() => {
    if (balanceData) {
      setNativeBalance(balanceData.formatted)
    } else {
      setNativeBalance(null)
    }
  }, [balanceData])

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bridgeTransactions', JSON.stringify(transactions))
    }
  }, [transactions])

  useEffect(() => {
    let mounted = true

    const initializeBridge = async () => {
      if (!mounted) return

      try {
        setIsLoading(true)

        // Initialize SDK with custom RPC URLs
        const bridgeSdk = new AllbridgeCoreSdk({
          ...nodeRpcUrlsDefault,
          ETH: 'https://mainnet.infura.io/v3/65630cb840de47268841556908ea0932',
          POL: 'https://polygon-mainnet.infura.io/v3/65630cb840de47268841556908ea0932',
          CEL: 'https://celo-mainnet.infura.io/v3/65630cb840de47268841556908ea0932',
          BSC: 'https://bsc-mainnet.infura.io/v3/65630cb840de47268841556908ea0932',
          ARB: 'https://arbitrum-mainnet.infura.io/v3/65630cb840de47268841556908ea0932',
          SOL: 'https://solana-mainnet.g.alchemy.com/v2/eOWqQ4wfz-PlNuiSE0ZFrGvOlsdx4hJZ'
        })

        if (!mounted) return
        setSdk(bridgeSdk)

        const chainDetails = await bridgeSdk.chainDetailsMap()
        if (!mounted) return
        setChains(chainDetails)

        const tokenList = await bridgeSdk.tokens()
        if (!mounted) return
        setTokens(tokenList)

        // Set default chains and tokens
        const defaultSourceChain = chainDetails[ChainSymbol.POL]
        const defaultDestinationChain = chainDetails[ChainSymbol.ARB]

        if (!mounted) return
        setSourceChain(defaultSourceChain)
        setDestinationChain(defaultDestinationChain)

        if (defaultSourceChain?.tokens) {
          const defaultSourceToken = defaultSourceChain.tokens.find(
            (token: TokenWithChainDetails) => token.symbol === 'USDC'
          )
          if (!mounted) return
          setSourceToken(defaultSourceToken || null)
        }

        if (defaultDestinationChain?.tokens) {
          const defaultDestinationToken = defaultDestinationChain.tokens.find(
            (token: TokenWithChainDetails) => token.symbol === 'USDC'
          )
          if (!mounted) return
          setDestinationToken(defaultDestinationToken || null)
        }
        setIsLoading(false)
        if (!mounted) return
        setError(null)
      } catch (err) {
        if (!mounted) return
        setError(err instanceof Error ? err.message : 'Failed to initialize bridge')
        console.error('Bridge initialization error:', err)
      } finally {
        if (!mounted) return
        setIsLoading(false)
      }
    }

    initializeBridge()

    return () => {
      mounted = false
    }
  }, [address])

  useEffect(() => {
    if (useNativeTokenForGas) {
      setFeePaymentMethod(FeePaymentMethod.WITH_NATIVE_CURRENCY)
    } else {
      setFeePaymentMethod(FeePaymentMethod.WITH_STABLECOIN)
    }
  }, [useNativeTokenForGas])

  const getTransactionStatus = async (
    transactionId: string
  ): Promise<BridgeTransaction['status']> => {
    const transaction = transactions.find((t) => t.hash === transactionId)
    if (!transaction) {
      throw new Error('Transaction not found')
    }
    return transaction.status
  }

  const getGasFeeOptions = async (
    sourceToken: TokenWithChainDetails,
    destinationToken: TokenWithChainDetails,
    messenger: Messenger
  ) => {
    if (!sdk) {
      console.log('SDK not initialized')
      return null
    }
    try {
      return await sdk.getGasFeeOptions(sourceToken, destinationToken, messenger)
    } catch (error) {
      console.log('Error getting gas fee options:', error)
      return null
    }
  }

  const getAverageTransferTime = async (
    sourceToken: TokenWithChainDetails,
    destinationToken: TokenWithChainDetails,
    messenger: Messenger
  ) => {
    if (!sdk) {
      console.log('SDK not initialized')
      return null
    }
    try {
      return await sdk.getAverageTransferTime(sourceToken, destinationToken, messenger)
    } catch (error) {
      console.log('Error getting average transfer time:', error)
      return null
    }
  }

  // Function to add a new transaction
  const addTransaction = (transaction: Omit<BridgeTransaction, 'status'>) => {
    const newTransaction: BridgeTransaction = {
      ...transaction,
      status: 'pending'
    }
    setTransactions((prev) => [newTransaction, ...prev])
  }

  // Function to update transaction status
  const updateTransactionStatus = (hash: string, status: BridgeTransaction['status']) => {
    setTransactions((prev) => prev.map((tx) => (tx.hash === hash ? { ...tx, status } : tx)))
  }

  // Function to handle Nexon deposit
  const handleNexonDeposit = async (txId: string) => {
    try {
      setIsLoading(true)
      // Find the transaction to get its amount
      const transaction = transactions.find((tx) => tx.hash === txId)
      if (!transaction) {
        throw new Error('Transaction not found')
      }

      // Switch to Arbitrum network for the deposit
      const switchResult = await switchChain(wagmiConfig, { chainId: 42161 })
      console.log('Chain switch result:', switchResult)

      // Wait a moment to ensure chain switch is complete
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Convert amount to bigint for the contract call
      const amountBigInt = BigInt(Math.floor(parseFloat(transaction.amount) * 1e6)) // Assuming 6 decimals for USDC
      console.log('amountBigInt', amountBigInt)
      // Deposit to Hyperliquid using writeContractAsync
      const depositHash = await writeContractAsync({
        address: USDC_ARBITRUM,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [HYPERLIQUID_DEPOSIT, amountBigInt]
      })
      depositInitiatedTransactions.add(depositHash)
      console.log('Deposit to Nexon hash:', depositHash)

      // Add deposit transaction to list
      addTransaction({
        hash: depositHash,
        messenger: 'ARBISCAN',
        timestamp: Date.now(),
        amount: transaction.amount,
        sourceToken: 'USDC',
        destinationToken: 'USDC',
        sourceChain: 'ARB',
        destinationChain: 'NEXON',
        transferTime: null
      })

      // Store the deposit hash for tracking
      setPendingDeposits((prev) =>
        new Map(prev).set(txId, { hash: depositHash, destinationChain: 'NEXON' })
      )
    } catch (error) {
      console.error('Deposit to Nexon failed:', error)
      toast.error('Failed to deposit to Nexon. Please try again.')
      depositInitiatedTransactions.delete(txId)
      setIsLoading(false)
    }
  }

  // Function to check transfer status
  const checkTransferStatus = async (
    txId: string,
    chainSymbol: ChainSymbol,
    destinationChain: ChainSymbol
  ) => {
    if (!sdk) {
      console.error('SDK not initialized')
      return null
    }

    try {
      if (destinationChain !== ('NEXON' as ChainSymbol)) {
        setIsLoading(true)
        console.log('Checking transfer status for:', txId, chainSymbol)
        const transferStatus = await sdk.getTransferStatus(chainSymbol, txId)
        console.log('Transfer Status:', transferStatus)

        if (!transferStatus) {
          return 'pending'
        } else if (typeof transferStatus === 'object') {
          if (transferStatus.receive === null) {
            return 'source_complete'
          } else if (transferStatus.receive) {
            // Check if deposit has already been initiated for this transaction
            if (!depositInitiatedTransactions.has(txId)) {
              // Add transaction to the set of initiated deposits
              depositInitiatedTransactions.add(txId)
              // Call handleNexonDeposit
              handleNexonDeposit(txId)
            }
            setIsLoading(false)
            return 'complete'
          }
        }
        return null
      } else {
        //Check if the deposit has been completed on ARBITRUM to HYPERLIQUID
      }
    } catch (error) {
      console.error('Error checking transfer status:', error)
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'status' in error.response &&
        error.response.status !== 404
      ) {
        setIsLoading(false)
        return null
      }
    }
  }

  // Effect to check status of pending transactions
  useEffect(() => {
    let isChecking = false // Flag to prevent concurrent checks
    const lastCheckedTx = new Set<string>() // Track which transactions we've checked in this interval

    const checkPendingTransactions = async () => {
      if (isChecking || !sdk) return // Skip if already checking or SDK not initialized
      isChecking = true

      try {
        const pendingTransactions = transactions.filter(
          (tx) => tx.status !== 'complete' && tx.destinationChain !== 'NEXON'
        )
        // if (pendingTransactions.length > 0 && ) {

        for (const tx of pendingTransactions) {
          // Skip if we've already checked this transaction in this interval
          if (lastCheckedTx.has(tx.hash)) continue

          const status = await checkTransferStatus(
            tx.hash,
            tx.sourceChain as ChainSymbol,
            tx.destinationChain as ChainSymbol
          )
          if (status) {
            updateTransactionStatus(tx.hash, status)
          }
          lastCheckedTx.add(tx.hash)
        }
      } finally {
        isChecking = false
        // Clear the set after the interval completes
        lastCheckedTx.clear()
      }
    }

    // Clear any existing interval
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current)
    }

    // Only set up interval if SDK is initialized
    if (sdk) {
      // Check status immediately
      checkPendingTransactions()

      // Then check status every 5 seconds
      statusCheckIntervalRef.current = setInterval(checkPendingTransactions, 5000)
    }

    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current)
        statusCheckIntervalRef.current = null
      }
    }
  }, [sdk, transactions]) // Re-run when SDK or transactions change

  const getExplorerUrl = (hash: string, messenger: Messenger | string) => {
    switch (messenger) {
      case Messenger.ALLBRIDGE:
        return `https://core.allbridge.io/explorer/transfer/${hash}`
      case Messenger.WORMHOLE:
        return `https://wormholescan.io/#/tx/${hash}`
      case 'ARBISCAN':
        return `https://arbiscan.io/tx/${hash}`
      default:
        return `https://core.allbridge.io/explorer/transfer/${hash}`
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const value = {
    sdk,
    chains,
    tokens,
    sourceChain,
    destinationChain,
    sourceToken,
    destinationToken,
    amount,
    isLoading,
    error,
    transactions,
    setAmount,
    getTransactionStatus,
    getGasFeeOptions,
    getAverageTransferTime,
    setIsLoading,
    setSourceChain,
    setDestinationChain,
    setSourceToken,
    setDestinationToken,
    setUseNativeTokenForGas,
    useNativeTokenForGas,
    feePaymentMethod,
    sourceAddress,
    setSourceAddress,
    selectedMessenger,
    setSelectedMessenger,
    showWalletsModal,
    setShowWalletsModal,
    addTransaction,
    updateTransactionStatus,
    isTronAllowanceApproved,
    setIsTronAllowanceApproved,
    getExplorerUrl,
    formatTime,
    pendingDeposits,
    nativeBalance
  }

  return (
    <BridgeContext.Provider value={value}>
      <SuiWalletProvider
        defaultWallets={[
          // order defined by you
          SuietWallet,
          SuiWallet,
          EthosWallet
          // ...
        ]}
      >
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          children as any
        }
      </SuiWalletProvider>
    </BridgeContext.Provider>
  )
}

export const useBridge = () => {
  const context = useContext(BridgeContext)
  if (context === undefined) {
    throw new Error('useBridge must be used within a BridgeProvider')
  }
  return context
}
