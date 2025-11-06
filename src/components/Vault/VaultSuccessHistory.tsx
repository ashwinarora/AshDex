// import React from 'react'
// import Image from 'next/image'
// import menuClose from '@/assets/images/close_icon.svg'
// import successicon from '@/assets/images/success_icon.svg'
// import erroricon from '@/assets/images/error_icon.svg'
// import weth from '@/assets/images/weth_icon.svg'
// import eth from '@/assets/images/eth_icon.svg'
// import checkIcon from '@/assets/images/checkgreen_icon.svg'
// import refreshIcon from '@/assets/images/refresh_icon.svg'

// interface VaultSuccessHistoryProps {
//   onClose: () => void
//   isFinalSuccess?: boolean
// }

// const VaultSuccessHistory: React.FC<VaultSuccessHistoryProps> = ({ onClose, isFinalSuccess }) => {
//   return (
//     <>
//       <div className="flex justify-between items-center mb-6">
//         <div />
//         <button onClick={onClose} className="p-2 bg-[#322944] rounded-full">
//           <Image src={menuClose} alt="close" width={14} height={14} />
//         </button>
//       </div>

//       <div className="flex items-center justify-center gap-x-2 mb-4 w-full">
//         <div className="flex items-center">
//           <Image src={eth} alt="token1" style={{ width: 30, height: 'auto' }} />
//           <div className="w-10 h-px bg-[#FFFFFF29] mx-2" />
//         </div>
//         <div className="flex items-center">
//           <Image
//             src={isFinalSuccess ? successicon : erroricon}
//             alt="success"
//             width={60}
//             height={60}
//           />
//           <div className="w-10 h-px bg-[#FFFFFF29] mx-2" />
//         </div>
//         <Image src={weth} alt="token2" style={{ width: 30, height: 'auto' }} />
//       </div>

//       <div className="text-center">
//         <p className="text-xl text-white font-semibold">
//           {isFinalSuccess ? '00h 00m 04s' : 'Error!'}
//         </p>
//         <p className="text-sm font-normal text-[#8B8BA0] mt-1">
//           {isFinalSuccess ? 'Vault deposit successful!' : 'The deposit has not been completed.'}
//         </p>
//       </div>

//       <div
//         style={{
//           background:
//             'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
//         }}
//         className="border border-white/10 mt-6 rounded-2xl p-4 space-y-3"
//       >
//         {isFinalSuccess ? (
//           <>
//             <div className="flex justify-between items-center text-sm">
//               <span className="text-white/70 opacity-50 text-sm font-normal">
//                 Confirmation time:
//               </span>
//               <span className="text-green text-sm font-medium flex items-center gap-x-2">
//                 00h 00m 02s{' '}
//                 <Image src={checkIcon} alt="check" style={{ width: 14, height: 'auto' }} />
//               </span>
//             </div>
//             <div className="flex justify-between items-center text-sm">
//               <span className="text-white/70 opacity-50 text-sm font-normal">Total time:</span>
//               <span className="text-green text-sm font-medium flex items-center gap-x-2">
//                 00h 00m 04s{' '}
//                 <Image src={checkIcon} alt="check" style={{ width: 14, height: 'auto' }} />
//               </span>
//             </div>
//           </>
//         ) : (
//           <>
//             <div className="flex justify-between items-center text-white/70  text-sm font-normal">
//               <span className="opacity-50">Reason:</span>
//               <span className="text-sm font-medium text-red">Network problem</span>
//             </div>
//             <p className="text-white/70 opacity-50 text-sm font-normal">
//               Please try again or come back later.
//             </p>
//           </>
//         )}
//       </div>

//       <div className="flex justify-between gap-x-2 mt-6">
//         <button
//           className="text-[#8B8BA0] w-1/2 text-base font-medium hover:text-white"
//           onClick={onClose}
//         >
//           Go Back
//         </button>
//         <button className=" w-1/2  px-[11px] justify-center  flex items-center py-[11px] bg-[#5F46F9] font-bold text-white text-sm rounded-lg md:rounded-xl cursor-pointer">
//           {isFinalSuccess ? (
//             <span>Go to history</span>
//           ) : (
//             <div className="flex items-center gap-x-2">
//               <Image src={refreshIcon} alt="refresh" style={{ width: 14, height: 'auto' }} />
//               <span>Try again</span>
//             </div>
//           )}
//         </button>
//       </div>
//     </>
//   )
// }

// export default VaultSuccessHistory
