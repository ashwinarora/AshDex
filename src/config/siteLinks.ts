/**
 * Every link to another of my sites, with both deployments' URLs committed.
 *
 * `next.config.ts` picks one column from `NO_CONTACT` and injects only that one into the
 * build, so the other column never reaches the bundle. Nothing in the app may import this
 * file: read the selected values from `src/config/noContact.ts` instead.
 * See README "No-contact mode".
 */
export const siteLinks = {
  /** Faucet dialog promo (`HlToolsPromo`). */
  hlTools: { normal: 'https://hltools.tech', showcase: 'https://showcase.hltools.tech' }
} as const

/** `NO_CONTACT=true` is no-contact mode. Unset, or any other value, is the normal site. */
export const isNoContact = (value: string | undefined): boolean => value === 'true'

/**
 * The `env` block for `next.config.ts`, derived from the `NO_CONTACT` variable alone.
 *
 * Next inlines these into client and server code at build time and they take precedence
 * over the same names in the environment. That matters for the sibling-deployment URLs
 * behind the header network switch: a no-contact environment is created by copying the
 * production variables, and those URLs are normal-mode sites, so they are blanked here
 * rather than trusted to be unset.
 */
export const noContactBuildEnv = (value: string | undefined): Record<string, string> => {
  if (!isNoContact(value)) {
    return {
      NEXT_PUBLIC_NO_CONTACT: 'false',
      NEXT_PUBLIC_HLTOOLS_URL: siteLinks.hlTools.normal
    }
  }

  return {
    NEXT_PUBLIC_NO_CONTACT: 'true',
    NEXT_PUBLIC_HLTOOLS_URL: siteLinks.hlTools.showcase,
    NEXT_PUBLIC_MAINNET_APP_URL: '',
    NEXT_PUBLIC_TESTNET_APP_URL: ''
  }
}
