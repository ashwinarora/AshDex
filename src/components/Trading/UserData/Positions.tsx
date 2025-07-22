import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState
} from '@tanstack/react-table'
import WalletNotConnected from '@/components/common/WalletNotConnected'
import { useAccount } from 'wagmi'
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
  IconChevronUp
} from '@tabler/icons-react'
import IsolatedMarginModal from './component/IsolatedMarginModal'
import CloseAllModal from './component/CloseAllModal'
import ReactiveText from '@/components/common/ReactiveText'
import { AssetPosition } from '@nktkas/hyperliquid'
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
interface IPositionsProps {
  setSelectedAsset: (asset: string) => void
}

const Positions = ({ setSelectedAsset }: IPositionsProps) => {
  const { isConnected } = useAccount()
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
  const [tpslAsset, setTpslAsset] = useState<AssetPosition['position']>()
  const [isLeverageModalOpen, setIsLeverageModalOpen] = useState(false)
  const [leverageAsset, setLeverageAsset] = useState<AssetPosition['position']>()
  const { isAgentApproved, currentFeeApproval, openModal: openAgentModal } = useAgentApproval()
  const [isIsolatedMarginModalOpen, setIsIsolatedMarginModalOpen] = useState(false)
  const [isolatedMarginAsset, setIsolatedMarginAsset] = useState<AssetPosition['position']>()
  const [isCloseAllModalOpen, setIsCloseAllModalOpen] = useState(false)

  const { isTablet, isMobile } = useScreenSize()

  useEffect(() => {
    setMounted(true)
  }, [])

  const helper = useMemo(
    () => createColumnHelper<AssetPosition['position'] & { meta?: { label: string } }>(),
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
        header: 'Position',
        cell: (info) => {
          const coin = info.getValue()
          const { leverage } = info.row.original
          return (
            <div className="flex items-center justify-start gap-2">
              <Button
                variant="link"
                size="defaultLink"
                className="text-white hover:text-accent-foreground transition-all hover:no-underline"
                onClick={() => setSelectedAsset(coin)}
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
        header: 'Value',
        meta: { label: 'Position Value' },
        cell: (info) => <ReactiveText value={info.getValue()} type="currency" precision={2} />
      }),
      helper.accessor('szi', {
        id: 'szi',
        header: 'Size',
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
        header: 'Entry',
        meta: { label: 'Entry Price' },
        cell: (info) => <ReactiveText value={info.getValue()} type="currency" precision={2} />
      }),
      helper.display({
        id: 'markPx',
        header: 'Mark',
        meta: { label: 'Mark Price' },
        cell: (info) => <MarkPxDisplay asset={info.row.original.coin} />
      }),
      helper.accessor('cumFunding.allTime', {
        id: 'cumFunding.allTime',
        header: 'Funding PnL',
        meta: { label: 'Funding PnL' }
      }),

      helper.accessor('unrealizedPnl', {
        id: 'unrealizedPnl',
        header: 'Unrealized PnL',
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
        header: 'Liq. Price',
        meta: { label: 'Liq. Price' },
        cell: (info) => {
          const value = info.getValue()
          if (!value) return '-'
          return <ReactiveText value={value} type="currency" precision={2} />
        }
      }),
      helper.accessor('marginUsed', {
        id: 'marginUsed',
        header: 'Margin',
        meta: { label: 'Margin' },
        cell: (info) => {
          return (
            <div className="flex flex-col gap-1 items-center justify-center font-medium text-xs">
              <ReactiveText
                value={info.getValue()}
                type="currency"
                precision={2}
                currency={''}
                suffix={'USD'}
              />
              <div className="flex items-center gap-1 text-white/50 text-xs capitalize">
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
                    <IconPencil className="size-3" />
                  </Button>
                ) : (
                  <span className="text-white/50 text-xs capitalize">
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
        header: 'Status',
        cell: () => {
          return (
            <span className="bg-green/20 px-2 py-1 rounded-md font-medium text-green text-xs">
              Open
            </span>
          )
        },
        meta: { label: 'Status' }
      }),
      helper.display({
        id: 'tp_sl',
        header: () => (
          <div className="flex items-center justify-end gap-2">
            <span className="text-white/50 text-xs">Action</span>
            <Button
              onClick={() => {
                if (!agentWallet || !isAgentApproved) return openAgentModal()
                setIsCloseAllModalOpen(true)}}
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
                  More <IconChevronDown className="size-3" />
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
                  <span>Set TP/SL</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (!agentWallet || !isAgentApproved) return openAgentModal()
                    setClosingAsset(row.original.coin)
                    setIsLimitCloseModalOpen(true)
                  }}
                >
                  <span>Close on Limit</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (!agentWallet || !isAgentApproved) return openAgentModal()
                    setClosingAsset(row.original.coin)
                    setIsMarketCloseModalOpen(true)
                  }}
                >
                  <span>Close on Market</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        meta: { label: 'TP/SL' }
      })
    ],
    [helper, isAgentApproved, currentFeeApproval, openAgentModal]
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
                className="w-full flex flex-col justify-between rounded-md h-fit gap-3 bg-accent p-4"
              >
                {header.map((item, index) => (
                  <div className="flex flex-col gap-3" key={index}>
                    <div className="flex items-center text-xs justify-between">
                      <span className="text-white/50">{item}</span>
                      <span className="text-white w-fit">{cell[index]}</span>
                    </div>
                    {(item === 'Position' || item === 'Margin') && (
                      <Separator className="w-full bg-white/10" />
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
        {agentWallet && isAgentApproved && isTPSLModalOpen && tpslAsset && (
          <TPSL_Cell
            isOpen={isTPSLModalOpen}
            onClose={() => setIsTPSLModalOpen(false)}
            asset={tpslAsset.coin}
            tpslAsset={tpslAsset}
          />
        )}
        {agentWallet && isAgentApproved && isLimitCloseModalOpen && closingAsset && (
          <LimitCloseModal
            isOpen={isLimitCloseModalOpen}
            onClose={() => setIsLimitCloseModalOpen(false)}
            closingAsset={closingAsset}
          />
        )}
        {agentWallet && isAgentApproved && isMarketCloseModalOpen && closingAsset && (
          <MarketCloseModal
            isOpen={isMarketCloseModalOpen}
            onClose={() => setIsMarketCloseModalOpen(false)}
            closingAsset={closingAsset}
          />
        )}
        {agentWallet && isAgentApproved && isLeverageModalOpen && leverageAsset && (
          <LeverageModal
            isOpen={isLeverageModalOpen}
            onClose={() => setIsLeverageModalOpen(false)}
            asset={leverageAsset}
          />
        )}
        {agentWallet && isAgentApproved && isIsolatedMarginModalOpen && isolatedMarginAsset && (
          <IsolatedMarginModal
            isOpen={isIsolatedMarginModalOpen}
            onClose={() => setIsIsolatedMarginModalOpen(false)}
            asset={isolatedMarginAsset}
          />
        )}
        {agentWallet && isAgentApproved && isCloseAllModalOpen && (
          <CloseAllModal
            isOpen={isCloseAllModalOpen}
            onClose={() => setIsCloseAllModalOpen(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <Table>
        <TableHeader className="sticky top-0 bg-secondary">
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
                    'cursor-pointer flex-1',
                    header.id === 'coin'
                      ? 'justify-start'
                      : header.id === 'tp_sl'
                        ? 'justify-end'
                        : 'justify-center',
                    header.column.columnDef.enableSorting
                      ? 'hover:text-accent-foreground'
                      : 'hover:text-white/50',
                    header.column.getIsSorted() === 'asc' || header.column.getIsSorted() === 'desc'
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
        <TableBody className="overflow-y-auto h-full overflow-x-hidden no-scrollbar">
          {table.getRowModel().rows.map((row) => (
            <TableRow className="h-12" key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    'font-medium text-white text-xs first:text-left text-right',
                    cell.column.id === 'coin'
                      ? 'text-start justify-start'
                      : cell.column.id === 'tp_sl'
                        ? 'text-end justify-end'
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
      {agentWallet && isAgentApproved && isTPSLModalOpen && tpslAsset && (
        <TPSL_Cell
          isOpen={isTPSLModalOpen}
          onClose={() => setIsTPSLModalOpen(false)}
          asset={tpslAsset.coin}
          tpslAsset={tpslAsset}
        />
      )}
      {agentWallet && isAgentApproved && isLimitCloseModalOpen && closingAsset && (
        <LimitCloseModal
          isOpen={isLimitCloseModalOpen}
          onClose={() => setIsLimitCloseModalOpen(false)}
          closingAsset={closingAsset}
        />
      )}
      {agentWallet && isAgentApproved && isMarketCloseModalOpen && closingAsset && (
        <MarketCloseModal
          isOpen={isMarketCloseModalOpen}
          onClose={() => setIsMarketCloseModalOpen(false)}
          closingAsset={closingAsset}
        />
      )}
      {agentWallet && isAgentApproved && isLeverageModalOpen && leverageAsset && (
        <LeverageModal
          isOpen={isLeverageModalOpen}
          onClose={() => setIsLeverageModalOpen(false)}
          asset={leverageAsset}
        />
      )}
      {agentWallet && isAgentApproved && isIsolatedMarginModalOpen && isolatedMarginAsset && (
        <IsolatedMarginModal
          isOpen={isIsolatedMarginModalOpen}
          onClose={() => setIsIsolatedMarginModalOpen(false)}
          asset={isolatedMarginAsset}
        />
      )}
      {agentWallet && isAgentApproved && isCloseAllModalOpen && (
        <CloseAllModal isOpen={isCloseAllModalOpen} onClose={() => setIsCloseAllModalOpen(false)} />
      )}
    </div>
  )
}

export default dynamic(() => Promise.resolve(Positions), { ssr: false })
