import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { marketKindFromPathname, type MarketKind } from '@/utils/marketKind'

/** Which market family the current route belongs to. */
const useMarketKind = (): MarketKind => {
  const pathname = usePathname()
  return useMemo(() => marketKindFromPathname(pathname), [pathname])
}

export default useMarketKind
