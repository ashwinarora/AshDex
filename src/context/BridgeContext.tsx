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
import { useAccount } from 'wagmi'

interface Chain {
  name: string
  chainSymbol: string
  chainType: string
  allbridgeChainId: number
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
  initiateBridge: (params: SendParams) => Promise<void>
  getTransactionStatus: (transactionId: string) => Promise<BridgeTransaction['status']>
  getGasFeeOptions: (
    sourceToken: TokenWithChainDetails,
    destinationToken: TokenWithChainDetails,
    messenger: Messenger
  ) => Promise<GasFeeOptions>
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

  useEffect(() => {
    const initializeBridge = async () => {
      try {
        toast.success('Initializing bridge...')
        setIsLoading(true)
        const bridgeSdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault)
        setSdk(bridgeSdk)

        const chainDetails = await bridgeSdk.chainDetailsMap()
        setChains(chainDetails)
        console.log('chainDetails', chainDetails)
        const tokenList = await bridgeSdk.tokens()
        setTokens(tokenList)
        console.log('tokenList', tokenList)

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

  const initiateBridge = async (params: SendParams) => {
    if (!sdk || !address) {
      throw new Error('Bridge not properly initialized')
    }

    const transaction: BridgeTransaction = {
      id: Date.now().toString(),
      status: 'pending',
      sourceChain: params.sourceToken.chainId || 'unknown',
      destinationChain: params.destinationToken.chainId || 'unknown',
      sourceToken: params.sourceToken.symbol,
      destinationToken: params.destinationToken.symbol,
      amount: params.amount,
      timestamp: Date.now()
    }

    try {
      setIsLoading(true)
      setTransactions((prev) => [...prev, transaction])

      // Build the raw transaction
      await sdk.bridge.rawTxBuilder.send({
        ...params,
        fromAccountAddress: address,
        toAccountAddress: address, // Using same address as recipient for now
        gasFeePaymentMethod: params.gasFeePaymentMethod,
        messenger: params.messenger,
        txFeeParams: params.txFeeParams
      })

      // Update transaction with hash
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === transaction.id ? { ...t, status: 'completed', txHash: 'txHash' } : t
        )
      )

      toast.success('Bridge transaction initiated successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate bridge transaction')
      setTransactions((prev) =>
        prev.map((t) => (t.id === transaction.id ? { ...t, status: 'failed' } : t))
      )
      toast.error('Failed to initiate bridge transaction')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

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
    if (!sdk) throw new Error('SDK not initialized')
    return await sdk.getGasFeeOptions(sourceToken, destinationToken, messenger)
  }

  const getAverageTransferTime = async (
    sourceToken: TokenWithChainDetails,
    destinationToken: TokenWithChainDetails,
    messenger: Messenger
  ) => {
    if (!sdk) throw new Error('SDK not initialized')
    return await sdk.getAverageTransferTime(sourceToken, destinationToken, messenger)
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
    initiateBridge,
    getTransactionStatus,
    getGasFeeOptions,
    getAverageTransferTime
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
