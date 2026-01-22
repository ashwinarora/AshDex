import { useQuery } from '@tanstack/react-query'
import { useConnection } from 'wagmi'
import { Hex } from 'viem'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import useIsSpot from './useIsSpot'

const targetFee = {
  perpsTaker: '0.00045',
  perpsMaker: '0.00015',
  spotTaker: '0.00070',
  spotMaker: '0.00040'
} as const

/**
 * Calculate builder fee in basis points (bps) using integer math (ppm scale) to avoid JS float errors.
 *
 * @param protocolFeeStr       e.g. "0.00045"  (== 0.045% == 450 ppm)
 * @param referralDiscountStr  e.g. "0.04"     (== 4% discount on the protocol fee)
 * @param targetFeeStr         e.g. "0.0005"   (== 0.05% == 500 ppm)
 * @returns integer builder fee in bps; returns 0 if required fee < 1 bp
 *
 * Notes:
 * - 1 bp = 0.0001 (decimal) = 100 ppm.
 * - Discount is applied to the protocol fee: effectiveProtocol = protocolFee * (1 - referralDiscount).
 * - We floor to whole bps so we never overshoot the target.
 */
export function calcBuilderFeeBps(
  protocolFeeStr: string,
  referralDiscountStr: string,
  targetFeeStr: string
): number {
  // scale everything to integers in ppm (1e-6)
  const SCALE = 1_000_000n // ppm scale for decimals in [0,1)
  const BP_IN_PPM = 100n // 1 bp = 100 ppm

  const protocolPpm = toScaledInt(protocolFeeStr, 6)
  const targetPpm = toScaledInt(targetFeeStr, 6)
  const discountPerOne = toScaledInt(referralDiscountStr, 6) // e.g. "0.04" -> 40,000 (ppm of 1)

  if (protocolPpm < 0n || targetPpm < 0n) {
    throw new Error('Fees must be non-negative decimals.')
  }
  if (discountPerOne < 0n || discountPerOne > SCALE) {
    throw new Error("Referral discount must be between 0 and 1 (e.g., '0.04' for 4%).")
  }

  // effective protocol fee after discount: round to nearest ppm
  const effectiveProtocolPpm = divRound(protocolPpm * (SCALE - discountPerOne), SCALE)

  // builder fee needed (in ppm)
  const neededPpm = targetPpm > effectiveProtocolPpm ? targetPpm - effectiveProtocolPpm : 0n

  // convert ppm -> bps (floor). If below 1 bp (i.e., < 100 ppm), return 0.
  const bps = neededPpm / BP_IN_PPM // integer division floors
  return Number(bps) // safe: bps here is tiny (fits in JS number easily)
}

/** Parse a base-10 decimal string into an integer scaled by 10^scale (no floating point). */
function toScaledInt(input: string, scale: number): bigint {
  const s = input.trim()
  if (!/^[+-]?(?:\d+\.?\d*|\d*\.?\d+)$/.test(s)) {
    throw new Error(`Invalid decimal: "${input}"`)
  }
  const neg = s[0] === '-'
  const unsigned = s.replace(/^[+-]/, '')
  const [intPart, fracPartRaw = ''] = unsigned.split('.')
  const fracPart = (fracPartRaw + '0'.repeat(scale)).slice(0, scale)
  const digits = (intPart.replace(/^0+/, '') || '0') + fracPart
  const val = BigInt(digits)
  return neg ? -val : val
}

/** Integer division with rounding to nearest (ties to up). */
function divRound(numerator: bigint, denominator: bigint): bigint {
  if (denominator === 0n) throw new Error('Division by zero')
  const half = denominator / 2n
  // works for non-negative values in this context
  return (numerator + half) / denominator
}

export const useUserFee = () => {
  const { address } = useConnection()
  const sdkInfoClient = useHyperliquidStore((state) => state.sdkInfoClient)
  const isSpot = useIsSpot()

  const data = useQuery({
    queryKey: ['userFeeData', address],
    queryFn: () => sdkInfoClient?.userFees({ user: address as Hex }),
    refetchInterval: 2000,
    enabled: !!address && !!sdkInfoClient
  })

  const getAdjustedBuilderFee = (isMarket?: boolean) => {
    if (!data.data) return 0
    if (isSpot) {
      if (isMarket) {
        return calcBuilderFeeBps(
          data.data.userSpotCrossRate,
          data.data.activeReferralDiscount,
          targetFee.spotMaker
        )
      } else {
        return calcBuilderFeeBps(
          data.data.userSpotAddRate,
          data.data.activeReferralDiscount,
          targetFee.spotMaker
        )
      }
    } else {
      if (isMarket) {
        return calcBuilderFeeBps(
          data.data.userCrossRate,
          data.data.activeReferralDiscount,
          targetFee.perpsTaker
        )
      } else {
        return calcBuilderFeeBps(
          data.data.userAddRate,
          data.data.activeReferralDiscount,
          targetFee.perpsMaker
        )
      }
    }
  }
  return { ...data, getAdjustedBuilderFee }
}
