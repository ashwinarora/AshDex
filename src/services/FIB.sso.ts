// Server-side wrapper for FIB SSO SDK
// https://first-iraqi-bank.github.io/fib-nodejs-payment-sdk/guide/usage/sso.html

import { SingleSignOnSDK } from '@first-iraqi-bank/sdk/sso'

const clientId = process.env.FIB_SSO_CLIENT_ID as string | undefined
const clientSecret = process.env.FIB_SSO_CLIENT_SECRET as string | undefined
const environment = (process.env.FIB_ENV as 'dev' | 'stage' | 'prod' | undefined) ?? 'prod'

if (!clientId || !clientSecret) {
  // eslint-disable-next-line no-console
  console.warn('FIB SSO credentials are not set. Set FIB_SSO_CLIENT_ID and FIB_SSO_CLIENT_SECRET')
}

export const FIBSingleSignOn = SingleSignOnSDK.getClient(
  clientId ?? '',
  clientSecret ?? '',
  environment
)
