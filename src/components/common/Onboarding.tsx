'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import step1 from '@/assets/images/onboarding/step1.png'
import step2 from '@/assets/images/onboarding/step2.png'
import step3 from '@/assets/images/onboarding/step3.png'
import step4 from '@/assets/images/onboarding/step4.png'
import { toast } from 'react-toastify'

const onboardingSteps = [
  {
    title: 'Welcome to Nexon!',
    subtitle: 'The Future of DeFi is Here.',
    description:
      'A fully decentralized, non-custodial, and on-chain platform for trading, lending, staking & predictions. You stay in control—always.',
    image: step1,
    button: 'Next →'
  },
  {
    title: 'Trade with Deep Liquidity',
    subtitle: 'Perpetual & Spot Trading, Fully On-Chain.',
    description:
      'Tap into deep liquidity while keeping full custody of your assets. No middlemen, no compromises—just pure decentralized trading.',
    image: step2,
    button: 'Next →'
  },
  {
    title: 'Earn, Borrow & Stake Securely',
    subtitle: 'Decentralized Lending, Borrowing & Staking.',
    description:
      'Earn yield, unlock liquidity, or stake assets to support the network—all on-chain, secure, and fully permissionless. Your assets, your rules.',
    image: step3,
    button: 'Next →'
  },
  {
    title: 'Predict & Get Rewarded',
    subtitle: 'A Transparent, On-Chain Prediction Market.',
    description:
      'Make predictions on crypto, stocks & commodities—all verifiable on-chain. Earn Nexon points for engaging with the ecosystem.',
    image: step4,
    button: 'Start Exploring'
  }
]

export default function OnboardingModal() {
  const [step, setStep] = useState(0)
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const skip = () => {
    setStep(onboardingSteps.length - 1)
  }

  const current = onboardingSteps[step]

  useEffect(() => {
    setIsClient(true)
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      const onboarded = localStorage.getItem('onboarded')
      if (onboarded) {
        setStep(onboardingSteps.length - 1)
        setIsOnboarded(true)
      }
    }
  }, [])

  // Don't render anything until we're on the client side
  if (!isClient) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 bg-secondary/50 items-center justify-center z-50 ${isOnboarded ? 'hidden' : 'flex'}`}
    >
      <div className="bg-[#0F0816] text-white max-w-4xl rounded-3xl shadow-2xl w-full flex flex-col md:flex-row p-4">
        {/* Left Content */}
        <div className="flex-1 flex flex-col justify-between p-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-300 font-semibold">Nexon</span>
              <span className="text-xs text-purple-400">
                Step {step + 1} of {onboardingSteps.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-4 items-center justify-center gap-2 w-full">
                {onboardingSteps.map((item, index) => {
                  return (
                    <div
                      key={index}
                      onClick={() => setStep(index)}
                      className={`w-full h-[4px] flex  ${index <= step ? 'bg-primary' : 'bg-primary/10'}`}
                    ></div>
                  )
                })}
              </div>
            </div>
            <h2 className="text-2xl font-bold">{current.title}</h2>
            <p className="text-purple-300 font-medium">{current.subtitle}</p>
            <p className="text-sm text-gray-300 mt-2">{current.description}</p>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => {
                if (step < onboardingSteps.length - 1) {
                  setStep((prev) => prev + 1)
                } else if (step === onboardingSteps.length - 1) {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('onboarded', 'true')
                  }
                  setIsOnboarded(true)
                  toast.success('Welcome to Nexon!')
                }
              }}
              className="bg-[#7242F8] hover:bg-[#5b32cb] transition text-white px-6 py-2 rounded-xl text-sm font-semibold cursor-pointer"
            >
              {current.button}
            </button>
            {step < onboardingSteps.length - 1 && (
              <button
                onClick={skip}
                className="text-sm text-gray-400 hover:text-gray-200 cursor-pointer"
              >
                Skip
              </button>
            )}
          </div>
        </div>

        {/* Right Image */}
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="transform transition-transform duration-300 hover:rotate-3 hover:scale-105 hover:shadow-2xl">
            <Image
              src={current.image}
              alt="onboarding-step"
              width={200}
              className="w-full h-full object-cover rounded-3xl"
              height={100}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
