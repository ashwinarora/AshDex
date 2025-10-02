import { cn } from '@/lib/utils'
import { useUserFee } from '@/hooks/useUserFee'
import { useTranslate } from '@tolgee/react'

const Fees = ({ isSpot, isRTL }: { isSpot: boolean; isRTL: boolean }) => {
  const { t } = useTranslate()
  const { data: userFeeData } = useUserFee()

  const referralDiscount = userFeeData
    ? parseFloat(userFeeData.activeReferralDiscount ?? '0') || 0
    : 0

  const getDiscountedFee = (fee: string | number) => {
    const raw = typeof fee === 'number' ? fee : parseFloat(fee)
    if (isNaN(raw)) return 0
    return raw > 0 ? raw * (1 - referralDiscount) : raw
  }

  const feeText = userFeeData
    ? isSpot
      ? `${(getDiscountedFee(userFeeData.userSpotCrossRate) * 100).toFixed(3)}% / ${(getDiscountedFee(userFeeData.userSpotAddRate) * 100).toFixed(3)}%`
      : `${(getDiscountedFee(userFeeData.userCrossRate) * 100).toFixed(3)}% / ${(getDiscountedFee(userFeeData.userAddRate) * 100).toFixed(3)}%`
    : '0.0% / 0.0%'

  return (
    <div className={cn('flex justify-between', isRTL && 'flex-row-reverse')}>
      <p className="text-white/50">{t('Fees')}</p>
      <p className="text-white">{feeText}</p>
    </div>
  )
}

export default Fees
