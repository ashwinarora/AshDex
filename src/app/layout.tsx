import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { DM_Mono } from 'next/font/google'
import { HyperLiquidProvider } from '@/context/HyperLiquid'
import Header from '@/components/Header'
import { Provider } from './provider'
import Footer from '@/components/Footer'
import { WalletModalProvider } from '@/context/WalletModalContext'
import { UserProvider } from '@/context/UserContext'
import ConnectWalletModal from '@/components/ConnectWalletModal'
import { ToastProvider } from '../context/ToastContext'

import { FavoritesProvider } from '@/context/FavoritesContext'
import './globals.css'
import '@/styles/table.css'
import OnboardingModal from '@/components/common/Onboarding'

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
        <Provider>
          <HyperLiquidProvider>
            <WalletModalProvider>
              <UserProvider>
                <ToastProvider>
                  <FavoritesProvider>
                    <ConnectWalletModal />
                    <Header />
                    <OnboardingModal />
                    {children}
                    <div className="py-8 px-4 md:px-9   col-span-full">
                      <Footer />
                    </div>
                  </FavoritesProvider>
                </ToastProvider>
              </UserProvider>
            </WalletModalProvider>
          </HyperLiquidProvider>
        </Provider>
      </body>
    </html>
  )
}
