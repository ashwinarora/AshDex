'use client'
import { useMemo, useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
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
import { useAgentApproval } from '@/context/EstablishConnection'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { IconX, IconSelector, IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import ReactiveText from '@/components/reactive-text'
import type { WebData2Event } from '@nktkas/hyperliquid/api/subscription'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { SPOT_DELTA } from '@/utils/constants'
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
import { useTranslate } from '@tolgee/react'

type FrontendOrderWithAssetKey = WebData2Event['openOrders'][number] & { assetKey: string }

const OpenOrders = ({ isRTL }: { isRTL: boolean }) => {
  const { t } = useTranslate()
  const { isConnected } = useAccount()
  const { sdkL1ActionClient, openOrders, perpsMeta, agentWallet } = useHyperliquidStore(
    useShallow((state) => ({
      sdkL1ActionClient: state.sdkL1ActionClient,
      openOrders: state.openOrders,
      perpsMeta: state.perpsMeta,
      agentWallet: state.agentWallet
    }))
  )
  const isSpot = useIsSpot()
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
        const toastId = toast.loading(t('Cancelling order...'))
        try {
          if (!sdkL1ActionClient) return
          const assetIndex = isSpot
            ? Number(
                spotMeta?.universe.find((asset) => asset.name === row.original.assetKey)?.index
              ) + SPOT_DELTA
            : perpsMeta?.universe.findIndex((asset) => asset.name === row.original.assetKey)
          if (!assetIndex || assetIndex < 0) throw new Error('Asset index not found')
          await sdkL1ActionClient.cancel({
            cancels: [
              {
                a: assetIndex,
                o: row.original.oid
              }
            ]
          })
          toast.success(t('Order cancelled'), {
            id: toastId
          })
        } catch (error: unknown) {
          toast.error(
            `${t('Failed to cancel order.')} ${error instanceof Error ? error.message : String(error)}`,
            {
              id: toastId
            }
          )
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
            Enable Trading
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
      const toastId = toast.loading(t('Cancelling all orders...'))
      try {
        if (!sdkL1ActionClient) return
        const allOrders = openOrders.filter((order) => {
          if (isSpot) {
            return !!spotKeyToName.get(order.coin)
          } else {
            // asset should not be in spot universe to be a perp order
            return !spotKeyToName.get(order.coin)
          }
        })

        await sdkL1ActionClient.cancel({
          cancels: allOrders
            .map((order) => {
              const assetIndex = isSpot
                ? Number(spotMeta?.universe.find((asset) => asset.name === order.coin)?.index) +
                  SPOT_DELTA
                : perpsMeta?.universe.findIndex((asset) => asset.name === order.coin)

              if (assetIndex === undefined || assetIndex < 0) {
                return
              }
              return {
                a: assetIndex,
                o: order.oid
              }
            })
            .filter((order) => !!order)
        })
        toast.success(t('All orders cancelled'), {
          id: toastId
        })
      } catch (error: unknown) {
        toast.error(
          `${t('Failed to cancel all orders.')} ${error instanceof Error ? error.message : String(error)}`,
          {
            id: toastId
          }
        )
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
    return (
      <div className={cn('flex items-center justify-end gap-2', isRTL && 'flex-row-reverse')}>
        <span className="text-white/70 text-xs">{t('Action')}</span>
        <Button
          onClick={() => {
            if (!agentWallet || !isAgentApproved) return openAgentModal()
            handleCancelAll()
          }}
          variant={'outline'}
          className="!py-1 !px-1 text-xs w-fit h-fit flex items-center justify-between gap-1"
        >
          <IconX className="size-3" />
        </Button>
      </div>
    )
  }, [handleCancelAll, agentWallet, isAgentApproved, openAgentModal])

  const columns = useMemo(
    () => [
      columnHelper.accessor('timestamp', {
        id: 'timestamp',
        header: () => t('Time'),
        cell: (info) => <>{new Date(info.getValue()).toLocaleString('en-US')}</>,
        enableSorting: true,
        meta: { label: t('Time') }
      }),
      columnHelper.accessor('coin', {
        id: 'coin',
        header: () => t('Coin'),
        cell: (info) => <>{info.getValue()}</>,
        enableSorting: false,
        meta: { label: t('Coin') }
      }),
      columnHelper.accessor('orderType', {
        id: 'orderType',
        header: () => t('Type'),
        cell: (info) => info.getValue(),
        meta: { label: t('Type') }
      }),
      columnHelper.accessor('side', {
        id: 'side',
        header: () => t('Direction'),
        cell: (info) => (
          <span className={`capitalize ${info.getValue() === 'B' ? 'text-green' : 'text-red'}`}>
            {info.getValue() === 'B' ? 'Buy' : 'Sell'}
          </span>
        ),
        enableSorting: false,
        meta: { label: t('Direction') }
      }),
      columnHelper.accessor('limitPx', {
        id: 'px',
        header: () => t('Price'),
        cell: (info) => <ReactiveText value={info.getValue()} type="currency" precision={2} />,
        meta: { label: t('Limit Price') }
      }),
      columnHelper.accessor('sz', {
        id: 'sz',
        header: () => t('Size'),
        cell: (info) => (
          <>
            <ReactiveText value={info.getValue()} type="number" precision={4} />
          </>
        ),
        meta: { label: t('Original Size') }
      }),
      columnHelper.accessor('origSz', {
        id: 'origSz',
        header: () => t('Original Size'),
        cell: (info) => <ReactiveText value={info.getValue()} type="number" precision={4} />,
        meta: { label: t('Original Size') }
      }),
      columnHelper.accessor('origSz', {
        id: 'orderValue',
        header: () => t('Order Value'),
        cell: (info) => (
          <ReactiveText
            value={Number(info.getValue()) * Number(info.row.original.limitPx)}
            type="currency"
            precision={2}
          />
        ),
        meta: { label: t('Order Value') }
      }),
      columnHelper.accessor('reduceOnly', {
        id: 'reduceOnly',
        header: () => t('Reduce Only'),
        cell: (info) => (info.getValue() ? t('Yes') : t('No')),
        enableSorting: false,
        meta: { label: t('Reduce Only') }
      }),
      columnHelper.accessor('triggerCondition', {
        id: 'triggerCondition',
        header: () => t('Trigger'),
        cell: (info) => info.getValue(),
        enableSorting: false,
        meta: { label: t('Trigger Condition') }
      }),

      columnHelper.display({
        id: 'actions',
        header: () => {
          return renderCancelAllButton()
        },
        cell: ({ row }) => renderCancelButton(row),
        enableSorting: false,
        meta: { label: t('Actions') }
      })
    ],
    [renderCancelButton, renderCancelAllButton, t]
  )

  const data = useMemo(() => {
    return openOrders
      .filter((order) => {
        if (isSpot) {
          return !!spotKeyToName.get(order.coin)
        } else {
          // asset should not be in spot universe to be a perp order
          return !spotKeyToName.get(order.coin)
        }
      })
      .map((order) => {
        const coin = isSpot ? spotKeyToName.get(order.coin) || '' : order.coin
        return {
          ...order,
          coin,
          assetKey: order.coin
        }
      })
  }, [openOrders, isSpot])

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
                    {(item === t('Coin') || item === t('Trigger')) && (
                      <Separator className="w-full bg-white/10" />
                    )}
                  </div>
                ))}
              </div>
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
            <TableRow className={cn('h-10', isRTL && 'flex-row-reverse')} key={row.id}>
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
