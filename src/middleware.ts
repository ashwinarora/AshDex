import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const MINTLIFY_DOCS_URL = process.env.MINTLIFY_DOCS_URL
  if (!MINTLIFY_DOCS_URL) {
    throw new Error('MINTLIFY_DOCS_URL is not set')
  }
  const { pathname } = request.nextUrl

  // Handle /docs routing to Mintlify
  if (pathname.startsWith('/docs')) {
    const host = request.headers.get('host') || ''
    const isTestnet = host.startsWith('test.')

    // Determine the custom URL based on environment
    const customUrl = isTestnet ? 'test.nexon.xyz' : 'nexon.xyz'

    // Create the proxy URL to Mintlify
    const mintlifyUrl = new URL(pathname, `https://${MINTLIFY_DOCS_URL}`)
    mintlifyUrl.search = request.nextUrl.search

    // Rewrite to Mintlify with custom headers
    const response = NextResponse.rewrite(mintlifyUrl, {
      request: {
        headers: new Headers({
          Host: MINTLIFY_DOCS_URL,
          'X-Forwarded-Host': customUrl,
          'X-Forwarded-Proto': 'https'
        })
      }
    })

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/docs/:path*']
}
