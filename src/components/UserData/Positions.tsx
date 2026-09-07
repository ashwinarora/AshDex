import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState
} from '@tanstack/react-table'
import WalletNotConnected from '@/components/ConnectWalletModal/DisconnectedWalletState'
import { useConnection } from 'wagmi'
import dynamic from 'next/dynamic'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import LimitCloseModal from './component/LimitCloseModal'
import MarketCloseModal from './component/MarketCloseModal'
import MarkPxDisplay from './component/MarkPxDisplay'
import TPSL_Cell from './component/TPSL_Cell'
import LeverageModal from './component/LeverageModal'
import {
  IconPencil,
  IconChevronDown,
  IconX,
  IconSelector,
  IconChevronUp,
  IconChartBar
} from '@tabler/icons-react'
import IsolatedMarginModal from './component/IsolatedMarginModal'
import CloseAllModal from './component/CloseAllModal'
import ReactiveText from '@/components/reactive-text'
import type { WebData2Event } from '@nktkas/hyperliquid/api/subscription'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useScreenSize } from '@/hooks/useScreenSize'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
interface IPositionsProps {
  isRTL: boolean
}

const Positions = ({ isRTL }: IPositionsProps) => {
  const { isConnected } = useConnection()
  const router = useRouter()
  const { clearingHouseState, allMids, agentWallet } = useHyperliquidStore(
    useShallow((state) => ({
      clearingHouseState: state.clearingHouseState,
      allMids: state.allMids,
      agentWallet: state.agentWallet
    }))
  )
  const [sorting, setSorting] = useState<SortingState>([])
  const [mounted, setMounted] = useState(false)
  const [isLimitCloseModalOpen, setIsLimitCloseModalOpen] = useState(false)
  const [isMarketCloseModalOpen, setIsMarketCloseModalOpen] = useState(false)
  const [closingAsset, setClosingAsset] = useState<string | null>(null)
  const [isTPSLModalOpen, setIsTPSLModalOpen] = useState(false)
  const [tpslAsset, setTpslAsset] =
    useState<WebData2Event['clearinghouseState']['assetPositions'][number]['position']>()
  const [isLeverageModalOpen, setIsLeverageModalOpen] = useState(false)
  const [leverageAsset, setLeverageAsset] =
    useState<WebData2Event['clearinghouseState']['assetPositions'][number]['position']>()
  const { isAgentApproved, currentFeeApproval, openModal: openAgentModal } = useAgentApproval()
  const [isIsolatedMarginModalOpen, setIsIsolatedMarginModalOpen] = useState(false)
  const [isolatedMarginAsset, setIsolatedMarginAsset] =
    useState<WebData2Event['clearinghouseState']['assetPositions'][number]['position']>()
  const [isCloseAllModalOpen, setIsCloseAllModalOpen] = useState(false)

  const { isTablet, isMobile } = useScreenSize()
  useEffect(() => {
    setMounted(true)
  }, [])

  const helper = useMemo(
    () =>
      createColumnHelper<
        WebData2Event['clearinghouseState']['assetPositions'][number]['position'] & {
          meta?: { label: string }
        }
      >(),
    []
  )

  const allMidsRef = useRef(allMids)

  useEffect(() => {
    allMidsRef.current = allMids
  }, [allMids])

  const columns = useMemo(
    () => [
      helper.accessor('coin', {
        id: 'coin',
        header: () => (
          <span className={cn('flex justify-start items-center gap-1')}>{'Position'}</span>
        ),
        cell: (info) => {
          const coin = info.getValue()
          const { leverage } = info.row.original
          return (
            <div
              className={cn('flex items-center justify-start gap-2', isRTL && 'flex-row-reverse')}
            >
              <Button
                variant="link"
                size="defaultLink"
                className="text-white hover:text-accent-foreground transition-all hover:no-underline"
                onClick={() => {
                  router.push(`/${coin}`)
                }}
              >
                {coin || ''}
              </Button>
              <Button
                variant="outline"
                className="p-1 flex-1 h-fit text-xs"
                onClick={() => {
                  if (!isAgentApproved || currentFeeApproval === 0) return openAgentModal()
                  setLeverageAsset(info.row.original)
                  setIsLeverageModalOpen(true)
                }}
              >
                {leverage.value}x
              </Button>
            </div>
          )
        },
        meta: { label: 'Coin' }
      }),
      helper.accessor('positionValue', {
        id: 'positionValue',
        header: () => (
          <span className={cn('flex justify-start items-center gap-1')}>{'Value'}</span>
        ),
        meta: { label: 'Position Value' },
        cell: (info) => <ReactiveText value={info.getValue()} type="currency" precision={2} />
      }),
      helper.accessor('szi', {
        id: 'szi',
        header: () => 'Size',
        meta: { label: 'Size' },
        cell: (info) => (
          <ReactiveText
            value={info.getValue()}
            type="number"
            precision={4}
            isStatic={true}
            suffix={info.row.original.coin}
          />
        )
      }),
      helper.accessor('entryPx', {
        id: 'entryPx',
        header: () => 'Entry',
        meta: { label: 'Entry Price' },
        cell: (info) => <ReactiveText value={info.getValue()} type="currency" precision={2} />
      }),
      helper.display({
        id: 'markPx',
        header: () => 'Mark',
        meta: { label: 'Mark Price' },
        cell: (info) => <MarkPxDisplay asset={info.row.original.coin} />
      }),
      helper.accessor('cumFunding.allTime', {
        id: 'cumFunding.allTime',
        header: () => 'Funding PnL',
        meta: { label: 'Funding PnL' }
      }),

      helper.accessor('unrealizedPnl', {
        id: 'unrealizedPnl',
        header: () => 'Unrealized PnL',
        meta: { label: 'Unrealized PnL' },
        cell: (info) => (
          <ReactiveText
            value={info.getValue()}
            type="currency"
            precision={2}
            suffix={'USD'}
            currency={''}
            isStatic={true}
          />
        )
      }),
      helper.accessor('liquidationPx', {
        id: 'liquidationPx',
        header: () => 'Liq. Price',
        meta: { label: 'Liq. Price' },
        cell: (info) => {
          const value = info.getValue()
          if (!value) return '-'
          return <ReactiveText value={value} type="currency" precision={2} />
        }
      }),
      helper.accessor('marginUsed', {
        id: 'marginUsed',
        header: () => 'Margin',
        meta: { label: 'Margin' },
        cell: (info) => {
          const isMobileView = isTablet || isMobile
          return (
            <div
              className={cn(
                'gap-1 items-center justify-center font-medium text-xs',
                isMobileView ? 'flex flex-row' : 'flex flex-col'
              )}
            >
              <ReactiveText
                value={info.getValue()}
                type="currency"
                precision={2}
                currency={''}
                suffix={'USD'}
              />
              <div className="flex items-center gap-1 text-white/70 text-xs capitalize">
                {info.row.original.leverage.type === 'isolated' ? (
                  <Button
                    variant="link"
                    size="defaultLink"
                    className="cursor-pointer capitalize p-0 h-fit text-xs flex items-center gap-1"
                    onClick={() => {
                      setIsolatedMarginAsset(info.row.original)
                      setIsIsolatedMarginModalOpen(true)
                    }}
                  >
                    {info.row.original.leverage.type}
                    {!isMobileView && <IconPencil className="size-3" />}
                  </Button>
                ) : (
                  <span className="text-white/70 text-xs capitalize">
                    {info.row.original.leverage.type}
                  </span>
                )}
              </div>
            </div>
          )
        }
      }),
      helper.display({
        id: 'status',
        header: () => 'Status',
        cell: () => {
          return (
            <span className="bg-green/20 px-2 py-1 rounded-md font-medium text-green text-xs">
              {'Open'}
            </span>
          )
        },
        meta: { label: 'Status' }
      }),
      helper.display({
        id: 'tp_sl',
        header: () => (
          <div className="flex items-center justify-end gap-2">
            <span className="text-white/70 text-xs">{'Action'}</span>
            <Button
              onClick={() => {
                if (!agentWallet || !isAgentApproved) return openAgentModal()
                setIsCloseAllModalOpen(true)
              }}
              variant={'outline'}
              className="!py-1 !px-1 text-xs w-fit h-fit flex items-center justify-between gap-1"
            >
              <IconX className="size-3" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={'outline'}
                  className="!py-1 !px-2 text-xs w-full h-fit flex items-center justify-between gap-1"
                >
                  {'More'} <IconChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    if (!agentWallet || !isAgentApproved) return openAgentModal()
                    setTpslAsset(row.original)
                    setIsTPSLModalOpen(true)
                  }}
                >
                  <span>{'Set TP/SL'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (!agentWallet || !isAgentApproved) return openAgentModal()
                    setClosingAsset(row.original.coin)
                    setIsLimitCloseModalOpen(true)
                  }}
                >
                  <span>{'Close on Limit'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (!agentWallet || !isAgentApproved) return openAgentModal()
                    setClosingAsset(row.original.coin)
                    setIsMarketCloseModalOpen(true)
                  }}
                >
                  <span>{'Close on Market'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        meta: { label: 'TP/SL' }
      })
    ],
    [helper, isAgentApproved, currentFeeApproval, openAgentModal, isTablet, isMobile]
  )

  const tableData = useMemo(() => {
    if (!clearingHouseState?.assetPositions) return []
    return clearingHouseState.assetPositions.map((pos) => pos.position)
  }, [clearingHouseState?.assetPositions])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    enableSorting: true
  })

  if (!mounted) {
    return <div className="w-full h-full bg-secondary"></div>
  }

  if (!isConnected) {
    return <WalletNotConnected />
  }

  if (table.getRowModel().rows.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center py-12 gap-2">
        <IconChartBar className="size-10 text-white" />
        <span className="text-white">{'No Positions Found'}</span>
        <p className="text-white/70 text-center text-xs">
          {'Start trading to see your positions here'}
        </p>
      </div>
    )
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
            const coinName = row.original.coin
            const unrealizedPnl = row.original.unrealizedPnl
            const isLong = Number(row.original.szi) > 0

            return (
              <Collapsible key={row.id} className="w-full">
                <CollapsibleTrigger className="w-full">
                  <div className="w-full flex items-center justify-between p-4 bg-background rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-xs">{coinName}</span>
                      <span
                        className={cn(
                          'text-xs px-1.5 py-0.5 rounded',
                          isLong ? 'bg-green/20 text-green' : 'bg-red/20 text-red'
                        )}
                      >
                        {isLong ? 'Long' : 'Short'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-xs',
                          !unrealizedPnl || unrealizedPnl === '--'
                            ? 'text-white/70'
                            : Number(unrealizedPnl) > 0
                              ? 'text-green'
                              : 'text-red'
                        )}
                      >
                        {!unrealizedPnl || unrealizedPnl === '--'
                          ? ''
                          : `${Number(unrealizedPnl) >= 0 ? '+' : '-'}$${Math.abs(Number(unrealizedPnl)).toFixed(2)}`}
                      </span>
                      <IconChevronDown className="size-4 text-white/70" />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-2 bg-background rounded-b-md flex flex-col gap-2 -mt-2">
                    {/* Info rows - skip coin (index 0) and action column (last) */}
                    {header.slice(1, -1).map((item, index) => (
                      <div
                        className={cn(
                          'flex items-center justify-between',
                          isRTL && 'flex-row-reverse'
                        )}
                        key={index}
                      >
                        <span className="text-white/70 text-xs">{item}</span>
                        <span className="text-white text-xs">{cell[index + 1]}</span>
                      </div>
                    ))}
                    {/* Action buttons footer */}
                    <Separator className="my-2 bg-white/10" />
                    <div
                      className={cn(
                        'flex items-center gap-4 justify-end flex-wrap',
                        isRTL && 'flex-row-reverse justify-start'
                      )}
                    >
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs h-6 !p-0"
                        onClick={() => {
                          if (!isAgentApproved || currentFeeApproval === 0) return openAgentModal()
                          setLeverageAsset(row.original)
                          setIsLeverageModalOpen(true)
                        }}
                      >
                        {row.original.leverage.value}x
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs h-6 !p-0"
                        onClick={() => {
                          if (!agentWallet || !isAgentApproved) return openAgentModal()
                          setTpslAsset(row.original)
                          setIsTPSLModalOpen(true)
                        }}
                      >
                        {'TP/SL'}
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs h-6 !p-0"
                        onClick={() => {
                          if (!agentWallet || !isAgentApproved) return openAgentModal()
                          setClosingAsset(row.original.coin)
                          setIsLimitCloseModalOpen(true)
                        }}
                      >
                        {'Close Limit'}
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs h-6 !p-0"
                        onClick={() => {
                          if (!agentWallet || !isAgentApproved) return openAgentModal()
                          setClosingAsset(row.original.coin)
                          setIsMarketCloseModalOpen(true)
                        }}
                      >
                        {'Close Market'}
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
        <TPSL_Cell
          isOpen={!!agentWallet && isAgentApproved && isTPSLModalOpen && !!tpslAsset}
          onClose={() => setIsTPSLModalOpen(false)}
          asset={tpslAsset?.coin ?? ''}
          tpslAsset={tpslAsset}
        />
        <LimitCloseModal
          isOpen={!!agentWallet && isAgentApproved && isLimitCloseModalOpen && !!closingAsset}
          onClose={() => setIsLimitCloseModalOpen(false)}
          closingAsset={closingAsset ?? ''}
        />
        <MarketCloseModal
          isOpen={!!agentWallet && isAgentApproved && isMarketCloseModalOpen && !!closingAsset}
          onClose={() => setIsMarketCloseModalOpen(false)}
          closingAsset={closingAsset ?? ''}
        />
        <LeverageModal
          isOpen={!!agentWallet && isAgentApproved && isLeverageModalOpen && !!leverageAsset}
          onClose={() => setIsLeverageModalOpen(false)}
          asset={leverageAsset}
        />
        <IsolatedMarginModal
          isOpen={
            !!agentWallet && isAgentApproved && isIsolatedMarginModalOpen && !!isolatedMarginAsset
          }
          onClose={() => setIsIsolatedMarginModalOpen(false)}
          asset={isolatedMarginAsset}
        />
        <CloseAllModal
          isOpen={!!agentWallet && isAgentApproved && isCloseAllModalOpen}
          onClose={() => setIsCloseAllModalOpen(false)}
        />
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <Table>
        <TableHeader className="sticky top-0 bg-secondary">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className={cn(isRTL && 'flex-row-reverse')} key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  onClick={() => {
                    if (header.column.getCanSort()) {
                      header.column.toggleSorting()
                    }
                  }}
                  className={cn(
                    'cursor-pointer flex-1',
                    header.id === 'coin'
                      ? isRTL
                        ? 'justify-end'
                        : 'justify-start'
                      : header.id === 'tp_sl'
                        ? isRTL
                          ? 'justify-start'
                          : 'justify-end'
                        : 'justify-center',
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
        <TableBody className="overflow-y-auto h-full overflow-x-hidden no-scrollbar">
          {table.getRowModel().rows.map((row) => (
            <TableRow className={cn('h-8', isRTL && 'flex-row-reverse')} key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    'font-medium text-white text-xs',
                    cell.column.id === 'coin'
                      ? isRTL
                        ? 'text-end'
                        : 'text-start'
                      : cell.column.id === 'tp_sl'
                        ? isRTL
                          ? 'text-start'
                          : 'text-end'
                        : 'text-center justify-center'
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TPSL_Cell
        isOpen={!!agentWallet && isAgentApproved && isTPSLModalOpen && !!tpslAsset}
        onClose={() => setIsTPSLModalOpen(false)}
        asset={tpslAsset?.coin ?? ''}
        tpslAsset={tpslAsset}
      />
      <LimitCloseModal
        isOpen={!!agentWallet && isAgentApproved && isLimitCloseModalOpen && !!closingAsset}
        onClose={() => setIsLimitCloseModalOpen(false)}
        closingAsset={closingAsset ?? ''}
      />
      <MarketCloseModal
        isOpen={!!agentWallet && isAgentApproved && isMarketCloseModalOpen && !!closingAsset}
        onClose={() => setIsMarketCloseModalOpen(false)}
        closingAsset={closingAsset ?? ''}
      />
      <LeverageModal
        isOpen={!!agentWallet && isAgentApproved && isLeverageModalOpen && !!leverageAsset}
        onClose={() => setIsLeverageModalOpen(false)}
        asset={leverageAsset}
      />
      <IsolatedMarginModal
        isOpen={
          !!agentWallet && isAgentApproved && isIsolatedMarginModalOpen && !!isolatedMarginAsset
        }
        onClose={() => setIsIsolatedMarginModalOpen(false)}
        asset={isolatedMarginAsset}
      />
      <CloseAllModal
        isOpen={!!agentWallet && isAgentApproved && isCloseAllModalOpen}
        onClose={() => setIsCloseAllModalOpen(false)}
      />
    </div>
  )
}

export default dynamic(() => Promise.resolve(Positions), { ssr: false })
