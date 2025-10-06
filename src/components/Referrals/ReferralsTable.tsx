import { useMemo, useState } from 'react'
import { useReferralsInfo } from '@/hooks/useReferralsInfo'
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
import { IconChevronDown, IconChevronUp, IconSelector, IconUserX } from '@tabler/icons-react'

type ReferralsData = {
  address: string
  dateJoined: string
  totalVolume: string
  feesPaid: string
  yourRewards: string
}

const ReferralsTable = () => {
  const columnHelper = useMemo(() => createColumnHelper<ReferralsData>(), [])
  const { t } = useTranslate()
  const { data: referrals } = useReferralsInfo()
  const [sorting, setSorting] = useState<SortingState>([])
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')

  const columns = useMemo(
    () => [
      columnHelper.accessor('address', {
        id: 'address',
        header: () => (
          <span className={cn('flex justify-start items-center gap-1')}>{t('Address')}</span>
        ),
        cell: (info) => {
          return <span className="text-white text-xs">{info.getValue()}</span>
        },
        enableSorting: false,
        meta: { label: t('Address') }
      }),
      columnHelper.accessor('dateJoined', {
        id: 'dateJoined',
        header: () => (
          <span className={cn('flex justify-start items-center gap-1')}>{t('Date Joined')}</span>
        ),
        cell: (info) => {
          return <span className="text-white text-xs">{info.getValue()}</span>
        },
        enableSorting: true,
        meta: { label: t('Date Joined') }
      }),
      columnHelper.accessor('totalVolume', {
        id: 'totalVolume',
        header: () => (
          <span className={cn('flex justify-start items-center gap-1')}>{t('Total Volume')}</span>
        ),
        cell: (info) => {
          return <span className="text-white text-xs">{info.getValue()}</span>
        },
        enableSorting: true,
        meta: { label: t('Total Volume') }
      }),
      columnHelper.accessor('feesPaid', {
        id: 'feesPaid',
        header: () => (
          <span className={cn('flex justify-start items-center gap-1')}>{t('Fees Paid')}</span>
        ),
        cell: (info) => {
          return <span className="text-white text-xs">{info.getValue()}</span>
        },
        enableSorting: true,
        meta: { label: t('Fees Paid') }
      }),
      columnHelper.accessor('yourRewards', {
        id: 'yourRewards',
        header: () => (
          <span className={cn('flex justify-start items-center gap-1')}>{t('Your Rewards')}</span>
        ),
        cell: (info) => {
          return <span className="text-white text-xs">{info.getValue()}</span>
        },
        enableSorting: true,
        meta: { label: t('Your Rewards') }
      })
    ],
    [columnHelper, t]
  )

  const ReferralsData = useMemo(() => {
    if (referrals?.referrerState.stage !== 'ready') return []
    return referrals?.referrerState.data.referralStates.map((referral) => ({
      address: referral.user,
      dateJoined: new Date(referral.timeJoined).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      totalVolume: referral.cumVlm,
      feesPaid: referral.cumRewardedFeesSinceReferred,
      yourRewards: referral.cumFeesRewardedToReferrer
    }))
  }, [referrals])

  const table = useReactTable({
    data: ReferralsData,
    columns: isRTL ? columns.reverse() : columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  return (
    <div className="w-full h-full flex flex-col rounded-md gap-2">
      <Table className="w-full h-full">
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
        {table.getRowModel().rows.length > 0 ? (
          <TableBody className="overflow-y-auto h-full overflow-x-hidden no-scrollbar">
            {table.getRowModel().rows.map((row) => (
              <TableRow className="h-10" key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'font-medium text-white text-xs',
                        // isRTL ? 'first:text-start text-end' : 'text-start last:text-end'
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
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        ) : (
          <div className="flex flex-col gap-2 justify-center items-center h-full w-full">
            <IconUserX className="text-white size-10" />
            <span className="text-white/50 text-sm">{t('No Referrals found')}</span>
          </div>
        )}
      </Table>
    </div>
  )

  // const totalPages = Math.ceil(ReferralsData?.length / pageSize)

  // const paginatedBalance = useMemo(() => {
  //   if (referrals?.referrerState.stage !== 'ready') return []
  //   return ReferralsData?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  // }, [ReferralsData, currentPage, pageSize])

  // const RenderRowData: React.FC<RenderRowProps> = ({ item, columns }) => {
  //   return (
  //     <div className="flex flex-col gap-2 text-white text-sm">
  //       <div className="flex justify-between">
  //         <div className="flex items-center gap-2">
  //           <Image src={bitcoinicon} alt="BTC" style={{ width: 30, height: 'auto' }} />
  //           <div className="flex flex-col">
  //             <span className="font-medium">{item?.coin}</span>
  //             <span className="text-sm text-[#FFFFFF]">{item?.address}</span>
  //           </div>
  //         </div>
  //       </div>
  //       {columns
  //         ?.filter((col) => col?.key !== 'address')
  //         ?.map((col) => (
  //           <div key={col?.key} className="flex justify-between">
  //             <span className="text-[#8B8BA0]">{col?.label}</span>
  //             <span>{item[col?.key] ?? '-'}</span>
  //           </div>
  //         ))}
  //     </div>
  //   )
  // }

  // if (!isConnected) {
  //   return (
  //     <div className="flex justify-center items-center mt-30 max-xl:my-30 min-2xl:mt-30">
  //       <WalletNotConnected type="Referrals" />
  //     </div>
  //   )
  // }

  // return (
  //   <div className="overflow-x-auto w-full px-3 lg:px-4">
  //     <table className="w-full hidden lg:table text-white">
  //       <thead>
  //         <tr>
  //           {REFERRALS_COLUMNS?.map((col) => (
  //             <th
  //               key={col?.key}
  //               className="pt-3 pb-2.5 max-xl:px-7 pr-7 text-sm font-normal text-[#8B8BA0] text-start"
  //             >
  //               <div className="flex justify-start items-center gap-1">
  //                 <Image
  //                   src={sortingIcon}
  //                   alt="Sort"
  //                   style={{ width: 12, height: 'auto' }}
  //                   className="w-3 h-3 cursor-pointer"
  //                 />
  //                 <span>{col?.label}</span>
  //               </div>
  //             </th>
  //           ))}
  //         </tr>
  //       </thead>
  //       <tbody>
  //         <>
  //           {paginatedBalance?.map((item, index) => {
  //             return (
  //               <tr key={index} className="cursor-pointer border-b border-white/10">
  //                 <td className="py-2 pr-7 max-xl:px-7 opacity-80 text-[#FFFFFF] font-medium text-sm">
  //                   <div className="flex items-center gap-x-1">
  //                     <Image
  //                       src={bitcoinicon}
  //                       alt="Bitcoin"
  //                       style={{ width: 27, height: 'auto' }}
  //                       className="mx-1 cursor-pointer"
  //                     />
  //                     <div className="flex justify-between flex-col">{item?.user} </div>
  //                   </div>
  //                 </td>
  //                 <td className="py-2 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-medium text-sm">
  //                   {new Date(item?.timeJoined || '0').toLocaleDateString('en-US', {
  //                     year: 'numeric',
  //                     month: '2-digit',
  //                     day: '2-digit'
  //                   })}
  //                 </td>
  //                 <td className="py-2 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-medium text-sm">
  //                   {item?.cumRewardedFeesSinceReferred}
  //                 </td>
  //                 <td className="py-2 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-medium text-sm">
  //                   {item?.cumFeesRewardedToReferrer}
  //                 </td>
  //                 <td className="py-2 pr-7 max-xl:px-7  opacity-80 text-[#FFFFFF] font-medium text-sm">
  //                   {item?.cumVlm}
  //                 </td>
  //               </tr>
  //             )
  //           })}
  //         </>
  //       </tbody>
  //     </table>
  //     <ResponsiveDataCard
  //       columns={[...REFERRALS_COLUMNS]}
  //       data={paginatedBalance}
  //       renderRow={(item) => <RenderRowData item={item} columns={[...REFERRALS_COLUMNS]} />}
  //     />
  //     {ReferralsData?.length > 0 && (
  //       <Pagination
  //         currentPage={currentPage}
  //         totalPages={totalPages}
  //         onPageChange={setCurrentPage}
  //         pageSize={pageSize}
  //         onPageSizeChange={setPageSize}
  //       />
  //     )}
  //   </div>
  // )
}

export default ReferralsTable
