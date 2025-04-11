import Trading from '@/components/Trading/Trading'
import FavoriteStrip from '@/components/FavoriteStrip/FavoriteStrip'
import React from 'react'

const page = () => {
  return (
    <>
      <FavoriteStrip type="perp" />
      <Trading type="perp" />
    </>
  )
}

export default page
