// import React, { useEffect, useState } from 'react'
// import InputFeild from '../common/InputFeild'
// import Image from 'next/image'
// import menuClose from '@/assets/images/close_icon.svg'
// import successicon from '../../assets/images/success_icon.svg'
// import Modal from '../common/Modal'
// type Props = {
//   createVaultModal: boolean
//   handleCreateVault: () => void
// }
// export const CreateVaultModal = ({ createVaultModal, handleCreateVault }: Props) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     deposit: ''
//   })
//   const [errors, setErrors] = useState<{ [key: string]: string }>({})
//   const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({})
//   const [isSubmitted, setIsSubmitted] = useState(false)
//   const [isSuccess, setIsSuccess] = useState(false)
//   const availableBalance = 57.85
//   const isFormInvalid =
//     !formData.name || !formData.description || !formData.deposit || Object.keys(errors).length > 0

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value
//     }))
//   }

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsSubmitted(true)
//     if (validate()) {
//       console.log('Form Data:', formData)
//       setIsSuccess(true)
//     }
//   }

//   const handleCloseModal = () => {
//     handleCreateVault()
//     setTouchedFields({})
//     setFormData({
//       name: '',
//       description: '',
//       deposit: ''
//     })
//     setErrors({})
//     setIsSubmitted(false)
//   }

//   const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name } = e.target
//     setTouchedFields((prev) => ({ ...prev, [name]: true }))
//   }

//   const validate = () => {
//     const newErrors: typeof errors = {}
//     if (!formData.name.trim()) newErrors.name = 'Vault name required!'
//     if (!formData.description.trim()) newErrors.description = 'Vault description required!'
//     if (!formData.deposit.trim()) newErrors.deposit = 'Vault deposit required!'

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   useEffect(() => {
//     validate()
//   }, [formData])

//   return (
//     <Modal isOpen={createVaultModal} onClose={handleCloseModal}>
//       <div
//         style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
//         className="w-full max-w-md max-md:max-w-sm border-[2px] bg-[#0F0816] p-6 rounded-2xl shadow-lg 
//         relative lg:static max-lg:fixed max-lg:bottom-4 max-lg:left-1/2 max-lg:-translate-x-1/2"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="flex items-center justify-between w-full">
//           <p className="text-lg text-white font-semibold tracking-[0em]">
//             {!isSuccess && 'Create your own vault'}
//           </p>
//           <button
//             onClick={handleCloseModal}
//             className="p-2 bg-[#322944] rounded-3xl text-white/70 hover:text-white cursor-pointer"
//           >
//             <Image
//               width={20}
//               height={20}
//               src={menuClose}
//               alt="menuclose"
//               className="w-[13px] h-[13px]"
//             />
//           </button>
//         </div>
//         {isSuccess ? (
//           <div className="pt-10 flex flex-col items-center">
//             <Image
//               src={successicon}
//               style={{ width: 70, height: 'auto' }}
//               className="pr-2"
//               alt="successicon"
//             />
//             <div className="pt-6 pb-10">
//               <div className="text-center pb-2 text-xl font-bold text-white">
//                 Vault Created Successfully!
//               </div>
//               <div className="text-center text-[#8B8BA0] text-sm font-normal">
//                 Your vault &quot;High Yield Vault&quot; has been created with 150 USDC.You will
//                 manage liquidity and earn 10% of the vault&apos;s profit share.
//               </div>
//             </div>
//             <button
//               type="submit"
//               onClick={() => handleCreateVault()}
//               className={`py-3 px-4 text-white font-bold w-full rounded-2xl bg-[#5F46F9] cursor-pointer hover:bg-[#4a37d4]`}
//             >
//               View Vault
//             </button>
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit}>
//             <InputFeild
//               name="name"
//               label="Enter a name for your vault"
//               value={formData.name}
//               onChange={handleChange}
//               placeholder="High Yield Vault"
//               error={touchedFields.name || isSubmitted ? errors.name : ''}
//               onBlur={handleBlur}
//             />
//             <div className="mt-5">
//               <label className="block text-sm font-medium text-[#8B8BA0] mb-1">
//                 Enter a description for your vault
//               </label>
//               <textarea
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//                 placeholder="A vault optimized for high APY returns through diversified DeFi strategies."
//                 className={`w-full px-3 py-4 rounded-md bg-[#FFFFFF0F] text-white text-base font-medium border-2 ${(touchedFields.description || isSubmitted) && errors.description ? 'border-[#E2464A29]' : 'border-[#FFFFFF0F]'} focus:outline-none`}
//                 rows={4}
//               />
//               {(touchedFields.description || isSubmitted) && errors.description && (
//                 <p className="text-red-500 text-sm mt-1">{errors.description}</p>
//               )}
//             </div>
//             <InputFeild
//               name="deposit"
//               label="Deposit a minimum of 100 USDC from your account. As the leader, you must maintain greater than 5% of the liquidity in the vault."
//               value={formData.deposit}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               placeholder="150"
//               error={touchedFields.deposit || isSubmitted ? errors.deposit : ''}
//             />
//             <p className="text-sm text-[#8B8BA0] font-normal mt-2">
//               Available balance in account:{' '}
//               <span className="text-white font-normal">{availableBalance} USDC</span>
//             </p>
//             <div className="text-sm p-4 text-white mb-4 mt-6 rounded-lg bg-[linear-gradient(179.1deg,rgba(255,255,255,0.05)_-10.66%,rgba(153,153,153,0.05)_67.22%)]">
//               Leaders receive a 10% profit share for managing the vault.
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <button
//                 type="button"
//                 className="py-2 px-4 bg-[#0F0816] rounded-md cursor-pointer"
//                 onClick={handleCloseModal}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className={`py-3 px-4 text-white font-bold rounded-2xl  ${
//                   isFormInvalid
//                     ? 'bg-[#5F46F9] opacity-50 cursor-not-allowed pointer-events-none'
//                     : 'bg-[#5F46F9] cursor-pointer hover:bg-[#4a37d4]'
//                 }`}
//                 disabled={isFormInvalid}
//               >
//                 Create Vault
//               </button>
//             </div>
//           </form>
//         )}
//       </div>
//     </Modal>
//   )
// }
