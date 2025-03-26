import { coinmarketAxios } from '@/config/axios'
import axios from 'axios'
import { NextResponse } from 'next/server'

const fetchCoinData = async (coinId: string) => {
  try {
    const url1 = `/cryptocurrency/quotes/latest?id=${coinId}`
    const url2 = `/cryptocurrency/info?id=${coinId}`
    const [marketPairsResponse, infoResponse] = await Promise.all([
      coinmarketAxios.get(url1),
      coinmarketAxios.get(url2)
    ])
    const marketPairs = marketPairsResponse?.data?.data || null
    const coinInfo = infoResponse?.data?.data || null
    return {
      marketPairs,
      coinInfo
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching coin data:', error.response?.data || error.message)
    } else {
      console.error('Error fetching coin data:', error)
    }
    return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(req: Request, { params }: { params: any }) {
  try {
    if (!params.id) {
      throw new Error('No ID provided')
    }
    const coinData = await fetchCoinData(params.id)
    return NextResponse.json(coinData)
  } catch (error) {
    console.error('Error fetching coin data:', error)
    return NextResponse.json({ error: 'Failed to fetch coin data' }, { status: 500 })
  }
}
