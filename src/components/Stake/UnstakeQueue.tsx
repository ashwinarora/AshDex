// import React from 'react'
// import Image from 'next/image'
// import VectorIcon from '@/assets/images/vector_icon.svg'

// interface UnstakeItem {
//   amount: string
//   arrive: string
// }
// interface UnstakeItemProps {
//   unstakeItems: UnstakeItem[]
// }

// const UnstakeQueue: React.FC<UnstakeItemProps> = ({ unstakeItems }) => {
//   return (
//     <div>
//       <div
//         className="flex rounded-2xl border-2 border-white/10 justify-between
//                 p-3
//                 bg-[linear-gradient(179.1deg,rgba(255,255,255,0.05)_-10.66%,rgba(153,153,153,0.05)_67.22%)]
//                 backdrop-blur-[48.3px] items-center "
//       >
//         <span className="text-[#8B8BA0] text-base font-medium">Pending Total</span>
//         <span className="text-white font-medium text-xl flex">
//           <div className="bg-[#072723] p-1 rounded-full items-center">
//             <Image
//               style={{ width: 12, height: 'auto' }}
//               src={VectorIcon}
//               alt=""
//               className="mt-0.5"
//             />
//           </div>
//           12,382.28 HYPE
//         </span>
//       </div>
//       <div className="mt-5">
//         <div className="flex justify-between font-normal tracking-normal text-[#8B8BA0] text-sm pb-2">
//           <span>Amount</span>
//           <span>Arrive in</span>
//         </div>
//         {unstakeItems.map((item, index) => (
//           <div
//             key={index}
//             className="flex text-base justify-between py-3 border-b border-white/10 text-white"
//           >
//             <span>{item.amount}</span>
//             <span>{item.arrive}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// export default UnstakeQueue
