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
  SortingState,
  Header
} from '@tanstack/react-table'
import WalletNotConnected from '@/components/common/WalletNotConnected'
import dynamic from 'next/dynamic'
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import { toast } from 'react-toastify'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { IconChevronDown, IconChevronUp, IconSelector, IconTrash } from '@tabler/icons-react'
import ReactiveText from '@/components/common/ReactiveText'
import { FrontendOrder } from '@nktkas/hyperliquid'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { SPOT_DELTA } from '@/utils/constants'

type ColumnType = {
  key: string
  label: string
}

type RenderRowProps = {
  item: FrontendOrderWithAssetKey
  columns: ColumnType[]
  onCancel?: () => void
}

type FrontendOrderWithAssetKey = FrontendOrder & { assetKey: string }

const SortableHeader = ({ header }: { header: Header<FrontendOrderWithAssetKey, unknown> }) => {
  const canSort = header.column.getCanSort()
  const sortDirection = header.column.getIsSorted()

  return (
    <div className="flex items-center text-white/50">
      {header.isPlaceholder
        ? null
        : flexRender(header.column.columnDef.header, header.getContext())}
      {canSort && (
        <span className="inline-block">
          {sortDirection === 'asc' ? (
            <IconChevronDown className="w-4 h-4" />
          ) : sortDirection === 'desc' ? (
            <IconChevronUp className="w-4 h-4" />
          ) : (
            <IconSelector className="w-4 h-4" />
          )}
        </span>
      )}
    </div>
  )
}

const RenderRowData: React.FC<RenderRowProps> = ({ item, columns, onCancel }) => {
  return (
    <div className="flex flex-col gap-2 text-white text-sm">
      {columns?.map((col) => {
        const isAction = col?.key === 'actions'
        const key = col?.key as keyof FrontendOrder
        const value = item[key]
        const isSide = col?.key === 'side'
        const sideValue = isSide && typeof value === 'string' ? value.toLowerCase() : ''

        return (
          <div key={col?.key} className="flex justify-between items-center">
            <span className="text-[#8B8BA0]">{col?.label}</span>
            {isAction ? (
              <button
                className="bg-[#27273b] px-2 py-0.5 rounded font-bold text-red text-sm cursor-pointer"
                onClick={onCancel}
              >
                Cancel
              </button>
            ) : (
              <span className={col?.key === 'coin' ? 'truncate' : ''}>
                <span
                  className={`
                    flex px-1.5 py-1 w-fit rounded-lg font-medium items-center gap-x-2
                    ${
                      isSide
                        ? sideValue === 'buy'
                          ? 'text-green'
                          : sideValue === 'sell'
                            ? 'text-red'
                            : ''
                        : ''
                    }
                  `}
                >
                  {String(value ?? '-')}
                </span>
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

const OpenOrders = () => {
  const { isConnected } = useAccount()
  const { sdkExchangeClient, openOrders, perpsMeta } = useHyperliquid()
  const isSpot = useIsSpot()
  const { isAgentApproved, currentFeeApproval, openModal: openAgentModal } = useAgentApproval()
  const [sorting, setSorting] = useState<SortingState>([])
  const [mounted, setMounted] = useState(false)
  const { spotKeyToName, data: spotMeta } = useSpotMeta()

  useEffect(() => {
    setMounted(true)
  }, [])

  const columnHelper = createColumnHelper<FrontendOrderWithAssetKey>()

  const renderCancelButton = useCallback(
    (row: { original: FrontendOrderWithAssetKey }) => {
      if (!isAgentApproved || currentFeeApproval <= 0) {
        return (
          <button className="rounded font-bold text-red cursor-pointer" onClick={openAgentModal}>
            Connect
          </button>
        )
      }
      return (
        <button
          className="group flex items-center gap-1 px-2 py-0.5 rounded text-primary hover:text-red text-sm cursor-pointer"
          onClick={async () => {
            const toastId = toast.loading('Cancelling order...')
            try {
              if (!sdkExchangeClient) return
              const assetIndex = isSpot
                ? Number(
                    spotMeta?.universe.find((asset) => asset.name === row.original.assetKey)?.index
                  ) + SPOT_DELTA
                : perpsMeta?.universe.findIndex((asset) => asset.name === row.original.assetKey)
              if (!assetIndex || assetIndex < 0) throw new Error('Asset index not found')
              await sdkExchangeClient.cancel({
                cancels: [
                  {
                    a: assetIndex,
                    o: row.original.oid
                  }
                ]
              })
              toast.update(toastId, {
                render: 'Order cancelled',
                type: 'success',
                isLoading: false,
                autoClose: 2000
              })
            } catch (error: unknown) {
              toast.update(toastId, {
                render: '❌ ' + (error instanceof Error ? error.message : String(error)),
                type: 'error',
                isLoading: false,
                autoClose: 2000
              })
            }
          }}
        >
          <IconTrash className="w-4 h-4 group-hover:text-red transition-colors" />
          <span className="opacity-0 group-hover:opacity-100 group-hover:text-red transition-all -translate-x-4 group-hover:translate-x-0 duration-200">
            Cancel
          </span>
        </button>
      )
    },
    [
      sdkExchangeClient,
      isAgentApproved,
      currentFeeApproval,
      openAgentModal,
      isSpot,
      spotMeta,
      perpsMeta
    ]
  )

  const renderCancelAllButton = useCallback(() => {
    if (!isAgentApproved || currentFeeApproval <= 0) {
      return (
        <div className="rounded font-bold text-red cursor-pointer" onClick={openAgentModal}>
          Connect
        </div>
      )
    }
    return (
      <div
        className="px-2 rounded text-primary hover:text-red cursor-pointer"
        onClick={async () => {
          const toastId = toast.loading('Cancelling all orders...')
          try {
            if (!sdkExchangeClient) return
            // const allOrders = openOrders
            //   .filter((order) => order.coin.includes(isSpot ? 'SPOT' : 'PERP'))
            //   .map((order) => ({ coin: order.coin, o: order.oid }))
            // const allCancels = allOrders.map((order) => {
            //   const assetIndex = isSpot ?
            //     Number(spotMeta?.universe.find(asset => asset.name === order.coin)?.index) + SPOT_DELTA
            //     : perpsMeta?.universe.findIndex(asset => asset.name === order.coin)
            //   if (!assetIndex) return
            //   return {
            //     a: assetIndex,
            //     o: order.o
            //   }
            // }).filter(order => !!order)
            const allOrders = openOrders.filter((order) => {
              if (isSpot) {
                return !!spotKeyToName.get(order.coin)
              } else {
                // asset should not be in spot universe to be a perp order
                return !spotKeyToName.get(order.coin)
              }
            })
            await sdkExchangeClient.cancel({
              cancels: allOrders
                .map((order) => {
                  const assetIndex = isSpot
                    ? Number(spotMeta?.universe.find((asset) => asset.name === order.coin)?.index) +
                      SPOT_DELTA
                    : perpsMeta?.universe.findIndex((asset) => asset.name === order.coin)
                  if (!assetIndex) return
                  return {
                    a: assetIndex,
                    o: order.oid
                  }
                })
                .filter((order) => !!order)
            })
            toast.update(toastId, {
              render: 'All orders cancelled',
              type: 'success',
              isLoading: false,
              autoClose: 2000
            })
          } catch (error: unknown) {
            toast.update(toastId, {
              render: '❌ ' + (error instanceof Error ? error.message : String(error)),
              type: 'error',
              isLoading: false,
              autoClose: 2000
            })
          }
        }}
      >
        Cancel All
      </div>
    )
  }, [
    sdkExchangeClient,
    isAgentApproved,
    currentFeeApproval,
    openAgentModal,
    openOrders,
    isSpot,
    spotMeta,
    perpsMeta
  ])

  const columns = useMemo(
    () => [
      columnHelper.accessor('timestamp', {
        id: 'timestamp',
        header: () => 'Time',
        cell: (info) => (
          <div className="flex items-center gap-1 text-nowrap align-middle">
            {new Date(info.getValue()).toLocaleString('en-US')}
          </div>
        ),
        enableSorting: true,
        meta: { label: 'Time' }
      }),
      columnHelper.accessor('coin', {
        id: 'coin',
        header: () => 'Coin',
        cell: (info) => (
          <div className="flex items-center gap-1 font-bold align-middle">{info.getValue()}</div>
        ),
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
        cell: (info) => <ReactiveText value={info.getValue()} type="currency" precision={2} />,
        meta: { label: 'Limit Price' }
      }),
      columnHelper.accessor('sz', {
        id: 'sz',
        header: () => 'Size',
        cell: (info) => (
          <div className="flex items-center gap-1">
            <ReactiveText value={info.getValue()} type="number" precision={4} />
          </div>
        ),
        meta: { label: 'Original Size' }
      }),
      columnHelper.accessor('origSz', {
        id: 'origSz',
        header: () => 'Original Size',
        cell: (info) => (
          <div className="flex items-center gap-1">
            <ReactiveText value={info.getValue()} type="number" precision={4} />
          </div>
        ),
        meta: { label: 'Original Size' }
      }),
      columnHelper.accessor('origSz', {
        id: 'orderValue',
        header: () => 'Order Value',
        cell: (info) => (
          <div className="flex items-center gap-1">
            <ReactiveText
              value={Number(info.getValue()) * Number(info.row.original.limitPx)}
              type="currency"
              precision={2}
            />
          </div>
        ),
        meta: { label: 'Order Value' }
      }),
      columnHelper.accessor('reduceOnly', {
        id: 'reduceOnly',
        header: () => 'Reduce Only',
        cell: (info) => info.getValue() ? 'Yes' : 'No',
        enableSorting: false,
        meta: { label: 'Reduce Only' }
      }),
      columnHelper.accessor('triggerCondition', {
        id: 'triggerCondition',
        header: () => 'Trigger Condition',
        cell: (info) => info.getValue(),
        enableSorting: false,
        meta: { label: 'Trigger Condition' }
      }),

      columnHelper.display({
        id: 'actions',
        header: () => renderCancelAllButton(),
        cell: ({ row }) => renderCancelButton(row),
        enableSorting: false,
        meta: { label: 'Actions' }
      })
    ],
    [renderCancelButton, renderCancelAllButton]
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
    return <div className="px-3 w-full h-40 overflow-x-auto"></div>
  }

  return (
    <div className="px-3 w-full overflow-x-auto">
      <table className="hidden lg:table w-full text-white border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-2 py-2 font-normal text-sm text-left cursor-pointer"
                  onClick={
                    header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined
                  }
                >
                  <SortableHeader header={header} />
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-transparent">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              /* step 2: real border instead of ::before */
              className={
                ` border-l-4   border-b-6 border-b-secondary  ` +
                (row.original.side === 'B' ? 'border-l-green' : 'border-l-red')
              }
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-2 text-white text-sm align-middle">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <ResponsiveDataCard
        columns={columns.map((col) => ({
          key: col.id as string,
          label: col.meta && 'label' in col.meta ? String(col.meta.label) : ''
        }))}
        data={table.getRowModel().rows.map((row) => row.original)}
        renderRow={(item) => (
          <RenderRowData
            item={item}
            columns={columns.map((col) => ({
              key: col.id as string,
              label: col.meta && 'label' in col.meta ? String(col.meta.label) : ''
            }))}
            onCancel={() => {
              if (!sdkExchangeClient) return
              if (isAgentApproved && currentFeeApproval > 0) {
                const toastId = toast.loading('Cancelling order...')
                sdkExchangeClient
                  .cancel({
                    cancels: [
                      {
                        a: Number(item.coin), // TODO: This is broken.
                        o: item.oid
                      }
                    ]
                  })
                  .then(() => {
                    toast.update(toastId, {
                      render: 'Order cancelled',
                      type: 'success',
                      isLoading: false,
                      autoClose: 2000
                    })
                  })
                  .catch((error: unknown) => {
                    toast.update(toastId, {
                      render: '❌ ' + (error instanceof Error ? error.message : String(error)),
                      type: 'error',
                      isLoading: false,
                      autoClose: 2000
                    })
                  })
              } else {
                openAgentModal()
              }
            }}
          />
        )}
      />
    </div>
  )
}

export default dynamic(() => Promise.resolve(OpenOrders), { ssr: false })
