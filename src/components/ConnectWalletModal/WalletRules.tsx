'use client'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { useSignMessage } from 'wagmi'
import axios from 'axios'
import { useTermsSignature } from '@/hooks/useTermsSignature'
import { toast } from 'sonner'
import { IconAlertCircle, IconLoader } from '@tabler/icons-react'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'
import { Button } from '../ui/button'
import { useTranslate } from '@tolgee/react'

interface WalletRulesProps {
  onClose: () => void
}

const WalletRules: React.FC<WalletRulesProps> = ({ onClose }) => {
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const {
    data: terms,
    isLoading,
    error
  } = useQuery({
    queryKey: ['latestTerms'],
    queryFn: async () => {
      const response = await fetch('/api/latest-terms')
      if (!response.ok) {
        throw new Error('Failed to fetch terms')
      }
      return response.json()
    }
  })
  const { refetch: refetchUserTerms } = useTermsSignature()
  const { t } = useTranslate()
  const handleSignTerms = async () => {
    if (!terms?.content) return
    const signature = await signMessageAsync({
      message: terms.content
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

  if (isLoading) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <IconLoader className="size-10 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-80 flex flex-col gap-4 items-center justify-center">
        <IconAlertCircle className="size-10 text-red" />
        <div className="text-red text-sm">{t('Error loading terms')}</div>
      </div>
    )
  }

  return (
    <div className="w-full h-80 flex flex-col gap-4 items-center justify-center">
      <ScrollArea className="w-full h-full flex-1">
        <div className="max-h-60 text-sm text-white/50 pr-2">{terms?.content}</div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
      <div className="w-full flex flex-col shrink-0 items-center justify-center gap-2">
        <Button className="w-full" onClick={handleSignTerms}>
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
