'use client'
import {
  AllbridgeCoreSdk,
  nodeRpcUrlsDefault,
  ChainSymbol,
  TokenWithChainDetails,
  AmountFormat,
  FeePaymentMethod,
  Messenger,
  GasFeeOptions,
  TxFeeParams
} from '@allbridge/bridge-core-sdk'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'react-toastify'
import { useAccount, useWalletClient } from 'wagmi'

interface Chain {
  name: string
  chainSymbol: string
  chainType: string
  allbridgeChainId: number
  chainId?: string
  bridgeAddress: string
  tokens: TokenWithChainDetails[]
}

interface BridgeTransaction {
  id: string
  status: 'pending' | 'completed' | 'failed'
  sourceChain: string
  destinationChain: string
  sourceToken: string
  destinationToken: string
  amount: string
  timestamp: number
  txHash?: string
}

interface SendParams {
  amount: string
  sourceToken: TokenWithChainDetails
  destinationToken: TokenWithChainDetails
  fromAccountAddress: string
  toAccountAddress: string
  extraGas?: string
  extraGasFormat?: AmountFormat
  fee?: string
  feeFormat?: AmountFormat
  gasFeePaymentMethod: FeePaymentMethod
  messenger: Messenger
  txFeeParams?: TxFeeParams
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
  initiateBridge: (params: SendParams) => Promise<string>
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
}

const BridgeContext = createContext<BridgeContextProps | undefined>(undefined)

export const BridgeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sdk, setSdk] = useState<AllbridgeCoreSdk | null>(null)
  const [chains, setChains] = useState<Record<string, Chain>>({})
  const [tokens, setTokens] = useState<TokenWithChainDetails[]>([])
  const [sourceChain, setSourceChain] = useState<Chain | null>(null)
  const [destinationChain, setDestinationChain] = useState<Chain | null>(null)
  const [sourceToken, setSourceToken] = useState<TokenWithChainDetails | null>(null)
  const [destinationToken, setDestinationToken] = useState<TokenWithChainDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<BridgeTransaction[]>([])
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()

  useEffect(() => {
    const initializeBridge = async () => {
      try {
        toast.success('Initializing bridge...')
        setIsLoading(true)

        // Initialize SDK with custom RPC URLs
        const bridgeSdk = new AllbridgeCoreSdk({
          ...nodeRpcUrlsDefault,
          ETH: 'https://mainnet.infura.io/v3/65630cb840de47268841556908ea0932',
          POL: 'https://polygon-mainnet.infura.io/v3/65630cb840de47268841556908ea0932',
          CEL: 'https://celo-mainnet.infura.io/v3/65630cb840de47268841556908ea0932',
          BSC: 'https://bsc-mainnet.infura.io/v3/65630cb840de47268841556908ea0932',
          ARB: 'https://arbitrum-mainnet.infura.io/v3/65630cb840de47268841556908ea0932'
        })

        setSdk(bridgeSdk)

        const chainDetails = await bridgeSdk.chainDetailsMap()
        setChains(chainDetails)
        const tokenList = await bridgeSdk.tokens()
        setTokens(tokenList)

        // Set default chains and tokens
        const defaultSourceChain = chainDetails[ChainSymbol.ETH]
        const defaultDestinationChain = chainDetails[ChainSymbol.POL]

        setSourceChain(defaultSourceChain)
        setDestinationChain(defaultDestinationChain)

        if (defaultSourceChain?.tokens) {
          const defaultSourceToken = defaultSourceChain.tokens.find(
            (token: TokenWithChainDetails) => token.symbol === 'USDC'
          )
          setSourceToken(defaultSourceToken || null)
        }

        if (defaultDestinationChain?.tokens) {
          const defaultDestinationToken = defaultDestinationChain.tokens.find(
            (token: TokenWithChainDetails) => token.symbol === 'USDC'
          )
          setDestinationToken(defaultDestinationToken || null)
        }

        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize bridge')
        console.error('Bridge initialization error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (address) {
      initializeBridge()
    }
  }, [address])

  const getTransactionStatus = async (
    transactionId: string
  ): Promise<BridgeTransaction['status']> => {
    const transaction = transactions.find((t) => t.id === transactionId)
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

  const initiateBridge = async (params: SendParams): Promise<string> => {
    if (!sdk || !address) {
      throw new Error('Bridge not properly initialized')
    }

    if (!walletClient) {
      throw new Error('Wallet client not available')
    }

    try {
      setIsLoading(true)

      // Get the raw transaction
      const rawTx = await sdk.bridge.rawTxBuilder.send(params)

      // Send the transaction
      const hash = await walletClient.sendTransaction(rawTx)

      // Add to transactions list
      const transaction: BridgeTransaction = {
        id: Date.now().toString(),
        status: 'pending',
        sourceChain: params.sourceToken.chainId || 'unknown',
        destinationChain: params.destinationToken.chainId || 'unknown',
        sourceToken: params.sourceToken.symbol,
        destinationToken: params.destinationToken.symbol,
        amount: params.amount,
        timestamp: Date.now(),
        txHash: hash
      }

      setTransactions((prev) => [...prev, transaction])

      toast.success('Bridge transaction sent successfully')
      return hash
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send bridge transaction'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    sdk,
    chains,
    tokens,
    sourceChain,
    destinationChain,
    sourceToken,
    destinationToken,
    setSourceChain,
    setDestinationChain,
    setSourceToken,
    setDestinationToken,
    isLoading,
    error,
    transactions,
    getTransactionStatus,
    getGasFeeOptions,
    getAverageTransferTime,
    initiateBridge
  }

  return <BridgeContext.Provider value={value}>{children}</BridgeContext.Provider>
}

export const useBridge = () => {
  const context = useContext(BridgeContext)
  if (context === undefined) {
    throw new Error('useBridge must be used within a BridgeProvider')
  }
  return context
}
