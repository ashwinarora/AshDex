// import React, { useState } from 'react'
// import Image from 'next/image'
// import vaultsDetailsData from '@/utils/VaultDetails.json'
// import Modal from '../common/Modal'
// import SuccessAndErrorModal from '../common/SuccessAndErrorModal'
// import erroryellowicon from '@/assets/images/errorYellow_icon.svg'
// import menuClose from '@/assets/images/close_icon.svg'

// interface DisableDepositsVaultModalProps {
//   isVaultModal: boolean
//   openVaultsModal: () => void
//   isDepositsDisabled: boolean
//   setIsDepositsDisabled: (value: boolean) => void
// }

// const DisableDepositsVaultModal: React.FC<DisableDepositsVaultModalProps> = ({
//   isVaultModal,
//   openVaultsModal,
//   isDepositsDisabled,
//   setIsDepositsDisabled
// }) => {
//   const { disableDepositsDetails } = vaultsDetailsData
//   const [isModalOpen, setIsModalOpen] = useState(false)
//   const [statusType, setStatusType] = useState<'success' | 'error'>()
//   const handleCloseModal = () => {
//     openVaultsModal()
//   }

//   const handleDisable = () => {
//     setStatusType('success')
//     setIsModalOpen(true)
//     setTimeout(() => {
//       setIsDepositsDisabled(!isDepositsDisabled)
//       setIsModalOpen(false)
//       openVaultsModal()
//     }, 3000)
//   }

//   const handleGoBack = () => {
//     setIsModalOpen(false)
//     setIsDepositsDisabled(!isDepositsDisabled)
//     openVaultsModal()
//   }

//   return (
//     <>
//       <Modal isOpen={isVaultModal} onClose={handleCloseModal}>
//         <div
//           className="w-full max-w-md max-md:max-w-sm border-white/10 border-[2px] bg-[#0F0816] max-md:p-3 p-6 rounded-2xl shadow-lg
//            relative lg:static max-lg:fixed max-lg:bottom-4 max-lg:left-1/2 max-lg:-translate-x-1/2"
//           onClick={(e) => e.stopPropagation()}
//         >
//           <div className="flex items-center justify-between mb-4 w-full">
//             <p className="text-lg text-white font-semibold tracking-[0em]">
//               {' '}
//               {isDepositsDisabled ? 'Enable Deposits' : 'Disable Deposits'}
//             </p>{' '}
//             <button
//               onClick={handleCloseModal}
//               className="p-2 bg-[#322944] rounded-3xl text-white/70 hover:text-white cursor-pointer"
//             >
//               <Image
//                 width={20}
//                 height={20}
//                 src={menuClose}
//                 alt="menuclose"
//                 className="w-[13px] h-[13px]"
//               />
//             </button>
//           </div>
//           <div
//             className={`rounded-lg py-4 px-3 flex items-center gap-y-1 gap-x-3 mb-6 ${'bg-[#FFA90A14]'}`}
//           >
//             <Image src={erroryellowicon} alt="warning" style={{ width: 25, height: 'auto' }} />
//             <p className={`font-normal text-sm ${'text-[#FFA90A]'}`}>
//               {isDepositsDisabled
//                 ? 'By enabling deposits, users will be able to add funds to this vault again.'
//                 : `Disabling deposits will prevent new users from adding funds. Existing deposits will
//             remain unaffected.`}
//             </p>
//           </div>
//           <div
//             style={{
//               background:
//                 'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
//             }}
//             className="border border-white/10 mt-6 rounded-2xl p-4 space-y-3"
//           >
//             <div className="flex justify-between items-center text-sm">
//               <span className="text-white/70 opacity-50 text-sm font-normal">Current Status:</span>
//               <span
//                 className={`rounded-lg py-0.5 px-2 font-medium flex items-center gap-x-2 ${isDepositsDisabled ? 'bg-[#FF3B3B1A] text-[#FF3B3B]' : 'bg-[#1F1F30] text-green'}`}
//               >
//                 {isDepositsDisabled ? 'Deposits Disabled' : 'Deposits Enabled'}
//               </span>
//             </div>
//             {disableDepositsDetails?.map((item, index) => (
//               <div key={index} className="flex justify-between items-center text-sm">
//                 <span className="text-white/70 opacity-50 text-sm font-normal">{item?.label}:</span>
//                 <span className="text-white text-sm font-medium flex items-center gap-x-2">
//                   {item?.value}
//                 </span>
//               </div>
//             ))}
//           </div>

//           <div className="flex justify-between gap-x-2 mt-6">
//             <button
//               className="text-[#8B8BA0] w-1/2 text-base font-medium hover:text-white"
//               onClick={handleCloseModal}
//             >
//               Go Back
//             </button>
//             <button
//               onClick={handleDisable}
//               className=" w-1/2  px-[11px] justify-center  flex items-center py-[11px] bg-[#5F46F9] font-bold text-white text-sm rounded-lg md:rounded-xl cursor-pointer"
//             >
//               <span>Disable Deposits</span>
//             </button>
//           </div>
//         </div>
//       </Modal>
//       <SuccessAndErrorModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         statusType={statusType}
//         title={statusType === 'success' ? 'Deposits Disabled!' : 'Action Failed!'}
//         description={
//           statusType === 'success'
//             ? 'Users can no longer deposit funds into this Vault.'
//             : 'Unable to disable deposits at this time. Try again later.'
//         }
//         buttonLabel="Go Back"
//         onButtonClick={handleGoBack}
//       />
//     </>
//   )
// }

// export default DisableDepositsVaultModal
