import { NextResponse } from 'next/server'
import { FIBSingleSignOn } from '@/services/FIB.sso'

export async function POST() {
  try {
    const res = await FIBSingleSignOn.initiate()
    const json = await res.json()
    return NextResponse.json(json)
  } catch (error) {
    console.error('Error initiating SSO:', error)
    return NextResponse.json({ message: 'Failed to initiate SSO' }, { status: 500 })
  }
}
