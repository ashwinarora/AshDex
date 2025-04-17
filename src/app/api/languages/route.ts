import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

interface Language {
  code: string
  name: string
  nativeName: string
}

// GET handler to retrieve languages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const countryCode = searchParams.get('country_code')
    const id = searchParams.get('id')

    let query = 'SELECT * FROM languages'
    const params: string[] = []
    let paramIndex = 1
    let whereClause = ''

    if (countryCode || id) {
      whereClause = ' WHERE '
      const conditions = []

      if (countryCode) {
        conditions.push(`country_code = $${paramIndex}`)
        params.push(countryCode)
        paramIndex++
      }

      if (id) {
        conditions.push(`id = $${paramIndex}`)
        params.push(id)
        paramIndex++
      }

      whereClause += conditions.join(' AND ')
    }

    query += whereClause
    query += ' ORDER BY name'

    const result = await sql.query(query, params)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching languages:', error)
    return NextResponse.json({ error: 'Failed to fetch languages' }, { status: 500 })
  }
}

// POST handler to create a new language (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { country_code, label, name } = body

    if (!country_code || !label || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if language already exists
    const existingLanguage = await sql.query('SELECT * FROM languages WHERE country_code = $1', [
      country_code
    ])

    if (existingLanguage.rows.length > 0) {
      return NextResponse.json({ error: 'Language already exists' }, { status: 409 })
    }

    // Create new language
    const result = await sql.query(
      `INSERT INTO languages (country_code, label, name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [country_code, label, name]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating language:', error)
    return NextResponse.json({ error: 'Failed to create language' }, { status: 500 })
  }
}

export async function fetchLanguages() {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all')
    const data = await response.json()

    const languages: Language[] = data
      .flatMap((country: { languages: Record<string, string> }) =>
        Object.entries(country.languages || {}).map(([code, name]) => ({
          code,
          name,
          nativeName: name
        }))
      )
      .filter(
        (lang: Language, index: number, self: Language[]) =>
          index === self.findIndex((l) => l.code === lang.code)
      )
      .sort((a: Language, b: Language) => a.name.localeCompare(b.name))

    return languages
  } catch (error) {
    console.error('Error fetching languages:', error)
    return []
  }
}
