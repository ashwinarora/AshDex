import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { DM_Mono } from 'next/font/google'
import Header from '@/components/Header'
import { Provider } from './provider'
import { WalletModalProvider } from '@/context/WalletModalContext'
import { UserProvider } from '@/context/UserContext'
import { ToastProvider } from '../context/ToastContext'
import { GoogleAnalytics } from '@next/third-parties/google'
import { FavoritesProvider } from '@/context/FavoritesContext'
import './globals.css'
import '@/styles/table.css'
import OnboardingModal from '@/components/common/Onboarding'
import { BridgeProvider } from '@/context/BridgeContext'
import { EstablishConnectionProvider } from '@/context/EstablishConnection'
import { HyperLiquidInitializer } from './HyperliquidInitializer'
import FooterCompact from '@/components/FooterCompact'
import SnackBar from '@/components/common/SnackBar'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  weight: ['400'],
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Nexon',
  description: 'Best place to Trade'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmMono.variable}  bg-primary no-scrollbar`}
      >
        <GoogleAnalytics gaId="G-KR3QTG3TBY" />
        <Provider>
          <HyperLiquidInitializer />
          <WalletModalProvider>
            <BridgeProvider>
              <EstablishConnectionProvider>
                <UserProvider>
                  <ToastProvider>
                    <FavoritesProvider>
                      <Header />
                      <SnackBar />
                      <OnboardingModal />
                      {children}
                      <FooterCompact />
                    </FavoritesProvider>
                  </ToastProvider>
                </UserProvider>
              </EstablishConnectionProvider>
            </BridgeProvider>
          </WalletModalProvider>
        </Provider>
      </body>
    </html>
  )
}
