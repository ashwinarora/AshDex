'use client'
import { useAccount } from 'wagmi'
import WalletNotConnected from '@/components/ConnectWalletModal/DisconnectedWalletState'
import { useState, useMemo, useEffect } from 'react'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState
} from '@tanstack/react-table'
import SendModal from './component/SendModal'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { IconChevronDown, IconChevronUp, IconSelector } from '@tabler/icons-react'
import { useScreenSize } from '@/hooks/useScreenSize'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'
import { formatWithCommas } from '@/utils/format'
import { useTranslate } from '@tolgee/react'
import SpotToPerpTransferModal from './component/transfers/spot-to-perp'
import { useSpotMeta } from '@/hooks/useSpotMeta'

type BalanceProps = {
  isRTL: boolean
  isHideSmallBalances: boolean
}

type BalanceData = {
  coin: string
  token: string | number
  total: string | number
  hold: string | number
  entryNtl: string | number
  usdcValue: string | number
  avgBuyPrice: string | number
  pnl: string | number
  pnlPercentage: string | number
}

const Balances = ({ isRTL, isHideSmallBalances }: BalanceProps) => {
  const { t } = useTranslate()
  const { isConnected } = useAccount()
  const { spotKeyToName } = useSpotMeta()

  const { clearingHouseState, spotState, spotAssetContext } = useHyperliquidStore(
    useShallow((state) => ({
      clearingHouseState: state.clearingHouseState,
      spotState: state.spotState,
      spotAssetContext: state.spotAssetContext
    }))
  )

  const [sorting, setSorting] = useState<SortingState>([])
  const [isMounted, setIsMounted] = useState(false)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [coin, setCoin] = useState('')
  const [defaultToPerp, setDefaultToPerp] = useState(false)
  const columnHelper = useMemo(() => createColumnHelper<BalanceData>(), [])
  const { isTablet, isMobile } = useScreenSize()
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const combinedData = useMemo(() => {
    if (!isConnected) return []

    const perpData = {
      coin: 'USDC(Perps)',
      token: 'USDC',
      total: clearingHouseState?.marginSummary?.accountValue || '-',
      hold: clearingHouseState?.withdrawable || '-',
      usdcValue: Number(clearingHouseState?.marginSummary?.accountValue),
      avgBuyPrice: '--',
      pnl: '--',
      pnlPercentage: '--',
      entryNtl: '--'
    }

    const spotData =
      spotState?.balances
        ?.map((state) => {
          const SpotAssetKey = spotKeyToName.entries().find((value) => value[1] === state.coin)?.[0]
          const markPx = spotAssetContext.find((asset) => asset.coin === SpotAssetKey)?.markPx
          const usdcValue = Number(state.total) * Number(markPx)
          const pnl = usdcValue - Number(state.entryNtl)
          const pnlPercentage = (pnl / Number(state.entryNtl)) * 100

          return {
            ...state,
            coin: state.coin === 'USDC' ? 'USDC(Spot)' : state.coin,
            entryNtl: state.coin === 'USDC' ? '--' : Number(state.entryNtl),
            avgBuyPrice:
              state.coin === 'USDC'
                ? '--'
                : Number(state.total) > 0
                  ? Number(state.entryNtl) / Number(state.total)
                  : '--',
            pnl: state.coin === 'USDC' ? '--' : pnl,
            pnlPercentage: state.coin === 'USDC' ? '--' : pnlPercentage,
            usdcValue: state.coin === 'USDC' ? Number(state.total) : usdcValue,
            hold: Number(state.total) - Number(state.hold)
          }
        })
        .filter((state) => state.usdcValue > (isHideSmallBalances ? 1 : 0)) || []

    return [perpData, ...spotData]
  }, [
    isConnected,
    clearingHouseState?.marginSummary?.accountValue,
    clearingHouseState?.withdrawable,
    spotState?.balances,
    spotAssetContext,
    spotKeyToName,
    isHideSmallBalances
  ])

  const columns = useMemo(
    () => [
      columnHelper.accessor('coin', {
        id: 'coin',
        header: () => (
          <span className={cn('flex justify-start items-center gap-1')}>{t('Coin')}</span>
        ),
        cell: (info) => {
          const coin = info.getValue().replace('(', ' (')
          if (coin === 'USDC (Spot)' || coin === 'USDC (Perps)')
            return <span className="text-white text-xs">{coin}</span>
          return (
            <Button
              variant="link"
              size="defaultLink"
              className="text-accent-foreground font-bold text-xs hover:text-accent-foreground transition-all hover:no-underline"
              onClick={() => {
                router.push(`/spot/${info.getValue()}`)
              }}
            >
              {coin}
            </Button>
          )
        },
        enableSorting: true,
        meta: { label: t('Coin') }
      }),
      columnHelper.accessor((row) => ({ total: row.total, coin: row.coin }), {
        id: 'total',
        header: () => (
          <span className="flex justify-start items-center gap-1">{t('Total Balance')}</span>
        ),
        cell: (info) => {
          return (
            <div
              className={cn('flex justify-start items-center gap-1', isRTL && 'flex-row-reverse')}
            >
              <span className="text-white font-semibold">
                {formatWithCommas(Number(info.getValue().total))}{' '}
              </span>
              <span className="text-white/70 text-xs">
                {info.getValue().coin === 'USDC(Spot)' || info.getValue().coin === 'USDC(Perps)'
                  ? 'USDC'
                  : info.getValue().coin}
              </span>
            </div>
          )
        },
        enableSorting: true,
        meta: { label: t('Total Balance') }
      }),
      columnHelper.accessor((row) => ({ hold: row.hold, coin: row.coin }), {
        id: 'hold',
        header: () => (
          <span className="flex justify-start items-center gap-1">{t('Available Balance')}</span>
        ),
        cell: (info) => {
          return (
            <div
              className={cn('flex justify-start items-center gap-1', isRTL && 'flex-row-reverse')}
            >
              <span className="text-white font-semibold">
                {formatWithCommas(Number(info.getValue().hold))}{' '}
              </span>
              <span className={cn('text-white/70 text-xs')}>
                {info.getValue().coin === 'USDC(Spot)' || info.getValue().coin === 'USDC(Perps)'
                  ? 'USDC'
                  : info.getValue().coin}
              </span>
            </div>
          )
        },
        enableSorting: true,
        meta: { label: t('Hold') }
      }),
      columnHelper.accessor('usdcValue', {
        id: 'usdcValue',
        header: () => (
          <span className="flex justify-start items-center gap-1">{t('USDC Value')}</span>
        ),
        cell: (info) => {
          const value = formatWithCommas(Number(info.getValue())) ?? '--'
          return <span className="text-white text-start text-xs">$ {value}</span>
        },
        enableSorting: true,
        meta: { label: t('USDC Value') }
      }),
      columnHelper.accessor('avgBuyPrice', {
        id: 'avgBuyPrice',
        header: () => (
          <span className="flex justify-start items-center gap-1">{t('Avg Buy Price')}</span>
        ),
        cell: (info) => {
          const raw = info.getValue()
          const value = isNaN(Number(raw)) ? '--' : formatWithCommas(Number(raw))
          return (
            <span className="text-white text-start text-xs">
              {value === '--' ? '--' : `$ ${value}`}
            </span>
          )
        },
        enableSorting: true,
        meta: { label: t('Avg Buy Price') }
      }),
      columnHelper.accessor((row) => ({ pnl: row.pnl, pnlPercentage: row.pnlPercentage }), {
        id: 'pnl',
        header: () => <span className="flex justify-start items-center gap-1">{t('PNL')}</span>,
        cell: (info) => {
          // const value =  formatWithCommas(Number(info.getValue().pnl)) ?? '--'
          const value = isNaN(Number(info.getValue().pnl))
            ? '--'
            : formatWithCommas(Number(info.getValue().pnl))
          const percentage = isNaN(Number(info.getValue().pnlPercentage))
            ? '--'
            : formatWithCommas(Number(info.getValue().pnlPercentage))
          // const percentage = formatWithCommas(Number(info.getValue().pnlPercentage)) ?? '--'
          return (
            <span
              className={cn(
                'text-white text-start text-xs',
                value === '--'
                  ? 'text-white/70'
                  : Number(info.getValue().pnl) > 0
                    ? 'text-green'
                    : 'text-red'
              )}
            >
              {value === '--'
                ? '--'
                : `${Number(value) < 0 ? '-' : ''} $${Math.abs(Number(value))} (${percentage}%)`}
            </span>
          )
        },
        enableSorting: true,
        meta: { label: t('PNL') }
      }),
      columnHelper.display({
        id: 'transfer',
        header: () => (
          <span className="flex justify-start items-center gap-1">{t('Transfer')}</span>
        ),
        cell: (info) => {
          if (info.row.original.coin !== 'USDC(Perps)' && info.row.original.coin !== 'USDC(Spot)')
            return <span className="text-white/70">--</span>

          return (
            <Button
              variant={'link'}
              size={'sm'}
              className="text-xs !p-0"
              onClick={() => {
                setDefaultToPerp(info.row.original.coin !== 'USDC(Perps)')
                setIsTransferModalOpen(true)
              }}
            >
              {info.row.original.coin === 'USDC(Perps)'
                ? t('Transfer to Spot')
                : t('Transfer to Perp')}
            </Button>
          )
        },
        enableSorting: false,
        meta: { label: t('Transfer') }
      }),
      columnHelper.display({
        id: 'send',
        header: () => <span className="flex justify-start items-center gap-1">{t('Send')}</span>,
        cell: (info) => {
          const coin = info.row.original.coin
          return (
            <Button
              variant={'link'}
              size={'sm'}
              className="text-xs !p-0"
              onClick={() => {
                if (coin === 'USDC(Perps)') {
                  setCoin(() => '')
                  setIsSendModalOpen(true)
                  return
                }
                setCoin(() => coin)
                setIsSendModalOpen(true)
              }}
            >
              {t('Send')}
            </Button>
          )
        },
        enableSorting: false,
        meta: { label: t('Send') }
      })
    ],
    [columnHelper, isSendModalOpen, t]
  )

  const table = useReactTable({
    data: combinedData,
    columns: isRTL ? columns.reverse() : columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  if (!isMounted) {
    return null
  }

  if (!isConnected) {
    return <WalletNotConnected />
  }

  if (isTablet || isMobile) {
    const header = table.getHeaderGroups()[0].headers.map((header) => {
      return flexRender(header.column.columnDef.header, header.getContext())
    })
    return (
      <div className="w-full h-full flex flex-col rounded-md gap-2">
        <div className="flex xl:hidden flex-col items-center justify-start gap-2">
          {table.getRowModel().rows.map((row) => {
            const cell = row.getVisibleCells().map((cell) => {
              return flexRender(cell.column.columnDef.cell, cell.getContext())
            })
            return (
              <div
                key={row.id}
                className="w-full flex flex-col justify-between rounded-md h-fit gap-2 bg-accent p-4"
              >
                {header.map((item, index) => (
                  <div className="flex flex-col gap-3" key={index}>
                    <div className="flex items-center text-xs justify-between">
                      <span className="text-white/70">{item}</span>
                      <span className="text-white w-fit">{cell[index]}</span>
                    </div>
                    {item === t('Coin') && <Separator className="w-full bg-white/10" />}
                  </div>
                ))}
                {isSendModalOpen && (
                  <SendModal
                    isOpen={isSendModalOpen}
                    onClose={() => setIsSendModalOpen(false)}
                    spotDefaultName={coin}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col rounded-md gap-2">
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
                    'cursor-pointer w-full',
                    isRTL
                      ? header.id === 'send' || header.id === 'transfer'
                        ? 'justify-start'
                        : 'justify-end'
                      : header.id === 'send' || header.id === 'transfer'
                        ? 'justify-end'
                        : 'justify-start',
                    header.column.columnDef.enableSorting
                      ? 'hover:text-accent-foreground'
                      : 'hover:text-white/70',
                    header.column.getIsSorted() === 'asc' || header.column.getIsSorted() === 'desc'
                      ? 'text-accent-foreground'
                      : 'text-white/70'
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
            <TableRow className="h-10" key={row.id}>
              {row.getVisibleCells().map((cell) => {
                return (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      'font-medium text-white text-xs',
                      // isRTL ? 'first:text-start text-end' : 'text-start last:text-end'
                      isRTL
                        ? cell.column.id === 'send' || cell.column.id === 'transfer'
                          ? 'text-start'
                          : 'text-end'
                        : cell.column.id === 'send' || cell.column.id === 'transfer'
                          ? 'text-end'
                          : 'text-start'
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {isSendModalOpen && (
        <SendModal
          isOpen={isSendModalOpen}
          onClose={() => setIsSendModalOpen(false)}
          spotDefaultName={coin}
        />
      )}
      {isTransferModalOpen && (
        <SpotToPerpTransferModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          defaultToPerp={defaultToPerp}
        />
      )}
    </div>
  )
}

export default Balances
