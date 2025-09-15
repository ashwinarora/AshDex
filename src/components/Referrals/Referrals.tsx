'use client'
import React from 'react'
// import Image from 'next/image'
// import { useAccount } from 'wagmi'
// import { useWalletModal } from '@/context/WalletModalContext'
import { useComponentRendered } from '@/hooks/useComponentRendered'
// import { REFERRALSDATA, REFERRALS_DESC } from '@/utils/constants'
// import ReferralsInfo from './ReferralsInfo'
// import ReferralsTablesTab from './ReferralsTablesTab'
// import referralsBGimage from '@/assets/images/referralsGradients.svg'
// import { Button } from '../ui/button'
import { useScreenSize } from '@/hooks/useScreenSize'

function Referrals() {
  // const { isConnected } = useAccount()
  const { isMobile } = useScreenSize()
  // const { toggleConnectWalletModal } = useWalletModal()
  // const [, setIsCreateCode] = useState(false)
  const isRendered = useComponentRendered()
  // const handleButtonClick = () => {
  //   if (isConnected) {
  //     setIsCreateCode((p) => !p)
  //   } else {
  //     toggleConnectWalletModal()
  //     setIsCreateCode(false)
  //   }
  // }

  if (!isRendered) return null

  if (isMobile)
    return (
      <div className="w-full text-white/50 h-full max-h-screen flex flex-col gap-1 p-1">
        <div className="flex flex-col gap-4 bg-secondary rounded-md items-start justify-between w-full h-fit p-4">
          <h1 className="text-2xl text-white text-start">Referrals</h1>
        </div>
      </div>
    )

  return (
    <div className="w-full text-white/50 h-full max-h-screen flex flex-col gap-1 p-1">
      <div className="flex gap-4 bg-secondary rounded-md items-center justify-between w-full h-fit p-4">
        <h1 className="text-2xl text-white text-start">Referrals</h1>
        <div className="flex flex-wrap gap-2">
          {/* <Button
            className="flex-1 w-full"
            variant={'outline'}
            // onClick={() => setIsModalOpen({ ...isModalOpen, transfer: true })}
          >
            <p>Copy Referral Code</p>
          </Button>
          <Button className="flex-1 w-full" variant={'default'} onClick={handleButtonClick}>
            Create Referral Code
          </Button> */}
        </div>
      </div>
      {/* <ReferralsTablesTab /> */}
    </div>
    // <div className="max-sm:px-1 px-6 py-4 overflow-x-hidden">
    //   <div className="w-full my-2 gap-5 max-2xl:px-1 px-10 grid grid-cols-1 min-xl:grid-cols-12">
    //     <div
    //       className={`${isConnected ? 'min-xl:col-span-8' : 'min-xl:col-span-12'} w-full h-full ${
    //         !isCreateCode ? 'backdrop-blur-[48.3px] max-lg:p-2 p-5 rounded-2xl' : ''
    //       }`}
    //       style={
    //         !isCreateCode
    //           ? {
    //               background:
    //                 'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
    //             }
    //           : {}
    //       }
    //     >
    //       <div className="flex max-lg:flex-col flex-row max-lg:gap-y-6 gap-x-4 h-full">
    //         {isConnected && isCreateCode ? (
    //           <ReferralsTablesTab />
    //         ) : (
    //           <>
    //             <div
    //               className="flex flex-col justify-center gap-4  rounded-2xl w-full min-lg:w-1/2 h-full"
    //               style={{
    //                 backgroundImage: `url(${referralsBGimage.src})`,
    //                 backgroundSize: 'cover',
    //                 backgroundPosition: 'center'
    //               }}
    //             >
    //               <div
    //                 className={`flex max-sm:text-base max-lg:text-lg text-xl tracking-normal flex-col text-[rgba(255, 255, 255, 1)] font-medium max-lg:gap-3 gap-6 max-sm:p-3 max-lg:p-4 p-8 h-full`}
    //                 style={{
    //                   background:
    //                     'linear-gradient(180deg, rgba(36,21,50,0.50) 0%, rgba(36, 21, 50, 0) 92.58%)'
    //                 }}
    //               >
    //                 {REFERRALSDATA?.map((item, index) => (
    //                   <div
    //                     key={index}
    //                     className={`flex items-center gap-3 ${isConnected ? 'py-10 max-sm:py-2 max-lg:py-3' : 'max-sm:py-2 max-lg:py-3 py-8'} max-lg:px-4 px-6 rounded-xl border-2 border-[rgba(255,255,255,0.06)]`}
    //                   >
    //                     <Image
    //                       src={item.src}
    //                       alt={item.alt}
    //                       width={15}
    //                       height={15}
    //                       className="w-5 h-5 max-sm:w-4 max-sm:h-4 max-lg:w-4.5 max-lg:h-4.5 cursor-pointer"
    //                     />
    //                     <span className={item?.opacityClass}>{item?.label}</span>
    //                   </div>
    //                 ))}
    //               </div>
    //             </div>
    //             <div
    //               style={{
    //                 background:
    //                   'linear-gradient(179.1deg, rgba(255, 255, 255, 0.05) -10.66%, rgba(153, 153, 153, 0.05) 67.22%)'
    //               }}
    //               className="flex flex-col justify-between max-lg:px-4 max-lg:py-5 px-6 py-9 rounded-2xl w-full min-lg:w-1/2 h-full"
    //             >
    //               <div>
    //                 <p className="text-white max-lg:text-lg text-2xl font-medium mb-2 tracking-normal">
    //                   Earn Rewards and Unlock Discounts with Our Referral Program
    //                 </p>
    //                 {REFERRALS_DESC?.map((desc, index) => (
    //                   <p
    //                     key={index}
    //                     className="text-[#8B8BA0] max-lg:text-sm text-base font-medium mb-2"
    //                   >
    //                     {desc}
    //                   </p>
    //                 ))}
    //               </div>
    //               <button
    //                 onClick={handleButtonClick}
    //                 className="mt-6 cursor-pointer bg-primary text-white font-semibold py-2.5 rounded-xl"
    //               >
    //                 {isConnected ? 'Create a code and invite referrals' : 'Connect wallet'}
    //               </button>
    //             </div>
    //           </>
    //         )}
    //       </div>
    //     </div>
    //     {isConnected && (
    //       <div className="min-xl:col-span-4 w-full h-full">
    //         <ReferralsInfo isCreateCode={isCreateCode} />
    //       </div>
    //     )}
    //   </div>
    // </div>
  )
}

export default Referrals
