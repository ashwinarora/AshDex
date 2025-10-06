import { FC } from 'react'
import { WalletModalProvider } from '@tronweb3/tronwallet-adapter-react-ui'
import { tronAdapters, useTronConnect, useTronWallet } from '@/utils/tronWalletAdapter'
import { WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks'
import { toast } from 'sonner'
import { RawTronTransaction, TokenWithChainDetails } from '@allbridge/bridge-core-sdk'
import { useBridge } from '@/context/BridgeContext'
import { useTranslate } from '@tolgee/react'

type Props = {
  readonly children: React.ReactNode
}
export const TronWalletProvider: FC<Props> = ({ children }) => {
  return (
    <WalletProvider
      adapters={[tronAdapters.tronLink, tronAdapters.walletConnect]}
      disableAutoConnectOnLoad
    >
      <WalletModalProvider>{children}</WalletModalProvider>
    </WalletProvider>
  )
}

// Custom hook for Tron transfer functionality
export const useTronTransfer = () => {
  const {
    sdk,
    sourceToken,
    destinationToken,
    amount,
    feePaymentMethod,
    selectedMessenger,
    addTransaction,
    isTronAllowanceApproved,
    setIsTronAllowanceApproved
  } = useBridge()
  const { isConnected, address: sourceAddress } = useTronConnect()
  const { signTronTransaction } = useTronWallet()
  const { t } = useTranslate()

  const checkTronAllowance = async (
    token: TokenWithChainDetails,
    amount: string,
    owner: string
  ) => {
    if (!sdk) {
      toast.error(t('Bridge SDK not initialized'))
      return
    }
    if (!sourceAddress) {
      toast.error(t('Please connect your Tron wallet first'))
      return
    }
    const isAllowanceApproved = await sdk.bridge.checkAllowance({
      token: token,
      owner: owner,
      amount: amount
    })
    setIsTronAllowanceApproved(isAllowanceApproved)
  }

  const handleTronTransfer = async () => {
    if (!sdk) {
      toast.error(t('Bridge SDK not initialized'))
      return
    }
    if (!isConnected) {
      toast.error(t('Please connect your Tron wallet first'))
      return
    }
    if (!sourceToken || !destinationToken || !amount) {
      toast.error(t('Please fill in all required fields'))
      if (Number(amount) <= 0) {
        toast.error(t('Amount must be greater than 0'))
      }
      return
    }

    try {
      // Create sendParams object
      const sendParams = {
        amount,
        sourceToken,
        destinationToken,
        fromAccountAddress: sourceAddress!,
        toAccountAddress: sourceAddress!,
        gasFeePaymentMethod: feePaymentMethod,
        messenger: selectedMessenger
      }

      const owner = sourceAddress
      //check if sending tokens already approved
      if (owner) {
        await checkTronAllowance(sourceToken, amount, owner)
        if (!isTronAllowanceApproved) {
          // authorize the bridge to transfer tokens from sender's address
          const rawTransactionApprove = (await sdk.bridge.rawTxBuilder.approve({
            token: sourceToken,
            owner: owner
          })) as RawTronTransaction

          const approveTxReceipt = await signTronTransaction(rawTransactionApprove)
          console.log('Approve tx id:', approveTxReceipt)
        }

        // Get the raw transaction
        const rawTx = await sdk.bridge.rawTxBuilder.send(sendParams)

        // Send the transaction
        const hash = await signTronTransaction(rawTx)

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
            transferTime: null
          })

          console.log('Bridge transaction hash:', hash)
          toast.success(t('Transaction initiated successfully!'))
        }
      }
    } catch (err) {
      console.error('Transfer failed:', err)
      toast.error(t('Transaction failed. Please try again.'))
    }
  }

  return {
    handleTronTransfer,
    checkTronAllowance
  }
}
