import type { NextConfig } from 'next'
import { isNoContact, noContactBuildEnv } from './src/config/siteLinks'

// No-contact mode (README "No-contact mode"). `NO_CONTACT` is the only variable to set;
// everything the app reads is derived from it here and inlined at build time.
const noContact = isNoContact(process.env.NO_CONTACT)

const nextConfig: NextConfig = {
  env: noContactBuildEnv(process.env.NO_CONTACT),
  // Covers responses that carry no <meta name="robots">, such as the generated images.
  ...(noContact && {
    headers: async () => [
      { source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }
    ]
  }),
  eslint: {
    // Avoid failing CI/CD builds (e.g. Amplify) due to ESLint errors during `next build`.
    // Keep running `bun run lint` locally/CI as desired.
    ignoreDuringBuilds: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's2.coinmarketcap.com'
      },
      {
        protocol: 'https',
        hostname: 'reown.xyz'
      }
    ]
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  }
}

export default nextConfig
