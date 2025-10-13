'use client'

import { useEffect } from 'react'

// We import the register function from the SDK as per docs
// https://first-iraqi-bank.github.io/fib-nodejs-payment-sdk/guide/usage/native-app-bridge.html
// Note: package already installed with pre tag in package.json
import { registerFIBNativeBridge } from '@first-iraqi-bank/sdk/fib-native-bridge'

const FIBNativeBridgeInitializer = () => {
  useEffect(() => {
    try {
      registerFIBNativeBridge()
    } catch (err) {
      // Swallow errors in non-embedded environments; the bridge will be unavailable
      // This component should be safe to run in any browser
      // eslint-disable-next-line no-console
      console.warn('FIB Native Bridge registration failed or not available', err)
    }
  }, [])

  return null
}

export default FIBNativeBridgeInitializer
