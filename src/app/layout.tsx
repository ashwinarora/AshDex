import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { DM_Mono } from 'next/font/google'
import Header from '@/components/Header'
import { Provider } from './provider'
import Footer from '@/components/Footer'
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
        className={`${geistSans.variable} ${geistMono.variable} ${dmMono.variable}  bg-primary`}
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
                      <OnboardingModal />
                      {children}
                      <div className="py-8 px-4 md:px-9   col-span-full">
                        <Footer />
                      </div>
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
