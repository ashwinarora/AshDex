import { cn } from '@/lib/utils'
import { useUserFee } from '@/hooks/useUserFee'
const Fees = ({ isSpot, isRTL }: { isSpot: boolean; isRTL: boolean }) => {
  const { data: userFeeData } = useUserFee()

  const referralDiscount = userFeeData
    ? parseFloat(userFeeData.activeReferralDiscount ?? '0') || 0
    : 0

  const getDiscountedFee = (fee: string | number) => {
    const raw = typeof fee === 'number' ? fee : parseFloat(fee)
    if (isNaN(raw)) return 0
    return raw > 0 ? raw * (1 - referralDiscount) : raw
  }

  // Hyperliquid API naming: `*CrossRate` = taker (crosses the book),
  // `*AddRate` = maker (adds liquidity to the book). Label both explicitly
  // so users don't have to guess which number is which.
  const takerPct = userFeeData
    ? (
        getDiscountedFee(isSpot ? userFeeData.userSpotCrossRate : userFeeData.userCrossRate) * 100
      ).toFixed(3)
    : '0.0'
  const makerPct = userFeeData
    ? (
        getDiscountedFee(isSpot ? userFeeData.userSpotAddRate : userFeeData.userAddRate) * 100
      ).toFixed(3)
    : '0.0'

  return (
    <div className={cn('flex justify-between', isRTL && 'flex-row-reverse')}>
      <p className="text-white/70">{'Fees'}</p>
      <p className="text-white">
        {'Taker '}
        {takerPct}
        {'% · Maker '}
        {makerPct}
        {'%'}
      </p>
    </div>
  )
}

export default Fees
