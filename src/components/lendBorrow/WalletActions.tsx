// 'use client'
// import { useState } from 'react'
// import Image from 'next/image'
// import { useAccount } from 'wagmi'
// import TabContent from './TabContent'
// import Loading from '../common/Loading'
// import { useComponentRendered } from '@/hooks/useComponentRendered'
// import { LENDBORROW_LOADING_MESSAGES } from '@/utils/constants'
// import WithdrawAndRepayModal from './WithdrawAndRepayModal'
// import lendBorrowData from '@/utils/lendBorrow.json'
// import ethicon from '../../assets/images/eth_icon.svg'
// import wethicon from '../../assets/images/weth_icon.svg'

// const iconMap: { [key: string]: string } = {
//   wethicon: wethicon,
//   ethicon: ethicon
// }

// const WalletActions: React.FC = () => {
//   const { yourSuppliesAndBorrows } = lendBorrowData?.lendBorrow
//   const { isConnected } = useAccount()
//   const isRendered = useComponentRendered()
//   const [activeTab, setActiveTab] = useState<'Supply' | 'Borrow'>('Supply')
//   const [isLoading, setIsLoading] = useState(false)
//   const [modalType, setModalType] = useState<'Withdraw' | 'Repay' | null>(null)
//   const [isModalOpen, setModalOpen] = useState(false)

//   const openModal = (type: 'Withdraw' | 'Repay') => {
//     setModalType(type)
//     setModalOpen((p) => !p)
//   }
//   if (!isRendered) return null

//   return (
//     <>
//       <div className="bg-gradient-to-b from-white/5 to-gray-500/5 rounded-xl border-2 border-white/10 backdrop-blur-[40px]">
//         <div className="flex border-b mb-2 border-white/10 items-center justify-evenly space-x-2  p-4 ">
//           <button
//             onClick={() => setActiveTab('Supply')}
//             className={`w-full  py-2 rounded-full transition-colors duration-200 cursor-pointer ${
//               activeTab === 'Supply'
//                 ? 'bg-[#FFFFFF0F] text-white font-bold'
//                 : ' text-[#8B8BA0] font-medium'
//             }`}
//           >
//             Supply
//           </button>
//           <button
//             onClick={() => setActiveTab('Borrow')}
//             className={`w-full  py-2 rounded-full transition-colors duration-200 cursor-pointer ${
//               activeTab === 'Borrow'
//                 ? 'bg-[#FFFFFF0F] text-white font-bold'
//                 : ' text-[#8B8BA0] font-medium'
//             }`}
//           >
//             Borrow
//           </button>
//         </div>
//         {isLoading ? (
//           <Loading
//             title={LENDBORROW_LOADING_MESSAGES[activeTab]?.title}
//             subTitle={LENDBORROW_LOADING_MESSAGES[activeTab]?.subtitle}
//             className={`${activeTab === 'Supply' ? 'py-[6.65rem] px-[5rem]' : 'py-[5.5rem] px-[4.5rem]'}`}
//           />
//         ) : (
//           <TabContent
//             setActiveTab={setActiveTab}
//             activeTab={activeTab}
//             setIsLoading={setIsLoading}
//           />
//         )}
//       </div>
//       {isConnected && (
//         <div className="mt-6 h-[280px] bg-white/10 border-2 border-white/10 p-4 rounded-2xl">
//           <div className="flex justify-between items-center text-white mb-3">
//             <p className="font-bold text-white text-base">Your Supplies</p>
//             <button
//               onClick={() => openModal('Withdraw')}
//               className="px-[22px] cursor-pointer py-[10px] bg-[#FFFFFF0F] text-white font-bold rounded-xl text-sm"
//             >
//               Withdraw
//             </button>
//           </div>
//           <div className="space-y-3 max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:hidden">
//             {yourSuppliesAndBorrows?.map((supply, index) => (
//               <div
//                 key={index}
//                 className="flex pb-2.5 border-b-2 border-[#33293B] items-center text-base font-medium justify-between text-white"
//               >
//                 <div className="flex items-center space-x-2">
//                   <Image
//                     alt={supply?.icon}
//                     style={{ width: 27, height: 'auto' }}
//                     src={iconMap[supply?.icon]}
//                     className="text-lg"
//                   />
//                   <span>{supply?.name}</span>
//                 </div>
//                 <span>{supply?.amount}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {isConnected && (
//         <div className="mt-6 h-[280px] bg-white/10 border-2 border-white/10 p-4 rounded-2xl">
//           <div className="flex justify-between items-center text-white mb-3">
//             <p className="font-bold text-white text-base">Your Borrow</p>
//             <button
//               onClick={() => openModal('Repay')}
//               className="px-[22px] cursor-pointer py-[10px] bg-[#FFFFFF0F] text-white font-bold rounded-xl text-sm"
//             >
//               Repay
//             </button>
//           </div>
//           <div className="space-y-3 max-h-[200px] overflow-y-scroll [&::-webkit-scrollbar]:hidden">
//             {yourSuppliesAndBorrows?.map((supply, index) => (
//               <div
//                 key={index}
//                 className="flex pb-2.5 border-b-2 border-[#33293B] items-center text-base font-medium justify-between text-white"
//               >
//                 <div className="flex items-center space-x-2">
//                   <Image
//                     alt={supply?.icon}
//                     style={{ width: 27, height: 'auto' }}
//                     src={iconMap[supply?.icon]}
//                     className="text-lg"
//                   />
//                   <span>{supply?.name}</span>
//                 </div>
//                 <span>{supply?.amount}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//       <WithdrawAndRepayModal
//         isModalOpen={isModalOpen}
//         openModal={() => openModal('Withdraw')}
//         type={modalType}
//         setModalType={setModalType}
//       />
//     </>
//   )
// }

// export default WalletActions
