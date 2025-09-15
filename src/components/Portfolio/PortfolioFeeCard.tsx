import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { IconChevronDown } from '@tabler/icons-react'
import { Skeleton } from '../ui/skeleton'
import { UserFees } from '@nktkas/hyperliquid'
import { Dispatch, SetStateAction, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Separator } from '../ui/separator'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'
import { formatWithKMB } from '@/utils/format'
import { cn } from '@/lib/utils'
import { useTranslate } from '@tolgee/react'

const PortfolioFeeCard = ({
  userFeeData,
  selectedView,
  setSelectedView,
  isRTL
}: {
  userFeeData: UserFees | undefined
  selectedView: { [key: string]: 'perps' | 'all' | 'day' | 'month' | 'week' | 'alltime' }
  setSelectedView: Dispatch<
    SetStateAction<{
      [key: string]: 'perps' | 'all' | 'day' | 'month' | 'week' | 'alltime'
    }>
  >
  isRTL: boolean
}) => {
  const { t } = useTranslate()
  const feeTier = userFeeData?.feeSchedule.stakingDiscountTiers.map((tier) => ({
    stakedHype: parseFloat(tier.bpsOfMaxSupply) * 100000,
    discount: parseFloat(tier.discount)
  }))

  const [hypeStaked, setHypeStaked] = useState<{ stakedHype: number; discount: number }>(
    feeTier?.[0] ?? { stakedHype: 0, discount: 0 }
  )

  return (
    <div
      className={cn(
        'flex flex-col justify-between bg-secondary rounded-md flex-1 gap-4 p-4',
        isRTL && 'items-end'
      )}
    >
      <div className={cn('flex items-center justify-between w-full', isRTL && 'flex-row-reverse')}>
        <h2>{t('Fees (Taker/Maker)')}</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={'outline'} size={'sm'} className="w-fit">
              <p>{selectedView.fees.charAt(0).toUpperCase() + selectedView.fees.slice(1)}</p>
              <IconChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRTL ? 'end' : 'start'}>
            <DropdownMenuItem onClick={() => setSelectedView({ ...selectedView, fees: 'perps' })}>
              <p>{t('Perps')}</p>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedView({ ...selectedView, fees: 'all' })}>
              <p>{t('Spot')}</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h1 className="text-3xl font-semibold text-white">
        {userFeeData ? (
          selectedView.fees === 'perps' ? (
            `${(parseFloat(userFeeData.userCrossRate) * 100).toFixed(3)}% / ${(parseFloat(userFeeData.userAddRate) * 100).toFixed(3)}%`
          ) : (
            `${(parseFloat(userFeeData.userSpotCrossRate) * 100).toFixed(3)}% / ${(parseFloat(userFeeData.userSpotAddRate) * 100).toFixed(3)}%`
          )
        ) : (
          <Skeleton className="w-36 h-9" />
        )}
      </h1>
      <Dialog>
        <DialogTrigger asChild>
          <p className="text-xs underline underline-offset-4 cursor-pointer transition-colors hover:text-accent-foreground">
            {t('View Fee Schedule')}
          </p>
        </DialogTrigger>
        <DialogContent isRTL={isRTL} className="min-w-11/12 md:min-w-xl">
          <DialogHeader className={cn(isRTL ? 'items-end' : 'items-start')}>
            <DialogTitle>{t('Fee Schedule')}</DialogTitle>
            <DialogDescription className={cn('text-xs', isRTL ? 'text-end' : 'text-start')}>
              {t(
                'If you have staked HYPE, you might be eligible for a lower fee tier. Choose how much you&apos;ve staked below to see your current tier.'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-between h-fit w-full max-w-full gap-2">
            <div
              className={cn(
                'flex items-center justify-between w-full',
                isRTL && 'flex-row-reverse'
              )}
            >
              <p
                className={cn(
                  'text-sm text-muted-foreground w-full',
                  isRTL ? 'text-end' : 'text-start'
                )}
              >
                {t('HYPE Staked:')}
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={'outline'}
                    size={'sm'}
                    className="w-fit text-xs flex items-center gap-2"
                  >
                    {`${hypeStaked.stakedHype} HYPE (${hypeStaked.discount * 100}% discount)`}
                    <IconChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {feeTier?.map((tier) => (
                    <DropdownMenuItem key={tier.stakedHype} onClick={() => setHypeStaked(tier)}>
                      <p>
                        {tier.stakedHype} HYPE ({tier.discount * 100}% discount)
                      </p>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Separator className="w-full mb-2" />
            <h1 className={cn('text-white/50 w-full', isRTL ? 'text-end' : 'text-start')}>
              {t('Fee Tier')}
            </h1>
            <ScrollArea className="w-xs xs:w-md sm:w-xl  md:w-full h-full">
              <Table>
                <TableHeader>
                  <TableRow className={cn(isRTL ? 'flex-row-reverse' : '')}>
                    <TableHead
                      className={cn(isRTL ? 'w-full justify-end' : 'w-full justify-start')}
                    >
                      {t('Tier')}
                    </TableHead>
                    <TableHead
                      className={cn(isRTL ? 'w-full justify-start' : 'w-full justify-end')}
                    >
                      {t('14D Volume')}
                    </TableHead>
                    <TableHead
                      className={cn(isRTL ? 'w-full justify-start' : 'w-full justify-end')}
                    >
                      {t('Perps Taker')}
                    </TableHead>
                    <TableHead
                      className={cn(isRTL ? 'w-full justify-start' : 'w-full justify-end')}
                    >
                      {t('Perps Maker')}
                    </TableHead>
                    <TableHead
                      className={cn(isRTL ? 'w-full justify-start' : 'w-full justify-end')}
                    >
                      {t('Spot Taker')}
                    </TableHead>
                    <TableHead
                      className={cn(isRTL ? 'w-full justify-start' : 'w-full justify-end')}
                    >
                      {t('Spot Maker')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userFeeData && (
                    <TableRow className={cn(isRTL ? 'flex-row-reverse' : '')}>
                      <TableCell className={cn(isRTL ? 'text-end' : 'text-start')}>{0}</TableCell>
                      <TableCell className={cn(isRTL ? 'text-start' : 'text-end')}>
                        {'< $5M'}
                      </TableCell>
                      <TableCell
                        className={cn(isRTL ? 'text-start' : 'text-end')}
                      >{`${(parseFloat(userFeeData?.feeSchedule.cross) * (1 - hypeStaked.discount) * 100).toFixed(3)}%`}</TableCell>
                      <TableCell
                        className={cn(isRTL ? 'text-start' : 'text-end')}
                      >{`${(parseFloat(userFeeData?.feeSchedule.add) * (1 - hypeStaked.discount) * 100).toFixed(3)}%`}</TableCell>
                      <TableCell
                        className={cn(isRTL ? 'text-start' : 'text-end')}
                      >{`${(parseFloat(userFeeData?.feeSchedule.spotCross) * (1 - hypeStaked.discount) * 100).toFixed(3)}%`}</TableCell>
                      <TableCell
                        className={cn(isRTL ? 'text-start' : 'text-end')}
                      >{`${(parseFloat(userFeeData?.feeSchedule.spotAdd) * (1 - hypeStaked.discount) * 100).toFixed(3)}%`}</TableCell>
                    </TableRow>
                  )}
                  {userFeeData?.feeSchedule.tiers.vip.map((item, index) => (
                    <TableRow key={index} className={cn(isRTL ? 'flex-row-reverse' : '')}>
                      <TableCell className={cn(isRTL ? 'text-end' : 'text-start')}>
                        {index + 1}
                      </TableCell>
                      <TableCell
                        className={cn(isRTL ? 'text-start' : 'text-end')}
                      >{`> $${formatWithKMB(parseFloat(item.ntlCutoff))}`}</TableCell>
                      <TableCell
                        className={cn(isRTL ? 'text-start' : 'text-end')}
                      >{`${(parseFloat(item.cross) * (1 - hypeStaked.discount) * 100).toFixed(3)}%`}</TableCell>
                      <TableCell
                        className={cn(isRTL ? 'text-start' : 'text-end')}
                      >{`${(parseFloat(item.add) * (1 - hypeStaked.discount) * 100).toFixed(3)}%`}</TableCell>
                      <TableCell
                        className={cn(isRTL ? 'text-start' : 'text-end')}
                      >{`${(parseFloat(item.spotCross) * (1 - hypeStaked.discount) * 100).toFixed(3)}%`}</TableCell>
                      <TableCell
                        className={cn(isRTL ? 'text-start' : 'text-end')}
                      >{`${(parseFloat(item.spotAdd) * (1 - hypeStaked.discount) * 100).toFixed(3)}%`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <Separator className="w-full mb-2" />
            <h1 className={cn('text-white/50 w-full', isRTL ? 'text-end' : 'text-start')}>
              {t('Maker Rebate Fee')}
            </h1>
            <ScrollArea className="w-xs xs:w-md sm:w-xl md:w-full h-full">
              <Table>
                <TableHeader>
                  <TableRow className={cn(isRTL ? 'flex-row-reverse' : '')}>
                    <TableHead
                      className={cn(isRTL ? 'w-full justify-end' : 'w-full justify-start')}
                    >
                      {t('Tier')}
                    </TableHead>
                    <TableHead
                      className={cn(isRTL ? 'w-full justify-start' : 'w-full justify-end')}
                    >
                      {t('14D Maker Volume Share')}
                    </TableHead>
                    <TableHead
                      className={cn(isRTL ? 'w-full justify-start' : 'w-full justify-end')}
                    >
                      {t('Maker')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userFeeData?.feeSchedule.tiers.mm.map((item, index) => (
                    <TableRow key={index} className={cn(isRTL ? 'flex-row-reverse' : '')}>
                      <TableCell className={cn(isRTL ? 'text-end' : 'text-start')}>
                        {index + 1}
                      </TableCell>
                      <TableCell className={cn(isRTL ? 'text-start' : 'text-end')}>
                        {`${(parseFloat(item.makerFractionCutoff) * 100).toFixed(2)}%`}
                      </TableCell>
                      <TableCell className={cn(isRTL ? 'text-start' : 'text-end')}>
                        {`${(parseFloat(item.add) * 100).toFixed(3)}%`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
          <DialogFooter
            className={cn(
              'text-xs flex w-full !flex-col text-white/50',
              isRTL ? 'text-end' : 'text-center'
            )}
          >
            <Separator className="w-full mb-2" />
            <p>
              {t(
                'Perps and spot volume are counted together to determine your fee tier, and spot volume counts double toward your fee tier.'
              )}
            </p>
            <p>
              {t('Negative fees are rebates. Staking discounts do not apply to maker rebates.')}
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PortfolioFeeCard
