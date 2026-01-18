import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
