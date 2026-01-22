'use client'
import React, { useState } from 'react'
import { useConnection, useSignMessage } from 'wagmi'
import axios from 'axios'
import { useTermsSignature } from '@/hooks/useTermsSignature'
import { toast } from 'sonner'
import { IconCheck } from '@tabler/icons-react'
import { Button } from '../ui/button'
import { useTranslate } from '@tolgee/react'
import { ConnectedWallet, useWallets } from '@privy-io/react-auth'
import { cn } from '@/lib/utils'
import useUserStore from '@/store/userStore'

interface WalletRulesProps {
  onClose: () => void
}

const WalletRules: React.FC<WalletRulesProps> = ({ onClose }) => {
  const { address } = useConnection()
  const signMessage = useSignMessage()
  const { wallets } = useWallets()
  const embeddedWallet = wallets?.find((w: ConnectedWallet) => w?.walletClientType === 'privy')
  const walletId = address ?? embeddedWallet?.address
  const { refetch: refetchUserTerms } = useTermsSignature(walletId)
  const { t } = useTranslate()
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')

  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)

  const canProceed = acceptedTerms && acceptedPrivacy

  const handleSignTerms = async () => {
    if (!canProceed) return

    const message = `I accept the Terms & Conditions and Privacy Policy of Nexon.\n\nTimestamp: ${new Date().toISOString()}`
    const signature = await signMessage.mutateAsync({
      message
    })
    console.log('signature', signature)
    const toastId = toast.loading(t('Verifying Signature...'))
    try {
      const res = await axios.post('/api/user-terms', {
        wallet_id: address,
        signature: signature
      })
      console.log('terms res', res)
      await refetchUserTerms()
      toast.success(t('Signature verified'), {
        id: toastId
      })
    } catch (err) {
      toast.error(t('Failed to sign and verify terms. Please try again.'), {
        id: toastId
      })
      console.log('Error signing/verifying terms:', err)
    }
  }

  return (
    <div className="w-full flex flex-col gap-6 items-center justify-center">
      <div className="w-full flex flex-col gap-4">
        {/* Terms & Conditions Checkbox */}
        <label
          className={cn(
            'flex w-full items-center gap-3 cursor-pointer group',
            isRTL && 'flex-row-reverse'
          )}
        >
          <button
            type="button"
            role="checkbox"
            aria-checked={acceptedTerms}
            onClick={() => setAcceptedTerms(!acceptedTerms)}
            className={cn(
              'flex items-center cursor-pointer justify-center size-5 shrink-0 rounded border-2 transition-all mt-0.5',
              acceptedTerms
                ? 'bg-accent border-accent'
                : 'border-white/30 group-hover:border-white/50'
            )}
          >
            {acceptedTerms && <IconCheck className="size-3.5 text-white" />}
          </button>
          <span className="text-sm text-white/70">
            {t('I have read and I agree to the')}{' '}
            <a
              href="https://nexon.xyz/docs/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline hover:text-accent/80 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {t('Terms & Conditions')}
            </a>
          </span>
        </label>

        {/* Privacy Policy Checkbox */}
        <label
          className={cn('flex items-start gap-3 cursor-pointer group', isRTL && 'flex-row-reverse')}
        >
          <button
            type="button"
            role="checkbox"
            aria-checked={acceptedPrivacy}
            onClick={() => setAcceptedPrivacy(!acceptedPrivacy)}
            className={cn(
              'flex items-center justify-center size-5 shrink-0 rounded border-2 transition-all mt-0.5',
              acceptedPrivacy
                ? 'bg-accent border-accent'
                : 'border-white/30 group-hover:border-white/50'
            )}
          >
            {acceptedPrivacy && <IconCheck className="size-3.5 text-white" />}
          </button>
          <span className="text-sm text-white/70">
            {t('I have read and I agree to the')}{' '}
            <a
              href="https://nexon.xyz/docs/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline hover:text-accent/80 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {t('Privacy Policy')}
            </a>
          </span>
        </label>
      </div>

      <div className="w-full flex flex-col shrink-0 items-center justify-center gap-2">
        <Button className="w-full" onClick={handleSignTerms} disabled={!canProceed}>
          {t('I agree to the Rules')}
        </Button>
        <Button className="w-full" variant={'link'} onClick={onClose}>
          {t('Cancel')}
        </Button>
      </div>
    </div>
  )
}

export default WalletRules
