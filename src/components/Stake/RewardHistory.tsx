// 'use client'
// import React, { useMemo, useState } from 'react'
// import Pagination from '../common/Pagination'

// interface RewardHistoryItem {
//   time: string
//   amount: string
// }
// interface RewardHistoryProps {
//   rewardHistoryData: RewardHistoryItem[]
// }
// const RewardHistory: React.FC<RewardHistoryProps> = ({ rewardHistoryData }) => {
//   const [currentPage, setCurrentPage] = useState(1)

//   const totalPages = Math.ceil((rewardHistoryData?.length ?? 0) / 10)

//   const columns = [
//     { key: 'time', label: 'Time' },
//     { key: 'amount', label: 'Amount' }
//   ]

//   const paginatedPositions = useMemo(() => {
//     return rewardHistoryData?.slice((currentPage - 1) * 10, currentPage * 10)
//   }, [rewardHistoryData, currentPage, 10])

//   return (
//     <div className="space-y-4">
//       <div className="flex justify-between">
//         <div
//           className="flex rounded-2xl border-2 border-white/10 justify-between
//                 p-3
//                 bg-[linear-gradient(179.1deg,rgba(255,255,255,0.05)_-10.66%,rgba(153,153,153,0.05)_67.22%)]
//                 backdrop-blur-[48.3px] w-[80%] items-center"
//         >
//           <span className="text-[#8B8BA0] text-base font-medium">Earned in Total</span>
//           <span className="text-white font-medium text-lg flex">382.28 HYPE</span>
//         </div>
//         <button className="text-sm text-[#7D67FF] font-semibold">Export as CSV</button>
//       </div>

//       <div>
//         <div className="flex justify-between text-[#8B8BA0] text-sm pb-2 ">
//           {columns.map((col) => (
//             <span key={col.key}>{col.label}</span>
//           ))}
//         </div>
//         {paginatedPositions.map((data, index) => (
//           <div
//             key={index}
//             className="flex border-b border-white/10 justify-between items-center py-2.5"
//           >
//             {columns.map((col) => (
//               <span key={col.key} className="text-white opacity-80 text-base font-medium">
//                 {data[col.key as keyof RewardHistoryItem]}
//               </span>
//             ))}
//           </div>
//         ))}
//       </div>

//       {rewardHistoryData && rewardHistoryData?.length > 0 && (
//         <Pagination
//           currentPage={currentPage}
//           totalPages={totalPages}
//           onPageChange={setCurrentPage}
//         />
//       )}
//     </div>
//   )
// }

// export default RewardHistory
