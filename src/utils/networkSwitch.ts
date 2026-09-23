// The Hyperliquid network is fixed at build time (`NEXT_PUBLIC_HYPERLIQUID_NETWORK`),
// so "switch network" means navigating to the sibling deployment rather than
// flipping a runtime flag. The counterpart origin comes from env; when it is not
// configured the header button hides itself instead of dead-linking.

/**
 * Map the current path onto the counterpart deployment.
 *
 * Returns `null` when `baseUrl` is empty or unparseable so callers can skip
 * rendering. Outcome ids are per-network, so `/outcomes/<id>/<side>` collapses
 * to the `/outcomes` grid; every other path carries over as-is.
 */
export const buildNetworkSwitchUrl = (baseUrl: string, pathname: string): string | null => {
  const base = baseUrl.trim()
  if (!base) return null

  let url: URL
  try {
    url = new URL(base)
  } catch {
    return null
  }

  const path = /^\/outcomes\/[^/]+/.test(pathname) ? '/outcomes' : pathname || '/'
  const prefix = url.pathname.replace(/\/+$/, '')
  url.pathname = `${prefix}${path}`

  return url.toString()
}
