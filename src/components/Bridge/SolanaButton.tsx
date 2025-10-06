'use client'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { WalletConnectWalletAdapter } from '@walletconnect/solana-adapter'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { FC, useEffect, useMemo } from 'react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { toast } from 'sonner'
import { useBridge } from '@/context/BridgeContext'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useTranslate } from '@tolgee/react'
// require('@solana/wallet-adapter-react-ui/styles.css')

type Props = {
  readonly children: React.ReactNode
}

// Mainnet-beta is the actuall mainnet (as of writing)
const endpoint = 'https://solana-mainnet.g.alchemy.com/v2/eOWqQ4wfz-PlNuiSE0ZFrGvOlsdx4hJZ'

// Re-export the useWallet hook
export const useSolanaWallet = () => useWallet()

export const useHandleSolanaTransfer = () => {
  const { connected, publicKey, signTransaction, connecting } = useSolanaWallet()
  const {
    sdk,
    sourceToken,
    destinationToken,
    amount,
    setIsLoading,
    sourceAddress,
    feePaymentMethod,
    selectedMessenger,
    setSourceAddress,
    addTransaction
  } = useBridge()
  const { connection } = useConnection()
  const { t } = useTranslate()
  // Update sourceAddress when wallet is connected
  useEffect(() => {
    if (connected && publicKey) {
      const address = publicKey.toBase58()
      setSourceAddress(address)
    }
  }, [connected, publicKey, setSourceAddress])

  useEffect(() => {
    if (connecting) {
      toast.info(t('Connecting to Solana...'))
      setIsLoading(true)
    }
  }, [connecting])

  return async () => {
    if (!connected || !publicKey) {
      toast.error(t('Please connect your Solana wallet'))
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
    try {
      const amountInLamports = Number(amount) * 10 ** 9

      const balance = await connection.getBalance(publicKey)
      console.log('Balance:', balance)
      if (balance < amountInLamports) {
        toast.error(t('Not enough SOL in wallet'))
        return
      }

      toast.info(t('Initiating Solana transfer...'))
      setIsLoading(true)
      const sendParams = {
        amount,
        sourceToken,
        destinationToken,
        fromAccountAddress: sourceAddress!,
        toAccountAddress: sourceAddress!,
        gasFeePaymentMethod: feePaymentMethod,
        messenger: selectedMessenger
      }

      const rawTx = await sdk.bridge.rawTxBuilder.send(sendParams)
      console.log('Raw transaction:', rawTx)

      if (!signTransaction) {
        toast.error(t('Wallet does not support signing (use Phantom)'))
        return
      }

      const signedTx = await signTransaction(rawTx)
      console.log('Signed transaction:', signedTx)

      const txId = await connection.sendTransaction(signedTx.serialize())
      console.log(`Transaction sent: https://explorer.solana.com/tx/${txId}`)

      // Add transaction to context - status checking is handled by the context
      addTransaction({
        hash: txId,
        messenger: selectedMessenger,
        timestamp: Date.now(),
        amount,
        sourceToken: sourceToken.symbol,
        destinationToken: destinationToken.symbol,
        sourceChain: sourceToken.chainSymbol,
        destinationChain: destinationToken.chainSymbol,
        transferTime: null
      })

      toast.success(t('Transfer submitted!'))
      setIsLoading(false)
    } catch (err) {
      console.error('Transfer failed:', err)
      toast.error(t('Transaction failed. Please try again.'))
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }
}

export const SolanaWalletProvider: FC<Props> = ({ children }) => {
  const wallets = useMemo(
    () => [
      new WalletConnectWalletAdapter({
        network: WalletAdapterNetwork.Mainnet,
        options: {
          projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || ''
        }
      }),
      new PhantomWalletAdapter()
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [WalletAdapterNetwork.Mainnet]
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
