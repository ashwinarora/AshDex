'use client'

import { Suspense } from 'react'
import FooterCompact from '@/components/FooterCompact'
import TreasurySetup from '@/components/Treasury/TreasurySetup'

// useSearchParams needs a Suspense boundary in the App Router.
const TreasuryPage = () => (
  <div className="w-full min-h-dvh text-white/70 flex flex-col items-center">
    <div className="w-11/12 md:w-3/5 lg:w-2/5 flex-1 flex flex-col gap-4 py-8">
      <Suspense fallback={<p className="text-sm">{'Loading…'}</p>}>
        <TreasurySetup />
      </Suspense>
    </div>
    <FooterCompact />
  </div>
)

export default TreasuryPage
