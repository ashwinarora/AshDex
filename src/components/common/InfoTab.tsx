'use client'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { useHyperLiquid } from '@/context/HyperLiquid'
import exporticon from '@/assets/images/export_icon.svg'
import bitcoinicon from '@/assets/images/bitcoin_logo.svg'
import { useMemo } from 'react'
import { useCoinData } from '@/hooks/useCoinData'
import { useCoins } from '@/hooks/useCoins'
import { usePerpetualData } from '@/hooks/usePerpetualData'
import { useTokenDetails } from '@/hooks/useTokenDetails'

interface IInfoTabProps {
  selectedAsset: string
}

const InfoTab: React.FC<IInfoTabProps> = ({ selectedAsset }) => {
  const { sdk, isSdkConnected } = useHyperLiquid()
  const { data: allCoins = [] } = useCoins()
  const { coinData, coinInfo, isLoading } = useCoinData(allCoins, selectedAsset)
  const { data: tokens = [] } = usePerpetualData(sdk, isSdkConnected)
  const safeTokens = useMemo(
    () =>
      tokens?.map((token) => ({
        name: token?.name,
        tokenId: token?.tokenId
      })),
    [tokens]
  )
  const { data: tokenDetails } = useTokenDetails(sdk, safeTokens, selectedAsset)

  const assetData = useMemo(
    () => [
      { label: 'Rank', value: coinData?.cmc_rank != null ? 'No.' + coinData.cmc_rank : '-' },
      {
        label: 'Market Capitalization',
        value: coinData?.quote?.USD?.market_cap ?? '-',
        change: ''
      },
      {
        label: 'Fully Diluted Market Cap',
        value: coinData?.quote?.USD?.fully_diluted_market_cap ?? '-'
      },
      {
        label: 'Market Dominance',
        value: coinData?.quote?.USD?.market_cap_dominance ?? '-'
      },
      { label: 'Volume', value: tokenDetails?.volume ?? '-' },
      {
        label: 'Volume/Market Cap',
        value: coinData?.quote?.USD?.market_cap ?? '-'
      },
      {
        label: 'Circulating Supply',
        value: tokenDetails?.circulatingSupply ?? '-'
      },
      { label: 'Maximum Supply', value: tokenDetails?.maxSupply ?? '-' },
      { label: 'Total Supply', value: tokenDetails?.totalSupply ?? '-' },
      {
        label: 'Issue Date',
        value: coinData?.date_added
          ? new Date(coinData.date_added).toISOString().split('T')[0]
          : '-'
      }
    ],
    [coinData, tokenDetails]
  )

  const assetLinks = useMemo(
    () => [
      { name: 'Official Website', url: coinInfo?.urls?.website?.[0] || '' },
      { name: 'Whitepaper', url: coinInfo?.urls?.technical_doc?.[0] || '' },
      { name: 'Block Explorer', url: coinInfo?.urls?.explorer?.[0] || '' },
      { name: 'Submit Feedback', url: '' }
    ],
    [coinInfo]
  )

  return (
    <div
      className={`flex justify-center max-lg:flex-col flex-row gap-4 px-3 py-3 h-full rounded-xl text-white overflow-scroll no-scrollbar ${
        isLoading ? 'items-center' : ''
      }`}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin text-[#E8E0F1] text-8xl" />
        </>
      ) : (
        <>
          <div className="w-[45%] max-lg:w-full p-3 bg-transparent border-2 border-white/10 rounded-2xl">
            <div className="flex items-center gap-3 mb-5">
              <Image src={coinInfo?.logo ?? bitcoinicon} alt="Bitcoin" width={30} height={30} />
              <h2 className="text-xl font-semibold">{selectedAsset}</h2>
            </div>
            <div className="space-y-3 pt-2 text-gray-300">
              {assetData?.map(({ label, value, change }, index) => (
                <p
                  key={index}
                  className="flex last:border-0 border-b pb-[11px] border-white/10 justify-between"
                >
                  <span className="text-[#8B8BA0] text-sm font-normal">{label}:</span>{' '}
                  <span className="text-[#E8E0F1] flex text-sm font-medium">
                    {value}{' '}
                    {change && (
                      <span className="ml-2 flex xl:hidden 2xl:flex text-[#2FA766]">{change}</span>
                    )}
                  </span>
                </p>
              ))}
            </div>
          </div>
          <div className="w-[55%] max-lg:w-full max-lg:px-3 py-5 px-4 bg-transparent border-2 border-white/10 rounded-2xl">
            <div className="mb-5">
              <p className="text-sm text-[#8B8BA0] font-normal mb-4">Links</p>
              <div className="flex flex-wrap max-lg:gap-0 gap-2 xl:gap-1  2xl:gap-x-0.5 2xl:gap-y-2">
                {assetLinks?.map((link, index) => (
                  <a
                    key={index}
                    href={link?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 max-lg:px-3 max-lg:mb-1.5 max-lg:mr-1 py-2 text-[#E8E0F1] text-sm font-medium bg-white/6 rounded-full flex items-center max-lg:gap-x-1.5 gap-2 xl:gap-1  2xl:gap-x-2 2xl:gap-y-2 hover:bg-[#322944]"
                  >
                    {link?.name}{' '}
                    <Image
                      alt="exporticon"
                      src={exporticon}
                      style={{ width: 14, height: 'auto' }}
                    />
                  </a>
                ))}
              </div>
            </div>
            <p className="text-sm text-[#8B8BA0] font-normal">Info</p>
            <div className="  font-normal overflow-y-auto text-sm text-white space-y-4 pr-2">
              {(coinInfo?.description ?? '')
                ?.split('\n')
                .map((line: string, index: number) => <div key={index}>{line}</div>)}
            </div>{' '}
          </div>
        </>
      )}
    </div>
  )
}

export default InfoTab
