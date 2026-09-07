import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#08090b',
          borderRadius: 40
        }}
      >
        <svg viewBox="0 0 24 24" width="120" height="120" fill="none">
          <defs>
            <linearGradient id="ember" x1="4" y1="22" x2="20" y2="2" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#e5551f" />
              <stop offset="1" stopColor="#ff8654" />
            </linearGradient>
          </defs>
          <path
            d="M12 3 L3 21 M12 3 L21 21 M8 15 L16 15"
            stroke="url(#ember)"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}
