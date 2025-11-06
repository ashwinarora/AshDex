// 'use client'
// import { useState } from 'react'
// import { VAULTSDETAILS_LOADING_MESSAGES } from '@/utils/constants'
// import Loading from '../common/Loading'
// import TabContent from './TabContent'
// import VaultConfirmingTransaction from './VaultConfirmingTransaction'

// function VaultsActions() {
//   const [activeTab, setActiveTab] = useState<'Deposit' | 'Withdraw'>('Deposit')
//   const [isLoading, setIsLoading] = useState(false)
//   const [isConfirmingOpen, setIsConfirmingOpen] = useState(false)

//   const openConfirmingModal = () => {
//     setIsConfirmingOpen((p) => !p)
//   }
//   return (
//     <>
//       <div className="bg-gradient-to-b from-white/5 to-gray-500/5 rounded-xl border-2 border-white/10 backdrop-blur-[40px]">
//         <div className="flex border-b mb-2 border-white/10 items-center justify-evenly space-x-2  p-4 ">
//           <button
//             onClick={() => setActiveTab('Deposit')}
//             className={`w-full  py-2 rounded-full transition-colors duration-200 cursor-pointer ${
//               activeTab === 'Deposit'
//                 ? 'bg-[#FFFFFF0F] text-white font-bold'
//                 : ' text-[#8B8BA0] font-medium'
//             }`}
//           >
//             Deposit
//           </button>
//           <button
//             onClick={() => setActiveTab('Withdraw')}
//             className={`w-full  py-2 rounded-full transition-colors duration-200 cursor-pointer ${
//               activeTab === 'Withdraw'
//                 ? 'bg-[#FFFFFF0F] text-white font-bold'
//                 : ' text-[#8B8BA0] font-medium'
//             }`}
//           >
//             Withdraw
//           </button>
//         </div>
//         {isLoading ? (
//           <Loading
//             title={VAULTSDETAILS_LOADING_MESSAGES[activeTab]?.title}
//             subTitle={VAULTSDETAILS_LOADING_MESSAGES[activeTab]?.subtitle}
//             className={`py-[4rem] px-[4.5rem]`}
//           />
//         ) : (
//           <TabContent
//             setActiveTab={setActiveTab}
//             activeTab={activeTab}
//             setIsLoading={setIsLoading}
//             openConfirmingModal={openConfirmingModal}
//           />
//         )}
//       </div>
//       <VaultConfirmingTransaction
//         isConfirmingOpen={isConfirmingOpen}
//         openConfirmingModal={openConfirmingModal}
//         activeTab={activeTab}
//         setActiveTab={setActiveTab}
//       />
//     </>
//   )
// }

// export default VaultsActions
