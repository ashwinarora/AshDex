// app/api/admin/address/route.ts
export const runtime = 'nodejs' // ensure Node runtime (not Edge)

import { getEthAddress } from '@/services/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const address = await getEthAddress()
  return NextResponse.json({ address })
}
