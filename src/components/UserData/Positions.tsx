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
import { useTranslate } from '@tolgee/react'
interface IPositionsProps {
  isRTL: boolean
}

const Positions = ({ isRTL }: IPositionsProps) => {
  const { t } = useTranslate()
  const { isConnected } = useAccount()
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
          <span className={cn('flex justify-start items-center gap-1')}>{t('Position')}</span>
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
        meta: { label: t('Coin') }
      }),
      helper.accessor('positionValue', {
        id: 'positionValue',
        header: () => (
          <span className={cn('flex justify-start items-center gap-1')}>{t('Value')}</span>
        ),
        meta: { label: t('Position Value') },
        cell: (info) => <ReactiveText value={info.getValue()} type="currency" precision={2} />
      }),
      helper.accessor('szi', {
        id: 'szi',
        header: () => t('Size'),
        meta: { label: t('Size') },
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
        header: () => t('Entry'),
        meta: { label: t('Entry Price') },
        cell: (info) => <ReactiveText value={info.getValue()} type="currency" precision={2} />
      }),
      helper.display({
        id: 'markPx',
        header: () => t('Mark'),
        meta: { label: t('Mark Price') },
        cell: (info) => <MarkPxDisplay asset={info.row.original.coin} />
      }),
      helper.accessor('cumFunding.allTime', {
        id: 'cumFunding.allTime',
        header: () => t('Funding PnL'),
        meta: { label: t('Funding PnL') }
      }),

      helper.accessor('unrealizedPnl', {
        id: 'unrealizedPnl',
        header: () => t('Unrealized PnL'),
        meta: { label: t('Unrealized PnL') },
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
        header: () => t('Liq. Price'),
        meta: { label: t('Liq. Price') },
        cell: (info) => {
          const value = info.getValue()
          if (!value) return '-'
          return <ReactiveText value={value} type="currency" precision={2} />
        }
      }),
      helper.accessor('marginUsed', {
        id: 'marginUsed',
        header: () => t('Margin'),
        meta: { label: t('Margin') },
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
                    <IconPencil className="size-3" />
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
        header: () => t('Status'),
        cell: () => {
          return (
            <span className="bg-green/20 px-2 py-1 rounded-md font-medium text-green text-xs">
              {t('Open')}
            </span>
          )
        },
        meta: { label: t('Status') }
      }),
      helper.display({
        id: 'tp_sl',
        header: () => (
          <div className="flex items-center justify-end gap-2">
            <span className="text-white/70 text-xs">{t('Action')}</span>
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
                  {t('More')} <IconChevronDown className="size-3" />
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
                  <span>{t('Set TP/SL')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (!agentWallet || !isAgentApproved) return openAgentModal()
                    setClosingAsset(row.original.coin)
                    setIsLimitCloseModalOpen(true)
                  }}
                >
                  <span>{t('Close on Limit')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (!agentWallet || !isAgentApproved) return openAgentModal()
                    setClosingAsset(row.original.coin)
                    setIsMarketCloseModalOpen(true)
                  }}
                >
                  <span>{t('Close on Market')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        meta: { label: t('TP/SL') }
      })
    ],
    [helper, isAgentApproved, currentFeeApproval, openAgentModal, t]
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
                      <span className="text-white/70">{item}</span>
                      <span className="text-white w-fit">{cell[index]}</span>
                    </div>
                    {(item === t('Position') || item === t('Margin')) && (
                      <Separator className="w-full bg-white/10" />
                    )}
                  </div>
                ))}
              </div>
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
