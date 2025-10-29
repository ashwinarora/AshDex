'use client'
import React, { useEffect, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { IconX } from '@tabler/icons-react'

interface DeBridgeModalProps {
  isOpen: boolean
  onClose: () => void
}

interface DeBridgeWidgetConfig {
  v: string
  element: string
  title: string
  description: string
  width: string
  height: string
  supportedChains: string
  inputChain: number
  outputChain: number
  inputCurrency: string
  outputCurrency: string
  showSwapTransfer: boolean
  lang: string
  mode: string
  isHideLogo: boolean
  theme: string
  styles: string
}

interface DeBridgeWindow extends Window {
  deBridge?: {
    widget: (config: DeBridgeWidgetConfig) => void
  }
}

const DeBridgeModal: React.FC<DeBridgeModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      // Load deBridge widget script
      const script = document.createElement('script')
      script.src = 'https://app.debridge.finance/assets/scripts/widget.js'
      script.async = true
      script.onload = () => {
        // Wait for the next tick to ensure the element is rendered
        setTimeout(() => {
          const widgetElement = document.getElementById('debridgeWidget')
          if (widgetElement) {
            // Initialize widget after script loads
            ;(window as DeBridgeWindow).deBridge?.widget({
              v: '1',
              element: 'debridgeWidget',
              title: '',
              description: '',
              width: '100%',
              height: '800',
              supportedChains:
                '{"inputChains":{"1":"all","10":"all","56":"all","100":"all","137":"all","146":"all","250":"all","388":"all","747":"all","998":"all","1088":"all","1514":"all","2741":"all","4158":"all","5000":"all","7171":"all","8453":"all","32769":"all","42161":"all","43114":"all","48900":"all","59144":"all","60808":"all","80094":"all","7565164":"all","245022934":"all"},"outputChains":{"998":"all"}}',
              inputChain: 1,
              outputChain: 998,
              inputCurrency: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
              outputCurrency: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
              showSwapTransfer: true,
              lang: 'en',
              mode: 'deswap',
              isHideLogo: true,
              theme: 'dark',
              styles:
                'eyJhcHBCYWNrZ3JvdW5kIjoiIzBmMDgxNiIsImJvcmRlclJhZGl1cyI6MTQsImJvcmRlckNvbG9yIjoicmdiYSgyNTUsMjU1LDI1NSwwLjEpIiwiZm9ybUNvbnRyb2xCZyI6InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIsImNvbnRyb2xCb3JkZXIiOiJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLCJwcmltYXJ5IjoiIzVmNDZmOSIsInNlY29uZGFyeSI6IiMxODEwMWYiLCJwcmltYXJ5QnRuQmciOiIjNWY0NmY5IiwicHJpbWFyeUJ0blRleHQiOiIjZmZmZmZmIiwic2Vjb25kYXJ5QnRuQmciOiJyZ2JhKDI0OSwyNDksMjQ5LDAuMSkiLCJzZWNvbmRhcnlCdG5CZ0hvdmVyIjoicmdiYSgyNTUsMjU1LDI1NSwwLjIpIiwic2Vjb25kYXJ5QnRuT3V0bGluZSI6InJnYmEoMzEsMzYsNDcsMCkifQ=='
            })
            setIsLoading(false)
          }
        }, 0)
      }
      document.body.appendChild(script)

      return () => {
        document.body.removeChild(script)
      }
    }
  }, [isOpen])

  const LoadingSkeleton = () => (
    <div
      className={`w-full h-[800px] bg-[#1a1027] rounded-lg animate-pulse ${
        isLoading ? 'block' : 'hidden'
      }`}
    >
      <div className="h-12 bg-white/10 rounded-t-lg mb-4" />
      <div className="space-y-4 p-4">
        <div className="h-10 bg-white/10 rounded-lg w-3/4" />
        <div className="h-10 bg-white/10 rounded-lg w-1/2" />
        <div className="h-32 bg-white/10 rounded-lg" />
        <div className="h-10 bg-white/10 rounded-lg w-2/3" />
        <div className="h-10 bg-white/10 rounded-lg w-1/3" />
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[9999]">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-[40px]" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative mx-auto rounded-lg bg-[#0f0816] p-4 max-w-full h-max min-w-md no-scrollbar">
          <IconX
            onClick={onClose}
            className="absolute top-0 right-0 m-4 text-white nexon-ghost p-2 rounded-full cursor-pointer h-8 w-8"
          />
          <LoadingSkeleton />
          <div id="debridgeWidget" className={`w-full mt-4 ${isLoading ? 'hidden' : 'block'}`} />
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default DeBridgeModal
