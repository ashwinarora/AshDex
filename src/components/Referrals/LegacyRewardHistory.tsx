import { useMemo, useState } from 'react'
import { useGetClaimRewardHistory } from '@/hooks/invite/useGetClaimRewardHistory'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from '@tanstack/react-table'
import { useTranslate } from '@tolgee/react'
import { cn } from '@/lib/utils'
import useUserStore from '@/store/userStore'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import {
  IconAlertCircle,
  IconChevronDown,
  IconChevronUp,
  IconLoader2,
  IconSelector,
  IconUserX
} from '@tabler/icons-react'
import { RewardsHistoryItem } from '@/services/Rewards.manager'

const columnHelper = createColumnHelper<RewardsHistoryItem>()

function LegacyRewardHistory() {
  const { t } = useTranslate()
  const { data: rewardHistoryData, isLoading, error } = useGetClaimRewardHistory()
  const [sorting, setSorting] = useState<SortingState>([])
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')

  const columns = useMemo(
    () => [
      columnHelper.accessor('created_at', {
        header: t('Date'),
        enableSorting: true,
        cell: (info) => (
          <span className="text-xs">
            {new Date(info.getValue()).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        )
      }),
      columnHelper.accessor('rewards_claimed', {
        header: t('Rewards Claimed'),
        enableSorting: true,
        cell: (info) => <span className="text-xs font-medium">${info.getValue().toFixed(2)}</span>
      })
    ],
    [t]
  )

  const table = useReactTable({
    data: rewardHistoryData?.rewardsHistory || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting
    }
  })

  return (
    <>
      {isLoading && (
        <div className="w-full h-full items-center justify-center flex flex-col gap-2">
          <IconLoader2 className="text-white size-10 animate-spin" />
        </div>
      )}

      {error && (
        <div className="w-full h-full items-center justify-center flex flex-col gap-2">
          <IconAlertCircle className="text-red size-10" />
          <div className="text-red">
            {t('Error loading reward history')}: {t(error.message)}
          </div>
        </div>
      )}

      {!isLoading && !error && rewardHistoryData && (
        <>
          {table.getRowModel().rows?.length ? (
            <div className="w-full h-full flex flex-col gap-4">
              {/* Table */}
              <Table className="w-full h-full">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            'cursor-pointer w-full',
                            !isRTL
                              ? header.id === 'created_at'
                                ? 'justify-start'
                                : 'justify-end'
                              : header.id === 'created_at'
                                ? 'justify-end'
                                : 'justify-start',
                            header.column.columnDef.enableSorting
                              ? 'hover:text-accent-foreground'
                              : 'hover:text-white/70',
                            header.column.getIsSorted() === 'asc' ||
                              header.column.getIsSorted() === 'desc'
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
                    <TableRow className="h-10" key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              'font-medium text-white text-xs',
                              !isRTL
                                ? cell.column.id === 'created_at'
                                  ? 'text-start'
                                  : 'text-end'
                                : cell.column.id === 'created_at'
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
            </div>
          ) : (
            <div className="flex flex-col gap-2 justify-center items-center h-full w-full">
              <IconUserX className="text-white size-10" />
              <span className="text-white/70 text-sm">{t('No reward history found')}</span>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default LegacyRewardHistory
