'use client'
import { useState, useMemo } from 'react'
import { useSuccessfulInvites } from '@/hooks/invite/useSuccessfulInvites'
import { IInviteWithUsedBy } from '@/services/Invite.manager'
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
import {
  IconAlertCircle,
  IconChevronDown,
  IconChevronUp,
  IconLoader2,
  IconSelector,
  IconUserX
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import useUserStore from '@/store/userStore'
import { useTranslate } from '@tolgee/react'

const columnHelper = createColumnHelper<IInviteWithUsedBy>()

export default function ReferralsSuccess() {
  const { t } = useTranslate()
  const [sorting, setSorting] = useState<SortingState>([])
  const { data: successfulInvites, isLoading, error } = useSuccessfulInvites()
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')
  const columns = useMemo(
    () => [
      columnHelper.accessor('used_by', {
        header: 'Used By',
        cell: (info) => {
          const usedBy = info.getValue()
          return (
            <div className="flex flex-col gap-1">
              {usedBy.length > 0 ? (
                usedBy.map((user) => (
                  <div key={user.id} className="text-xs font-mono">
                    {user.wallet_id}
                  </div>
                ))
              ) : (
                <span className="text-gray-400 text-xs">No users yet</span>
              )}
            </div>
          )
        }
      }),
      columnHelper.accessor('created_at', {
        header: 'Created At',
        cell: (info) => new Date(info.getValue()).toLocaleDateString()
      })
    ],
    []
  )

  const table = useReactTable({
    data: successfulInvites || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting
    }
  })

  return (
    <div
      className={cn(
        'w-full h-full flex-1 flex flex-col p-2 gap-2 justify-start bg-secondary rounded-md shrink-0',
        isRTL && 'items-end'
      )}
    >
      <h2 className="text-white text-lg font-medium">{t('Successful Referrals')}</h2>

      {isLoading && (
        <div className="w-full h-full items-center justify-center flex flex-col gap-2">
          <IconLoader2 className="text-white size-10 animate-spin" />
        </div>
      )}

      {error && (
        <div className="w-full h-full items-center justify-center flex flex-col gap-2">
          <IconAlertCircle className="text-red size-10" />
          <div className="text-red">
            {t('Error loading referrals')}: {t(error.message)}
          </div>
        </div>
      )}

      {!isLoading && !error && successfulInvites && (
        <>
          {table.getRowModel().rows?.length ? (
            <Table className="w-full h-full">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
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

              <TableBody className="overflow-y-auto h-full overflow-x-hidden no-scrollbar">
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="h-10">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'font-medium text-white text-xs',
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
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col gap-2 justify-center items-center h-full w-full">
              <IconUserX className="text-white size-10" />
              <span className="text-white/50 text-sm">{t('No Referrals found')}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
