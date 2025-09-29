import { useMemo } from 'react'
import { usePathname } from 'next/navigation'

const useIsSpot = (): boolean => {
  const pathname = usePathname()
  const isSpot = useMemo(() => pathname?.startsWith('/spot'), [pathname])
  return isSpot
}

export default useIsSpot
