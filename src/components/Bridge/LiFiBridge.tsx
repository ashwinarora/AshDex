'use client'

import dynamic from 'next/dynamic'
import type { WidgetConfig } from '@lifi/widget'
import { useEffect, useRef } from 'react'

const LiFiWidget = dynamic(() => import('@lifi/widget').then((mod) => mod.LiFiWidget), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[500px] w-sm md:w-md">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  )
})

const widgetConfig: WidgetConfig = {
  integrator: 'AshDex',
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
        main: '#ff6b35'
      },
      secondary: {
        main: '#ff8654'
      },
      background: {
        default: '#08090b',
        paper: '#171b21'
      },
      text: {
        primary: '#f2f4f7',
        secondary: 'rgba(242, 244, 247, 0.6)'
      },
      grey: {
        300: '#232830',
        800: '#171b21'
      }
    },
    shape: {
      borderRadius: 10,
      borderRadiusSecondary: 10
    }
  }
}

export function LiFiBridge() {
  /**
   * LiFi widget is built on MUI/emotion and may inject global styles into <head>
   * (and sometimes inline styles on <html>/<body>). If those persist after the
   * dialog closes, they can visually "grey out" unrelated buttons that rely on
   * our CSS variables (e.g. --primary/--secondary) and base element styles.
   *
   * We snapshot the relevant global state on mount and restore it on unmount.
   */
  const htmlStyleBeforeMountRef = useRef<string | null>(null)
  const bodyStyleBeforeMountRef = useRef<string | null>(null)
  const htmlClassBeforeMountRef = useRef<string | null>(null)
  const bodyClassBeforeMountRef = useRef<string | null>(null)
  const bodyMUIDialogNodesBeforeMountRef = useRef<Set<Element> | null>(null)

  useEffect(() => {
    // Client-only safety (component is already `use client` but this avoids edge cases).
    if (typeof document === 'undefined') return

    htmlStyleBeforeMountRef.current = document.documentElement.getAttribute('style')
    bodyStyleBeforeMountRef.current = document.body.getAttribute('style')
    htmlClassBeforeMountRef.current = document.documentElement.getAttribute('class')
    bodyClassBeforeMountRef.current = document.body.getAttribute('class')
    bodyMUIDialogNodesBeforeMountRef.current = new Set(
      Array.from(
        document.body.querySelectorAll(
          [
            // MUI portal roots / backdrops that can "dim" the whole app if left behind.
            '.MuiModal-root',
            '.MuiBackdrop-root',
            '.MuiPopover-root',
            '.MuiPopper-root',
            '.MuiDialog-root'
          ].join(',')
        )
      )
    )

    return () => {
      // Restore inline styles (if LiFi changed them).
      if (htmlStyleBeforeMountRef.current === null) {
        document.documentElement.removeAttribute('style')
      } else {
        document.documentElement.setAttribute('style', htmlStyleBeforeMountRef.current)
      }

      if (bodyStyleBeforeMountRef.current === null) {
        document.body.removeAttribute('style')
      } else {
        document.body.setAttribute('style', bodyStyleBeforeMountRef.current)
      }

      // Restore classNames (widgets sometimes toggle global theme classes).
      if (htmlClassBeforeMountRef.current === null) {
        document.documentElement.removeAttribute('class')
      } else {
        document.documentElement.setAttribute('class', htmlClassBeforeMountRef.current)
      }
      if (bodyClassBeforeMountRef.current === null) {
        document.body.removeAttribute('class')
      } else {
        document.body.setAttribute('class', bodyClassBeforeMountRef.current)
      }

      // Remove any newly created MUI portal/backdrop nodes that can linger and keep the UI dimmed.
      const beforeMUI = bodyMUIDialogNodesBeforeMountRef.current
      if (beforeMUI) {
        for (const el of Array.from(
          document.body.querySelectorAll(
            [
              '.MuiModal-root',
              '.MuiBackdrop-root',
              '.MuiPopover-root',
              '.MuiPopper-root',
              '.MuiDialog-root'
            ].join(',')
          )
        )) {
          if (beforeMUI.has(el)) continue
          el.remove()
        }
      }
    }
  }, [])

  return <LiFiWidget integrator="AshDex" config={widgetConfig} />
}
