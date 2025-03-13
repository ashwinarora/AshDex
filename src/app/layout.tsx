import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { HyperLiquidProvider } from '@/context/HyperLiquid'
import Header from '@/components/Header'
import '@/styles/table.css'
import { Provider } from './provider'

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
              <Header />
              {children}
            </HyperLiquidProvider>
          </Provider>
      </body>
    </html>
  )
}
