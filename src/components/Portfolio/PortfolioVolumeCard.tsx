import React from 'react'
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
import { flexRender } from '@tanstack/react-table'
import { UserFees } from '@nktkas/hyperliquid'
import { cn } from '@/lib/utils'
import { Table as ReactTable } from '@tanstack/react-table'

type PortfolioVolumeCardProps = {
  userFeeData: UserFees | undefined
  userFeeLoading: boolean
  table: ReactTable<{
    date: `${number}-${number}-${number}`
    userCross: string
    userAdd: string
    exchange: string
  }>
}

const PortfolioVolumeCard = ({ userFeeData, userFeeLoading, table }: PortfolioVolumeCardProps) => {
  return (
    <div className="flex flex-col justify-between bg-secondary rounded-md flex-1 gap-1 p-4">
      <h2>30 Day Volume</h2>
      {userFeeLoading ? (
        <Skeleton className="w-36 h-12" />
      ) : (
        <h1 className="text-5xl font-semibold text-white">
          $
          {userFeeData?.dailyUserVlm
            ?.reduce((acc, curr) => Number(curr.userAdd) + Number(curr.userCross) + acc, 0)
            .toFixed(2) || 0}
        </h1>
      )}
      <Dialog>
        <DialogTrigger disabled={userFeeData?.dailyUserVlm?.length === 0} asChild>
          <p className="text-xs underline underline-offset-4 cursor-pointer transition-colors hover:text-accent-foreground">
            View Volume
          </p>
        </DialogTrigger>
        <DialogContent className="w-fit !max-w-2xl max-h-[80vh] overflow-x-hidden overflow-y-auto scroll-smooth flex flex-col items-center gap-2">
          <DialogHeader>
            <DialogTitle>Your Volume History</DialogTitle>
            <DialogDescription className="text-xs text-white/50">
              Dates are based on UTC time zone and do not include the current day. Your 14D maker
              volume share is 0.00%. <br />
              Perps and spot volume are counted together to determine your fee tier, and spot volume
              counts double toward your fee tier.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center h-full w-full gap-2">
            {userFeeData?.dailyUserVlm && userFeeData?.dailyUserVlm?.length > 0 && (
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
                            'cursor-pointer flex items-center gap-1 w-1/4 flex-1 shrink-0 !text-xs',
                            header.id === 'date' ? 'justify-start' : 'justify-end',
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
                    <TableRow className="h-12" key={row.id}>
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
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PortfolioVolumeCard
