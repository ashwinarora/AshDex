'use client'

import dynamic from 'next/dynamic'
import type { WidgetConfig } from '@lifi/widget'

const LiFiWidget = dynamic(() => import('@lifi/widget').then((mod) => mod.LiFiWidget), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[500px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  )
})

const widgetConfig: WidgetConfig = {
  integrator: 'Nexon',
  variant: 'compact',
  appearance: 'dark',
  // Hyperliquid L1
  toChain: 1337,
  // USDC on Hyperliquid
  toToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  theme: {
    container: {
      borderRadius: '16px'
    },
    palette: {
      mode: 'dark',
      primary: {
        main: '#5f46f9'
      },
      secondary: {
        main: '#5f46f9'
      },
      background: {
        default: '#0f0f1a',
        paper: '#1e1a2d'
      },
      text: {
        primary: '#ffffff',
        secondary: 'rgba(255, 255, 255, 0.5)'
      },
      grey: {
        300: '#27163c',
        800: '#1e1a2d'
      }
    },
    shape: {
      borderRadius: 10,
      borderRadiusSecondary: 10
    }
  }
}

export function LiFiBridge() {
  return <LiFiWidget integrator="Nexon" config={widgetConfig} />
}
