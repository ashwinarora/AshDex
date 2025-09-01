import { ExchangeClient, FrontendOrder, SpotMeta } from '@nktkas/hyperliquid'
import { toast } from 'sonner'
import { BUILDER_ADDRESS, SPOT_DELTA } from '@/utils/constants'

export const placeSpotOrder = async ({
  sdkExchangeClient,
  spotMeta,
  selectedAsset,
  isBuy,
  limitPrice,
  assetAmount,
  isPostOnly,
  adjustedBuilderFee,
  spotKeyToName,
  pushNewOpenOrders
}: {
  sdkExchangeClient: ExchangeClient | null
  spotMeta?: SpotMeta
  selectedAsset: string
  isBuy: boolean
  limitPrice: string
  assetAmount: string
  isPostOnly: boolean
  adjustedBuilderFee: number
  spotKeyToName: Map<string, string>
  pushNewOpenOrders: (order: FrontendOrder[]) => void
}) => {
  if (!spotMeta?.tokens.length) return
  if (!sdkExchangeClient) return
  const assetIndex = spotMeta.universe.find((asset) => asset.name === selectedAsset)?.index
  if (assetIndex === -1 || assetIndex === undefined) return
  const toastId = toast.loading('⏳ Loading…')
  try {
    const res = await sdkExchangeClient.order({
      grouping: 'na',
      builder: {
        b: BUILDER_ADDRESS,
        f: adjustedBuilderFee
      },
      orders: [
        {
          a: assetIndex + SPOT_DELTA,
          b: isBuy,
          p: limitPrice,
          s: assetAmount,
          r: false,
          t: {
            limit: {
              tif: isPostOnly ? 'Alo' : 'Gtc'
            }
          }
        }
      ]
    })
    console.log(res)
    const status = res.response.data.statuses[0]
    if ('error' in status) {
      toast.error(status.error, {
        id: toastId
      })
    } else if ('filled' in status) {
      const filled = status.filled
      const action = isBuy ? 'bought' : 'sold'
      const assetName = selectedAsset.split('-')[0]
      toast.success(
        `${filled.totalSz} ${spotKeyToName.get(assetName)} ${action} at average price of ${filled.avgPx}`,
        {
          id: toastId
        }
      )
    } else if ('resting' in status) {
      const resting = status.resting
      console.log('pushing open order', resting)
      pushNewOpenOrders([
        {
          oid: resting.oid,
          children: [],
          cloid: null,
          triggerPx: '',
          triggerCondition: 'N/A',
          isTrigger: false,
          isPositionTpsl: false,
          reduceOnly: false,
          limitPx: limitPrice,
          orderType: 'Limit',
          tif: isPostOnly ? 'Alo' : 'Gtc',
          coin: selectedAsset,
          side: isBuy ? 'B' : 'A',
          sz: assetAmount,
          origSz: assetAmount,
          timestamp: Date.now()
        }
      ])
      if (resting) {
        toast.success('Order Placed Successfully', {
          id: toastId
        })
      }
    }
  } catch (error) {
    console.error('Error placing spot order:', error)
    toast.error(error as string, {
      id: toastId
    })
  }
}
