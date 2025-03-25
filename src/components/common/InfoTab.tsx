'use client'
import Image from 'next/image'
import { INFOTAB_DESC } from './../../utils/constants'
import exporticon from '@/assets/images/export_icon.svg'
import bitcoinicon from '@/assets/images/bitcoin_logo.svg'

interface Asset {
  name: string
  rank: number
  marketCap: string
  fullyDilutedCap: string
  dominance: string
  volume: string
  volumeMarketCapRatio: string
  circulatingSupply: string
  maxSupply: string
  totalSupply: string
  issueDate: string
  links: { name: string; url: string }[]
}

const asset: Asset = {
  name: 'Bitcoin',
  rank: 1,
  marketCap: '$1.95T',
  fullyDilutedCap: '$1.5T',
  dominance: '52%',
  volume: '$50B',
  volumeMarketCapRatio: '4.2%',
  circulatingSupply: '19.5M BTC',
  maxSupply: '21M BTC',
  totalSupply: '21M BTC',
  issueDate: '2009-01-03',
  links: [
    { name: 'Official Website', url: 'https://bitcoin.org' },
    { name: 'Whitepaper', url: 'https://bitcoin.org/bitcoin.pdf' },
    { name: 'Block Explorer', url: 'https://www.blockchain.com/explorer' },
    { name: 'Submit Feedback', url: '' }
  ]
}

const assetData = [
  { label: 'Rank', value: `No.1` },
  { label: 'Market Capitalization', value: asset.marketCap, change: '+24%' },
  { label: 'Fully Diluted Market Cap', value: asset.fullyDilutedCap },
  { label: 'Market Dominance', value: asset.dominance },
  { label: 'Volume', value: asset.volume },
  { label: 'Volume/Market Cap', value: asset.volumeMarketCapRatio },
  { label: 'Circulating Supply', value: asset.circulatingSupply },
  { label: 'Maximum Supply', value: asset.maxSupply },
  { label: 'Total Supply', value: asset.totalSupply },
  { label: 'Issue Date', value: asset.issueDate }
]

const InfoTab = () => {
  return (
    <div className="flex max-[770px]:flex-col flex-row gap-4 px-3 py-6 h-[90vh] max-[770px]:h-full rounded-xl text-white">
      <div className="w-[45%] max-[770px]:w-full p-6 bg-transparent border-2 border-white/10 rounded-2xl">
        <div className="flex items-center gap-3 mb-5">
          <Image src={bitcoinicon} alt="Bitcoin" width={30} height={30} />
          <h2 className="text-xl font-semibold">{asset.name}</h2>
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
      <div className="w-[55%] max-[770px]:w-full max-[770px]:px-3 py-5 px-4 bg-transparent border-2 border-white/10 rounded-2xl">
        <div className="mb-5">
          <p className="text-sm text-[#8B8BA0] font-normal mb-4">Links</p>
          <div className="flex flex-wrap max-[770px]:gap-0 gap-2 xl:gap-1  2xl:gap-x-0.5 2xl:gap-y-2">
            {asset?.links?.map((link, index) => (
              <a
                key={index}
                href={link?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 max-[770px]:px-3 max-[770px]:mb-1.5 max-[770px]:mr-1 py-2 text-[#E8E0F1] text-sm font-medium bg-white/6 rounded-full flex items-center max-[770px]:gap-x-1.5 gap-2 xl:gap-1  2xl:gap-x-2 2xl:gap-y-2 hover:bg-[#322944]"
              >
                {link?.name} <Image alt="exporticon" src={exporticon} width={14} height={14} />
              </a>
            ))}
          </div>
        </div>
        <p className="text-sm text-[#8B8BA0] font-normal">Info</p>
        <div className="h-[57vh] xl:h-[50vh] 2xl:h-[60vh] max-[770px]:h-full font-normal overflow-y-auto text-sm text-[#FFFFFF] space-y-4 pr-2">
          {INFOTAB_DESC?.split('\n').map((line, index) => <div key={index}>{line}</div>)}
        </div>{' '}
      </div>
    </div>
  )
}

export default InfoTab
