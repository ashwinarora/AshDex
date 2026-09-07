import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import Header from '@/components/Header'
import { WalletModalProvider } from '@/context/WalletModalContext'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'
import '@/styles/table.css'
import OnboardingModal from '@/components/onboarding-modal'
import { EstablishConnectionProvider } from '@/context/EstablishConnection'
import HyperLiquidInitializer from './HyperliquidInitializer'
import dynamic from 'next/dynamic'
import WagmiProvider from './WagmiProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
})

export const metadata: Metadata = {
  title: 'AshDex — Trade Perps On-Chain',
  description: 'A precision derivatives terminal on Hyperliquid. Perps and spot, self-custodial.',
  openGraph: {
    title: 'AshDex — Trade Perps On-Chain',
    description: 'A precision derivatives terminal on Hyperliquid. Perps and spot, self-custodial.',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AshDex — Trade Perps On-Chain',
    description: 'A precision derivatives terminal on Hyperliquid. Perps and spot, self-custodial.'
  }
}

const DynamicUseToastOptions = dynamic(() =>
  import('@/components/ui/toast-config').then((mod) => mod.Toast)
)

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={`${inter.variable} ${geistMono.variable} bg-surface-0 text-text-1 no-scrollbar`}
      >
        <GoogleAnalytics gaId="G-KR3QTG3TBY" />
        <WagmiProvider>
          <HyperLiquidInitializer />
          <WalletModalProvider>
            <EstablishConnectionProvider>
              <div className="overscroll-none">
                <Header />
                <OnboardingModal />
                <DynamicUseToastOptions />
                {children}
              </div>
            </EstablishConnectionProvider>
          </WalletModalProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}
