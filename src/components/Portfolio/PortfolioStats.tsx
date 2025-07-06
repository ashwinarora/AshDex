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
import { IconChevronDown, IconChevronUp, IconSelector } from '@tabler/icons-react'
import PortfolioChart from './PortfolioChart'
import { PortfolioPeriods, UserFees } from '@nktkas/hyperliquid'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { cn } from '@/lib/utils'
import ReactiveText from '../common/ReactiveText'
import { UseQueryResult } from '@tanstack/react-query'
import { Skeleton } from '../ui/skeleton'

const PortfolioStats = ({
  portfolioData,
  userFeeData
}: {
  portfolioData: UseQueryResult<PortfolioPeriods | undefined, Error>
  userFeeData: UseQueryResult<UserFees | undefined, Error>
}) => {
  const { isMobile, isTablet } = useScreenSize()
  const columnHelper = useMemo(() => createColumnHelper<UserFees['dailyUserVlm'][number]>(), [])
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedView, setSelectedView] = useState<{
    [key: string]: string
  }>({
    fees: 'perps',
    overview: 'perps',
    overviewTimeFrame: '14d'
  })

  const columns = useMemo(
    () => [
      columnHelper.accessor('date', {
        header: 'Date',
        cell: ({ row }) => {
          return <div className="text-xs">{row.original.date}</div>
        },
        meta: { label: 'Date' },
        enableSorting: true
      }),
      columnHelper.accessor('exchange', {
        header: 'Exchange Volume',
        cell: ({ row }) => (
          <ReactiveText value={parseFloat(row.original.exchange)} type="currency" precision={2} />
        ),
        meta: { label: 'Exchange Volume' },
        enableSorting: false
      }),
      columnHelper.accessor('userCross', {
        header: 'Taker Volume',
        cell: ({ row }) => (
          <ReactiveText
            className={cn(
              '',
              parseFloat(row.original.userCross) > 0 ? 'text-white' : 'text-white/50'
            )}
            value={parseFloat(row.original.userCross)}
            type="currency"
            precision={2}
          />
        ),
        meta: { label: 'Weighted Taker Volume' },
        enableSorting: false
      }),
      columnHelper.accessor('userAdd', {
        header: 'Maker Volume',
        cell: ({ row }) => (
          <ReactiveText
            className={cn(
              '',
              parseFloat(row.original.userAdd) > 0 ? 'text-white' : 'text-white/50'
            )}
            value={parseFloat(row.original.userAdd)}
            type="currency"
            precision={2}
          />
        ),
        meta: { label: 'Weighted Maker Volume' },
        enableSorting: false
      })
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data: userFeeData?.data ? userFeeData?.data?.dailyUserVlm : [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting: true
  })

  const overviewTable = useMemo(() => {
    return {
      PNL: '$0.00',
      Volume: '$0.00',
      'Max Drawdown': '0.00%',
      'Total Equity': '$0.00',
      'Perps Account Equity': '$0.00',
      'Spot Account Equity': '$0.00',
      'Vault Equity': '$0.00',
      'Staking Account': '0 HYPE'
    }
  }, [])

  if (isMobile || isTablet) {
    return (
      <div className="flex flex-col w-full h-fit gap-1">
        <div className="flex bg-secondary rounded-md h-80 items-center justify-center w-full">
          <PortfolioChart portfolioData={portfolioData?.data as PortfolioPeriods} />
        </div>
        <div className={cn('flex flex-row gap-1 w-full h-fit', isMobile ? 'flex-col' : 'flex-row')}>
          <div className={cn('flex flex-col gap-1 rounded-md', isMobile ? 'w-full' : 'w-1/2')}>
            <div className="flex flex-col justify-between bg-secondary rounded-md flex-1 gap-4 p-4">
              <h2>30 Day Volume</h2>
              {userFeeData?.isLoading ? (
                <Skeleton className="w-36 h-12" />
              ) : (
                <h1 className="text-3xl font-semibold text-white">
                  $
                  {userFeeData?.data?.dailyUserVlm
                    ?.reduce((acc, curr) => Number(curr.userAdd) + Number(curr.userCross) + acc, 0)
                    .toFixed(2) || 0}
                </h1>
              )}
              <Dialog>
                <DialogTrigger disabled={userFeeData?.data?.dailyUserVlm?.length === 0} asChild>
                  <p className="text-xs underline underline-offset-4 cursor-pointer transition-colors hover:text-accent-foreground">
                    View Volume
                  </p>
                </DialogTrigger>
                <DialogContent className="w-fit !max-w-2xl max-h-[80vh] overflow-x-hidden overflow-y-auto scroll-smooth flex flex-col items-center gap-2">
                  <DialogHeader>
                    <DialogTitle>Your Volume History</DialogTitle>
                    <DialogDescription className="text-xs text-white/50">
                      Dates are based on UTC time zone and do not include the current day. Your 14D
                      maker volume share is 0.00%. <br />
                      Perps and spot volume are counted together to determine your fee tier, and
                      spot volume counts double toward your fee tier.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center h-full w-full gap-2">
                    {userFeeData?.data?.dailyUserVlm &&
                      userFeeData?.data?.dailyUserVlm?.length > 0 && (
                        <Table>
                          <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                              <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                  <TableHead
                                    key={header.id}
                                    onClick={() => {
                                      if (header.column.getCanSort()) {
                                        header.column.toggleSorting()
                                      }
                                    }}
                                    className={cn(
                                      'cursor-pointer flex items-center gap-1 w-1/4 flex-1 shrink-0 !text-xs',
                                      header.id === 'date' ? 'justify-start' : 'justify-end',
                                      header.column.columnDef.enableSorting
                                        ? 'hover:text-accent-foreground'
                                        : 'hover:text-white/50',
                                      header.column.getIsSorted() === 'asc' ||
                                        header.column.getIsSorted() === 'desc'
                                        ? 'text-accent-foreground'
                                        : 'text-white/50'
                                    )}
                                  >
                                    {header.isPlaceholder ? null : (
                                      <>
                                        {flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                        )}
                                        {header.column.columnDef.enableSorting ? (
                                          header.column.getIsSorted() === 'asc' ? (
                                            <IconChevronUp className="text-inherit size-4" />
                                          ) : header.column.getIsSorted() === 'desc' ? (
                                            <IconChevronDown className="text-inherit size-4" />
                                          ) : (
                                            <IconSelector className="text-inherit size-4" />
                                          )
                                        ) : null}
                                      </>
                                    )}
                                  </TableHead>
                                ))}
                              </TableRow>
                            ))}
                          </TableHeader>
                          <TableBody>
                            {table.getRowModel().rows.map((row) => (
                              <TableRow className="h-12" key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                  <TableCell
                                    key={cell.id}
                                    className="font-medium text-white text-xs first:text-left text-right"
                                  >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex flex-col justify-between bg-secondary rounded-md flex-1 gap-4 p-4">
              <div className="flex items-center justify-between w-full">
                <h2>Fees (Taker/Maker)</h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={'outline'} size={'sm'} className="w-fit">
                      <p>
                        {selectedView.fees.charAt(0).toUpperCase() + selectedView.fees.slice(1)}
                      </p>
                      <IconChevronDown className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      onClick={() => setSelectedView({ ...selectedView, fees: 'perps' })}
                    >
                      <p>Perps</p>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSelectedView({ ...selectedView, fees: 'spot' })}
                    >
                      <p>Spot</p>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h1 className="text-3xl font-semibold text-white">
                {userFeeData &&
                  userFeeData.data &&
                  (selectedView.fees === 'perps'
                    ? `${(parseFloat(userFeeData.data.userCrossRate) * 100).toFixed(3)}% / ${(parseFloat(userFeeData.data.userAddRate) * 100).toFixed(3)}%`
                    : `${(parseFloat(userFeeData.data.userSpotCrossRate) * 100).toFixed(3)}% / ${(parseFloat(userFeeData.data.userSpotAddRate) * 100).toFixed(3)}%`)}
              </h1>
              <p className="text-xs">View Fee Schedule</p>
            </div>
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
                    <p>{selectedView.overview}</p>
                    <IconChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    onClick={() => setSelectedView({ ...selectedView, overview: 'perps' })}
                  >
                    <p>Perps</p>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      setSelectedView({ ...selectedView, overview: 'perps+spot+vault' })
                    }
                  >
                    <p>Perps+Spot+Vault</p>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={'outline'} size={'sm'} className="w-fit">
                    <p>{selectedView.overviewTimeFrame}</p>
                    <IconChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setSelectedView({ ...selectedView, overviewTimeFrame: '14d' })}
                  >
                    <p>14d</p>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSelectedView({ ...selectedView, overviewTimeFrame: '1m' })}
                  >
                    <p>1m</p>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Separator className="bg-white/5" />
            <div className="flex flex-col justify-between h-full gap-1 p-2">
              {Object.entries(overviewTable).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between w-full">
                  <p className="text-sm text-white/50">{key}</p>
                  <p className="text-sm text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex w-full h-80 gap-1">
      <div className="basis-xs flex flex-col gap-1 rounded-md h-full">
        <div className="flex flex-col justify-between bg-secondary rounded-md flex-1 gap-1 p-4">
          <h2>30 Day Volume</h2>
          {userFeeData?.isLoading ? (
            <Skeleton className="w-36 h-12" />
          ) : (
            <h1 className="text-5xl font-semibold text-white">
              $
              {userFeeData?.data?.dailyUserVlm
                ?.reduce((acc, curr) => Number(curr.userAdd) + Number(curr.userCross) + acc, 0)
                .toFixed(2) || 0}
            </h1>
          )}
          <Dialog>
            <DialogTrigger disabled={userFeeData?.data?.dailyUserVlm?.length === 0} asChild>
              <p className="text-xs underline underline-offset-4 cursor-pointer transition-colors hover:text-accent-foreground">
                View Volume
              </p>
            </DialogTrigger>
            <DialogContent className="w-fit !max-w-2xl max-h-[80vh] overflow-x-hidden overflow-y-auto scroll-smooth flex flex-col items-center gap-2">
              <DialogHeader>
                <DialogTitle>Your Volume History</DialogTitle>
                <DialogDescription className="text-xs text-white/50">
                  Dates are based on UTC time zone and do not include the current day. Your 14D
                  maker volume share is 0.00%. <br />
                  Perps and spot volume are counted together to determine your fee tier, and spot
                  volume counts double toward your fee tier.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center h-full w-full gap-2">
                {userFeeData?.data?.dailyUserVlm && userFeeData?.data?.dailyUserVlm?.length > 0 && (
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead
                              key={header.id}
                              onClick={() => {
                                if (header.column.getCanSort()) {
                                  header.column.toggleSorting()
                                }
                              }}
                              className={cn(
                                'cursor-pointer flex items-center gap-1 w-1/4 flex-1 shrink-0 !text-xs',
                                header.id === 'date' ? 'justify-start' : 'justify-end',
                                header.column.columnDef.enableSorting
                                  ? 'hover:text-accent-foreground'
                                  : 'hover:text-white/50',
                                header.column.getIsSorted() === 'asc' ||
                                  header.column.getIsSorted() === 'desc'
                                  ? 'text-accent-foreground'
                                  : 'text-white/50'
                              )}
                            >
                              {header.isPlaceholder ? null : (
                                <>
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                  {header.column.columnDef.enableSorting ? (
                                    header.column.getIsSorted() === 'asc' ? (
                                      <IconChevronUp className="text-inherit size-4" />
                                    ) : header.column.getIsSorted() === 'desc' ? (
                                      <IconChevronDown className="text-inherit size-4" />
                                    ) : (
                                      <IconSelector className="text-inherit size-4" />
                                    )
                                  ) : null}
                                </>
                              )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows.map((row) => (
                        <TableRow className="h-12" key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className="font-medium text-white text-xs first:text-left text-right"
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-col justify-between bg-secondary rounded-md flex-1 gap-1 p-4">
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
                <DropdownMenuItem
                  onClick={() => setSelectedView({ ...selectedView, fees: 'perps' })}
                >
                  <p>Perps</p>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedView({ ...selectedView, fees: 'spot' })}
                >
                  <p>Spot</p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <h1 className="text-3xl font-semibold text-white">
            {userFeeData &&
              userFeeData.data &&
              (selectedView.fees === 'perps'
                ? `${(parseFloat(userFeeData.data.userCrossRate) * 100).toFixed(3)}% / ${(parseFloat(userFeeData.data.userAddRate) * 100).toFixed(3)}%`
                : `${(parseFloat(userFeeData.data.userSpotCrossRate) * 100).toFixed(3)}% / ${(parseFloat(userFeeData.data.userSpotAddRate) * 100).toFixed(3)}%`)}
          </h1>
          <p className="text-xs">View Fee Schedule</p>
        </div>
      </div>
      <div className="flex-1 flex bg-secondary rounded-md h-full items-center justify-center">
        <PortfolioChart portfolioData={portfolioData?.data as PortfolioPeriods} />
      </div>
      <div className="basis-xs bg-secondary rounded-md h-full flex flex-col gap-2 p-2">
        <div className="flex items-center justify-between w-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={'outline'} size={'sm'} className="w-fit">
                <p>{selectedView.overview}</p>
                <IconChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={() => setSelectedView({ ...selectedView, overview: 'perps' })}
              >
                <p>Perps</p>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedView({ ...selectedView, overview: 'perps+spot+vault' })}
              >
                <p>Perps+Spot+Vault</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={'outline'} size={'sm'} className="w-fit">
                <p>{selectedView.overviewTimeFrame}</p>
                <IconChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setSelectedView({ ...selectedView, overviewTimeFrame: '14d' })}
              >
                <p>14d</p>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedView({ ...selectedView, overviewTimeFrame: '1m' })}
              >
                <p>1m</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Separator className="bg-white/5" />
        <div className="flex flex-col justify-between h-full gap-1 p-2">
          {Object.entries(overviewTable).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between w-full">
              <p className="text-sm text-white/50">{key}</p>
              <p className="text-sm text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PortfolioStats
