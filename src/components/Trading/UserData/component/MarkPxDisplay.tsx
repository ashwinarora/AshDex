import ReactiveText from '@/components/common/ReactiveText'
import { usePerpsUniverse } from '@/hooks/usePerpsUniverse'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { useMemo } from 'react'

interface MarkPxDisplayProps {
  asset: string
}

const MarkPxDisplay = ({ asset }: MarkPxDisplayProps) => {
  const { data: universe } = usePerpsUniverse()
  const { perpAssetContext } = useHyperliquid()

  const assetCtx = useMemo(() => {
    const assetIndex = universe.findIndex((item) => item.name === asset)

    return assetIndex !== -1 ? perpAssetContext[assetIndex] : null
  }, [perpAssetContext, asset, universe])

  return <ReactiveText value={assetCtx?.markPx || 0} type="currency" precision={2} pulse={true} />
}

export default MarkPxDisplay
