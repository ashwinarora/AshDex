'use client'

import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useConnection } from 'wagmi'
import { useShallow } from 'zustand/react/shallow'
import { zeroAddress, type Hex } from 'viem'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { ASHDEX_REFERRAL_CODE } from '@/utils/constants'
import { shouldSetReferrer } from './useAutoReferral.helpers'

// Silent, agent-signed auto-referral. Fires setReferrer once per session per
// address after the agent is approved and Hyperliquid confirms the wallet has
// no existing referrer. The agent wallet (not the user's wallet) signs, so
// there is no popup and no user-visible feedback on success or failure.
export const useAutoReferral = () => {
  const { address } = useConnection()
  const { sdkInfoClient, sdkL1ActionClient, agentWallet } = useHyperliquidStore(
    useShallow((state) => ({
      sdkInfoClient: state.sdkInfoClient,
      sdkL1ActionClient: state.sdkL1ActionClient,
      agentWallet: state.agentWallet
    }))
  )
  const attempted = useRef<Set<Hex>>(new Set())

  const hasCode = !!ASHDEX_REFERRAL_CODE
  const userReady = !!address && address !== zeroAddress

  // Shares the queryKey shape used by EstablishConnection so both hooks hit
  // the same React Query cache entry instead of double-fetching.
  const { data: isAgentApproved = false } = useQuery({
    queryKey: ['extraAgents', address, agentWallet],
    queryFn: async () => {
      if (!sdkInfoClient || !address || !agentWallet) return false
      const extraAgents = await sdkInfoClient.extraAgents({ user: address })
      return extraAgents.some(
        (a) => a.address.toLowerCase() === agentWallet.address.toLowerCase()
      )
    },
    enabled: hasCode && userReady && !!sdkInfoClient && !!agentWallet
  })

  const { data: referral } = useQuery({
    queryKey: ['referral', address],
    queryFn: () => sdkInfoClient!.referral({ user: address! }),
    enabled: hasCode && userReady && !!sdkInfoClient && isAgentApproved
  })

  useEffect(() => {
    if (!userReady || !sdkL1ActionClient) return
    if (!shouldSetReferrer({ code: ASHDEX_REFERRAL_CODE, isAgentApproved, referral })) return
    if (attempted.current.has(address)) return

    attempted.current.add(address)
    sdkL1ActionClient
      .setReferrer({ code: ASHDEX_REFERRAL_CODE })
      .catch((err) => console.error('[useAutoReferral] setReferrer failed', err))
  }, [address, userReady, sdkL1ActionClient, isAgentApproved, referral])
}
