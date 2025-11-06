// import { useState } from 'react'
// // import BuyOrSell from './components/BuyOrSell'
// import CheckBox from '@/components/common/CheckBox'
// import { useTranslate } from '@tolgee/react'

// const TWAP = () => {
//   const { t } = useTranslate()
//   // const [isBuy, setIsBuy] = useState<boolean>(true)
//   const [size, setSize] = useState<number>(0)
//   const [minutes, setMinutes] = useState<number>(0)
//   const [randomize, setRandomize] = useState<boolean>(false)

//   return (
//     <div className="flex flex-col w-full h-full">
//       {/* <BuyOrSell isBuy={isBuy} setIsBuy={setIsBuy} isRTL={isRTL} /> */}
//       <div className="flex-1 overflow-y-auto no-scrollbar">
//         <div className="space-y-1">
//           <div className="mb-1 px-4 border-[#FFFFFF0F] border-b">
//             <label className="block mb-0.5 font-medium text-[#8B8BA0] text-xs">{t('Size')}</label>
//             <input
//               type="text"
//               value={size}
//               onChange={(e) => setSize(Number(e.target.value))}
//               className="p-1.5 rounded-md focus:outline-none w-full font-medium text-sm focus:none focus:none"
//             />
//           </div>
//           <div className="mb-1 px-4 border-[#FFFFFF0F] border-b">
//             <label className="block mb-0.5 font-medium text-[#8B8BA0] text-xs">
//               {t('Minutes')}
//             </label>
//             <input
//               type="text"
//               value={minutes}
//               onChange={(e) => setMinutes(Number(e.target.value))}
//               className="p-1.5 rounded-md focus:outline-none w-full font-medium text-sm focus:none focus:none"
//             />
//           </div>
//           <label className="flex items-center mb-1 px-4 py-0.5">
//             <CheckBox
//               label=""
//               setIsChecked={(checked) => setRandomize(checked)}
//               isChecked={randomize}
//             />
//             <span className="font-medium text-white/70 text-xs">Randomize</span>
//           </label>
//         </div>
//       </div>
//       <div className="p-2 border-white/10 border-t">
//         <button className="bg-[#5F46F9] px-4 py-2 rounded-xl w-full font-bold text-white text-xs cursor-pointer">
//           {t('Place Order')}
//         </button>
//       </div>
//     </div>
//   )
// }
// export default TWAP
