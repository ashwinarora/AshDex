'use client'
import { useScreenSize } from '@/hooks/useScreenSize'
import { useMemo, useState } from 'react'
import { Separator } from '../ui/separator'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { IconChevronDown } from '@tabler/icons-react'
import PortfolioChart from './PortfolioChart'
import { Hex } from '@nktkas/hyperliquid'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '../ui/skeleton'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useAccount } from 'wagmi'
import PortfolioFeeCard from './PortfolioFeeCard'
import PortfolioVolumeCard from './PortfolioVolumeCard'
import { formatWithKMB } from '@/utils/format'
import { useUserFee } from '@/hooks/useUserFee'
import useUserStore from '@/store/userStore'
import { useTranslate } from '@tolgee/react'

const PortfolioStats = () => {
  const { t } = useTranslate()
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar')
  const { isMobile, isTablet } = useScreenSize()
  const [selectedView, setSelectedView] = useState<{
    [key: string]: 'perps' | 'all' | 'day' | 'week' | 'month' | 'alltime'
  }>({
    fees: 'perps',
    overview: 'perps',
    overviewTimeFrame: 'alltime'
  })

  const { address } = useAccount()

  const sdkInfoClient = useHyperliquidStore((state) => state.sdkInfoClient)

  const portfolioQuery = useQuery({
    queryKey: ['portfolio', address],
    queryFn: () => sdkInfoClient?.portfolio({ user: address as Hex }),
    refetchInterval: 2000,
    enabled: !!address && !!sdkInfoClient
  })

  const { data: userFeeData, isLoading: userFeeLoading } = useUserFee()

  const overviewTable = useMemo(() => {
    if (!portfolioQuery.data) return undefined
    const filteredData = portfolioQuery.data?.map((item) => ({
      timeframe: item[0].includes('perp')
        ? item[0].replace('perp', '').toLowerCase()
        : item[0].toLowerCase(),
      type: item[0].includes('perp') ? 'perps' : 'all',
      pnl: item[1].pnlHistory,
      vlm: item[1].vlm,
      accountValue: item[1].accountValueHistory
    }))

    // subtract min account value from max account value and divide by max account value
    const maxDrawdownArray = filteredData?.find(
      (item) =>
        item.timeframe === selectedView.overviewTimeFrame && item.type === selectedView.overview
    )?.accountValue
    const maxValue =
      maxDrawdownArray?.length && maxDrawdownArray?.length > 0
        ? parseFloat(
            maxDrawdownArray?.reduce((acc, curr) => {
              return Number(acc[1]) > Number(curr[1]) ? acc : curr
            })[1] || '0   '
          )
        : 0

    const minValue =
      maxDrawdownArray?.length && maxDrawdownArray?.length > 0
        ? parseFloat(
            maxDrawdownArray?.reduce((acc, curr) => {
              return Number(acc[1]) < Number(curr[1]) ? acc : curr
            })[1] || '0   '
          )
        : 0

    const maxDrawdown = minValue - maxValue
    const maxDrawdownPercentage = (maxDrawdown / maxValue) * 100

    const totalEquity =
      parseFloat(
        filteredData
          ?.find((item) => item.timeframe === 'alltime' && item.type === 'all')
          ?.accountValue.at(-1)?.[1] || '0'
      ).toFixed(2) || '0'
    const perpEquity =
      parseFloat(
        filteredData
          ?.find((item) => item.timeframe === 'alltime' && item.type === 'perps')
          ?.accountValue.at(-1)?.[1] || '0'
      ).toFixed(2) || '0'
    const spotEquity = (parseFloat(totalEquity) - parseFloat(perpEquity)).toFixed(2)

    return {
      PNL:
        `$${formatWithKMB(parseFloat(filteredData?.find((item) => item.timeframe === selectedView.overviewTimeFrame && item.type === selectedView.overview)?.pnl.at(-1)?.[1] || '0'))}` ||
        '0.00',
      Volume:
        `$${formatWithKMB(parseFloat(filteredData?.find((item) => item.timeframe === selectedView.overviewTimeFrame && item.type === selectedView.overview)?.vlm || '0'))}` ||
        '$0.00',
      'Max Drawdown': `${maxDrawdownPercentage.toFixed(2)}%`,
      'Total Equity': `$${formatWithKMB(totalEquity)}`,
      'Perps Account Equity': `$${formatWithKMB(perpEquity)}`,
      'Spot Account Equity': `$${formatWithKMB(spotEquity)}`,
      'Vault Equity': '$0.00',
      'Staking Account': '0 HYPE'
    }
  }, [portfolioQuery.data, selectedView.overviewTimeFrame, selectedView.overview])

  if (isMobile || isTablet) {
    return (
      <div className="flex flex-col w-full h-fit gap-1">
        <div className="flex bg-secondary rounded-md h-fit items-center justify-center w-full">
          <PortfolioChart portfolioQuery={portfolioQuery} isRTL={isRTL} />
        </div>
        <div className={cn('flex flex-row gap-1 w-full h-fit', isMobile ? 'flex-col' : 'flex-row')}>
          <div className={cn('flex flex-col gap-1 rounded-md', isMobile ? 'w-full' : 'w-1/2')}>
            <PortfolioVolumeCard
              userFeeData={userFeeData}
              userFeeLoading={userFeeLoading}
              isRTL={isRTL}
            />
            <PortfolioFeeCard
              isRTL={isRTL}
              userFeeData={userFeeData}
              selectedView={selectedView}
              setSelectedView={setSelectedView}
            />
          </div>
          <div
            className={cn(
              'flex flex-col gap-1 bg-secondary p-2 rounded-md',
              isMobile ? 'w-full' : 'w-1/2'
            )}
          >
            <div className="flex items-center justify-between w-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={'outline'} size={'sm'} className="w-fit">
                    <p>
                      {selectedView.overview.charAt(0).toUpperCase() +
                        selectedView.overview.slice(1)}
                    </p>
                    <IconChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    onClick={() => setSelectedView({ ...selectedView, overview: 'perps' })}
                  >
                    <p>{t('Perps')}</p>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSelectedView({ ...selectedView, overview: 'all' })}
                  >
                    <p>{t('Perps+Spot+Vault')}</p>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={'outline'} size={'sm'} className="w-fit">
                    <p>
                      {selectedView.overviewTimeFrame === 'alltime'
                        ? t('All Time')
                        : selectedView.overviewTimeFrame.charAt(0).toUpperCase() +
                          selectedView.overviewTimeFrame.slice(1)}
                    </p>
                    <IconChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setSelectedView({ ...selectedView, overviewTimeFrame: 'day' })}
                  >
                    <p>{t('Day')}</p>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSelectedView({ ...selectedView, overviewTimeFrame: 'week' })}
                  >
                    <p>{t('Week')}</p>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSelectedView({ ...selectedView, overviewTimeFrame: 'month' })}
                  >
                    <p>{t('Month')}</p>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      setSelectedView({ ...selectedView, overviewTimeFrame: 'alltime' })
                    }
                  >
                    <p>{t('All Time')}</p>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Separator className="bg-white/5" />
            <div className="flex flex-col justify-between h-full gap-1 p-2">
              {overviewTable
                ? Object.entries(overviewTable).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between w-full">
                      <p className="text-sm text-white/50">{key}</p>
                      <p className="text-sm text-white">{value}</p>
                    </div>
                  ))
                : Array.from({ length: 8 }).map((_, index) => (
                    <Skeleton key={index} className="w-full h-5" />
                  ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className={cn('flex w-full h-80 gap-1', isRTL ? 'flex-row-reverse' : '')}>
      <div className="basis-xs flex flex-col gap-1 rounded-md h-full">
        <PortfolioVolumeCard
          userFeeData={userFeeData}
          userFeeLoading={userFeeLoading}
          isRTL={isRTL}
        />
        <PortfolioFeeCard
          userFeeData={userFeeData}
          selectedView={selectedView}
          setSelectedView={setSelectedView}
          isRTL={isRTL}
        />
      </div>
      <div className="flex-1 flex bg-secondary rounded-md h-full items-center justify-center">
        <PortfolioChart portfolioQuery={portfolioQuery} isRTL={isRTL} />
      </div>
      <div className="basis-xs bg-secondary rounded-md h-full flex flex-col gap-2 p-2">
        <div
          className={cn(
            'flex items-center justify-between w-full',
            isRTL ? 'flex-row-reverse' : ''
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={'outline'} size={'sm'} className="w-fit">
                <p>
                  {selectedView.overview.charAt(0).toUpperCase() + selectedView.overview.slice(1)}
                </p>
                <IconChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={() => setSelectedView({ ...selectedView, overview: 'perps' })}
              >
                <p>{t('Perps')}</p>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedView({ ...selectedView, overview: 'all' })}
              >
                <p>{t('Perps+Spot+Vault')}</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={'outline'} size={'sm'} className="w-fit">
                <p>
                  {selectedView.overviewTimeFrame === 'alltime'
                    ? t('All Time')
                    : selectedView.overviewTimeFrame.charAt(0).toUpperCase() +
                      selectedView.overviewTimeFrame.slice(1)}
                </p>
                <IconChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setSelectedView({ ...selectedView, overviewTimeFrame: 'day' })}
              >
                <p>{t('Day')} </p>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedView({ ...selectedView, overviewTimeFrame: 'week' })}
              >
                <p>{t('Week')}</p>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedView({ ...selectedView, overviewTimeFrame: 'month' })}
              >
                <p>{t('Month')}</p>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedView({ ...selectedView, overviewTimeFrame: 'alltime' })}
              >
                <p>{t('All Time')} </p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Separator className="bg-white/5" />
        <div className="flex flex-col justify-between h-full gap-1 p-2">
          {overviewTable
            ? Object.entries(overviewTable).map(([key, value]) => {
                return (
                  <div
                    key={key}
                    className={cn(
                      'flex items-center justify-between w-full',
                      isRTL ? 'flex-row-reverse' : ''
                    )}
                  >
                    <p className="text-sm text-white/50">{key}</p>
                    <p
                      className={cn(
                        'text-sm',
                        key === 'PNL'
                          ? parseFloat(value.slice(1)) > 0
                            ? `text-green-500`
                            : parseFloat(value.slice(1)) < 0
                              ? `text-red-500`
                              : 'text-white'
                          : 'text-white'
                      )}
                    >
                      {value}
                    </p>
                  </div>
                )
              })
            : Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="w-full h-5" />
              ))}
        </div>
      </div>
    </div>
  )
}

export default PortfolioStats
