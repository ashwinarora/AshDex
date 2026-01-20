'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSetInviteCode, useInviteCode } from '@/store/ReferralStore'
import { useGetReferrer } from '@/hooks/invite/useGetReferrer'
import { useAccount } from 'wagmi'
import { toast } from 'sonner'
import { useAgentApproval } from '@/context/EstablishConnection'
import { useUserFee } from '@/hooks/useUserFee'

/**
 * Hook to capture invite code from URL params and store it in localStorage.
 * Looks for `?inviteCode=XXXX` in the URL.
 * Should be used in pages that accept referral links (/, /spot).
 *
 * Flow:
 * 1. If wallet NOT connected: store code, mark for re-validation when connected
 * 2. If wallet connected:
 *    a. Check referrer - if exists, toast "already referred"
 *    b. Check agent/fee approval - if not approved, store code (new user setting up)
 *    c. Check volume - if > 0, toast "only new users"; if 0, store code
 *
 * Also handles showing referral prompt dialog:
 * - Shows when: no URL code, no stored code, no referrer, fee approved, not dismissed
 * - Returns showReferralPrompt state for parent to render dialog
 */
export const useInviteCodeCapture = () => {
  const searchParams = useSearchParams()
  const setInviteCode = useSetInviteCode()
  const { inviteCode: storedInviteCode, referralPromptDismissed } = useInviteCode()
  const { isConnected } = useAccount()
  const { data: referrer, isFetched: isReferrerFetched } = useGetReferrer()
  const { isAgentApproved, currentFeeApproval } = useAgentApproval()
  const { data: userFeeData, isFetched: isUserFeeFetched } = useUserFee()

  // State for showing referral prompt dialog
  const [showReferralPrompt, setShowReferralPrompt] = useState(false)

  // Track processing state
  const hasProcessedCode = useRef(false)
  const storedWhileDisconnected = useRef(false)
  const previouslyConnected = useRef(false)

  // Calculate total user volume
  const totalVolume =
    userFeeData?.dailyUserVlm?.reduce(
      (acc, curr) => Number(curr.userAdd) + Number(curr.userCross) + acc,
      0
    ) || 0

  // Check if agent and fee are both approved
  const isFullyApproved = isAgentApproved && currentFeeApproval > 0

  useEffect(() => {
    const inviteCode = searchParams.get('inviteCode')

    // No invite code in URL, nothing to do
    if (!inviteCode) {
      console.log('[InviteCodeCapture] No invite code in URL')
      return
    }

    console.log('[InviteCodeCapture] Invite code found:', inviteCode)
    console.log('[InviteCodeCapture] State:', {
      isConnected,
      hasProcessedCode: hasProcessedCode.current,
      storedWhileDisconnected: storedWhileDisconnected.current,
      previouslyConnected: previouslyConnected.current,
      isReferrerFetched,
      referrer,
      isFullyApproved,
      isAgentApproved,
      currentFeeApproval,
      isUserFeeFetched,
      totalVolume
    })

    // === DISCONNECTED FLOW ===
    if (!isConnected) {
      // Store code if not already processed
      if (!hasProcessedCode.current) {
        console.log('[InviteCodeCapture] Wallet not connected - storing code for later validation')
        setInviteCode(inviteCode)
        storedWhileDisconnected.current = true
        hasProcessedCode.current = true
      }
      previouslyConnected.current = false
      return
    }

    // === WALLET JUST CONNECTED - Re-validate if code was stored while disconnected ===
    if (isConnected && !previouslyConnected.current && storedWhileDisconnected.current) {
      console.log('[InviteCodeCapture] Wallet just connected - re-validating stored code')
      // Reset processing to re-run validation
      hasProcessedCode.current = false
      storedWhileDisconnected.current = false
    }
    previouslyConnected.current = true

    // Already fully processed this code
    if (hasProcessedCode.current) {
      console.log('[InviteCodeCapture] Code already processed, skipping')
      return
    }

    // === CONNECTED FLOW ===

    // Step 1: Wait for referrer data
    if (!isReferrerFetched) {
      console.log('[InviteCodeCapture] Waiting for referrer data...')
      return
    }

    // Step 2: Check if user already has a referrer
    if (referrer !== null) {
      console.log('[InviteCodeCapture] User already has a referrer:', referrer)
      toast.info('You already have a referrer linked to your wallet')
      hasProcessedCode.current = true
      return
    }

    // Step 3: Check agent/fee approval status
    // If not fully approved, user is still setting up - store code and exit
    if (!isFullyApproved) {
      console.log('[InviteCodeCapture] Agent/fee not approved - storing code (new user setting up)', {
        isAgentApproved,
        currentFeeApproval
      })
      setInviteCode(inviteCode)
      hasProcessedCode.current = true
      return
    }

    // Step 4: Agent and fee are approved - check volume
    // Wait for user fee data to be fetched
    if (!isUserFeeFetched) {
      console.log('[InviteCodeCapture] Waiting for user fee data...')
      return
    }

    // Step 5: Check if user has any trading volume
    if (totalVolume > 0) {
      console.log('[InviteCodeCapture] User has trading volume:', totalVolume)
      toast.info('Only new users can be referred')
      hasProcessedCode.current = true
      return
    }

    // Step 6: No volume, user is eligible - store the invite code
    console.log('[InviteCodeCapture] User eligible - storing invite code')
    setInviteCode(inviteCode)
    hasProcessedCode.current = true
  }, [
    searchParams,
    setInviteCode,
    isConnected,
    referrer,
    isReferrerFetched,
    isFullyApproved,
    isUserFeeFetched,
    totalVolume
  ])

  // === REFERRAL PROMPT DIALOG LOGIC ===
  // Show dialog when user has no invite code and completes fee approval
  useEffect(() => {
    const inviteCode = searchParams.get('inviteCode')

    console.log('[InviteCodeCapture] Checking referral prompt conditions:', {
      inviteCode,
      storedInviteCode,
      isConnected,
      isReferrerFetched,
      referrer,
      isFullyApproved,
      referralPromptDismissed
    })

    // Don't show if there's an invite code in URL
    if (inviteCode) {
      console.log('[InviteCodeCapture] Has URL invite code - not showing prompt')
      setShowReferralPrompt(false)
      return
    }

    // Don't show if wallet not connected
    if (!isConnected) {
      console.log('[InviteCodeCapture] Wallet not connected - not showing prompt')
      setShowReferralPrompt(false)
      return
    }

    // Don't show if permanently dismissed
    if (referralPromptDismissed) {
      console.log('[InviteCodeCapture] Prompt permanently dismissed - not showing')
      setShowReferralPrompt(false)
      return
    }

    // Wait for referrer data
    if (!isReferrerFetched) {
      console.log('[InviteCodeCapture] Waiting for referrer data for prompt check')
      return
    }

    // Don't show if user already has a referrer
    if (referrer !== null) {
      console.log('[InviteCodeCapture] User has referrer - not showing prompt')
      setShowReferralPrompt(false)
      return
    }

    // Don't show if fee not approved yet
    if (!isFullyApproved) {
      console.log('[InviteCodeCapture] Fee not approved - not showing prompt yet')
      setShowReferralPrompt(false)
      return
    }

    // Don't show if there's already a stored invite code
    if (storedInviteCode) {
      console.log('[InviteCodeCapture] Has stored invite code - not showing prompt')
      setShowReferralPrompt(false)
      return
    }

    // All conditions met - show the prompt
    console.log('[InviteCodeCapture] All conditions met - showing referral prompt')
    setShowReferralPrompt(true)
  }, [
    searchParams,
    storedInviteCode,
    isConnected,
    isReferrerFetched,
    referrer,
    isFullyApproved,
    referralPromptDismissed
  ])

  return {
    showReferralPrompt,
    setShowReferralPrompt
  }
}
