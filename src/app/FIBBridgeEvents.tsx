'use client'

import { useEffect } from 'react'
import { useFIBStore } from '@/store/FIBStore'

const FIBBridgeEvents = () => {
  const setEmbedded = useFIBStore((s) => s.setEmbedded)
  const setAuthenticated = useFIBStore((s) => s.setAuthenticated)
  const setPaymentResult = useFIBStore((s) => s.setPaymentResult)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.FIBNativeBridge) return
    setEmbedded(Boolean(window.FIBNativeBridge.isFIBBridgeAvailable))

    const onAuthenticated = () => {
      setAuthenticated(true)
    }

    const onAuthenticationFailed = () => {
      setAuthenticated(false)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onPaymentSuccess = (event: any) => {
      const transactionId = event?.detail?.body?.transactionId as string | undefined
      setPaymentResult(transactionId, 'success')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onPaymentFailed = (event: any) => {
      const transactionId = event?.detail?.body?.transactionId as string | undefined
      setPaymentResult(transactionId, 'failed')
    }

    window.FIBNativeBridge.addEventListener('AUTHENTICATED', onAuthenticated)
    window.FIBNativeBridge.addEventListener('AUTHENTICATION_FAILED', onAuthenticationFailed)
    window.FIBNativeBridge.addEventListener('PAYMENT_SUCCESSFULLY_PAID', onPaymentSuccess)
    window.FIBNativeBridge.addEventListener('PAYMENT_FAILED', onPaymentFailed)

    return () => {
      window.FIBNativeBridge.removeEventListener('AUTHENTICATED', onAuthenticated)
      window.FIBNativeBridge.removeEventListener('AUTHENTICATION_FAILED', onAuthenticationFailed)
      window.FIBNativeBridge.removeEventListener('PAYMENT_SUCCESSFULLY_PAID', onPaymentSuccess)
      window.FIBNativeBridge.removeEventListener('PAYMENT_FAILED', onPaymentFailed)
    }
  }, [setEmbedded, setAuthenticated, setPaymentResult])

  return null
}

export default FIBBridgeEvents
