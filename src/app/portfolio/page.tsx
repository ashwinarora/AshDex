'use client'
import PortfolioHeader from '@/components/Portfolio/PortfolioHeader'
import PortfolioStats from '@/components/Portfolio/PortfolioStats'
import UserData from '@/components/Trading/UserData/UserData'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { Hex } from 'viem'

const PortfolioPage = () => {
  const { address } = useAccount()

  const { sdkInfoClient } = useHyperliquid()

  const portfolioData = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => sdkInfoClient?.portfolio({ user: address as Hex }),
    refetchInterval: 2000
  })

  const userFeeData = useQuery({
    queryKey: ['userFeeData'],
    queryFn: () => sdkInfoClient?.userFees({ user: address as Hex }),
    refetchInterval: 2000
  })

  console.log('🚀 ~ PortfolioPage ~ userFeeData:', userFeeData)

  return (
    <div className="w-full text-white/50 h-full max-h-screen flex flex-col gap-1 p-1">
      <div className="w-full h-fit shrink-0">
        <PortfolioHeader />
      </div>
      <div className="w-full h-fit shrink-0">
        <PortfolioStats userFeeData={userFeeData} portfolioData={portfolioData} />
      </div>
      <div className="w-full h-96">
        <UserData setSelectedAsset={() => {}} />
      </div>
    </div>
  )
}

export default PortfolioPage
