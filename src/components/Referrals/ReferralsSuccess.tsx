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

// Flattened type where each user gets their own row
type FlattenedInviteUser = {
  userId: string
  userWalletId: string
  userCreatedAt: Date
  rewardsGenerated: number
  clmVol: number
}

const columnHelper = createColumnHelper<FlattenedInviteUser>()

export default function ReferralsSuccess() {
  const { t } = useTranslate()
  const [sorting, setSorting] = useState<SortingState>([])
  const { data: successfulInvites, isLoading, error } = useSuccessfulInvites()
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')

  // Flatten the data: each user gets their own row
  const flattenedData = useMemo(() => {
    if (!successfulInvites) return []

    const flattened: FlattenedInviteUser[] = []
    successfulInvites.forEach((invite) => {
      if (invite.used_by && invite.used_by.length > 0) {
        invite.used_by.forEach((user) => {
          flattened.push({
            userId: user.id.toString(),
            userWalletId: user.wallet_id,
            userCreatedAt: user.created_at,
            rewardsGenerated: Number(user.rewards_generated) || 0,
            clmVol: Number(user.volume_traded) || 0
          })
        })
      }
    })
    return flattened
  }, [successfulInvites])

  const columns = useMemo(
    () => [
      columnHelper.accessor('userWalletId', {
        header: 'User Wallet',
        cell: (info) => <span className="text-xs font-mono">{info.getValue()}</span>
      }),
      columnHelper.accessor('userCreatedAt', {
        header: 'User Joined',
        enableSorting: true,
        cell: (info) => (
          <span className="text-xs">{new Date(info.getValue()).toLocaleDateString()}</span>
        )
      }),
      columnHelper.accessor('rewardsGenerated', {
        header: 'Rewards Generated',
        enableSorting: true,
        cell: (info) => <span className="text-xs font-medium">{info.getValue().toFixed(2)}</span>
      }),
      columnHelper.accessor('clmVol', {
        header: 'Volume Traded',
        enableSorting: true,
        cell: (info) => <span className="text-xs font-medium">{info.getValue().toFixed(2)}</span>
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
                        onClick={header.column.getToggleSortingHandler()}
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
