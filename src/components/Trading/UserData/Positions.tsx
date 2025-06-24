import React, { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import editicon from '@/assets/images/edit_icon.svg'
import bitcoinicon from '@/assets/images/bitcoin_logo.svg'
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
import ResponsiveDataCard from '@/components/common/ResponsiveDataCard'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useHyperliquid } from '@/store/HyperliquidStore'
import LimitCloseModal from './component/LimitCloseModal'
import MarketCloseModal from './component/MarketCloseModal'
import MarkPxDisplay from './component/MarkPxDisplay'
import TPSL_Cell from './component/TPSL_Cell'
import TPSL_Modal from './component/TPSL_Modal'
import LeverageModal from './component/LeverageModal'
import {
  IconPencil,
  IconArrowMoveUp,
  IconArrowsMoveVertical,
  IconArrowMoveDown
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

type ColumnType = {
  key: string
  label: string
}

type RenderRowProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any
  columns: ColumnType[]
}

interface IPositionsProps {
  setSelectedAsset: (asset: string) => void
}

const RenderRowData: React.FC<RenderRowProps> = ({ item }) => {
  return (
    <div className="flex flex-col gap-2 text-white text-sm">
      <div className="flex justify-between">
        <div className="flex items-center gap-1">
          <span className={`w-[4px] h-[30px] rounded-sm bg-green`}></span>
          <Image
            src={bitcoinicon}
            alt="Bitcoin"
            style={{ width: 24, height: 'auto' }}
            className="mx-1 w-6 h-6 cursor-pointer"
          />
          {item?.coin}{' '}
          <span className="bg-[#5F46F91A] ml-1 px-1.5 py-1 rounded-lg font-semibold text-[#7D67FF] text-xs">
            {item?.leverage?.value + 'x'}
          </span>
        </div>
      </div>
      <div className="flex justify-between">
        <span className="text-[#8B8BA0]">Entry Price</span>{' '}
        <span className="font-medium text-sm">{item?.entryPx}</span>{' '}
      </div>
      <div className="flex justify-between">
        <span className="text-[#8B8BA0]">Mark Price</span>{' '}
        <span className="font-medium text-sm">{item?.entryPx}</span>{' '}
      </div>
      <div className="flex justify-between">
        <span className="text-[#8B8BA0]">Funding P&L</span>{' '}
        <span className="font-medium text-sm">{item?.cumFunding?.allTime}</span>{' '}
      </div>
      <div className="flex justify-between">
        <span className="text-[#8B8BA0]">Size</span>{' '}
        <span className="font-medium text-sm">{item?.szi}</span>{' '}
      </div>
      <div className="flex justify-between">
        <span className="text-[#8B8BA0]">Unrealized PnL</span>{' '}
        <span className="font-medium text-sm">{item?.unrealizedPnl}</span>{' '}
      </div>
      <div className="flex justify-between">
        <span className="text-[#8B8BA0]">Liq. Price</span>{' '}
        <span className="font-medium text-red text-sm">{item?.liquidationPx}</span>{' '}
      </div>
      <div className="flex justify-between">
        <span className="text-[#8B8BA0]">Margin</span>{' '}
        <span className="font-medium text-sm">{item?.liquidationPx}</span>{' '}
      </div>
      <div className="flex justify-between">
        <span className="text-[#8B8BA0]">Status</span>{' '}
        <span className="bg-[#1F1F30] px-1.5 py-0.5 rounded-lg font-medium text-green text-sm">
          {'Open'}
        </span>{' '}
      </div>
      <div className="flex justify-between gap-1">
        <div className="flex items-center font-medium text-[#7D67FF] text-sm">
          <span className="py-2 pr-3">Market</span>
          <span className="px-3 py-2">Limit</span>
        </div>
        <div className="flex items-center">
          <span className="bg-[#322944] bg-opacity-10 ml-2 px-3 py-1 border-2 border-white/10 border-opacity-10 rounded-md text-white text-sm">
            dummy
          </span>
          <span className="bg-[#322944] bg-opacity-10 ml-2 px-3 py-1.5 border-2 border-white/10 border-opacity-10 rounded-md text-white text-sm">
            dummy
          </span>
        </div>
      </div>
      <div className="flex justify-between gap-1">
        <span className="text-[#8B8BA0]">TP/SL for position</span>
        <span>
          {item?.tp_sl?.tp && item?.tp_sl?.sl ? (
            <div className="flex items-center gap-x-1">
              <span className="w-17 overflow-hidden break-words">
                {item.tp_sl.tp}/{item.tp_sl.sl}
              </span>
              <Image
                src={editicon}
                alt="Edit"
                style={{ width: 16, height: 'auto' }}
                className="w-4 h-4 cursor-pointer"
              />
            </div>
          ) : (
            '-/-'
          )}
        </span>
      </div>
    </div>
  )
}

// const SortableHeader = ({
//   header
// }: {
//   header: Header<AssetPosition['position'] & { meta?: { label: string } }, unknown>
// }) => {
//   const canSort = header.column.getCanSort()
//   const sortDirection = header.column.getIsSorted()

//   return (
//     <div className="flex items-center text-white/50">
//       {header.isPlaceholder
//         ? null
//         : flexRender(header.column.columnDef.header, header.getContext())}
//       {canSort && (
//         <span className="inline-block">
//           {sortDirection === 'asc' ? (
//             <IconChevronDown className="w-4 h-4" />
//           ) : sortDirection === 'desc' ? (
//             <IconChevronUp className="w-4 h-4" />
//           ) : (
//             <IconSelector className="w-4 h-4" />
//           )}
//         </span>
//       )}
//     </div>
//   )
// }

const Positions = ({ setSelectedAsset }: IPositionsProps) => {
  const { isConnected } = useAccount()
  const { clearingHouseState, allMids } = useHyperliquid()
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
            <div className="flex items-center gap-x-2 align-middle">
              <button
                className="text-white font-bold hover:underline hover:text-indigo-500 cursor-pointer"
                onClick={() => setSelectedAsset(coin)}
              >
                {coin || ''}
              </button>
              <button
                className="flex items-center hover:scale-150 bg-primary/10 ml-1 px-1 py-0.5 rounded-md font-semibold text-primary text-xs align-middle cursor-pointer"
                onClick={() => {
                  if (!isAgentApproved || currentFeeApproval === 0) return openAgentModal()
                  setLeverageAsset(info.row.original)
                  setIsLeverageModalOpen(true)
                }}
              >
                {leverage.value}x
              </button>
            </div>
          )
        },
        meta: { label: 'Coin' }
      }),
      helper.accessor('positionValue', {
        id: 'positionValue',
        header: 'Position Value',
        meta: { label: 'Position Value' },
        cell: (info) => <ReactiveText value={info.getValue()} type="currency" precision={2} />
      }),
      helper.accessor('szi', {
        id: 'szi',
        header: 'Size',
        meta: { label: 'Size' },
        cell: (info) => (
          <div className="flex items-center gap-1">
            <ReactiveText
              value={info.getValue()}
              type="number"
              precision={4}
              isStatic={true}
              suffix={info.row.original.coin}
            />
          </div>
        )
      }),
      helper.accessor('entryPx', {
        id: 'entryPx',
        header: 'Entry Price',
        meta: { label: 'Entry Price' },
        cell: (info) => <ReactiveText value={info.getValue()} type="currency" precision={2} />
      }),
      helper.display({
        id: 'markPx',
        header: 'Mark Price',
        meta: { label: 'Mark Price' },
        cell: (info) => <MarkPxDisplay asset={info.row.original.coin} />
      }),
      helper.accessor('cumFunding.allTime', {
        id: 'cumFunding.allTime',
        header: 'Funding P&L',
        meta: { label: 'Funding P&L' }
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
            <div className="flex flex-col font-medium text-sm">
              <ReactiveText
                value={info.getValue()}
                type="currency"
                precision={2}
                currency={''}
                suffix={'USD'}
              />
              <div className="flex items-center gap-1 -mt-1 text-white/50 text-xs capitalize">
                {info.row.original.leverage.type}

                {info.row.original.leverage.type === 'isolated' && (
                  <button
                    className="ml-2 cursor-pointer"
                    onClick={() => {
                      setIsolatedMarginAsset(info.row.original)
                      setIsIsolatedMarginModalOpen(true)
                    }}
                  >
                    <IconPencil className="w-4 h-4" />
                  </button>
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
            <span className="bg-[#1F1F30] px-2 py-1 rounded-md font-medium text-green text-xs">
              Open
            </span>
          )
        },
        meta: { label: 'Status' }
      }),
      helper.display({
        id: 'actions',
        header: () =>
          !isAgentApproved || currentFeeApproval === 0 ? (
            <button
              className="font-medium text-[#8B8BA0] hover:text-indigo-300 text-sm underline"
              onClick={openAgentModal}
            >
              Connect
            </button>
          ) : (
            <button
              className="rounded focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-[#8B8BA0] hover:text-indigo-300 text-sm transition-colors cursor-pointer"
              onClick={() => {
                if (!isAgentApproved || currentFeeApproval === 0) return openAgentModal()
                setIsCloseAllModalOpen(true)
              }}
              type="button"
            >
              Close All
            </button>
          ),
        cell: (info) => {
          const position = info.row.original
          return (
            <div className="flex items-center gap-2">
              {!isAgentApproved || currentFeeApproval === 0 ? (
                <button
                  className="mr-2 py-1 font-medium hover:text-indigo-300 hover:underline cursor-pointer"
                  onClick={openAgentModal}
                >
                  Connect
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    className="mr-2 py-1 font-medium hover:text-indigo-300 hover:underline cursor-pointer"
                    onClick={() => {
                      if (!isAgentApproved || currentFeeApproval === 0) return openAgentModal()
                      setClosingAsset(position.coin)
                      setIsLimitCloseModalOpen(true)
                    }}
                  >
                    Limit
                  </button>
                  <button
                    className="mr-2 py-1 font-medium hover:text-indigo-300 hover:underline cursor-pointer"
                    onClick={() => {
                      if (!isAgentApproved || currentFeeApproval === 0) return openAgentModal()
                      setClosingAsset(position.coin)
                      setIsMarketCloseModalOpen(true)
                    }}
                  >
                    Market
                  </button>
                </div>
              )}
            </div>
          )
        },
        meta: { label: 'Actions' }
      }),
      helper.display({
        id: 'tp_sl',
        header: 'TP/SL',
        cell: ({ row }) => {
          return (
            <TPSL_Cell
              asset={row.original.coin}
              openModal={() => {
                if (!isAgentApproved || currentFeeApproval === 0) return openAgentModal()
                setTpslAsset(row.original)
                setIsTPSLModalOpen(true)
              }}
            />
          )
        },
        meta: { label: 'TP/SL' }
      })
    ],
    [helper, isAgentApproved, currentFeeApproval, openAgentModal]
  )

  useEffect(() => {
    console.log(openAgentModal)
  }, [openAgentModal])

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
    return <div className="px-3 lg:px-4 w-full h-40 overflow-x-auto"></div>
  }

  if (!isConnected) {
    return <WalletNotConnected />
  }

  return (
    <div className="w-full h-full flex flex-col gap-2">
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
                          <IconArrowMoveUp className="text-inherit size-4" />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <IconArrowMoveDown className="text-inherit size-4" />
                        ) : (
                          <IconArrowsMoveVertical className="text-inherit size-4" />
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
            <TableRow key={row.id}>
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
          />
        )}
        positionTab={true}
      />
      {isLimitCloseModalOpen && closingAsset && (
        <LimitCloseModal
          isOpen={isLimitCloseModalOpen}
          onClose={() => setIsLimitCloseModalOpen(false)}
          closingAsset={closingAsset}
        />
      )}
      {isMarketCloseModalOpen && closingAsset && (
        <MarketCloseModal
          isOpen={isMarketCloseModalOpen}
          onClose={() => setIsMarketCloseModalOpen(false)}
          closingAsset={closingAsset}
        />
      )}
      {isTPSLModalOpen && tpslAsset && (
        <TPSL_Modal
          isOpen={isTPSLModalOpen}
          onClose={() => setIsTPSLModalOpen(false)}
          tpslAsset={tpslAsset}
        />
      )}
      {isLeverageModalOpen && leverageAsset && (
        <LeverageModal
          isOpen={isLeverageModalOpen}
          onClose={() => setIsLeverageModalOpen(false)}
          asset={leverageAsset}
        />
      )}
      {isIsolatedMarginModalOpen && isolatedMarginAsset && (
        <IsolatedMarginModal
          isOpen={isIsolatedMarginModalOpen}
          onClose={() => setIsIsolatedMarginModalOpen(false)}
          asset={isolatedMarginAsset}
        />
      )}
      {isCloseAllModalOpen && (
        <CloseAllModal isOpen={isCloseAllModalOpen} onClose={() => setIsCloseAllModalOpen(false)} />
      )}
    </div>
    // <div className="px-3 w-full overflow-x-auto">
    //   <table className="hidden lg:table w-full text-white">
    //     <thead>
    //       {table.getHeaderGroups().map((headerGroup) => (
    //         <tr key={headerGroup.id}>
    //           {headerGroup.headers.map((header) => (
    //             <th
    //               key={header.id}
    //               className="px-2 py-2 font-normal text-sm text-left cursor-pointer"
    //               onClick={
    //                 header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined
    //               }
    //             >
    //               <SortableHeader header={header} />
    //             </th>
    //           ))}
    //         </tr>
    //       ))}
    //     </thead>
    //     <tbody>
    //       {table.getRowModel().rows.map((row) => (
    //         <tr
    //           key={row.id}
    //           className={`border-white/10 border-l-5 py-1 ${Number(row.original.szi) < 0 ? 'border-l-red' : 'border-l-green'}`}
    //         >
    //           {row.getVisibleCells().map((cell) => (
    //             <td key={cell.id} className="px-2 py-1 text-white text-sm align-middle">
    //               {flexRender(cell.column.columnDef.cell, cell.getContext())}
    //             </td>
    //           ))}
    //         </tr>
    //       ))}
    //     </tbody>
    //   </table>
    //   <ResponsiveDataCard
    //     columns={columns.map((col) => ({
    //       key: col.id as string,
    //       label: col.meta && 'label' in col.meta ? String(col.meta.label) : ''
    //     }))}
    //     data={table.getRowModel().rows.map((row) => row.original)}
    //     renderRow={(item) => (
    //       <RenderRowData
    //         item={item}
    //         columns={columns.map((col) => ({
    //           key: col.id as string,
    //           label: col.meta && 'label' in col.meta ? String(col.meta.label) : ''
    //         }))}
    //       />
    //     )}
    //     positionTab={true}
    //   />
    //   {isLimitCloseModalOpen && closingAsset && (
    //     <LimitCloseModal
    //       isOpen={isLimitCloseModalOpen}
    //       onClose={() => setIsLimitCloseModalOpen(false)}
    //       closingAsset={closingAsset}
    //     />
    //   )}
    //   {isMarketCloseModalOpen && closingAsset && (
    //     <MarketCloseModal
    //       isOpen={isMarketCloseModalOpen}
    //       onClose={() => setIsMarketCloseModalOpen(false)}
    //       closingAsset={closingAsset}
    //     />
    //   )}
    //   {isTPSLModalOpen && tpslAsset && (
    //     <TPSL_Modal
    //       isOpen={isTPSLModalOpen}
    //       onClose={() => setIsTPSLModalOpen(false)}
    //       tpslAsset={tpslAsset}
    //     />
    //   )}
    //   {isLeverageModalOpen && leverageAsset && (
    //     <LeverageModal
    //       isOpen={isLeverageModalOpen}
    //       onClose={() => setIsLeverageModalOpen(false)}
    //       asset={leverageAsset}
    //     />
    //   )}
    //   {isIsolatedMarginModalOpen && isolatedMarginAsset && (
    //     <IsolatedMarginModal
    //       isOpen={isIsolatedMarginModalOpen}
    //       onClose={() => setIsIsolatedMarginModalOpen(false)}
    //       asset={isolatedMarginAsset}
    //     />
    //   )}
    //   {isCloseAllModalOpen && (
    //     <CloseAllModal isOpen={isCloseAllModalOpen} onClose={() => setIsCloseAllModalOpen(false)} />
    //   )}
    // </div>
  )
}

export default dynamic(() => Promise.resolve(Positions), { ssr: false })
