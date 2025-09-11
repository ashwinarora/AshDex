import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { DM_Mono } from 'next/font/google'
import Header from '@/components/Header'
import { Provider } from './provider'
import { WalletModalProvider } from '@/context/WalletModalContext'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'
import '@/styles/table.css'
import OnboardingModal from '@/components/common/Onboarding'
import { BridgeProvider } from '@/context/BridgeContext'
import { EstablishConnectionProvider } from '@/context/EstablishConnection'
import HyperLiquidInitializer from './HyperliquidInitializer'
import dynamic from 'next/dynamic'
import { getLanguage } from '@/tolgee/language'
import { getTolgee } from '@/tolgee/server'
import { TolgeeNextProvider } from '@/tolgee/client'

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

const DynamicUseToastOptions = dynamic(() =>
  import('@/components/ui/toast-config').then((mod) => mod.Toast)
)

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLanguage()
  const tolgee = await getTolgee()
  // serializable data that are passed to client components
  const staticData = await tolgee.loadRequired()
  return (
    <html suppressHydrationWarning lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmMono.variable}  bg-primary no-scrollbar`}
      >
        <GoogleAnalytics gaId="G-KR3QTG3TBY" />
        <TolgeeNextProvider language={locale} staticData={staticData}>
          <Provider>
            <HyperLiquidInitializer />
            <WalletModalProvider>
              <BridgeProvider>
                <EstablishConnectionProvider>
                  <div className='overscroll-none'>
                    {/* <SnackBar /> */}
                    <Header />
                    <OnboardingModal />
                    <DynamicUseToastOptions />
                    {children}
                  </div>
                </EstablishConnectionProvider>
              </BridgeProvider>
            </WalletModalProvider>
          </Provider>
        </TolgeeNextProvider>
      </body>
    </html>
  )
}
