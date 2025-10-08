import { useBridge } from '@/context/BridgeContext'
import { BridgeTransaction } from '@/context/BridgeContext'
import Image from 'next/image'
import { IconExternalLink } from '@tabler/icons-react'
import ProgressBar from './ProgressBar'
import { useEffect } from 'react'
import { useTransactionReceipt } from 'wagmi'

function TransactionsCard({
  transaction,
  getLogoPath
}: {
  transaction: BridgeTransaction
  getLogoPath: (token: string) => string
}) {
  const { updateTransactionStatus, setIsLoading } = useBridge()
  const {
    data,
    isLoading: isLoadingReceipt,
    isSuccess,
    isError,
    isFetching
  } = useTransactionReceipt({
    hash: transaction.hash as `0x${string}`,
    query: { enabled: transaction.status !== 'complete' }
  })
  useEffect(() => {
    if (transaction.destinationChain === 'NEXON' && transaction.status !== 'complete') {
      if (isSuccess) {
        updateTransactionStatus(transaction.hash, 'complete')
      } else {
        updateTransactionStatus(transaction.hash, 'pending')
      }
    }
    if (isFetching) {
      setIsLoading(true)
    } else {
      setIsLoading(false)
    }
  }, [isSuccess, isError, data, isLoadingReceipt, isFetching])
  const { getExplorerUrl, formatTime } = useBridge()
  return (
    <div>
      <a
        key={transaction.hash}
        href={getExplorerUrl(transaction.hash, transaction.messenger)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col bg-white/5 hover:bg-white/10 p-3 rounded-lg transition-colors cursor-pointer"
      >
        {' '}
        <div>
          {/* {isLoading && <p>Waiting for confirmation...</p>}
  {isSuccess && <p>✅ Transaction Confirmed!</p>}
  {isError && <p>❌ Transaction Failed or Reverted</p>} */}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image
              src={getLogoPath(transaction.sourceToken)}
              alt={transaction.sourceToken}
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <div className="flex flex-col">
              <span className="text-white text-sm">
                {transaction.amount} {transaction.sourceToken} → {transaction.destinationToken}
              </span>
              <span className="text-white/50 text-xs">
                {transaction.sourceChain} → {transaction.destinationChain}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-xs">{formatTime(transaction.timestamp)}</span>
            <IconExternalLink className="w-4 h-4 text-white/50" />
          </div>
        </div>
        <ProgressBar
          sourceChain={transaction.sourceChain}
          destinationChain={transaction.destinationChain}
          status={transaction.status}
          transferTime={transaction.transferTime}
          getLogoPath={getLogoPath}
        />
      </a>
    </div>
  )
}

export default TransactionsCard
