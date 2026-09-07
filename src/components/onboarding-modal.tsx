'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import step1 from '@/assets/images/onboarding/step1.png'
import step2 from '@/assets/images/onboarding/step2.png'
import step3 from '@/assets/images/onboarding/step3.png'
import step4 from '@/assets/images/onboarding/step4.png'
import ashdexLogo from '@/assets/images/logo.svg'
import arrowrightlineicon from '@/assets/images/arrowrightline_icon.svg'
import { toast } from 'sonner'

export default function OnboardingModal() {
  const [step, setStep] = useState(0)
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const totalSteps = 4

  const onboardingSteps = [
    {
      title: 'Welcome to AshDex.',
      subtitle: 'Precision Derivatives, On-Chain.',
      description:
        'A fully decentralized, non-custodial, and on-chain platform for trading, lending, staking & predictions. You stay in control—always.',
      image: step1
    },
    {
      title: 'Trade with Deep Liquidity',
      subtitle: 'Perpetual & Spot Trading, Fully On-Chain.',
      description:
        'Tap into deep liquidity while keeping full custody of your assets. No middlemen, no compromises—just pure decentralized trading.',
      image: step2
    },
    {
      title: 'Earn, Borrow & Stake Securely',
      subtitle: 'Decentralized Lending, Borrowing & Staking.',
      description:
        'Earn yield, unlock liquidity, or stake assets to support the network—all on-chain, secure, and fully permissionless. Your assets, your rules.',
      image: step3
    },
    {
      title: 'Predict & Get Rewarded',
      subtitle: 'A Transparent, On-Chain Prediction Market.',
      description:
        'Make predictions on crypto, stocks & commodities—all verifiable on-chain. Earn AshDex points for engaging with the ecosystem.',
      image: step4
    }
  ]

  const skip = () => {
    setStep(onboardingSteps.length - 1)
  }

  const current = onboardingSteps[step]
  const renderButton = () => {
    const isLastStep = step === totalSteps - 1
    return (
      <div className="mt-8 max-md:mx-3 max-md:mt-3 max-md:mb-1 flex items-center justify-between">
        <button
          onClick={() => {
            if (step < onboardingSteps.length - 1) {
              setStep((prev) => prev + 1)
            } else if (step === onboardingSteps.length - 1) {
              if (typeof window !== 'undefined') {
                localStorage.setItem('onboarded', 'true')
              }
              setIsOnboarded(true)
              toast.success('Welcome to AshDex.')
            }
          }}
          className={`${isLastStep ? 'w-full' : 'w-1/2'} bg-primary order-1 max-md:order-2 transition text-white px-6 py-2 rounded-xl text-md font-semibold cursor-pointer`}
        >
          {isLastStep ? (
            <div className="flex justify-center items-center gap-2">Start Exploring</div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              Next
              <Image src={arrowrightlineicon} alt="Next" style={{ width: 15, height: 'auto' }} />
            </div>
          )}
        </button>
        {!isLastStep && (
          <button
            onClick={skip}
            className="text-lg order-2 max-md:order-1 font-medium text-text-3 hover:text-text-1 cursor-pointer transition-colors"
          >
            Skip
          </button>
        )}
      </div>
    )
  }

  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      const onboarded = localStorage.getItem('onboarded')
      if (onboarded) {
        setStep(totalSteps - 1)
        setIsOnboarded(true)
      }
    }
  }, [])

  if (!isClient) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 bg-secondary/50 items-center justify-center z-50 ${isOnboarded ? 'hidden' : 'flex'}`}
    >
      <div className="bg-surface-1 border border-border text-text-1 max-md:max-w-sm max-w-3xl rounded-2xl shadow-2xl w-full flex flex-col md:flex-row max-md:py-3 max-md:px-2 p-4 relative lg:static max-lg:fixed max-lg:bottom-4 max-lg:left-1/2 max-lg:-translate-x-1/2">
        <div className="flex-1 flex flex-col justify-between max-md:px-2 max-md:py-3 p-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl gap-x-1 flex items-center text-white/70 font-semibold">
                <Image height={20} width={20} src={ashdexLogo} alt="AshDex" className="w-6 h-6" />
                <span className="tracking-tight">
                  <span className="text-text-1">Ash</span>
                  <span className="text-text-3">Dex</span>
                </span>
              </span>
              <span className="text-sm bg-white/6 rounded-full py-1 px-2.5 text-white">
                Step {step + 1} of {onboardingSteps.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-4 items-center justify-center gap-2 w-full">
                {onboardingSteps?.map((item, index) => {
                  return (
                    <div
                      key={index}
                      onClick={() => setStep(index)}
                      className={`w-full h-[4px] rounded-full flex cursor-pointer ${index <= step ? 'bg-gradient-to-r from-accent-pressed to-accent-hover' : 'bg-surface-3'}`}
                    ></div>
                  )
                })}
              </div>
            </div>
            <p className="text-2xl mt-5 text-white/70 font-medium">{current.title}</p>
            <p className="text-white/70 text-lg tracking-normal font-medium">{current.subtitle}</p>
            <p className="text-sm font-normal text-white tracking-normal mt-2">
              {current.description}
            </p>
          </div>
          <div className="max-md:hidden">{renderButton()}</div>
        </div>
        <div className="flex-1 max-md:px-0 p-4 flex items-center justify-center">
          <div className="transform transition-transform duration-300 hover:rotate-3 hover:scale-105 hover:shadow-2xl">
            <Image
              src={current.image}
              alt="onboarding-step"
              className="w-full h-full object-cover rounded-3xl"
              width={300}
              height={100}
            />
          </div>
        </div>
        <div className="max-md:block hidden">{renderButton()}</div>
      </div>
    </div>
  )
}
