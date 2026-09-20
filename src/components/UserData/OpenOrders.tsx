'use client'
import { useMemo, useState, useEffect, useCallback } from 'react'
import { useConnection } from 'wagmi'
import useIsSpot from '@/hooks/useIsSpot'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState
} from '@tanstack/react-table'
import WalletNotConnected from '@/components/ConnectWalletModal/DisconnectedWalletState'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { toastSdkError } from '@/lib/toastSdkError'
import { resolveAssetIndex } from '@/utils/resolveAssetIndex'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { formatTimestamp } from '@/utils/format'
import {
  IconX,
  IconSelector,
  IconChevronDown,
  IconChevronUp,
  IconNotebook
} from '@tabler/icons-react'
import ReactiveText from '@/components/reactive-text'
import type { FrontendOpenOrdersResponse } from '@nktkas/hyperliquid/api/info'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import useMarketKind from '@/hooks/useMarketKind'
import { getMarketKind } from '@/utils/marketKind'
import { useOutcomeCoinLabel } from '@/hooks/useOutcomeMarket'
import { usePathname } from 'next/navigation'
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
import { Separator } from '@/components/ui/separator'
import { useScreenSize } from '@/hooks/useScreenSize'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

type FrontendOrderWithAssetKey = FrontendOpenOrdersResponse[number] & { assetKey: string }

const OpenOrders = ({ isRTL }: { isRTL: boolean }) => {
  const { isConnected } = useConnection()
  const { sdkL1ActionClient, openOrders, perpsMeta, agentWallet } = useHyperliquidStore(
    useShallow((state) => ({
      sdkL1ActionClient: state.sdkL1ActionClient,
      openOrders: state.openOrders,
      perpsMeta: state.perpsMeta,
      agentWallet: state.agentWallet
    }))
  )
  const isSpot = useIsSpot()
  const marketKind = useMarketKind()
  const isPortfolio = !!usePathname()?.startsWith('/portfolio')
  const outcomeLabel = useOutcomeCoinLabel()
  const { isAgentApproved, currentFeeApproval, openModal: openAgentModal } = useAgentApproval()
  const [sorting, setSorting] = useState<SortingState>([])
  const [mounted, setMounted] = useState(false)
  const { spotKeyToName, data: spotMeta } = useSpotMeta()
  const { isTablet, isMobile } = useScreenSize()

  useEffect(() => {
    setMounted(true)
  }, [])

  const columnHelper = createColumnHelper<FrontendOrderWithAssetKey>()

  const handleCancelOrder = useCallback(
    (row: { original: FrontendOrderWithAssetKey }) => {
      const cancelOrder = async () => {
        if (!isAgentApproved || currentFeeApproval <= 0) {
          openAgentModal()
          return
        }
        const toastId = toast.loading('Cancelling order...')
        try {
          if (!sdkL1ActionClient) return
          // BUG-007 was rooted in a `!assetIndex || assetIndex < 0` guard
          // that fires for `assetIndex === 0` (SOL sits at perps index 0 on
          // testnet, so every SOL cancel threw "Asset index not found").
          // The shared resolver returns `null` on miss, so `0` passes through.
          const assetIndex = resolveAssetIndex(row.original.assetKey, {
            isSpot,
            perpsUniverse: perpsMeta?.universe,
            spotUniverse: spotMeta?.universe
          })
          if (assetIndex === null) throw new Error('Asset index not found')
          await sdkL1ActionClient.cancel({
            cancels: [
              {
                a: assetIndex,
                o: row.original.oid
              }
            ]
          })
          toast.success('Order cancelled', {
            id: toastId
          })
        } catch (error: unknown) {
          toastSdkError(error, 'Error cancelling order', { id: toastId })
        }
      }
      cancelOrder()
    },
    [
      sdkL1ActionClient,
      isSpot,
      spotMeta,
      perpsMeta,
      isAgentApproved,
      openAgentModal,
      currentFeeApproval
    ]
  )

  const renderCancelButton = useCallback(
    (row: { original: FrontendOrderWithAssetKey }) => {
      if (!agentWallet || !isAgentApproved)
        return (
          <Button
            onClick={() => openAgentModal()}
            variant="link"
            className={cn(
              'p-0 h-fit text-xs w-full flex items-center gap-1',
              isRTL ? 'justify-start' : 'justify-end'
            )}
          >
            {'Enable Trading'}
          </Button>
        )
      return (
        <Button
          onClick={() => handleCancelOrder(row)}
          variant="link"
          className={cn(
            'p-0 h-fit text-xs w-full flex items-center gap-1',
            isRTL ? 'justify-start' : 'justify-end'
          )}
        >
          Cancel
        </Button>
      )
    },
    [isAgentApproved, agentWallet, handleCancelOrder, openAgentModal]
  )

  const handleCancelAll = useCallback(() => {
    const cancelAll = async () => {
      if (!isAgentApproved || currentFeeApproval <= 0) {
        openAgentModal()
        return
      }
      const toastId = toast.loading('Cancelling all orders...')
      try {
        if (!sdkL1ActionClient) return
        const allOrders = openOrders.filter(
          (order) => isPortfolio || getMarketKind(order.coin, spotKeyToName) === marketKind
        )

        await sdkL1ActionClient.cancel({
          cancels: allOrders
            .map((order) => {
              const assetIndex = resolveAssetIndex(order.coin, {
                isSpot,
                perpsUniverse: perpsMeta?.universe,
                spotUniverse: spotMeta?.universe
              })
              if (assetIndex === null) return
              return {
                a: assetIndex,
                o: order.oid
              }
            })
            .filter((order) => !!order)
        })
        toast.success('All orders cancelled', {
          id: toastId
        })
      } catch (error: unknown) {
        toastSdkError(error, 'Error cancelling all orders', { id: toastId })
      }
    }
    cancelAll()
  }, [
    isAgentApproved,
    currentFeeApproval,
    openAgentModal,
    sdkL1ActionClient,
    openOrders,
    isSpot,
    spotMeta,
    perpsMeta,
    spotKeyToName
  ])

  const renderCancelAllButton = useCallback(() => {
    // BUG-009: the previous UI was just an unlabelled X icon in the "Action"
    // column header — undiscoverable. Add the text "Cancel all" beside the
    // icon, and disable when there are fewer than 2 open orders (a single
    // order should be cancelled via its own row button, not a bulk action).
    const disabled = openOrders.length < 2
    return (
      <div className={cn('flex items-center justify-end gap-2', isRTL && 'flex-row-reverse')}>
        <span className="text-white/70 text-xs">{'Action'}</span>
        <Button
          onClick={() => {
            if (!agentWallet || !isAgentApproved) return openAgentModal()
            handleCancelAll()
          }}
          disabled={disabled}
          variant={'outline'}
          className="!py-1 !px-2 text-xs w-fit h-fit flex items-center justify-between gap-1"
          data-testid="cancel-all-orders"
        >
          <IconX className="size-3" />
          <span>{'Cancel all'}</span>
        </Button>
      </div>
    )
  }, [handleCancelAll, agentWallet, isAgentApproved, openAgentModal, openOrders.length])

  const columns = useMemo(
    () => [
      columnHelper.accessor('timestamp', {
        id: 'timestamp',
        header: () => 'Time',
        cell: (info) => <>{formatTimestamp(info.getValue())}</>,
        enableSorting: true,
        meta: { label: 'Time' }
      }),
      columnHelper.accessor('coin', {
        id: 'coin',
        header: () => 'Coin',
        cell: (info) => <>{info.getValue()}</>,
        enableSorting: false,
        meta: { label: 'Coin' }
      }),
      columnHelper.accessor('orderType', {
        id: 'orderType',
        header: () => 'Type',
        cell: (info) => info.getValue(),
        meta: { label: 'Type' }
      }),
      columnHelper.accessor('side', {
        id: 'side',
        header: () => 'Direction',
        cell: (info) => (
          <span className={`capitalize ${info.getValue() === 'B' ? 'text-green' : 'text-red'}`}>
            {info.getValue() === 'B' ? 'Buy' : 'Sell'}
          </span>
        ),
        enableSorting: false,
        meta: { label: 'Direction' }
      }),
      columnHelper.accessor('limitPx', {
        id: 'px',
        header: () => 'Price',
        cell: (info) => (
          <ReactiveText
            value={info.getValue()}
            type="currency"
            // Outcome shares are priced as probabilities (0.001–0.999, 5 decimals).
            precision={info.row.original.assetKey.startsWith('#') ? 5 : 2}
          />
        ),
        meta: { label: 'Limit Price' }
      }),
      columnHelper.accessor('sz', {
        id: 'sz',
        header: () => 'Size',
        cell: (info) => (
          <>
            <ReactiveText value={info.getValue()} type="number" precision={4} />
          </>
        ),
        meta: { label: 'Original Size' }
      }),
      columnHelper.accessor('origSz', {
        id: 'origSz',
        header: () => 'Original Size',
        cell: (info) => <ReactiveText value={info.getValue()} type="number" precision={4} />,
        meta: { label: 'Original Size' }
      }),
      columnHelper.accessor('origSz', {
        id: 'orderValue',
        header: () => 'Order Value',
        cell: (info) => (
          <ReactiveText
            value={Number(info.getValue()) * Number(info.row.original.limitPx)}
            type="currency"
            precision={2}
          />
        ),
        meta: { label: 'Order Value' }
      }),
      columnHelper.accessor('reduceOnly', {
        id: 'reduceOnly',
        header: () => 'Reduce Only',
        cell: (info) => (info.getValue() ? 'Yes' : 'No'),
        enableSorting: false,
        meta: { label: 'Reduce Only' }
      }),
      columnHelper.accessor('triggerCondition', {
        id: 'triggerCondition',
        header: () => 'Trigger',
        cell: (info) => info.getValue(),
        enableSorting: false,
        meta: { label: 'Trigger Condition' }
      }),

      columnHelper.display({
        id: 'actions',
        header: () => {
          return renderCancelAllButton()
        },
        cell: ({ row }) => renderCancelButton(row),
        enableSorting: false,
        meta: { label: 'Actions' }
      })
    ],
    [renderCancelButton, renderCancelAllButton]
  )

  const data = useMemo(() => {
    return openOrders
      .filter((order) => isPortfolio || getMarketKind(order.coin, spotKeyToName) === marketKind)
      .map((order) => {
        const kind = getMarketKind(order.coin, spotKeyToName)
        const coin =
          kind === 'spot'
            ? spotKeyToName.get(order.coin) || ''
            : kind === 'outcome'
              ? outcomeLabel(order.coin, 'full')
              : order.coin
        return {
          ...order,
          coin,
          assetKey: order.coin
        }
      })
  }, [openOrders, marketKind, isPortfolio, spotKeyToName, outcomeLabel])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  if (!isConnected) {
    return <WalletNotConnected />
  }

  if (!mounted) {
    return <div className="w-full h-full bg-secondary"></div>
  }

  if (table.getRowModel().rows.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center py-12 justify-center gap-2">
        <IconNotebook className="size-10 text-white" />
        <span className="text-white">{'No Open Orders Found'}</span>
        <p className="text-white/70 text-center text-xs">
          {'Start trading to see your open orders here'}
        </p>
      </div>
    )
  }

  if (isTablet || isMobile) {
    const header = table.getHeaderGroups()[0].headers.map((header) => {
      return flexRender(header.column.columnDef.header, header.getContext())
    })
    return (
      <div className="w-full h-full min-h-48 flex flex-col rounded-md pt-2 gap-2">
        <div className="flex xl:hidden flex-col items-center justify-start gap-2">
          {table.getRowModel().rows.map((row) => {
            const cell = row.getVisibleCells().map((cell) => {
              return flexRender(cell.column.columnDef.cell, cell.getContext())
            })
            const coinName = row.original.coin
            const side = row.original.side
            const isBuy = side === 'B'

            return (
              <Collapsible key={row.id} className="w-full">
                <CollapsibleTrigger className="w-full">
                  <div className="w-full flex items-center justify-between p-4 bg-background rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-xs">{coinName}</span>
                      <span
                        className={cn(
                          'text-xs px-1.5 py-0.5 rounded',
                          isBuy ? 'bg-green/20 text-green' : 'bg-red/20 text-red'
                        )}
                      >
                        {isBuy ? 'Buy' : 'Sell'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/70 text-xs">{row.original.orderType}</span>
                      <IconChevronDown className="size-4 text-white/70" />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-2 bg-background rounded-b-md flex flex-col gap-2 -mt-2">
                    {/* Info rows - skip coin (index 1), side (index 3), and action column (last) */}
                    {header.slice(0, -1).map((item, index) => {
                      // Skip coin and side as they're in the header
                      if (index === 1 || index === 3) return null
                      return (
                        <div
                          className={cn(
                            'flex items-center justify-between',
                            isRTL && 'flex-row-reverse'
                          )}
                          key={index}
                        >
                          <span className="text-white/70 text-xs">{item}</span>
                          <span className="text-white text-xs">{cell[index]}</span>
                        </div>
                      )
                    })}
                    {/* Action buttons footer */}
                    <Separator className="my-2 bg-white/10" />
                    <div
                      className={cn(
                        'flex items-center gap-4 justify-end',
                        isRTL && 'flex-row-reverse justify-start'
                      )}
                    >
                      {cell[cell.length - 1]} {/* Cancel button */}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <Table>
        <TableHeader>
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
                    'cursor-pointer hover:text-accent-foreground',
                    header.id === 'timestamp'
                      ? isRTL
                        ? 'justify-end !w-36'
                        : 'justify-start !w-36'
                      : isRTL
                        ? 'justify-start flex-2'
                        : 'justify-end flex-2',
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
            <TableRow className={cn('h-8', isRTL && 'flex-row-reverse')} key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    'font-medium text-white text-xs',
                    cell.column.id === 'timestamp'
                      ? isRTL
                        ? 'text-end !w-36'
                        : 'text-start !w-36'
                      : isRTL
                        ? 'text-start flex-2'
                        : 'text-end flex-2'
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default dynamic(() => Promise.resolve(OpenOrders), { ssr: false })
