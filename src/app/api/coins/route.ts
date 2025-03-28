import { NextResponse } from 'next/server'
import { coinmarketAxios } from '@/config/axios'
import axios from 'axios'
const fetchAllCoins = async () => {
  try {
    const url = `/cryptocurrency/map`
    const response = await coinmarketAxios.get(url)
    return response?.data?.data || []
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching all coins:', error.response?.data || error.message)
    } else {
      console.error('Error fetching all coins:', error)
    }
    return []
  }
}
export async function GET() {
  try {
    const allCoins = await fetchAllCoins()
    return NextResponse.json(allCoins)
  } catch (error) {
    console.error('Error fetching all coins:', error)
    return NextResponse.json({ error: 'Failed to fetch all coins' }, { status: 500 })
  }
}
