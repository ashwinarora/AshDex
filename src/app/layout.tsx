import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { HyperLiquidProvider } from '@/context/HyperLiquid'
import Header from '@/components/Header'
import { Provider } from './provider'
import Footer from '@/components/Footer'
import './globals.css'
import '@/styles/table.css'
import { WalletModalProvider } from '@/context/WalletModalContext'
import ConnectWalletModal from '@/components/ConnectWalletModal'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Provider>
          <HyperLiquidProvider>
            <WalletModalProvider>
              <ConnectWalletModal />
              <Header />
              {children}
              <div className="py-8 px-4 md:px-9 bg-[#0d021f] lg:px-14 col-span-full">
                <Footer />
              </div>
            </WalletModalProvider>
          </HyperLiquidProvider>
        </Provider>
      </body>
    </html>
  )
}
