import { NextResponse } from 'next/server'
import TermsManager from '@/services/Terms.manager'

export async function GET() {
  try {
    const terms = await TermsManager.getLatestTerms()
    return NextResponse.json(terms)
  } catch (error) {
    console.error('Error fetching terms:', error)
    return NextResponse.json({ error: 'Failed to fetch terms' }, { status: 500 })
  }
}
