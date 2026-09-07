import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
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

export const metadata: Metadata = {
  title: 'Nexon',
  description: 'Best place to Trade'
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
      <body className={`${inter.variable}  bg-primary no-scrollbar`}>
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
