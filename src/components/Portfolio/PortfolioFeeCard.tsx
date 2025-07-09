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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Separator } from '../ui/separator'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'

const PortfolioFeeCard = ({
    userFeeData,
    selectedView,
    setSelectedView
}: {
    userFeeData: UserFees | undefined
    selectedView: { [key: string]: 'perps' | 'all' | 'day' | 'month' | 'week' | 'alltime' }
    setSelectedView: Dispatch<
        SetStateAction<{
            [key: string]: 'perps' | 'all' | 'day' | 'month' | 'week' | 'alltime'
        }>
    >
}) => {

    const feeTier = userFeeData?.feeSchedule.stakingDiscountTiers.map((tier) => ({
        stakedHype: parseFloat(tier.bpsOfMaxSupply) * 100000,
        discount: parseFloat(tier.discount)
    }))

    const [hypeStaked, setHypeStaked] = useState<{ stakedHype: number, discount: number }>(feeTier?.[0] ?? { stakedHype: 0, discount: 0 })

    return (
        <div className="flex flex-col justify-between bg-secondary rounded-md flex-1 gap-4 p-4">
            <div className="flex items-center justify-between w-full">
                <h2>Fees (Taker/Maker)</h2>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={'outline'} size={'sm'} className="w-fit">
                            <p>{selectedView.fees.charAt(0).toUpperCase() + selectedView.fees.slice(1)}</p>
                            <IconChevronDown className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => setSelectedView({ ...selectedView, fees: 'perps' })}>
                            <p>Perps</p>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedView({ ...selectedView, fees: 'all' })}>
                            <p>Spot</p>
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
                        View Fee Schedule
                    </p>
                </DialogTrigger>
                <DialogContent className='min-w-11/12 md:min-w-xl'>
                    <DialogTitle>Fee Schedule</DialogTitle>
                    <DialogDescription className='text-xs'>
                        If you have staked HYPE, you might be eligible for a lower fee tier. Choose how much you&apos;ve staked below to see your current tier.
                    </DialogDescription>
                    <div className="flex flex-col items-center justify-between h-fit w-full max-w-full gap-2">
                        <div className='flex items-center justify-between w-full'>
                            <p className='text-sm text-muted-foreground w-full text-left'>HYPE Staked:</p>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant={'outline'} size={'sm'} className="w-fit text-xs flex items-center gap-2">
                                        {`${hypeStaked.stakedHype} HYPE (${hypeStaked.discount * 100}% discount)`}
                                        <IconChevronDown className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {feeTier?.map((tier) => (
                                        <DropdownMenuItem key={tier.stakedHype} onClick={() => setHypeStaked(tier)}>
                                            <p>{tier.stakedHype} HYPE ({tier.discount * 100}% discount)</p>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <Separator className='w-full mb-2' />
                        <h1 className='text-white/50 w-full text-left'>Fee Tier</h1>
                        <ScrollArea className='w-xs xs:w-md sm:w-xl  md:w-full h-full'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className='w-14'>Tier</TableHead>
                                    <TableHead className='w-28 text-right justify-end'>14D Volume</TableHead>
                                    <TableHead className='w-20 justify-end'>Perps Taker</TableHead>
                                    <TableHead className='w-20 justify-end'>Perps Maker</TableHead>
                                    <TableHead className='w-20 justify-end'>Spot Taker</TableHead>
                                    <TableHead className='w-20 justify-end'>Spot Maker</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {userFeeData && <TableRow>
                                    <TableCell className='w-14'>{0}</TableCell>
                                    <TableCell className='text-right w-28'>{'< $5,000,000'}</TableCell>
                                    <TableCell className='text-right w-20'>{`${(parseFloat(userFeeData?.feeSchedule.cross) * (1-hypeStaked.discount) * 100).toFixed(3)}%`}</TableCell>
                                    <TableCell className='text-right w-20'>{`${(parseFloat(userFeeData?.feeSchedule.add) * (1-hypeStaked.discount) * 100).toFixed(3)}%`}</TableCell>
                                    <TableCell className='text-right w-20'>{`${(parseFloat(userFeeData?.feeSchedule.spotCross) * (1-hypeStaked.discount) * 100).toFixed(3)}%`}</TableCell>
                                    <TableCell className='text-right w-20'>{`${(parseFloat(userFeeData?.feeSchedule.spotAdd) * (1-hypeStaked.discount) * 100).toFixed(3)}%`}</TableCell>
                                </TableRow>}
                                {userFeeData?.feeSchedule.tiers.vip.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='w-14'>{index + 1}</TableCell>
                                        <TableCell className='text-right w-28'>{`> $${parseFloat(item.ntlCutoff).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}</TableCell>
                                        <TableCell className='text-right w-20'>{`${(parseFloat(item.cross) * (1-hypeStaked.discount) * 100).toFixed(3)}%`}</TableCell>
                                        <TableCell className='text-right w-20'>{`${(parseFloat(item.add) * (1-hypeStaked.discount) * 100).toFixed(3)}%`}</TableCell>
                                        <TableCell className='text-right w-20'>{`${(parseFloat(item.spotCross) * (1-hypeStaked.discount) * 100).toFixed(3)}%`}</TableCell>
                                        <TableCell className='text-right w-20'>{`${(parseFloat(item.spotAdd) * (1-hypeStaked.discount) * 100).toFixed(3)}%`}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <ScrollBar orientation='horizontal' />
                        </ScrollArea>
                        <Separator className='w-full mb-2' />
                        <h1 className='text-white/50 w-full text-left'>Maker Rebate Fee</h1>
                        <ScrollArea className='w-xs xs:w-md sm:w-xl md:w-full h-full'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className='w-full flex-1'>Tier</TableHead>
                                    <TableHead className='w-full flex-1 text-center justify-center'>14D Maker Volume Share</TableHead>
                                    <TableHead className='w-full flex-1 justify-end'>Maker</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {userFeeData?.feeSchedule.tiers.mm.map((item,index) => (
                                    <TableRow key={index}>
                                        <TableCell className='w-full flex-1'>{index + 1}</TableCell>
                                        <TableCell className='w-full flex-1 text-center justify-center'>
                                            {`${(parseFloat(item.makerFractionCutoff) * 100).toFixed(2)}%`}
                                        </TableCell>
                                        <TableCell className='w-full flex-1 text-right justify-end'>
                                            {`${(parseFloat(item.add) * 100).toFixed(3)}%`}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <ScrollBar orientation='horizontal' />
                        </ScrollArea>
                    </div>
                    <DialogFooter className='text-xs flex w-full !flex-col text-center text-white/50'>
                        <Separator className='w-full mb-2' />
                        <p>Perps and spot volume are counted together to determine your fee tier, and spot volume counts double toward your fee tier.</p>
                        <p>Negative fees are rebates. Staking discounts do not apply to maker rebates.</p>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default PortfolioFeeCard
