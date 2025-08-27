import React, { useMemo, useState } from 'react'
import { Skeleton } from '../ui/skeleton'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../ui/dialog'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '../ui/table'
import { IconChevronUp, IconChevronDown, IconSelector } from '@tabler/icons-react'
import {
  flexRender,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  SortingState
} from '@tanstack/react-table'
import { UserFees } from '@nktkas/hyperliquid'
import { cn } from '@/lib/utils'
import { formatWithKMB } from '@/utils/format'
import { useTranslate } from '@tolgee/react'

type PortfolioVolumeCardProps = {
  userFeeData: UserFees | undefined
  userFeeLoading: boolean
  isRTL: boolean
}

const PortfolioVolumeCard = ({ userFeeData, userFeeLoading, isRTL }: PortfolioVolumeCardProps) => {
  const { t } = useTranslate()
  const columnHelper = useMemo(() => createColumnHelper<UserFees['dailyUserVlm'][number]>(), [])
  const [sorting, setSorting] = useState<SortingState>([])
  const columns = useMemo(
    () => [
      columnHelper.accessor('date', {
        header: 'Date',
        cell: ({ row }) => {
          return <div className="text-xs">{row.original.date}</div>
        },
        meta: { label: 'Date' },
        enableSorting: true
      }),
      columnHelper.accessor('exchange', {
        header: 'Exchange Volume',
        cell: ({ row }) => (
          <div className="text-xs">{'$ ' + formatWithKMB(parseFloat(row.original.exchange))}</div>
        ),
        meta: { label: 'Exchange Volume' },
        enableSorting: false
      }),
      columnHelper.accessor('userCross', {
        header: 'Taker Volume',
        cell: ({ row }) => (
          <div
            className={cn(
              'text-xs',
              parseFloat(row.original.userCross) > 0 ? 'text-white' : 'text-white/50'
            )}
          >
            {'$ ' + formatWithKMB(parseFloat(row.original.userCross))}
          </div>
        ),
        meta: { label: 'Weighted Taker Volume' },
        enableSorting: false
      }),
      columnHelper.accessor('userAdd', {
        header: 'Maker Volume',
        cell: ({ row }) => (
          <div
            className={cn(
              'text-xs',
              parseFloat(row.original.userAdd) > 0 ? 'text-white' : 'text-white/50'
            )}
          >
            {'$ ' + formatWithKMB(parseFloat(row.original.userAdd))}
          </div>
        ),
        meta: { label: 'Weighted Maker Volume' },
        enableSorting: false
      })
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data: userFeeData ? userFeeData?.dailyUserVlm : [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting: true
  })

  return (
    <div
      className={cn(
        'flex flex-col w-full justify-between bg-secondary rounded-md flex-1 gap-1 p-4',
        isRTL && 'items-end'
      )}
    >
      <h2>{t('30 Day Volume')}</h2>
      {userFeeLoading ? (
        <Skeleton className="w-36 h-12" />
      ) : (
        <h1 className="text-5xl font-semibold text-white">
          $
          {formatWithKMB(
            userFeeData?.dailyUserVlm?.reduce(
              (acc, curr) => Number(curr.userAdd) + Number(curr.userCross) + acc,
              0
            ) || 0
          )}
        </h1>
      )}
      <Dialog>
        <DialogTrigger disabled={userFeeData?.dailyUserVlm?.length === 0} asChild>
          <p className="text-xs underline underline-offset-4 cursor-pointer transition-colors hover:text-accent-foreground">
            {t('View Volume')}
          </p>
        </DialogTrigger>
        <DialogContent
          isRTL={isRTL}
          className="w-fit !max-w-xl max-h-[80vh] overflow-x-hidden overflow-y-auto scroll-smooth flex flex-col items-center gap-2"
        >
          <DialogHeader className={cn(isRTL ? 'items-end' : 'items-start')}>
            <DialogTitle>{t('Your Volume History')}</DialogTitle>
            <DialogDescription
              className={cn('text-xs text-white/50', isRTL ? 'text-end' : 'text-start')}
            >
              {t(
                '  Dates are based on UTC time zone and do not include the current day. Your 14D maker volume share is 0.00%. <br /> Perps and spot volume are counted together to determine your fee tier, and spot volume counts double toward your fee tier.'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center h-full w-full gap-2">
            {userFeeData?.dailyUserVlm && userFeeData?.dailyUserVlm?.length > 0 && (
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className={cn(isRTL ? 'flex-row-reverse' : '')}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          onClick={() => {
                            if (header.column.getCanSort()) {
                              header.column.toggleSorting()
                            }
                          }}
                          className={cn(
                            'cursor-pointer flex items-center gap-1 w-1/4 flex-1 shrink-0 !text-xs',
                            header.id === 'date'
                              ? isRTL
                                ? 'justify-end'
                                : 'justify-start'
                              : isRTL
                                ? 'justify-start'
                                : 'justify-end',
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
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow className={cn('h-12', isRTL ? 'flex-row-reverse' : '')} key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            'font-medium text-white text-xs',
                            isRTL ? 'first:text-end text-start' : 'first:text-start text-end'
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PortfolioVolumeCard
