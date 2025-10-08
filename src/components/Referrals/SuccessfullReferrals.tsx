'use client'
import { useState, useMemo } from 'react'
import { useSuccessfulInvites } from '@/hooks/invite/useSuccessfulInvites'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  SortingState
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { IconChevronDown, IconChevronUp, IconSelector } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

type FlattenedReferral = {
  wallet_id: string
  user_id: number
  rewards_generated: number | null
  created_at: Date
}

const columnHelper = createColumnHelper<FlattenedReferral>()

export default function SuccessfullReferrals() {
  const [sorting, setSorting] = useState<SortingState>([])
  const { data: successfulInvites, isLoading, error } = useSuccessfulInvites()

  // Flatten the data so each user gets their own row
  const flattenedData = useMemo(() => {
    if (!successfulInvites) return []

    return successfulInvites.flatMap((invite) =>
      invite.used_by.map((user) => ({
        wallet_id: user.wallet_id,
        user_id: user.id,
        rewards_generated: user.rewards_generated ? Number(user.rewards_generated) : null,
        created_at: invite.created_at
      }))
    )
  }, [successfulInvites])

  const columns = useMemo(
    () => [
      columnHelper.accessor('wallet_id', {
        header: 'Wallet Address',
        cell: (info) => <div className="text-xs font-mono">{info.getValue()}</div>
      }),
      columnHelper.accessor('rewards_generated', {
        header: 'Rewards Generated',
        cell: (info) => {
          const value = info.getValue()
          return <div className="text-sm">{value !== null ? `$${value.toFixed(2)}` : '-'}</div>
        }
      }),
      columnHelper.accessor('created_at', {
        header: 'Joined At',
        cell: (info) => new Date(info.getValue()).toLocaleDateString()
      })
    ],
    []
  )

  const table = useReactTable({
    data: flattenedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting
    }
  })

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-2xl p-6 flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold">Successful Referrals</h2>
        <p className="text-gray-400 text-sm">Track your referral performance</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-400">Loading referrals...</div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-8">
          <div className="text-red-400">Error loading referrals: {error.message}</div>
        </div>
      )}

      {!isLoading && !error && successfulInvites && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">Total Referrals: {flattenedData.length}</div>
          </div>

          <div className="border border-white/10 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-white/70">
                        {header.isPlaceholder ? null : (
                          <div
                            className={cn(
                              'flex items-center gap-1 cursor-pointer select-none',
                              header.column.getCanSort() && 'hover:text-white'
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              <div className="flex flex-col">
                                {header.column.getIsSorted() === 'asc' ? (
                                  <IconChevronUp className="h-3 w-3" />
                                ) : header.column.getIsSorted() === 'desc' ? (
                                  <IconChevronDown className="h-3 w-3" />
                                ) : (
                                  <IconSelector className="h-3 w-3 opacity-50" />
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-white/5">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="text-white/90">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center text-gray-400 py-8">
                      No successful referrals found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
