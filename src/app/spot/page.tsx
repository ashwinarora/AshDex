import FavoriteStrip from '@/components/FavoriteStrip/FavoriteStrip'
import Trading from '@/components/Trading/Trading'
import React from 'react'

const page = () => {
  return (
    <div>
      <FavoriteStrip type="spot" />
      <Trading type="spot" />
    </div>
  )
}

export default page
