'use client'
import FavoriteStrip from '@/components/FavoriteStrip/FavoriteStrip'
import Trading from '@/components/Trading/Trading'

export default function Home() {
  return (
    <>
      <FavoriteStrip type="perp" />
      <Trading type="perp" />
    </>
  )
}
