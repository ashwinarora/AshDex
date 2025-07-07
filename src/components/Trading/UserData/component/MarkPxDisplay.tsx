import ReactiveText from '@/components/common/ReactiveText'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { useMemo } from 'react'

interface MarkPxDisplayProps {
  asset: string
}

const MarkPxDisplay = ({ asset }: MarkPxDisplayProps) => {
  const { perpAssetContext, perpsMeta } = useHyperliquidStore(
    useShallow((state) => ({
      perpAssetContext: state.perpAssetContext,
      perpsMeta: state.perpsMeta
    }))
  )

  const assetCtx = useMemo(() => {
    const assetIndex = perpsMeta?.universe.findIndex((item) => item.name === asset)

    return assetIndex ? perpAssetContext[assetIndex] : null
  }, [perpAssetContext, asset, perpsMeta])

  return <ReactiveText value={assetCtx?.markPx || 0} type="currency" precision={2} pulse={true} />
}

export default MarkPxDisplay
