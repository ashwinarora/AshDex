import { describe, expect, it } from 'vitest'
import { shouldSetReferrer } from './useAutoReferral.helpers'

const readyReferral = {
  referredBy: null,
  cumVlm: '0',
  unclaimedRewards: '0',
  claimedRewards: '0',
  builderRewards: '0',
  referrerState: {
    stage: 'ready',
    data: {
      code: 'MYCODE',
      nReferrals: 0,
      referralStates: []
    }
  },
  rewardHistory: []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any

describe('shouldSetReferrer', () => {
  it('returns false when the code is empty', () => {
    expect(shouldSetReferrer({ code: '', isAgentApproved: true, referral: readyReferral })).toBe(
      false
    )
  })

  it('returns false when the agent is not approved', () => {
    expect(
      shouldSetReferrer({ code: 'ASHWIN', isAgentApproved: false, referral: readyReferral })
    ).toBe(false)
  })

  it('returns false while referral data is still loading', () => {
    expect(shouldSetReferrer({ code: 'ASHWIN', isAgentApproved: true, referral: undefined })).toBe(
      false
    )
  })

  it('returns false when the user is already referred', () => {
    expect(
      shouldSetReferrer({
        code: 'ASHWIN',
        isAgentApproved: true,
        referral: {
          ...readyReferral,
          referredBy: { referrer: '0xabc', code: 'OTHER' }
        }
      })
    ).toBe(false)
  })

  it('returns false when the user still needs to create their own code', () => {
    expect(
      shouldSetReferrer({
        code: 'ASHWIN',
        isAgentApproved: true,
        referral: {
          ...readyReferral,
          referrerState: { stage: 'needToCreateCode' }
        }
      })
    ).toBe(false)
  })

  it('returns true when the user is eligible and unreferred (needToTrade stage)', () => {
    expect(
      shouldSetReferrer({
        code: 'ASHWIN',
        isAgentApproved: true,
        referral: {
          ...readyReferral,
          referrerState: {
            stage: 'needToTrade',
            data: { required: '10000' }
          }
        }
      })
    ).toBe(true)
  })

  it('returns true when the user is eligible and unreferred (ready stage)', () => {
    expect(
      shouldSetReferrer({ code: 'ASHWIN', isAgentApproved: true, referral: readyReferral })
    ).toBe(true)
  })
})
