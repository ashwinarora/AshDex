import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'AshDex — Trade Perps On-Chain'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px 96px',
          backgroundColor: '#08090b',
          backgroundImage:
            'radial-gradient(circle at 78% 22%, rgba(255,107,53,0.22) 0%, rgba(255,107,53,0) 45%)',
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginBottom: 44
          }}
        >
          <svg viewBox="0 0 24 24" width="72" height="72" fill="none">
            <defs>
              <linearGradient
                id="og-ember"
                x1="4"
                y1="22"
                x2="20"
                y2="2"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#e5551f" />
                <stop offset="1" stopColor="#ff8654" />
              </linearGradient>
            </defs>
            <path
              d="M12 3 L3 21 M12 3 L21 21 M8 15 L16 15"
              stroke="url(#og-ember)"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div style={{ display: 'flex', fontSize: 56, fontWeight: 600, letterSpacing: '-0.02em' }}>
            <span style={{ color: '#f2f4f7' }}>Ash</span>
            <span style={{ color: '#8b929e' }}>Dex</span>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 600,
            color: '#f2f4f7',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            maxWidth: 900
          }}
        >
          Precision derivatives, on-chain.
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 30,
            color: '#8b929e',
            letterSpacing: '-0.01em',
            maxWidth: 900
          }}
        >
          Perps and spot on Hyperliquid. Self-custodial. No middlemen.
        </div>
      </div>
    ),
    { ...size }
  )
}
